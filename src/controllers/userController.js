const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Generate JWT for a user
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
};

/**
 * POST /api/v1/user/signup
 * Register a new user
 */
const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        logger.warn(`Signup failed: Username already exists - ${username}`);
        return res.status(409).json({
          status: false,
          message: 'Username already exists',
        });
      }
      logger.warn(`Signup failed: Email already exists - ${email}`);
      return res.status(409).json({
        status: false,
        message: 'Email already exists',
      });
    }

    const user = await User.create({ username, email, password });

    logger.info(`User registered successfully: ${user.username} (${user._id})`);

    res.status(201).json({
      status: true,
      message: 'User created successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/user/login
 * Authenticate user with username+password or email+password
 */
const login = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Build query - support either username or email
    let query = {};
    if (username) {
      query.username = username;
    } else if (email) {
      query.email = email.toLowerCase();
    }

    // Explicitly select password since it has select: false
    const user = await User.findOne(query).select('+password');

    if (!user) {
      logger.warn(
        `Login failed: User not found - ${username || email}`
      );
      return res.status(401).json({
        status: false,
        message: 'Invalid username/email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(
        `Login failed: Invalid password for user - ${user.username}`
      );
      return res.status(401).json({
        status: false,
        message: 'Invalid username/email or password',
      });
    }

    const token = generateToken(user._id);

    logger.info(`User logged in successfully: ${user.username} (${user._id})`);

    res.status(200).json({
      status: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
};
