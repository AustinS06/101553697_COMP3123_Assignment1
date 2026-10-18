const Employee = require('../models/Employee');
const logger = require('../utils/logger');

/**
 * GET /api/v1/emp/employees
 * Get all employees owned by the authenticated user
 */
const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find({ user: req.user._id }).sort({
      created_at: -1,
    });

    logger.info(
      `User ${req.user.username} retrieved ${employees.length} employees`
    );

    res.status(200).json({
      status: true,
      message: 'Employees retrieved successfully',
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/emp/employees
 * Create a new employee for the authenticated user
 */
const createEmployee = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      email,
      position,
      salary,
      date_of_joining,
      department,
    } = req.body;

    const employee = await Employee.create({
      first_name,
      last_name,
      email,
      position,
      salary,
      date_of_joining,
      department,
      user: req.user._id, // Ownership set from authenticated user, never from client
    });

    logger.info(
      `Employee created by ${req.user.username}: ${employee._id} (${employee.first_name} ${employee.last_name})`
    );

    res.status(201).json({
      status: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/emp/employees/:eid
 * Get a single employee owned by the authenticated user
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const { eid } = req.params;

    // Ownership enforced in query - user can only find their own employees
    const employee = await Employee.findOne({
      _id: eid,
      user: req.user._id,
    });

    if (!employee) {
      // Could be non-existent OR belongs to another user - same response for security
      logger.warn(
        `Employee access denied or not found: ${eid} by user ${req.user.username}`
      );
      return res.status(404).json({
        status: false,
        message: 'Employee not found',
      });
    }

    logger.info(
      `User ${req.user.username} retrieved employee ${eid}`
    );

    res.status(200).json({
      status: true,
      message: 'Employee retrieved successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/emp/employees/:eid
 * Update an employee owned by the authenticated user
 */
const updateEmployee = async (req, res, next) => {
  try {
    const { eid } = req.params;

    // Only allow updating specific fields (prevent user field change)
    const allowedUpdates = [
      'first_name',
      'last_name',
      'email',
      'position',
      'salary',
      'date_of_joining',
      'department',
    ];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: false,
        message: 'No valid fields provided for update',
      });
    }

    // Ownership enforced in query
    const employee = await Employee.findOneAndUpdate(
      { _id: eid, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!employee) {
      logger.warn(
        `Employee update denied or not found: ${eid} by user ${req.user.username}`
      );
      return res.status(404).json({
        status: false,
        message: 'Employee not found',
      });
    }

    logger.info(
      `User ${req.user.username} updated employee ${eid}`
    );

    res.status(200).json({
      status: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/emp/employees?eid=xxx
 * Delete an employee owned by the authenticated user
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const { eid } = req.query;

    // Ownership enforced in query
    const employee = await Employee.findOneAndDelete({
      _id: eid,
      user: req.user._id,
    });

    if (!employee) {
      logger.warn(
        `Employee delete denied or not found: ${eid} by user ${req.user.username}`
      );
      return res.status(404).json({
        status: false,
        message: 'Employee not found',
      });
    }

    logger.info(
      `User ${req.user.username} deleted employee ${eid}`
    );

    // 204 No Content - no body
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
