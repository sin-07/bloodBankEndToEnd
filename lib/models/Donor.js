import mongoose from 'mongoose';

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
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood group is required'],
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    weight: {
      type: Number,
      min: [45, 'Minimum weight for donation is 45 kg'],
    },
    lastDonationDate: {
      type: Date,
    },
    totalDonations: {
      type: Number,
      default: 0,
    },
    medicalConditions: [String],
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate
donorSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Check donation eligibility (90 days between donations)
donorSchema.methods.checkEligibility = function () {
  if (!this.lastDonationDate) return true;

  const daysSinceLastDonation = Math.floor(
    (Date.now() - this.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceLastDonation >= 90;
};

// Get days until eligible
donorSchema.methods.daysUntilEligible = function () {
  if (!this.lastDonationDate) return 0;

  const daysSinceLastDonation = Math.floor(
    (Date.now() - this.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return Math.max(0, 90 - daysSinceLastDonation);
};

export default mongoose.models.Donor || mongoose.model('Donor', donorSchema);
