const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const logger = require('./utils/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

const app = express();

// ---------- Security Middleware ----------
// Helmet sets various HTTP headers to help protect the app
app.use(helmet());

// Enable CORS
app.use(cors());

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ---------- Logging ----------
// HTTP request logging with morgan, integrated with winston
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// ---------- General Rate Limiting ----------
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  message: {
    status: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(
      `General rate limit exceeded: ${req.method} ${req.originalUrl} from ${req.ip}`
    );
    res.status(429).json(options.message);
  },
});
app.use(generalLimiter);

// ---------- Health Check ----------
/**
 * GET /health
 * Simple health-check endpoint to verify the API is running
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: true,
    message: 'API is healthy and running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ---------- API Routes ----------
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/emp', employeeRoutes);

// ---------- 404 & Error Handling ----------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
