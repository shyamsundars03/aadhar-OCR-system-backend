import AppError from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
      files: req.files
    });
    next();
  } catch (err) {
    if (err.errors) {
      const errorMsg = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return next(new AppError(errorMsg, HTTP_STATUS.BAD_REQUEST));
    }
    next(new AppError(err.message, HTTP_STATUS.BAD_REQUEST));
  }
};
