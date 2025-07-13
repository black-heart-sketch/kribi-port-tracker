class ErrorResponse extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'ERROR';
    this.isOperational = true;
    
    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }

  // Bad Request Error (400)
  static badRequest(message = 'Bad Request', code) {
    return new ErrorResponse(message, 400, code || 'BAD_REQUEST');
  }

  // Unauthorized Error (401)
  static unauthorized(message = 'Not authorized', code) {
    return new ErrorResponse(message, 401, code || 'UNAUTHORIZED');
  }

  // Forbidden Error (403)
  static forbidden(message = 'Forbidden', code) {
    return new ErrorResponse(message, 403, code || 'FORBIDDEN');
  }

  // Not Found Error (404)
  static notFound(resource, code) {
    const message = resource ? `${resource} not found` : 'Resource not found';
    return new ErrorResponse(message, 404, code || 'NOT_FOUND');
  }

  // Method Not Allowed (405)
  static methodNotAllowed(message = 'Method not allowed', code) {
    return new ErrorResponse(message, 405, code || 'METHOD_NOT_ALLOWED');
  }

  // Conflict Error (409)
  static conflict(message = 'Conflict', code) {
    return new ErrorResponse(message, 409, code || 'CONFLICT');
  }

  // Validation Error (422)
  static validationError(errors, message = 'Validation failed') {
    const error = new ErrorResponse(message, 422, 'VALIDATION_ERROR');
    error.errors = errors;
    return error;
  }

  // Too Many Requests (429)
  static tooManyRequests(message = 'Too many requests, please try again later', code) {
    return new ErrorResponse(message, 429, code || 'TOO_MANY_REQUESTS');
  }

  // Internal Server Error (500)
  static serverError(message = 'Internal Server Error', code) {
    return new ErrorResponse(message, 500, code || 'INTERNAL_SERVER_ERROR');
  }

  // Service Unavailable (503)
  static serviceUnavailable(message = 'Service Unavailable', code) {
    return new ErrorResponse(message, 503, code || 'SERVICE_UNAVAILABLE');
  }

  // Database Error
  static databaseError(error) {
    let message = 'Database operation failed';
    let statusCode = 500;
    let code = 'DATABASE_ERROR';

    // Handle duplicate field errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      message = `${field} already exists`;
      statusCode = 400;
      code = 'DUPLICATE_FIELD';
    }
    // Handle validation errors
    else if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return this.validationError(errors, 'Validation failed');
    }
    // Handle cast errors (invalid ObjectId, etc.)
    else if (error.name === 'CastError') {
      message = `Invalid ${error.path}: ${error.value}`;
      statusCode = 400;
      code = 'INVALID_INPUT';
    }
    // Handle JWT errors
    else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token';
      statusCode = 401;
      code = 'INVALID_TOKEN';
    } else if (error.name === 'TokenExpiredError') {
      message = 'Token expired';
      statusCode = 401;
      code = 'TOKEN_EXPIRED';
    }

    return new ErrorResponse(message, statusCode, code);
  }
}

export default ErrorResponse;
