const mongoose = require('mongoose');

// Custom error class for API errors
class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Validation error handler
const handleValidationError = (err) => {
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map(error => error.message);
    return new ApiError(errors.join(', '), 400);
  }
  return err;
};

// Duplicate key error handler
const handleDuplicateKeyError = (err) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return new ApiError(`${field} already exists`, 400);
  }
  return err;
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    name: err.name
  });

  // Handle specific error types
  err = handleValidationError(err);
  err = handleDuplicateKeyError(err);

  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};

module.exports = {
  ApiError,
  errorHandler
}; 