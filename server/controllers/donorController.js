const Donor = require('../models/Donor');
const Donation = require('../models/Donation');
const User = require('../models/User');
const { generateDonationCertificate } = require('../utils/pdfGenerator');
const { sendEmail } = require('../utils/emailService');
const { donationRecordedEmail } = require('../utils/emailTemplates');

/**
 * @desc    Get donor profile
 * @route   GET /api/donors/profile
 * @access  Private (Donor)
 */
const getDonorProfile = async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id }).populate(
      'userId',
      'name email phone city address'
    );

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { donor },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update donor profile
 * @route   PUT /api/donors/profile
 * @access  Private (Donor)
 */
const updateDonorProfile = async (req, res, next) => {
  try {
    const { bloodGroup, dateOfBirth, gender, weight, medicalConditions, emergencyContact } =
      req.body;

    let donor = await Donor.findOne({ userId: req.user.id });

    if (!donor) {
      // Create donor profile if it doesn't exist
      donor = await Donor.create({
        userId: req.user.id,
        bloodGroup,
        dateOfBirth,
        gender,
        weight,
        medicalConditions,
        emergencyContact,
      });
    } else {
      // Update existing profile
      donor = await Donor.findOneAndUpdate(
        { userId: req.user.id },
        { bloodGroup, dateOfBirth, gender, weight, medicalConditions, emergencyContact },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Donor profile updated successfully',
      data: { donor },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check donation eligibility (90-day rule)
 * @route   GET /api/donors/eligibility
 * @access  Private (Donor)
 */
const checkEligibility = async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found',
      });
    }

    const isEligible = donor.checkEligibility();
    const daysRemaining = donor.daysUntilEligible();

    res.status(200).json({
      success: true,
      data: {
        isEligible,
        daysRemaining,
        lastDonationDate: donor.lastDonationDate,
        totalDonations: donor.totalDonations,
        message: isEligible
          ? 'You are eligible to donate blood!'
          : `You need to wait ${daysRemaining} more days before your next donation.`,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get donation history for a donor
 * @route   GET /api/donors/donations
 * @access  Private (Donor)
 */
const getDonationHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId: req.user.id };
    if (status) query.status = status;

    const donations = await Donation.find(query)
      .sort({ donationDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Donation.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        donations,
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
 * @desc    Create a new donation record
 * @route   POST /api/donors/donations
 * @access  Private (Admin)
 */
const createDonation = async (req, res, next) => {
  try {
    const { donorId, bloodGroup, units, location, healthScreening, notes } = req.body;

    const donor = await Donor.findById(donorId);
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }

    // Check eligibility
    if (!donor.checkEligibility()) {
      return res.status(400).json({
        success: false,
        message: `Donor is not eligible. Must wait ${donor.daysUntilEligible()} more days.`,
      });
    }

    const donation = await Donation.create({
      donorId,
      userId: donor.userId,
      bloodGroup: bloodGroup || donor.bloodGroup,
      units: units || 1,
      location,
      healthScreening,
      notes,
      status: 'completed',
      donationDate: new Date(),
    });

    // Update donor's last donation date and total donations
    donor.lastDonationDate = new Date();
    donor.totalDonations += 1;
    donor.isEligible = false;
    await donor.save();

    // Send donation confirmation email to donor
    const donorUser = await User.findById(donor.userId);
    if (donorUser) {
      const emailData = donationRecordedEmail({
        name: donorUser.name,
        bloodGroup: donation.bloodGroup,
        units: donation.units,
        location: location || 'N/A',
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      });
      sendEmail({ to: donorUser.email, subject: emailData.subject, html: emailData.html }).catch(err => console.error('Donation email error:', err));
    }

    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully',
      data: { donation },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download donation certificate (PDF)
 * @route   GET /api/donors/donations/:id/certificate
 * @access  Private (Donor)
 */
const downloadCertificate = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('donorId');
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found',
      });
    }

    // Check if the donation belongs to the requesting user
    if (donation.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this certificate',
      });
    }

    if (donation.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Certificate is only available for completed donations',
      });
    }

    const user = await User.findById(donation.userId);

    // Generate PDF
    const pdfBuffer = await generateDonationCertificate({
      donorName: user.name,
      bloodGroup: donation.bloodGroup,
      donationDate: donation.donationDate,
      units: donation.units,
      location: donation.location,
      donationId: donation._id,
    });

    // Mark certificate as generated
    donation.certificateGenerated = true;
    await donation.save();

    // Send PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=donation-certificate-${donation._id}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all donors (Admin)
 * @route   GET /api/donors
 * @access  Private (Admin)
 */
const getAllDonors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, bloodGroup, city, search } = req.query;

    let matchQuery = {};
    if (bloodGroup) matchQuery.bloodGroup = bloodGroup;

    const donors = await Donor.find(matchQuery)
      .populate({
        path: 'userId',
        select: 'name email phone city isActive',
        ...(city && { match: { city: new RegExp(city, 'i') } }),
        ...(search && {
          match: { name: new RegExp(search, 'i') },
        }),
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Filter out donors where userId didn't match (when city/search filter applied)
    const filteredDonors = donors.filter((d) => d.userId !== null);

    const total = await Donor.countDocuments(matchQuery);

    res.status(200).json({
      success: true,
      data: {
        donors: filteredDonors,
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
 * @desc    Book a donation appointment (self-service by donor)
 * @route   POST /api/donors/appointments
 * @access  Private (Donor)
 */
const bookAppointment = async (req, res, next) => {
  try {
    const { preferredDate, location, bloodGroup, notes } = req.body;

    const donor = await Donor.findOne({ userId: req.user.id });
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor profile not found. Please complete your profile first.' });
    }

    const appointment = await Donation.create({
      donorId: donor._id,
      userId: req.user.id,
      bloodGroup: bloodGroup || donor.bloodGroup,
      units: 1,
      location,
      donationDate: preferredDate || new Date(),
      status: 'pending',
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully! The admin will confirm your slot.',
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get appointments (donor sees own, admin sees all pending)
 * @route   GET /api/donors/appointments
 * @access  Private (Donor | Admin)
 */
const getAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    let query = {};
    if (req.user.role === 'donor') {
      query.userId = req.user.id;
    }
    if (status) {
      query.status = status;
    } else if (req.user.role === 'donor') {
      // donor sees all their own appointments
    } else {
      // admin default: show pending
      query.status = 'pending';
    }

    const appointments = await Donation.find(query)
      .populate('donorId', 'bloodGroup totalDonations')
      .populate('userId', 'name email phone')
      .sort({ donationDate: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Donation.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        appointments,
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
 * @desc    Approve a pending appointment and finalize donation (Admin)
 * @route   PUT /api/donors/donations/:id/approve
 * @access  Private (Admin)
 */
const approveDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('donorId');
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    if (donation.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending appointments can be approved' });
    }

    const donor = donation.donorId;
    if (!donor.checkEligibility()) {
      return res.status(400).json({
        success: false,
        message: `Donor is not eligible yet. Must wait ${donor.daysUntilEligible()} more days.`,
      });
    }

    const { units, location, notes, healthScreening } = req.body;

    donation.status = 'completed';
    donation.donationDate = new Date();
    if (units) donation.units = units;
    if (location) donation.location = location;
    if (notes) donation.notes = notes;
    if (healthScreening) donation.healthScreening = healthScreening;
    await donation.save();

    // Update donor stats
    donor.lastDonationDate = new Date();
    donor.totalDonations += 1;
    donor.isEligible = false;
    await donor.save();

    // Send confirmation email
    const donorUser = await User.findById(donation.userId);
    if (donorUser) {
      const emailData = donationRecordedEmail({
        name: donorUser.name,
        bloodGroup: donation.bloodGroup,
        units: donation.units,
        location: donation.location || 'N/A',
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      });
      sendEmail({ to: donorUser.email, subject: emailData.subject, html: emailData.html })
        .catch(err => console.error('Approve donation email error:', err));
    }

    res.status(200).json({
      success: true,
      message: 'Donation approved and recorded successfully',
      data: { donation },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a pending appointment (Admin)
 * @route   PUT /api/donors/donations/:id/reject
 * @access  Private (Admin)
 */
const rejectDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    if (donation.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending appointments can be rejected' });
    }

    donation.status = 'rejected';
    donation.notes = req.body.reason || donation.notes;
    await donation.save();

    res.status(200).json({
      success: true,
      message: 'Appointment rejected',
      data: { donation },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDonorProfile,
  updateDonorProfile,
  checkEligibility,
  getDonationHistory,
  createDonation,
  downloadCertificate,
  getAllDonors,
  bookAppointment,
  getAppointments,
  approveDonation,
  rejectDonation,
};
