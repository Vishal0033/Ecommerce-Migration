import { AppError } from '../utils/appError.js';

export const validateBody = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return next(new AppError('Validation failed', 400, formattedErrors));
    }
    return next(error);
  }
};

export const validateQuery = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse(req.query);
    req.query = validated;
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return next(new AppError('Query validation failed', 400, formattedErrors));
    }
    return next(error);
  }
};
