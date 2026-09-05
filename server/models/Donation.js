const mongoose = require('mongoose');

/**
 * Donation Model - Tracks individual blood donations
 */
const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    donationType: {
      type: String,
      enum: ['whole_blood', 'platelets', 'plasma'],
      default: 'whole_blood',
    },
    component: {
      type: String,
      enum: ['whole_blood', 'packed_rbc', 'platelets', 'plasma', 'cryoprecipitate'],
      default: 'whole_blood',
    },
    units: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 3,
    },
    donationDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    location: {
      type: String,
      required: [true, 'Donation location is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    healthScreening: {
      hemoglobin: Number,
      bloodPressure: String,
      temperature: Number,
      pulse: Number,
      weight: Number,
      passed: {
        type: Boolean,
        default: false,
      },
    },
    notes: {
      type: String,
      default: '',
    },
    certificateGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Donation', donationSchema);
