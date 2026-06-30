import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import AppError from '../utils/AppError.js';

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only JPEG and PNG are allowed.', 400));
  }
};

const uploadConfig = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 
  }
});

const uploadAadhaarFiles = uploadConfig.fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage', maxCount: 1 }
]);

export default uploadAadhaarFiles;
