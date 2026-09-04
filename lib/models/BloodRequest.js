import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requesterType: {
      type: String,
      enum: ['donor', 'hospital', 'individual'],
      required: true,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood group is required'],
    },
    units: {
      type: Number,
      required: [true, 'Number of units is required'],
      min: 1,
      max: 10,
    },
    urgency: {
      type: String,
      enum: ['normal', 'urgent', 'critical'],
      default: 'normal',
    },
    reason: {
      type: String,
      required: [true, 'Reason for request is required'],
    },
    hospitalName: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
    },
    prescriptionUrl: String,
    prescriptionPublicId: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'fulfilled', 'rejected', 'cancelled'],
      default: 'pending',
    },
    matchedDonors: [
      {
        donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        bloodGroup: String,
        phone: String,
        notified: { type: Boolean, default: false },
      },
    ],
    fulfilledFrom: {
      type: String,
      enum: ['inventory', 'donor', 'external'],
    },
    adminNotes: String,
    fulfilledDate: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
bloodRequestSchema.index({ bloodGroup: 1, city: 1, status: 1 });
bloodRequestSchema.index({ requesterId: 1 });
bloodRequestSchema.index({ urgency: 1, status: 1 });

export default mongoose.models.BloodRequest || mongoose.model('BloodRequest', bloodRequestSchema);
