const express = require('express');
const {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { authenticate } = require('../middleware/auth');
const {
  createEmployeeValidation,
  updateEmployeeValidation,
  employeeIdParamValidation,
  employeeIdQueryValidation,
} = require('../validators/employeeValidators');
const validate = require('../middleware/validate');

const router = express.Router();

// All employee routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/emp/employees
 * @desc    Get all employees owned by authenticated user
 * @access  Private
 */
router.get('/employees', getAllEmployees);

/**
 * @route   POST /api/v1/emp/employees
 * @desc    Create a new employee for authenticated user
 * @access  Private
 */
router.post(
  '/employees',
  createEmployeeValidation,
  validate,
  createEmployee
);

/**
 * @route   GET /api/v1/emp/employees/:eid
 * @desc    Get a single employee by ID (must be owned by user)
 * @access  Private
 */
router.get(
  '/employees/:eid',
  employeeIdParamValidation,
  validate,
  getEmployeeById
);

/**
 * @route   PUT /api/v1/emp/employees/:eid
 * @desc    Update an employee (must be owned by user)
 * @access  Private
 */
router.put(
  '/employees/:eid',
  updateEmployeeValidation,
  validate,
  updateEmployee
);

/**
 * @route   DELETE /api/v1/emp/employees?eid=xxx
 * @desc    Delete an employee by query param eid (must be owned by user)
 * @access  Private
 */
router.delete(
  '/employees',
  employeeIdQueryValidation,
  validate,
  deleteEmployee
);

module.exports = router;
