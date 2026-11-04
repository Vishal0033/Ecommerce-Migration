import { logger } from '../utils/logger.js';
import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Prisma Known Request Errors
  if (err.code === 'P2002') {
    statusCode = 409;
    const target = err.meta?.target ? ` (${err.meta.target})` : '';
    message = `A record with this field already exists${target}.`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Requested record was not found.';
  } else if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Foreign key constraint failed. Related record does not exist.';
  }

  // Handle JSON Syntax Error (Malformed JSON payload)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON payload received.';
  }

  // Log server errors (500) with stack trace
  if (statusCode >= 500) {
    logger.error(`[Unhandled Error] ${req.method} ${req.originalUrl}:`, err);
  } else {
    logger.warn(`[Client Error ${statusCode}] ${req.method} ${req.originalUrl}: ${message}`);
  }

  return sendError(res, message, statusCode, errors);
};

