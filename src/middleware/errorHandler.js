import multer from 'multer';
import AppError from '../utils/AppError.js';

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error stack for debugging
  console.error('--- ERROR DETECTED ---');
  console.error(err);
  console.error('----------------------');

  // 1. Handle Multer Specific Errors (Request Level / File Upload Level)
  if (err instanceof multer.MulterError) {
    let message = 'File upload error.';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size is too large. Max limit is 5MB.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected field in upload request.';
    }
    return res.status(400).json({
      status: 'fail',
      error: {
        type: 'UploadError',
        message
      }
    });
  }

  // 2. Handle Custom Request / Operational Errors (AppError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: {
        type: err.constructor.name,
        message: err.message
      }
    });
  }

  // 3. Handle Other General/Global/System level errors (Programmer or System level)
  // Hide details in production environment if config exists, otherwise output detail for dev
  const isDev = process.env.NODE_ENV !== 'production';
  return res.status(err.statusCode).json({
    status: 'error',
    error: {
      type: 'ServerError',
      message: isDev ? err.message : 'Internal server error',
      ...(isDev && { stack: err.stack })
    }
  });
};

export default errorHandler;
export { AppError };
