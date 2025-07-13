import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import ErrorResponse from '../utils/errorResponse.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization || '';
    
    // 1) Get token from header
    if (authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    } 
    // 2) Get token from cookie
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // 3) Check if token exists
    if (!token) {
      return next(
        new ErrorResponse('You are not logged in! Please log in to get access.', 401)
      );
    }

    try {
      // 4) Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 5) Check if user still exists
      const currentUser = await User.findById(decoded.id).select('+passwordChangedAt');
      if (!currentUser) {
        return next(
          new ErrorResponse('The user belonging to this token no longer exists.', 401)
        );
      }
      
      // 6) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
          new ErrorResponse('User recently changed password! Please log in again.', 401)
        );
      }
      
      // 7) Check if account is active
      if (!currentUser.isActive) {
        return next(
          new ErrorResponse('Your account has been deactivated. Please contact support.', 401)
        );
      }
      
      // 8) Grant access to protected route
      req.user = currentUser;
      res.locals.user = currentUser;
      next();
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        return next(new ErrorResponse('Invalid token. Please log in again!', 401));
      }
      if (err.name === 'TokenExpiredError') {
        return next(
          new ErrorResponse('Your token has expired! Please log in again.', 401)
        );
      }
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
  } catch (err) {
    return next(new ErrorResponse('Authentication failed', 401));
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Check if user is logged in, only for rendered pages, no errors!
export const isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      // 1) Verify token
      const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    }
    next();
  } catch (err) {
    return next();
  }
};

// Restrict to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          'You do not have permission to perform this action',
          403
        )
      );
    }

    next();
  };
};

// Check if user is the owner of the resource or admin
export const checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const doc = await model.findById(req.params.id);
      
      if (!doc) {
        return next(
          new ErrorResponse(`No document found with that ID`, 404)
        );
      }
      
      // Check if user is admin or the owner
      if (doc.user && doc.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
          new ErrorResponse(
            'You do not have permission to perform this action',
            403
          )
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Prevent password update on this route
export const preventPasswordUpdate = (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new ErrorResponse(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }
  next();
};
