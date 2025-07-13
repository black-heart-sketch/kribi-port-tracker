import ErrorResponse from '../utils/errorResponse.js';

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

// Check if user is the owner of the resource or has admin/port authority role
export const checkOwnership = (model, paramName = 'id') => {
  return async (req, res, next) => {
    const resource = await model.findById(req.params[paramName]);

    if (!resource) {
      return next(
        new ErrorResponse(
          `Resource not found with id of ${req.params[paramName]}`,
          404
        )
      );
    }

    // Check if user is admin or port authority
    if (['admin', 'port_authority'].includes(req.user.role)) {
      return next();
    }

    // Check if user is the owner of the resource
    if (resource.createdBy && resource.createdBy.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this resource`,
          401
        )
      );
    }

    // For resources that don't have createdBy but have user reference
    if (resource.user && resource.user.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this resource`,
          401
        )
      );
    }

    next();
  };
};

// Check if user is the owner of the cargo or has admin/port authority role
export const checkCargoOwnership = async (req, res, next) => {
  // Allow admins and port authorities
  if (['admin', 'port_authority'].includes(req.user.role)) {
    return next();
  }

  // Find the berthing that contains this cargo
  const berthing = await Berthing.findOne({
    'cargoDetails._id': req.params.cargoId,
  });

  if (!berthing) {
    return next(
      new ErrorResponse(`No cargo found with id ${req.params.cargoId}`, 404)
    );
  }

  // Check if the cargo belongs to the current user
  const cargoItem = berthing.cargoDetails.find(
    item => item._id.toString() === req.params.cargoId
  );

  if (!cargoItem) {
    return next(
      new ErrorResponse(`No cargo found with id ${req.params.cargoId}`, 404)
    );
  }

  // For cargo owners, check if they own the cargo
  if (req.user.role === 'cargo_owner') {
    if (cargoItem.owner.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `Not authorized to access this cargo`,
          403
        )
      );
    }
    return next();
  }

  // For maritime agents, check if they created the berthing
  if (req.user.role === 'maritime_agent') {
    if (berthing.createdBy.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `Not authorized to access this cargo`,
          403
        )
      );
    }
    return next();
  }

  // For customs brokers, check if they are assigned to this cargo
  if (req.user.role === 'customs_broker') {
    if (cargoItem.processedBy && cargoItem.processedBy.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `Not authorized to access this cargo`,
          403
        )
      );
    }
    // If not yet assigned, allow access (broker is claiming this cargo)
    return next();
  }

  next(
    new ErrorResponse(
      `User role ${req.user.role} is not authorized to access this route`,
      403
    )
  );
};
