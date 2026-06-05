import multer from 'multer';
import AppError from '../utils/AppError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  console.error('--- ERROR DETECTED ---');
  console.error(err);
  console.error('----------------------');

  if (err instanceof multer.MulterError) {
    let message = 'File upload error.';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size is too large. Max limit is 5MB.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected field in upload request.';
    }
    return ApiResponse.fail(res, message, HTTP_STATUS.BAD_REQUEST);
  }

  if (err.isOperational) {
    return ApiResponse.fail(res, err.message, statusCode);
  }

  const isDev = process.env.NODE_ENV !== 'production';
  const message = isDev ? err.message : 'Internal server error';
  return ApiResponse.error(res, message, statusCode);
};

export default errorHandler;
export { AppError };
