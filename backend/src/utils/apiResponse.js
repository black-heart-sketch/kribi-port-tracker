class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }

  // Success response with data
  static success(data, message = 'Operation successful') {
    return new ApiResponse(200, data, message);
  }

  // Created response (201)
  static created(data, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
  }

  // No content response (204)
  static noContent(message = 'No content') {
    return new ApiResponse(204, null, message);
  }

  // Bad request response (400)
  static badRequest(message = 'Bad request') {
    return new ApiResponse(400, null, message);
  }

  // Unauthorized response (401)
  static unauthorized(message = 'Unauthorized') {
    return new ApiResponse(401, null, message);
  }

  // Forbidden response (403)
  static forbidden(message = 'Forbidden') {
    return new ApiResponse(403, null, message);
  }

  // Not found response (404)
  static notFound(message = 'Resource not found') {
    return new ApiResponse(404, null, message);
  }

  // Conflict response (409)
  static conflict(message = 'Resource already exists') {
    return new ApiResponse(409, null, message);
  }

  // Unprocessable entity response (422)
  static unprocessableEntity(errors, message = 'Validation failed') {
    return new ApiResponse(422, { errors }, message);
  }

  // Internal server error response (500)
  static error(message = 'Internal server error') {
    return new ApiResponse(500, null, message);
  }

  // Send response to client
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }
}

export default ApiResponse;
