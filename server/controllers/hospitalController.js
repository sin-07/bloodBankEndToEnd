const Hospital = require('../models/Hospital');
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const { sendEmail } = require('../utils/emailService');
const { hospitalVerifiedEmail, bulkRequestCreatedEmail } = require('../utils/emailTemplates');

/**
 * @desc    Get hospital profile
 * @route   GET /api/hospitals/profile
 * @access  Private (Hospital)
 */
const getHospitalProfile = async (req, res, next) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user.id }).populate(
      'userId',
      'name email phone city address'
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { hospital },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update hospital profile
 * @route   PUT /api/hospitals/profile
 * @access  Private (Hospital)
 */
const updateHospitalProfile = async (req, res, next) => {
  try {
    const {
      hospitalName,
      type,
      city,
      state,
      address,
      contactPerson,
    } = req.body;

    const hospital = await Hospital.findOneAndUpdate(
      { userId: req.user.id },
      { hospitalName, type, city, state, address, contactPerson },
      { new: true, runValidators: true }
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital profile not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hospital profile updated',
      data: { hospital },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create bulk blood request (Hospital)
 * @route   POST /api/hospitals/bulk-request
 * @access  Private (Hospital)
 */
const createBulkRequest = async (req, res, next) => {
  try {
    const { requests } = req.body; // Array of blood request objects

    if (!requests || !Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of blood requests',
      });
    }

    const hospital = await Hospital.findOne({ userId: req.user.id });
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital profile not found',
      });
    }

    const createdRequests = [];

    for (const reqData of requests) {
      const request = await BloodRequest.create({
        requesterId: req.user.id,
        requesterType: 'hospital',
        patientName: reqData.patientName,
        bloodGroup: reqData.bloodGroup,
        units: reqData.units,
        urgency: reqData.urgency || 'normal',
        reason: reqData.reason,
        hospitalName: hospital.hospitalName,
        city: hospital.city,
        contactNumber: hospital.contactPerson.phone,
      });
      createdRequests.push(request);
    }

    // Update hospital's total requests
    hospital.totalRequests += createdRequests.length;
    await hospital.save();

    // Send bulk request confirmation email
    const hospitalUser = await User.findById(req.user.id);
    if (hospitalUser) {
      const emailData = bulkRequestCreatedEmail({ hospitalName: hospital.hospitalName, count: createdRequests.length, email: hospitalUser.email });
      sendEmail({ to: hospitalUser.email, subject: emailData.subject, html: emailData.html }).catch(err => console.error('Bulk request email error:', err));
    }

    res.status(201).json({
      success: true,
      message: `${createdRequests.length} blood requests created successfully`,
      data: { requests: createdRequests },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get hospital's blood requests
 * @route   GET /api/hospitals/requests
 * @access  Private (Hospital)
 */
const getHospitalRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { requesterId: req.user.id };
    if (status) query.status = status;

    const requests = await BloodRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await BloodRequest.countDocuments(query);

    // Stats
    const stats = {
      total: await BloodRequest.countDocuments({ requesterId: req.user.id }),
      pending: await BloodRequest.countDocuments({ requesterId: req.user.id, status: 'pending' }),
      approved: await BloodRequest.countDocuments({ requesterId: req.user.id, status: 'approved' }),
      fulfilled: await BloodRequest.countDocuments({ requesterId: req.user.id, status: 'fulfilled' }),
    };

    res.status(200).json({
      success: true,
      data: {
        requests,
        stats,
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
 * @desc    Get all hospitals (Admin)
 * @route   GET /api/hospitals
 * @access  Private (Admin)
 */
const getAllHospitals = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, city, isVerified } = req.query;

    const query = {};
    if (city) query.city = new RegExp(city, 'i');
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const hospitals = await Hospital.find(query)
      .populate('userId', 'name email phone isActive')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Hospital.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        hospitals,
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
 * @desc    Verify hospital (Admin)
 * @route   PUT /api/hospitals/:id/verify
 * @access  Private (Admin)
 */
const verifyHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found',
      });
    }

    // Send verification email to hospital
    const hospitalUser = await User.findById(hospital.userId);
    if (hospitalUser) {
      const emailData = hospitalVerifiedEmail({ hospitalName: hospital.hospitalName, email: hospitalUser.email });
      sendEmail({ to: hospitalUser.email, subject: emailData.subject, html: emailData.html }).catch(err => console.error('Hospital verified email error:', err));
    }

    res.status(200).json({
      success: true,
      message: 'Hospital verified successfully',
      data: { hospital },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHospitalProfile,
  updateHospitalProfile,
  createBulkRequest,
  getHospitalRequests,
  getAllHospitals,
  verifyHospital,
};
