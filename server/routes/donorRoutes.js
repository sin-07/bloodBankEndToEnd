const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/donorController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/donors:
 *   get:
 *     summary: Get all donors (Admin)
 *     tags: [Donors]
 */
router.get('/', authorize('admin'), getAllDonors);

/**
 * @swagger
 * /api/donors/profile:
 *   get:
 *     summary: Get donor profile
 *     tags: [Donors]
 */
router.get('/profile', authorize('donor'), getDonorProfile);

/**
 * @swagger
 * /api/donors/profile:
 *   put:
 *     summary: Update donor profile
 *     tags: [Donors]
 */
router.put(
  '/profile',
  authorize('donor'),
  [
    body('bloodGroup')
      .optional()
      .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
      .withMessage('Invalid blood group'),
    body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
    body('gender').optional().isIn(['male', 'female', 'other']),
    body('weight').optional().isFloat({ min: 45 }).withMessage('Minimum weight is 45 kg'),
  ],
  validate,
  updateDonorProfile
);

/**
 * @swagger
 * /api/donors/eligibility:
 *   get:
 *     summary: Check donation eligibility
 *     tags: [Donors]
 */
router.get('/eligibility', authorize('donor'), checkEligibility);

/**
 * @swagger
 * /api/donors/donations:
 *   get:
 *     summary: Get donation history
 *     tags: [Donors]
 */
router.get('/donations', authorize('donor', 'admin'), getDonationHistory);

/**
 * @swagger
 * /api/donors/donations:
 *   post:
 *     summary: Create donation record (Admin)
 *     tags: [Donors]
 */
router.post(
  '/donations',
  authorize('admin'),
  [
    body('donorId').notEmpty().withMessage('Donor ID is required'),
    body('location').notEmpty().withMessage('Location is required'),
  ],
  validate,
  createDonation
);

/**
 * @swagger
 * /api/donors/donations/{id}/certificate:
 *   get:
 *     summary: Download donation certificate
 *     tags: [Donors]
 */
router.get('/donations/:id/certificate', authorize('donor', 'admin'), downloadCertificate);

// Appointment booking (donor self-service)
router.post('/appointments', authorize('donor'), [
  body('location').notEmpty().withMessage('Location is required'),
  body('preferredDate').isISO8601().withMessage('Valid date is required'),
], validate, bookAppointment);

router.get('/appointments', authorize('donor', 'admin'), getAppointments);

// Admin approve / reject pending appointments
router.put('/donations/:id/approve', authorize('admin'), approveDonation);
router.put('/donations/:id/reject', authorize('admin'), rejectDonation);

module.exports = router;
