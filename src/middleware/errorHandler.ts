import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import AppError from '../utils/AppError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/index.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = 'Internal server error';

  console.error('--- ERROR DETECTED ---');
  console.error(err);
  console.error('----------------------');

  if (err instanceof multer.MulterError) {
    message = ERROR_MESSAGES.UPLOAD_ERROR;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = ERROR_MESSAGES.FILE_TOO_LARGE;
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = ERROR_MESSAGES.UNEXPECTED_FIELD;
    }
    return ApiResponse.fail(res, message, HTTP_STATUS.BAD_REQUEST);
  }

  if (err instanceof AppError && err.isOperational) {
    return ApiResponse.fail(res, err.message, err.statusCode);
  }

  if (err instanceof Error) {
    const isDev = process.env.NODE_ENV !== 'production';
    message = isDev ? err.message : 'Internal server error';
    if ('statusCode' in err) {
      const customCode = (err as { statusCode: unknown }).statusCode;
      if (typeof customCode === 'number') {
        statusCode = customCode;
      }
    }
  }

  return ApiResponse.error(res, message, statusCode);
};

export default errorHandler;
