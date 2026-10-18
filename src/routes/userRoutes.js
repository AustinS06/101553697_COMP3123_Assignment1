const express = require('express');
const rateLimit = require('express-rate-limit');
const { signup, login } = require('../controllers/userController');
const {
  signupValidation,
  loginValidation,
} = require('../validators/userValidators');
const validate = require('../middleware/validate');
const logger = require('../utils/logger');

const router = express.Router();

// Stricter rate limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window per IP
  message: {
    status: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(
      `Rate limit exceeded on auth endpoint: ${req.method} ${req.originalUrl} from ${req.ip}`
    );
    res.status(429).json(options.message);
  },
});

/**
 * @route   POST /api/v1/user/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', authLimiter, signupValidation, validate, signup);

/**
 * @route   POST /api/v1/user/login
 * @desc    Authenticate user and return JWT
 * @access  Public
 */
router.post('/login', authLimiter, loginValidation, validate, login);

module.exports = router;
