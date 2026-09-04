const mongoose = require('mongoose');

/**
 * Hospital Model - Extended hospital profile information
 * Links to User model via userId
 */
const hospitalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
    },
    type: {
      type: String,
      enum: ['government', 'private', 'charitable'],
      default: 'private',
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    contactPerson: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      designation: { type: String },
    },
    totalRequests: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    documents: [
      {
        name: String,
        url: String,
        publicId: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

hospitalSchema.index({ city: 1 });
hospitalSchema.index({ isVerified: 1 });

module.exports = mongoose.model('Hospital', hospitalSchema);
