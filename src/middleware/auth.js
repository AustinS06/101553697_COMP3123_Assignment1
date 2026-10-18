const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Authentication middleware
 * Verifies JWT from Authorization: Bearer <token>
 * Attaches authenticated user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn(`Authentication failed: Missing or invalid Authorization header - ${req.method} ${req.originalUrl}`);
      return res.status(401).json({
        status: false,
        message: 'Access denied. No token provided. Please login and include Authorization: Bearer <token>',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      logger.warn(`Authentication failed: Empty token - ${req.method} ${req.originalUrl}`);
      return res.status(401).json({
        status: false,
        message: 'Access denied. No token provided.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        logger.warn(`Authentication failed: Token expired - ${req.method} ${req.originalUrl}`);
        return res.status(401).json({
          status: false,
          message: 'Token has expired. Please login again.',
        });
      }
      if (err.name === 'JsonWebTokenError') {
        logger.warn(`Authentication failed: Invalid token - ${req.method} ${req.originalUrl}`);
        return res.status(401).json({
          status: false,
          message: 'Invalid token. Please login again.',
        });
      }
      throw err;
    }

    // Load user from DB (do not trust client-supplied user id)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      logger.warn(`Authentication failed: User not found for token - ${req.method} ${req.originalUrl}`);
      return res.status(401).json({
        status: false,
        message: 'User associated with this token no longer exists.',
      });
    }

    req.user = user;
    logger.debug(`Authenticated user: ${user.username} (${user._id}) - ${req.method} ${req.originalUrl}`);
    next();
  } catch (error) {
    logger.error(`Authentication middleware error: ${error.message}`);
    return res.status(500).json({
      status: false,
      message: 'Internal server error during authentication.',
    });
  }
};

module.exports = { authenticate };
