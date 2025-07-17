import Ship from '../models/ship.model.js';
import ErrorResponse from '../utils/errorResponse.js';
import { asyncHandler } from '../middleware/async.middleware.js';
import path from 'path';
import ShipModel from '../models/ship.model.js';

// @desc    Get all ships
// @route   GET /api/ships
// @access  Private
export const getShips = asyncHandler(async (req, res, next) => {
 const ships=await ShipModel.find();
  console.log(ships);
  res.status(200).json({
    success: true,
    count: ships.length,
    data: ships
  });
});

// @desc    Get available ships
// @route   GET /api/ships/available
// @access  Private
export const getAvailableShips = asyncHandler(async (req, res, next) => {
  // Find ships that are not currently in an active berthing
 
  const ships = await Ship.find({
    status: 'active'
  });
  
  res.status(200).json({
    success: true,
    count: ships.length,
    data: ships
  });
});

// @desc    Get single ship
// @route   GET /api/ships/:id
// @access  Private
export const getShip = asyncHandler(async (req, res, next) => {
  const ship = await Ship.findById(req.params.id).populate({
    path: 'berthings',
    select: 'arrivalDate departureDate status dock',
    populate: {
      path: 'dock',
      select: 'name location',
    },
  });

  if (!ship) {
    return next(
      new ErrorResponse(`Ship not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: ship,
  });
});

// @desc    Create new ship
// @route   POST /api/ships
// @access  Private/Admin/Maritime Agent
export const createShip = asyncHandler(async (req, res, next) => {
  // Check for existing ship with same IMO number
  const existingShip = await Ship.findOne({ imoNumber: req.body.imoNumber });
  if (existingShip) {
    return next(
      new ErrorResponse(
        `A ship with IMO number ${req.body.imoNumber} already exists`,
        400
      )
    );
  }
console.log(req.body);
  // Add user to req.body

  const ship = await Ship.create(req.body);

  res.status(201).json({
    success: true,
    data: ship,
  });
});

// @desc    Update ship
// @route   PUT /api/ships/:id
// @access  Private/Admin/Maritime Agent
export const updateShip = asyncHandler(async (req, res, next) => {
  let ship = await Ship.findById(req.params.id);

  if (!ship) {
    return next(
      new ErrorResponse(`Ship not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if IMO number is being updated and if it's already in use
  if (req.body.imoNumber && req.body.imoNumber !== ship.imoNumber) {
    const existingShip = await Ship.findOne({ imoNumber: req.body.imoNumber });
    if (existingShip) {
      return next(
        new ErrorResponse(
          `A ship with IMO number ${req.body.imoNumber} already exists`,
          400
        )
      );
    }
  }

  // Make sure user is ship owner or admin
  

  ship = await Ship.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: ship,
  });
});

// @desc    Delete ship
// @route   DELETE /api/ships/:id
// @access  Private/Admin
export const deleteShip = asyncHandler(async (req, res, next) => {
  const ship = await Ship.findById(req.params.id);

  if (!ship) {
    return next(
      new ErrorResponse(`Ship not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if ship is associated with any berthings
  const berthingCount = await Ship.countDocuments({ ship: req.params.id });
  if (berthingCount > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete ship that is associated with ${berthingCount} berthing(s)`,
        400
      )
    );
  }

  // Make sure user is admin or port authority
  if (
    req.user.role !== 'admin' &&
    req.user.role !== 'port_authority'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete ships`,
        401
      )
    );
  }

  await ship.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Upload photo for ship
// @route   PUT /api/ships/:id/photo
// @access  Private
export const shipPhotoUpload = asyncHandler(async (req, res, next) => {
  const ship = await Ship.findById(req.params.id);

  if (!ship) {
    return next(
      new ErrorResponse(`Ship not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is ship owner or admin
  if (
    ship.createdBy.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'port_authority'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this ship`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${ship._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/ships/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Ship.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});

// @desc    Get ships by company
// @route   GET /api/ships/company/:company
// @access  Private
export const getShipsByCompany = asyncHandler(async (req, res, next) => {
  const { company } = req.params;
  const ships = await Ship.find({
    company: { $regex: company, $options: 'i' },
  });

  res.status(200).json({
    success: true,
    count: ships.length,
    data: ships,
  });
});

// @desc    Get ship statistics
// @route   GET /api/ships/stats
// @access  Private/Admin
export const getShipStats = asyncHandler(async (req, res, next) => {
  const stats = await Ship.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgLength: { $avg: '$length' },
        avgTonnage: { $avg: '$grossTonnage' },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  res.status(200).json({
    success: true,
    data: stats,
  });
});
