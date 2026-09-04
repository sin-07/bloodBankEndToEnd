const express = require('express');
const { body } = require('express-validator');
const {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateRequestStatus,
  cancelBloodRequest,
} = require('../controllers/bloodRequestController');
const { protect, authorize } = require('../middleware/auth');
const { uploadPrescription } = require('../middleware/upload');
const validate = require('../middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/blood-requests:
 *   get:
 *     summary: Get all blood requests
 *     tags: [Blood Requests]
 */
router.get('/', getBloodRequests);

/**
 * @swagger
 * /api/blood-requests:
 *   post:
 *     summary: Create a new blood request
 *     tags: [Blood Requests]
 */
router.post(
  '/',
  uploadPrescription.single('prescription'),
  [
    body('patientName').notEmpty().withMessage('Patient name is required').trim(),
    body('bloodGroup')
      .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
      .withMessage('Valid blood group is required'),
    body('units')
      .isInt({ min: 1, max: 10 })
      .withMessage('Units must be between 1 and 10'),
    body('urgency')
      .optional()
      .isIn(['normal', 'urgent', 'critical'])
      .withMessage('Invalid urgency level'),
    body('reason').notEmpty().withMessage('Reason is required'),
    body('city').notEmpty().withMessage('City is required').trim(),
    body('contactNumber').notEmpty().withMessage('Contact number is required'),
  ],
  validate,
  createBloodRequest
);

/**
 * @swagger
 * /api/blood-requests/{id}:
 *   get:
 *     summary: Get single blood request
 *     tags: [Blood Requests]
 */
router.get('/:id', getBloodRequestById);

/**
 * @swagger
 * /api/blood-requests/{id}/status:
 *   put:
 *     summary: Update request status (Admin)
 *     tags: [Blood Requests]
 */
router.put(
  '/:id/status',
  authorize('admin'),
  [
    body('status')
      .isIn(['pending', 'approved', 'fulfilled', 'rejected'])
      .withMessage('Invalid status'),
  ],
  validate,
  updateRequestStatus
);

/**
 * @swagger
 * /api/blood-requests/{id}/cancel:
 *   put:
 *     summary: Cancel blood request
 *     tags: [Blood Requests]
 */
router.put('/:id/cancel', cancelBloodRequest);

module.exports = router;
