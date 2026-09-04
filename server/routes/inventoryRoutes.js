const express = require('express');
const { body } = require('express-validator');
const {
  getInventory,
  getStockSummary,
  addBloodUnits,
  updateInventory,
  removeBloodUnit,
  checkExpiredUnits,
  getLowStockAlerts,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get blood inventory
 *     tags: [Inventory]
 */
router.get('/', getInventory);

/**
 * @swagger
 * /api/inventory/summary:
 *   get:
 *     summary: Get stock summary grouped by blood group
 *     tags: [Inventory]
 */
router.get('/summary', getStockSummary);

/**
 * @swagger
 * /api/inventory/alerts:
 *   get:
 *     summary: Get low stock alerts
 *     tags: [Inventory]
 */
router.get('/alerts', authorize('admin'), getLowStockAlerts);

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Add blood units to inventory
 *     tags: [Inventory]
 */
router.post(
  '/',
  authorize('admin'),
  [
    body('bloodGroup')
      .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
      .withMessage('Valid blood group is required'),
    body('units')
      .isInt({ min: 1 })
      .withMessage('Units must be at least 1'),
    body('component')
      .optional()
      .isIn(['whole_blood', 'packed_rbc', 'platelets', 'plasma', 'cryoprecipitate'])
      .withMessage('Invalid blood component'),
  ],
  validate,
  addBloodUnits
);

/**
 * @swagger
 * /api/inventory/check-expiry:
 *   post:
 *     summary: Check and mark expired units
 *     tags: [Inventory]
 */
router.post('/check-expiry', authorize('admin'), checkExpiredUnits);

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Update inventory item
 *     tags: [Inventory]
 */
router.put('/:id', authorize('admin'), updateInventory);

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: Discard blood unit
 *     tags: [Inventory]
 */
router.delete('/:id', authorize('admin'), removeBloodUnit);

module.exports = router;
