import multer from 'multer';
import AppError from '../utils/AppError.js';

// Setup memory storage
const storage = multer.memoryStorage();

// File filter to only accept JPEG and PNG
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only JPEG and PNG are allowed.', 400), false);
  }
};

// Multer upload config
const uploadConfig = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  }
});

// Configure fields for front and back images
const uploadAadhaarFiles = uploadConfig.fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage', maxCount: 1 }
]);

export default uploadAadhaarFiles;
