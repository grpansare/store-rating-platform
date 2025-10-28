const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUser = [
  body('name')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('Password must contain at least one uppercase letter and one special character'),
  body('address')
    .optional()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters'),
  handleValidationErrors
];

// Store validation rules
const validateStore = [
  body('name')
    .isLength({ min: 1, max: 255 })
    .withMessage('Store name is required and must not exceed 255 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('address')
    .isLength({ min: 1, max: 400 })
    .withMessage('Address is required and must not exceed 400 characters'),
  handleValidationErrors
];

// Rating validation rules
const validateRating = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('store_id')
    .isInt({ min: 1 })
    .withMessage('Valid store ID is required'),
  handleValidationErrors
];

// Login validation rules
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Password update validation
const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('New password must be between 8 and 16 characters')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('New password must contain at least one uppercase letter and one special character'),
  handleValidationErrors
];

module.exports = {
  validateUser,
  validateStore,
  validateRating,
  validateLogin,
  validatePasswordUpdate,
  handleValidationErrors
};
