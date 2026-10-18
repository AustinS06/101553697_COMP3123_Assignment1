const { body, param, query } = require('express-validator');

const createEmployeeValidation = [
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),

  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('position')
    .trim()
    .notEmpty()
    .withMessage('Position is required')
    .isLength({ max: 100 })
    .withMessage('Position cannot exceed 100 characters'),

  body('salary')
    .notEmpty()
    .withMessage('Salary is required')
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),

  body('date_of_joining')
    .notEmpty()
    .withMessage('Date of joining is required')
    .isISO8601()
    .withMessage('Date of joining must be a valid date (ISO 8601 format)')
    .toDate(),

  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required')
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters'),
];

const updateEmployeeValidation = [
  param('eid')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isMongoId()
    .withMessage('Invalid employee ID format'),

  body('first_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),

  body('last_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('position')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Position cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Position cannot exceed 100 characters'),

  body('salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),

  body('date_of_joining')
    .optional()
    .isISO8601()
    .withMessage('Date of joining must be a valid date (ISO 8601 format)')
    .toDate(),

  body('department')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Department cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters'),
];

const employeeIdParamValidation = [
  param('eid')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isMongoId()
    .withMessage('Invalid employee ID format'),
];

const employeeIdQueryValidation = [
  query('eid')
    .notEmpty()
    .withMessage('Employee ID (eid) query parameter is required')
    .isMongoId()
    .withMessage('Invalid employee ID format'),
];

module.exports = {
  createEmployeeValidation,
  updateEmployeeValidation,
  employeeIdParamValidation,
  employeeIdQueryValidation,
};
