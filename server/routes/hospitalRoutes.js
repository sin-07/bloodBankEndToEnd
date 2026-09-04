const express = require('express');
const { body } = require('express-validator');
const {
  getHospitalProfile,
  updateHospitalProfile,
  createBulkRequest,
  getHospitalRequests,
  getAllHospitals,
  verifyHospital,
} = require('../controllers/hospitalController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/hospitals:
 *   get:
 *     summary: Get all hospitals (Admin)
 *     tags: [Hospitals]
 */
router.get('/', authorize('admin'), getAllHospitals);

/**
 * @swagger
 * /api/hospitals/profile:
 *   get:
 *     summary: Get hospital profile
 *     tags: [Hospitals]
 */
router.get('/profile', authorize('hospital'), getHospitalProfile);

/**
 * @swagger
 * /api/hospitals/profile:
 *   put:
 *     summary: Update hospital profile
 *     tags: [Hospitals]
 */
router.put(
  '/profile',
  authorize('hospital'),
  [
    body('hospitalName').optional().trim(),
    body('type').optional().isIn(['government', 'private', 'charitable']),
    body('city').optional().trim(),
  ],
  validate,
  updateHospitalProfile
);

/**
 * @swagger
 * /api/hospitals/bulk-request:
 *   post:
 *     summary: Create bulk blood requests
 *     tags: [Hospitals]
 */
router.post(
  '/bulk-request',
  authorize('hospital'),
  [
    body('requests').isArray({ min: 1 }).withMessage('At least one request is required'),
    body('requests.*.patientName').notEmpty().withMessage('Patient name is required'),
    body('requests.*.bloodGroup')
      .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
      .withMessage('Valid blood group is required'),
    body('requests.*.units').isInt({ min: 1 }).withMessage('Units must be at least 1'),
    body('requests.*.reason').notEmpty().withMessage('Reason is required'),
  ],
  validate,
  createBulkRequest
);

/**
 * @swagger
 * /api/hospitals/requests:
 *   get:
 *     summary: Get hospital's blood requests
 *     tags: [Hospitals]
 */
router.get('/requests', authorize('hospital'), getHospitalRequests);

/**
 * @swagger
 * /api/hospitals/{id}/verify:
 *   put:
 *     summary: Verify hospital (Admin)
 *     tags: [Hospitals]
 */
router.put('/:id/verify', authorize('admin'), verifyHospital);

module.exports = router;
