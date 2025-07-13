import ErrorResponse from '../utils/errorResponse.js';

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log to console for development
  if (process.env.NODE_ENV === 'development') {
    console.error('\x1b[31m', '--- Error Handler ---');
    console.error('\x1b[31m', 'Error:', err);
    console.error('\x1b[31m', 'Error Name:', err.name);
    console.error('\x1b[31m', 'Error Code:', err.code);
    console.error('\x1b[31m', 'Error Stack:', err.stack);
    console.error('\x1b[0m', '---------------------');
  }

  // Handle specific error types
  switch (true) {
    // Mongoose bad ObjectId
    case err.name === 'CastError':
      const message = `Resource not found with id of ${err.value}`;
      error = new ErrorResponse(message, 404);
      break;
      
    // Mongoose duplicate key
    case err.code === 11000:
      const duplicateField = Object.keys(err.keyValue)[0];
      error = new ErrorResponse(
        `Duplicate field value: ${err.keyValue[duplicateField]} already exists`,
        400
      );
      break;
      
    // Mongoose validation error
    case err.name === 'ValidationError':
      const messages = Object.values(err.errors).map(val => val.message);
      error = new ErrorResponse(messages, 400);
      break;
      
    // JWT errors
    case err.name === 'JsonWebTokenError':
      error = new ErrorResponse('Not authorized', 401);
      break;
      
    case err.name === 'TokenExpiredError':
      error = new ErrorResponse('Token expired', 401);
      break;
      
    // File upload errors
    case err.code === 'LIMIT_FILE_SIZE':
      error = new ErrorResponse('File size too large', 400);
      break;
      
    case err.code === 'LIMIT_UNEXPECTED_FILE':
      error = new ErrorResponse('Unexpected file field', 400);
      break;
      
    // Default to 500 server error
    default:
      if (!error.statusCode) {
        error.statusCode = 500;
        error.message = 'Server Error';
      }
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    error: error.message || 'Server Error',
    // Only include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// 404 Not Found middleware
export const notFound = (req, res, next) => {
  next(new ErrorResponse(`Not Found - ${req.originalUrl}`, 404));
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
