const User = require('../models/User');
const Donor = require('../models/Donor');
const Donation = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');
const BloodInventory = require('../models/BloodInventory');
const Hospital = require('../models/Hospital');
const { exportToCSV } = require('../utils/csvExporter');

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalDonors,
      totalHospitals,
      totalRequests,
      pendingRequests,
      fulfilledRequests,
      totalDonations,
      activeUsers,
    ] = await Promise.all([
      Donor.countDocuments(),
      Hospital.countDocuments(),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: 'pending' }),
      BloodRequest.countDocuments({ status: 'fulfilled' }),
      Donation.countDocuments({ status: 'completed' }),
      User.countDocuments({ isActive: true }),
    ]);

    // Blood stock summary
    const bloodStock = await BloodInventory.aggregate([
      {
        $match: {
          status: 'available',
          expiryDate: { $gt: new Date() },
        },
      },
      {
        $group: {
          _id: '$bloodGroup',
          totalUnits: { $sum: '$units' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent requests
    const recentRequests = await BloodRequest.find()
      .populate('requesterId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly donation trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const donationTrends = await Donation.aggregate([
      {
        $match: {
          status: 'completed',
          donationDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$donationDate' },
            month: { $month: '$donationDate' },
          },
          count: { $sum: 1 },
          units: { $sum: '$units' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Request distribution by urgency
    const requestsByUrgency = await BloodRequest.aggregate([
      {
        $group: {
          _id: '$urgency',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalDonors,
          totalHospitals,
          totalRequests,
          pendingRequests,
          fulfilledRequests,
          totalDonations,
          activeUsers,
        },
        bloodStock,
        recentRequests,
        donationTrends,
        requestsByUrgency,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users with pagination
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search, isActive } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
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
 * @desc    Update user status (activate/deactivate)
 * @route   PUT /api/admin/users/:id/status
 * @access  Private (Admin)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete associated profiles
    if (user.role === 'donor') {
      await Donor.deleteOne({ userId: user._id });
      await Donation.deleteMany({ userId: user._id });
    }
    if (user.role === 'hospital') {
      await Hospital.deleteOne({ userId: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User and associated data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export reports as CSV
 * @route   GET /api/admin/export/:type
 * @access  Private (Admin)
 */
const exportReport = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    let data = [];
    let headers = [];
    let filename = '';

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    switch (type) {
      case 'donors':
        data = await Donor.find().populate('userId', 'name email phone city');
        headers = [
          { id: 'name', title: 'Name' },
          { id: 'email', title: 'Email' },
          { id: 'phone', title: 'Phone' },
          { id: 'bloodGroup', title: 'Blood Group' },
          { id: 'city', title: 'City' },
          { id: 'totalDonations', title: 'Total Donations' },
          { id: 'lastDonationDate', title: 'Last Donation' },
        ];
        data = data.map((d) => ({
          name: d.userId?.name || '',
          email: d.userId?.email || '',
          phone: d.userId?.phone || '',
          bloodGroup: d.bloodGroup,
          city: d.userId?.city || '',
          totalDonations: d.totalDonations,
          lastDonationDate: d.lastDonationDate
            ? d.lastDonationDate.toISOString().split('T')[0]
            : 'Never',
        }));
        filename = 'donors-report';
        break;

      case 'requests':
        const requestQuery = {};
        if (startDate || endDate) requestQuery.createdAt = dateFilter;
        data = await BloodRequest.find(requestQuery).populate('requesterId', 'name email');
        headers = [
          { id: 'patientName', title: 'Patient Name' },
          { id: 'bloodGroup', title: 'Blood Group' },
          { id: 'units', title: 'Units' },
          { id: 'urgency', title: 'Urgency' },
          { id: 'status', title: 'Status' },
          { id: 'hospitalName', title: 'Hospital' },
          { id: 'city', title: 'City' },
          { id: 'requestedBy', title: 'Requested By' },
          { id: 'date', title: 'Date' },
        ];
        data = data.map((r) => ({
          patientName: r.patientName,
          bloodGroup: r.bloodGroup,
          units: r.units,
          urgency: r.urgency,
          status: r.status,
          hospitalName: r.hospitalName || '',
          city: r.city,
          requestedBy: r.requesterId?.name || '',
          date: r.createdAt.toISOString().split('T')[0],
        }));
        filename = 'requests-report';
        break;

      case 'inventory':
        data = await BloodInventory.find({ status: 'available' }).populate('addedBy', 'name');
        headers = [
          { id: 'bloodGroup', title: 'Blood Group' },
          { id: 'component', title: 'Component' },
          { id: 'units', title: 'Units' },
          { id: 'collectionDate', title: 'Collection Date' },
          { id: 'expiryDate', title: 'Expiry Date' },
          { id: 'status', title: 'Status' },
          { id: 'addedBy', title: 'Added By' },
        ];
        data = data.map((i) => ({
          bloodGroup: i.bloodGroup,
          component: i.component,
          units: i.units,
          collectionDate: i.collectionDate.toISOString().split('T')[0],
          expiryDate: i.expiryDate.toISOString().split('T')[0],
          status: i.status,
          addedBy: i.addedBy?.name || '',
        }));
        filename = 'inventory-report';
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type. Use: donors, requests, or inventory',
        });
    }

    const csv = await exportToCSV(data, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  deleteUser,
  exportReport,
};
