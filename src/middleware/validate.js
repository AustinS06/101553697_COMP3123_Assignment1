const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Middleware that checks express-validator results
 * and returns 400 with structured error messages
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    logger.warn(
      `Validation failed - ${req.method} ${req.originalUrl}: ${JSON.stringify(extractedErrors)}`
    );

    return res.status(400).json({
      status: false,
      message: 'Validation failed',
      errors: extractedErrors,
    });
  }
  next();
};

module.exports = validate;
