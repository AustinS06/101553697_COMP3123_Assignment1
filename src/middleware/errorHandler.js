const logger = require('../utils/logger');

/**
 * 404 handler for undefined routes
 */
const notFound = (req, res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

/**
 * Centralized error handling middleware
 * Must be registered last
 */
const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    logger.error(err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      status: false,
      message: 'Validation error',
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      status: false,
      message: `${field} already exists`,
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // JWT errors (should normally be caught in auth middleware)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: false,
      message: 'Invalid token',
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: false,
      message: 'Token expired',
    });
  }

  // Default
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: false,
    message:
      process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Internal server error'
        : err.message || 'Internal server error',
  });
};

module.exports = { notFound, errorHandler };
