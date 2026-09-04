import mongoose from 'mongoose';

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
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    units: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },
    donationDate: {
      type: Date,
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
      pulse: Number,
      temperature: Number,
      weight: Number,
      isCleared: {
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

export default mongoose.models.Donation || mongoose.model('Donation', donationSchema);
