import { AppError } from '../utils/appError.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('You are not authenticated.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Access forbidden: You do not have permission to perform this action.', 403)
      );
    }

    next();
  };
};

