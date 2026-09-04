import mongoose from 'mongoose';

const bloodInventorySchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood group is required'],
    },
    component: {
      type: String,
      enum: ['whole_blood', 'packed_rbc', 'platelets', 'plasma', 'cryoprecipitate'],
      default: 'whole_blood',
    },
    units: {
      type: Number,
      required: [true, 'Number of units is required'],
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
    },
    issuedTo: {
      requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest' },
      issuedDate: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate expiry date based on component
bloodInventorySchema.pre('save', function (next) {
  if (this.isNew && !this.expiryDate) {
    const collectionDate = this.collectionDate || new Date();
    let expiryDays = 42;

    switch (this.component) {
      case 'platelets':
        expiryDays = 5;
        break;
      case 'plasma':
      case 'cryoprecipitate':
        expiryDays = 365;
        break;
      case 'whole_blood':
      case 'packed_rbc':
      default:
        expiryDays = 42;
    }

    this.expiryDate = new Date(collectionDate.getTime() + expiryDays * 24 * 60 * 60 * 1000);
  }
  next();
});

// Check if expired
bloodInventorySchema.methods.isExpired = function () {
  return new Date() > this.expiryDate;
};

// Days until expiry
bloodInventorySchema.methods.daysUntilExpiry = function () {
  const diff = this.expiryDate.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export default mongoose.models.BloodInventory || mongoose.model('BloodInventory', bloodInventorySchema);
