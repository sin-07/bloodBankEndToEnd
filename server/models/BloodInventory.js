const mongoose = require('mongoose');

/**
 * Blood Inventory Model - Tracks blood units in stock
 * Includes expiry tracking (35-42 days for whole blood)
 */
const bloodInventorySchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    component: {
      type: String,
      enum: ['whole_blood', 'packed_rbc', 'platelets', 'plasma', 'cryoprecipitate'],
      default: 'whole_blood',
    },
    units: {
      type: Number,
      required: true,
      min: 0,
    },
    collectionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    source: {
      type: String,
      enum: ['donation', 'transfer', 'purchase'],
      default: 'donation',
    },
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'issued', 'expired', 'discarded'],
      default: 'available',
    },
    storageLocation: {
      type: String,
      default: 'Main Storage',
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    issuedTo: {
      requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BloodRequest',
      },
      issuedDate: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save: Calculate expiry date based on component type
 * Whole blood/packed RBC: 35-42 days
 * Platelets: 5 days
 * Plasma: 1 year (frozen)
 * Cryoprecipitate: 1 year (frozen)
 */
bloodInventorySchema.pre('save', function (next) {
  if (this.isNew && !this.expiryDate) {
    const collectionDate = this.collectionDate || new Date();
    switch (this.component) {
      case 'whole_blood':
      case 'packed_rbc':
        this.expiryDate = new Date(collectionDate.getTime() + 42 * 24 * 60 * 60 * 1000);
        break;
      case 'platelets':
        this.expiryDate = new Date(collectionDate.getTime() + 5 * 24 * 60 * 60 * 1000);
        break;
      case 'plasma':
      case 'cryoprecipitate':
        this.expiryDate = new Date(collectionDate.getTime() + 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        this.expiryDate = new Date(collectionDate.getTime() + 42 * 24 * 60 * 60 * 1000);
    }
  }
  next();
});

/**
 * Check if the unit is expired
 */
bloodInventorySchema.methods.isExpired = function () {
  return new Date() > this.expiryDate;
};

/**
 * Get days until expiry
 */
bloodInventorySchema.methods.daysUntilExpiry = function () {
  const diff = this.expiryDate.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// Indexes for efficient querying
bloodInventorySchema.index({ bloodGroup: 1, status: 1 });
bloodInventorySchema.index({ expiryDate: 1 });
bloodInventorySchema.index({ component: 1 });

module.exports = mongoose.model('BloodInventory', bloodInventorySchema);
