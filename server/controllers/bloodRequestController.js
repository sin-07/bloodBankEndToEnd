const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const User = require('../models/User');
const BloodInventory = require('../models/BloodInventory');
const { sendEmail } = require('../utils/emailService');
const { bloodRequestCreatedEmail, bloodRequestStatusEmail, donorUrgentRequestEmail } = require('../utils/emailTemplates');

/**
 * @desc    Create a new blood request
 * @route   POST /api/blood-requests
 * @access  Private
 */
const createBloodRequest = async (req, res, next) => {
  try {
    const {
      patientName,
      bloodGroup,
      component,
      units,
      urgency,
      reason,
      hospitalName,
      city,
      contactNumber,
    } = req.body;

    const request = await BloodRequest.create({
      requesterId: req.user.id,
      requesterType: req.user.role === 'hospital' ? 'hospital' : 'individual',
      patientName,
      bloodGroup,
      component: component || 'whole_blood',
      units,
      urgency: urgency || 'normal',
      reason,
      hospitalName,
      city,
      contactNumber,
      prescriptionUrl: req.file ? req.file.path : '',
      prescriptionPublicId: req.file ? req.file.filename : '',
    });

    // Auto-match donors by blood group and city
    const matchedDonors = await autoMatchDonors(bloodGroup, city);
    if (matchedDonors.length > 0) {
      request.matchedDonors = matchedDonors.map((d) => ({
        donorId: d._id,
        contacted: false,
        response: 'pending',
      }));
      await request.save();
    }

    // Send email notification for urgent/critical requests
    if (urgency === 'urgent' || urgency === 'critical') {
      await notifyMatchedDonors(matchedDonors, request);
    }

    // Send confirmation email to requester
    const requester = await User.findById(req.user.id);
    if (requester) {
      const emailData = bloodRequestCreatedEmail({
        name: requester.name,
        bloodGroup,
        units,
        urgency: urgency || 'normal',
        patientName,
        hospitalName,
      });
      sendEmail({ to: requester.email, subject: emailData.subject, html: emailData.html }).catch(err => console.error('Request created email error:', err));
    }

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: {
        request,
        matchedDonorsCount: matchedDonors.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Auto-match donors by blood group and city
 */
const autoMatchDonors = async (bloodGroup, city) => {
  try {
    // Find eligible donors matching blood group and city
    const donors = await Donor.find({
      bloodGroup,
      isEligible: true,
    }).populate({
      path: 'userId',
      match: { city: new RegExp(city, 'i'), isActive: true },
      select: 'name email phone city',
    });

    // Filter out donors that didn't match city
    return donors.filter((d) => d.userId !== null);
  } catch (error) {
    console.error('Auto-match error:', error);
    return [];
  }
};

/**
 * Notify matched donors via email
 */
const notifyMatchedDonors = async (donors, request) => {
  try {
    for (const donor of donors) {
      if (donor.userId && donor.userId.email) {
        const emailData = donorUrgentRequestEmail({
          donorName: donor.userId.name,
          bloodGroup: request.bloodGroup,
          units: request.units,
          urgency: request.urgency,
          patientName: request.patientName,
          hospitalName: request.hospitalName || 'N/A',
          city: request.city,
          contactNumber: request.contactNumber,
        });
        await sendEmail({ to: donor.userId.email, subject: emailData.subject, html: emailData.html });
      }
    }
  } catch (error) {
    console.error('Email notification error:', error);
  }
};

/**
 * @desc    Get all blood requests
 * @route   GET /api/blood-requests
 * @access  Private
 */
const getBloodRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, urgency, bloodGroup } = req.query;

    const query = {};

    // Non-admin users can only see their own requests
    if (req.user.role !== 'admin') {
      query.requesterId = req.user.id;
    }

    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (bloodGroup) query.bloodGroup = bloodGroup;

    const requests = await BloodRequest.find(query)
      .populate('requesterId', 'name email phone')
      .populate('matchedDonors.donorId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await BloodRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single blood request by ID
 * @route   GET /api/blood-requests/:id
 * @access  Private
 */
const getBloodRequestById = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requesterId', 'name email phone')
      .populate({
        path: 'matchedDonors.donorId',
        populate: { path: 'userId', select: 'name phone city' },
      });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      });
    }

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      request.requesterId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this request',
      });
    }

    res.status(200).json({
      success: true,
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update blood request status (Admin)
 * @route   PUT /api/blood-requests/:id/status
 * @access  Private (Admin)
 */
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status, adminNotes, fulfilledFrom } = req.body;

    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      });
    }

    request.status = status;
    if (adminNotes) request.adminNotes = adminNotes;
    if (fulfilledFrom) request.fulfilledFrom = fulfilledFrom;
    if (status === 'fulfilled') request.fulfilledDate = new Date();

    // If fulfilled from inventory, reduce stock
    if (status === 'fulfilled' && (fulfilledFrom === 'inventory' || fulfilledFrom === 'both')) {
      await reduceInventoryStock(request.bloodGroup, request.units, request._id);
    }

    await request.save();

    // Notify requester about status update
    const requester = await User.findById(request.requesterId);
    if (requester) {
      const emailData = bloodRequestStatusEmail({
        name: requester.name,
        bloodGroup: request.bloodGroup,
        units: request.units,
        status,
        adminNotes,
      });
      sendEmail({ to: requester.email, subject: emailData.subject, html: emailData.html }).catch(err => console.error('Status update email error:', err));
    }

    res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reduce inventory stock when blood is issued
 */
const reduceInventoryStock = async (bloodGroup, units, requestId) => {
  let remainingUnits = units;

  // Find available inventory items, prioritizing closest to expiry
  const inventoryItems = await BloodInventory.find({
    bloodGroup,
    status: 'available',
    expiryDate: { $gt: new Date() },
  }).sort({ expiryDate: 1 });

  for (const item of inventoryItems) {
    if (remainingUnits <= 0) break;

    const deductUnits = Math.min(item.units, remainingUnits);
    item.units -= deductUnits;
    remainingUnits -= deductUnits;

    if (item.units === 0) {
      item.status = 'issued';
    }

    item.issuedTo = {
      requestId,
      issuedDate: new Date(),
    };

    await item.save();
  }
};

/**
 * @desc    Cancel blood request
 * @route   PUT /api/blood-requests/:id/cancel
 * @access  Private
 */
const cancelBloodRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      });
    }

    if (request.requesterId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (request.status === 'fulfilled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a fulfilled request',
      });
    }

    request.status = 'cancelled';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateRequestStatus,
  cancelBloodRequest,
};
