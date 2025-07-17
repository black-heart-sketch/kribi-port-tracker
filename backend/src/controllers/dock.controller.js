import Dock from '../models/dock.model.js';
import ErrorResponse from '../utils/errorResponse.js';
import { asyncHandler } from '../middleware/async.middleware.js';
import Docks from '../models/dock.model.js';

// @desc    Get all docks
// @route   GET /api/docks
// @access  Private
export const getDocks = asyncHandler(async (req, res, next) => {
  const docks=await Docks.find();
  // console.log(docks);
  res.status(200).json({
    success: true,
    count: docks.length,
    data: docks
  });
});

// @desc    Get available docks
// @route   GET /api/docks/available
// @access  Private
export const getAvailableDocks = asyncHandler(async (req, res, next) => {
  // Find docks that are not currently occupied and have status 'active'
  const docks = await Dock.find({
    status: 'available',
  })
  
  res.status(200).json({
    success: true,
    count: docks.length,
    data: docks
  });
});

// @desc    Get single dock
// @route   GET /api/docks/:id
// @access  Private
export const getDock = asyncHandler(async (req, res, next) => {
  const dock = await Dock.findById(req.params.id).populate({
    path: 'berthings',
    select: 'arrivalDate departureDate status ship',
    populate: {
      path: 'ship',
      select: 'name imoNumber type',
    },
  });

  if (!dock) {
    return next(
      new ErrorResponse(`Dock not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: dock,
  });
});

// @desc    Create new dock
// @route   POST /api/docks
// @access  Private/Admin
export const createDock = asyncHandler(async (req, res, next) => {
  // Check for existing dock with same name
  const existingDock = await Dock.findOne({ name: req.body.name });
  if (existingDock) {
    return next(
      new ErrorResponse(`A dock with name ${req.body.name} already exists`, 400)
    );
  }

  const dock = await Dock.create(req.body);

  res.status(201).json({
    success: true,
    data: dock,
  });
});

// @desc    Update dock
// @route   PUT /api/docks/:id
// @access  Private/Admin
export const updateDock = asyncHandler(async (req, res, next) => {
  let dock = await Dock.findById(req.params.id);

  if (!dock) {
    return next(
      new ErrorResponse(`Dock not found with id of ${req.params.id}`, 404)
    );
  }

 

  dock = await Dock.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: dock,
  });
});

// @desc    Delete dock
// @route   DELETE /api/docks/:id
// @access  Private/Admin
export const deleteDock = asyncHandler(async (req, res, next) => {
  const dock = await Dock.findById(req.params.id);

  if (!dock) {
    return next(
      new ErrorResponse(`Dock not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if dock has associated berthings
  const berthingCount = await Berthing.countDocuments({ dock: dock._id });
  if (berthingCount > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete dock that is associated with ${berthingCount} berthing(s)`,
        400
      )
    );
  }

  await dock.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get available docks
// @route   GET /api/docks/available
// @access  Private


// @desc    Get dock utilization statistics
// @route   GET /api/docks/utilization
// @access  Private/Admin
export const getDockUtilization = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  // Default to last 30 days if no date range provided
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  // Get all docks
  const docks = await Dock.find();
  
  // Get all berthings in the date range
  const berthings = await Berthing.find({
    $or: [
      { arrivalDate: { $lte: end }, departureDate: { $gte: start } },
      { arrivalDate: { $lte: end, $gte: start } },
      { departureDate: { $lte: end, $gte: start } },
    ],
    status: { $in: ['approved'] },
  });

  // Calculate total time range in milliseconds
  const totalTimeRange = end - start;

  // Calculate utilization for each dock
  const utilization = await Promise.all(
    docks.map(async (dock) => {
      // Filter berthings for this dock
      const dockBerthings = berthings.filter(b => b.dock.toString() === dock._id.toString());
      
      // Calculate total occupied time in milliseconds
      let totalOccupiedTime = 0;
      
      dockBerthings.forEach(berthing => {
        const overlapStart = Math.max(berthing.arrivalDate, start);
        const overlapEnd = Math.min(berthing.departureDate, end);
        
        // Add to total occupied time if there's an overlap
        if (overlapStart < overlapEnd) {
          totalOccupiedTime += overlapEnd - overlapStart;
        }
      });
      
      // Calculate utilization percentage
      const utilizationPercentage = (totalOccupiedTime / totalTimeRange) * 100;
      
      return {
        dock: dock.name,
        dockId: dock._id,
        totalBerthings: dockBerthings.length,
        utilization: Math.min(100, Math.round(utilizationPercentage * 100) / 100), // Cap at 100%
        status: dock.status,
      };
    })
  );

  // Calculate overall utilization
  const totalUtilization = utilization.reduce(
    (sum, dock) => sum + dock.utilization,
    0
  ) / (utilization.length || 1);

  res.status(200).json({
    success: true,
    data: {
      startDate: start,
      endDate: end,
      totalDocks: docks.length,
      averageUtilization: Math.min(100, Math.round(totalUtilization * 100) / 100), // Cap at 100%
      docks: utilization,
    },
  });
});

// @desc    Get dock status overview
// @route   GET /api/docks/status
// @access  Private
export const getDockStatus = asyncHandler(async (req, res, next) => {
  const docks = await Dock.aggregate([
    {
      $lookup: {
        from: 'berthings',
        let: { dockId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$dock', '$$dockId'] },
                  { $in: ['$status', ['pending', 'approved']] },
                  { $lte: ['$arrivalDate', new Date()] },
                  { $gte: ['$departureDate', new Date()] },
                ],
              },
            },
          },
          {
            $lookup: {
              from: 'ships',
              localField: 'ship',
              foreignField: '_id',
              as: 'ship',
            },
          },
          { $unwind: '$ship' },
          {
            $project: {
              _id: 1,
              ship: { name: 1, imoNumber: 1, type: 1 },
              arrivalDate: 1,
              departureDate: 1,
            },
          },
        ],
        as: 'currentBerthings',
      },
    },
    {
      $project: {
        name: 1,
        location: 1,
        status: 1,
        length: 1,
        maxDraft: 1,
        currentBerthings: 1,
        isOccupied: { $gt: [{ $size: '$currentBerthings' }, 0] },
      },
    },
    { $sort: { name: 1 } },
  ]);

  res.status(200).json({
    success: true,
    count: docks.length,
    data: docks,
  });
});
