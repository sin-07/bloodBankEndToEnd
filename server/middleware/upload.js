const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

/**
 * Cloudinary storage configuration for prescription uploads
 */
const prescriptionStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bloodbank/prescriptions',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    transformation: [{ width: 1000, quality: 'auto' }],
  },
});

/**
 * Cloudinary storage for hospital documents
 */
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bloodbank/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
});

/**
 * File filter - Accept only images and PDFs
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
  }
};

// Upload middleware for prescriptions
const uploadPrescription = multer({
  storage: prescriptionStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Upload middleware for hospital documents
const uploadDocument = multer({
  storage: documentStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { uploadPrescription, uploadDocument };
