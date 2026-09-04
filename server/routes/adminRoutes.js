const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  deleteUser,
  exportReport,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(protect, authorize('admin'));

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 */
router.get('/stats', getDashboardStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with pagination
 *     tags: [Admin]
 */
router.get('/users', getUsers);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Activate/Deactivate user
 *     tags: [Admin]
 */
router.put('/users/:id/status', updateUserStatus);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 */
router.delete('/users/:id', deleteUser);

/**
 * @swagger
 * /api/admin/export/{type}:
 *   get:
 *     summary: Export reports as CSV
 *     tags: [Admin]
 */
router.get('/export/:type', exportReport);

module.exports = router;
