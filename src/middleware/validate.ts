import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import AppError from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
      files: req.files
    });
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errorMsg = err.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return next(new AppError(errorMsg, HTTP_STATUS.BAD_REQUEST));
    }
    const message = err instanceof Error ? err.message : String(err);
    next(new AppError(message, HTTP_STATUS.BAD_REQUEST));
  }
};
