import mongoose from 'mongoose';

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
      trim: true,
    },
    contactPerson: {
      name: String,
      phone: String,
      designation: String,
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

export default mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);
