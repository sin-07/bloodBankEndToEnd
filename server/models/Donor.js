const mongoose = require('mongoose');

/**
 * Donor Model - Extended donor profile information
 * Links to User model via userId
 */
const donorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    weight: {
      type: Number,
      min: [45, 'Minimum weight for donation is 45 kg'],
    },
    lastDonationDate: {
      type: Date,
      default: null,
    },
    totalDonations: {
      type: Number,
      default: 0,
    },
    medicalConditions: {
      type: [String],
      default: [],
    },
    isEligible: {
      type: Boolean,
      default: true,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Check eligibility based on 90-day rule
 * Donors must wait at least 90 days between donations
 */
donorSchema.methods.checkEligibility = function () {
  if (!this.lastDonationDate) return true;
  const daysSinceLastDonation = Math.floor(
    (Date.now() - this.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysSinceLastDonation >= 90;
};

/**
 * Get days until next eligible donation
 */
donorSchema.methods.daysUntilEligible = function () {
  if (!this.lastDonationDate) return 0;
  const daysSinceLastDonation = Math.floor(
    (Date.now() - this.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, 90 - daysSinceLastDonation);
};

// Virtual to populate user details
donorSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

donorSchema.set('toJSON', { virtuals: true });
donorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Donor', donorSchema);
