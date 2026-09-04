const BloodInventory = require('../models/BloodInventory');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const { lowStockAlertEmail } = require('../utils/emailTemplates');

// Low stock threshold per blood group
const LOW_STOCK_THRESHOLD = 5;

/**
 * @desc    Get blood inventory summary
 * @route   GET /api/inventory
 * @access  Private (Admin)
 */
const getInventory = async (req, res, next) => {
  try {
    const { bloodGroup, component, status = 'available' } = req.query;

    const query = { status };
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (component) query.component = component;

    // Filter out expired items
    query.expiryDate = { $gt: new Date() };

    const inventory = await BloodInventory.find(query)
      .populate('addedBy', 'name')
      .sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      data: { inventory },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get blood stock summary (grouped by blood group)
 * @route   GET /api/inventory/summary
 * @access  Private
 */
const getStockSummary = async (req, res, next) => {
  try {
    const summary = await BloodInventory.aggregate([
      {
        $match: {
          status: 'available',
          expiryDate: { $gt: new Date() },
        },
      },
      {
        $group: {
          _id: { bloodGroup: '$bloodGroup', component: '$component' },
          totalUnits: { $sum: '$units' },
          count: { $sum: 1 },
          nearestExpiry: { $min: '$expiryDate' },
        },
      },
      {
        $sort: { '_id.bloodGroup': 1 },
      },
    ]);

    // Calculate low stock alerts
    const lowStockAlerts = summary
      .filter((item) => item.totalUnits < LOW_STOCK_THRESHOLD)
      .map((item) => ({
        bloodGroup: item._id.bloodGroup,
        component: item._id.component,
        currentUnits: item.totalUnits,
        threshold: LOW_STOCK_THRESHOLD,
      }));

    // Get expiring soon items (within 7 days)
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const expiringSoon = await BloodInventory.find({
      status: 'available',
      expiryDate: { $gt: new Date(), $lt: sevenDaysFromNow },
    }).sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      data: {
        summary,
        lowStockAlerts,
        expiringSoon,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add blood units to inventory
 * @route   POST /api/inventory
 * @access  Private (Admin)
 */
const addBloodUnits = async (req, res, next) => {
  try {
    const { bloodGroup, component, units, collectionDate, source, donationId, storageLocation, notes } =
      req.body;

    // Calculate expiry date based on component
    const collection = collectionDate ? new Date(collectionDate) : new Date();
    let expiryDays = 42; // Default for whole blood

    switch (component) {
      case 'platelets':
        expiryDays = 5;
        break;
      case 'plasma':
      case 'cryoprecipitate':
        expiryDays = 365;
        break;
      case 'packed_rbc':
        expiryDays = 42;
        break;
      default:
        expiryDays = 42;
    }

    const expiryDate = new Date(collection.getTime() + expiryDays * 24 * 60 * 60 * 1000);

    const inventory = await BloodInventory.create({
      bloodGroup,
      component: component || 'whole_blood',
      units,
      collectionDate: collection,
      expiryDate,
      source: source || 'donation',
      donationId,
      storageLocation,
      notes,
      addedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Blood units added to inventory',
      data: { inventory },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update blood inventory item
 * @route   PUT /api/inventory/:id
 * @access  Private (Admin)
 */
const updateInventory = async (req, res, next) => {
  try {
    const { units, status, storageLocation, notes } = req.body;

    const inventory = await BloodInventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    if (units !== undefined) inventory.units = units;
    if (status) inventory.status = status;
    if (storageLocation) inventory.storageLocation = storageLocation;
    if (notes) inventory.notes = notes;

    await inventory.save();

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: { inventory },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove/discard blood unit
 * @route   DELETE /api/inventory/:id
 * @access  Private (Admin)
 */
const removeBloodUnit = async (req, res, next) => {
  try {
    const inventory = await BloodInventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    inventory.status = 'discarded';
    await inventory.save();

    res.status(200).json({
      success: true,
      message: 'Blood unit discarded successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check and mark expired units
 * @route   POST /api/inventory/check-expiry
 * @access  Private (Admin)
 */
const checkExpiredUnits = async (req, res, next) => {
  try {
    const result = await BloodInventory.updateMany(
      {
        status: 'available',
        expiryDate: { $lt: new Date() },
      },
      {
        $set: { status: 'expired' },
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} expired units marked`,
      data: { expiredCount: result.modifiedCount },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get low stock alerts
 * @route   GET /api/inventory/alerts
 * @access  Private (Admin)
 */
const getLowStockAlerts = async (req, res, next) => {
  try {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const alerts = [];

    for (const bg of bloodGroups) {
      const totalUnits = await BloodInventory.aggregate([
        {
          $match: {
            bloodGroup: bg,
            status: 'available',
            expiryDate: { $gt: new Date() },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$units' },
          },
        },
      ]);

      const units = totalUnits.length > 0 ? totalUnits[0].total : 0;

      if (units < LOW_STOCK_THRESHOLD) {
        alerts.push({
          bloodGroup: bg,
          currentUnits: units,
          threshold: LOW_STOCK_THRESHOLD,
          severity: units === 0 ? 'critical' : 'warning',
        });
      }
    }

    // Send email alert if critical
    const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      // Send to all admin users
      const admins = await User.find({ role: 'admin', isActive: true }).select('email');
      const emailData = lowStockAlertEmail({ alerts: criticalAlerts });
      for (const admin of admins) {
        sendEmail({ to: admin.email, subject: emailData.subject, html: emailData.html }).catch(err => console.error('Low stock alert email error:', err));
      }
    }

    res.status(200).json({
      success: true,
      data: { alerts },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  getStockSummary,
  addBloodUnits,
  updateInventory,
  removeBloodUnit,
  checkExpiredUnits,
  getLowStockAlerts,
};
