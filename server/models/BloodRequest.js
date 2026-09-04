const mongoose = require('mongoose');

/**
 * Blood Request Model - Tracks blood requests from hospitals/individuals
 * Includes urgency levels and auto-matching logic
 */
const bloodRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requesterType: {
      type: String,
      enum: ['hospital', 'individual'],
      required: true,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
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
    prescriptionUrl: {
      type: String,
      default: '',
    },
    prescriptionPublicId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'fulfilled', 'rejected', 'cancelled'],
      default: 'pending',
    },
    matchedDonors: [
      {
        donorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Donor',
        },
        contacted: {
          type: Boolean,
          default: false,
        },
        response: {
          type: String,
          enum: ['pending', 'accepted', 'declined'],
          default: 'pending',
        },
      },
    ],
    fulfilledFrom: {
      type: String,
      enum: ['inventory', 'donor', 'both', ''],
      default: '',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    fulfilledDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
bloodRequestSchema.index({ bloodGroup: 1, city: 1, status: 1 });
bloodRequestSchema.index({ requesterId: 1 });
bloodRequestSchema.index({ urgency: 1, status: 1 });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
