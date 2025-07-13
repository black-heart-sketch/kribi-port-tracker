import Joi from 'joi';
import { Types } from 'mongoose';
import { ApiResponse } from './apiResponse.js';

// Custom validation for MongoDB ObjectId
const objectId = (value, helpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

// Custom validation for password
const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.error('password.min', { limit: 8 });
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.error('password.complexity');
  }
  return value;
};

// Validation schemas
const schemas = {
  // Auth schemas
  register: Joi.object({
    name: Joi.string().required().min(2).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().custom(password).required(),
    role: Joi.string().valid('user', 'admin', 'port_authority').default('user'),
    company: Joi.string().when('role', {
      is: 'port_authority',
      then: Joi.forbidden(),
      otherwise: Joi.string().required(),
    }),
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  
  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),
  
  resetPassword: Joi.object({
    password: Joi.string().custom(password).required(),
    passwordConfirm: Joi.string().valid(Joi.ref('password')).required(),
  }),
  
  // User schemas
  updateMe: Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/),
    company: Joi.string(),
    address: Joi.string(),
  }),
  
  updatePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().custom(password).required(),
    newPasswordConfirm: Joi.string().valid(Joi.ref('newPassword')).required(),
  }),
  
  // Ship schemas
  createShip: Joi.object({
    name: Joi.string().required().min(2).max(100),
    imoNumber: Joi.string().required().length(7).pattern(/^\d+$/),
    type: Joi.string().required(),
    company: Joi.string().required(),
    flag: Joi.string().required(),
    length: Joi.number().positive().required(),
    beam: Joi.number().positive(),
    draft: Joi.number().positive(),
    grossTonnage: Joi.number().positive(),
    deadweight: Joi.number().positive(),
    yearBuilt: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1),
    callSign: Joi.string(),
    mmsi: Joi.string().pattern(/^\d{9}$/),
  }),
  
  // Berthing schemas
  createBerthing: Joi.object({
    ship: Joi.string().custom(objectId).required(),
    dock: Joi.string().custom(objectId).required(),
    arrivalDate: Joi.date().required(),
    departureDate: Joi.date().min(Joi.ref('arrivalDate')).required(),
    purpose: Joi.string().required(),
    agent: Joi.string().custom(objectId).required(),
    cargoDetails: Joi.array().items(
      Joi.object({
        description: Joi.string().required(),
        type: Joi.string().required(),
        weight: Joi.number().positive(),
        quantity: Joi.number().positive(),
        unit: Joi.string(),
        owner: Joi.string().custom(objectId).required(),
        customsStatus: Joi.string().valid('pending', 'in_progress', 'cleared', 'rejected').default('pending'),
        notes: Joi.string(),
      })
    ),
    documents: Joi.array().items(Joi.string()),
    status: Joi.string().valid('pending', 'approved', 'rejected', 'completed').default('pending'),
    notes: Joi.string(),
  }),
  
  updateBerthingStatus: Joi.object({
    status: Joi.string().valid('approved', 'rejected', 'completed').required(),
    rejectionReason: Joi.when('status', {
      is: 'rejected',
      then: Joi.string().required(),
      otherwise: Joi.string(),
    }),
  }),
  
  // Dock schemas
  createDock: Joi.object({
    name: Joi.string().required().min(2).max(100),
    location: Joi.string().required(),
    length: Joi.number().positive().required(),
    maxDraft: Joi.number().positive().required(),
    status: Joi.string().valid('available', 'occupied', 'maintenance').default('available'),
    coordinates: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
    }),
    description: Joi.string(),
  }),
  
  // Notification schemas
  createNotification: Joi.object({
    title: Joi.string().required(),
    message: Joi.string().required(),
    type: Joi.string().valid('info', 'warning', 'error', 'success').default('info'),
    relatedDocument: Joi.string().custom(objectId),
    relatedDocumentModel: Joi.string(),
    actionUrl: Joi.string().uri(),
  }),
};

// Custom error messages for Joi
const customMessages = {
  'any.required': '{{#label}} is required',
  'string.base': '{{#label}} must be a string',
  'string.empty': '{{#label}} cannot be empty',
  'string.email': 'Please provide a valid email',
  'string.min': '{{#label}} must be at least {{#limit}} characters long',
  'string.max': '{{#label}} cannot exceed {{#limit}} characters',
  'string.length': '{{#label}} must be exactly {{#limit}} characters long',
  'string.pattern.base': 'Please provide a valid {{#label}}',
  'number.base': '{{#label}} must be a number',
  'number.positive': '{{#label}} must be a positive number',
  'number.integer': '{{#label}} must be an integer',
  'date.base': '{{#label}} must be a valid date',
  'date.min': '{{#label}} must be after {{:#limit}}',
  'any.only': '{{#label}} does not match',
  'any.invalid': 'Invalid {{#label}}',
  'password.min': 'Password must be at least {{#limit}} characters long',
  'password.complexity': 'Password must contain at least one letter and one number',
};

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    // Skip validation if schema doesn't exist
    if (!schemas[schema]) {
      return next();
    }
    
    // Validate request
    const { error, value } = schemas[schema].validate(req.body, {
      abortEarly: false,
      messages: customMessages,
    });
    
    // If validation fails, return error response
    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      return new ApiResponse(400, { errors: errorDetails }, 'Validation failed').send(res);
    }
    
    // Replace request body with validated value
    req.body = value;
    next();
  };
};

export { validate, objectId, password };
