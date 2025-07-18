import Berthing from '../models/berthing.model.js';
import Ship from '../models/ship.model.js';
import Dock from '../models/dock.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import ErrorResponse from '../utils/errorResponse.js';
import { asyncHandler } from '../middleware/async.middleware.js';
import sendEmail from '../utils/email.js';

// @desc    Create new berthing
// @route   POST /api/berthings
// @access  Private/Maritime Agent
export const createBerthing = asyncHandler(async (req, res, next) => {
  console.log(req.body)
  // Get form data
  const {
    ship:shipId,
    dock: dockId,
    arrivalDate,
    departureDate,
    specialRequirements,
    cargoDetails,
    createdBy,
  } = req.body;

  // Parse cargoDetails if it's a string (from FormData)
  const parsedCargoDetails = typeof cargoDetails === 'string' 
    ? JSON.parse(cargoDetails) 
    : cargoDetails;

  // Get uploaded files
  const documents = req.files?.documents?.map(file => ({
    filename: file.filename,
    path: file.path,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  })) || [];

  // Check if the dock is available
  const dock = await Dock.findById(dockId);
  if (!dock) {
    return next(new ErrorResponse(`No dock found with id ${dockId}`, 404));
  }

  // Check if the dock is available
  if (dock.status === 'occupied') {
    console.log('The selected dock is currently occupied');
    return next(new ErrorResponse('The selected dock is currently occupied', 400));
  }

  // Check if the ship exists
  const ship = await Ship.findById(shipId);
  if (!ship) {
    return next(new ErrorResponse(`No ship found with id ${ship}`, 404));
  }

  // Create berthing
  const berthing = await Berthing.create({
    ship,
    dock: dockId,
    arrivalDate,
    departureDate,
    specialRequirements,
    cargoDetails: parsedCargoDetails,
    documents,
    status: 'pending',
    createdBy: createdBy,
  });

  // Update dock status to occupied
  dock.status = 'occupied';
  await dock.save();

  // Notify admins
  const admins = await User.find({ role: 'admin' });
  
  const notificationPromises = admins.map(admin => 
    Notification.create({
      user: admin._id,
      title: 'New Berthing Request',
      message: `A new berthing has been requested for ${ship.name} at ${dock.name}`,
      type: 'berthing_request',
      relatedDocument: berthing._id,
      relatedDocumentModel: 'Berthing',
      actionUrl: `/admin/berthings/${berthing._id}`
    })
  );

  await Promise.all(notificationPromises);

  // Send email notification to admins
  // const emailPromises = admins.map(admin => {
  //   const email = new Email(admin, {
  //     firstName: admin.name,
  //     url: `${req.protocol}://${req.get('host')}/admin/berthings/${berthing._id}`,
  //     berthing: {
  //       ...berthing.toObject(),
  //       ship: ship.toObject(),
  //       dock: dock.toObject()
  //     }
  //   });

  //   return email.sendBerthingNotification();
  // });

  // Don't await email sending to avoid blocking the response
  // Promise.all(emailPromises).catch(console.error);
console.log('Berthing created successfully');
  res.status(201).json({
    success: true,
    data: berthing,
  });
});

// @desc    Get all berthings
// @route   GET /api/berthings
// @access  Private
export const getBerthings = asyncHandler(async (req, res, next) => {
  // Finding resource
  let berthings =await Berthing.find().populate('ship').populate('dock').populate('createdBy')
  .populate('approvedBy')
// console.log(berthings)
  res.status(200).json({
    success: true,
    count: berthings.length,
    data: berthings,
  });
});

// @desc    Get single berthing
// @route   GET /api/berthings/:id
// @access  Private
export const getBerthing = asyncHandler(async (req, res, next) => {
  const berthing = await Berthing.findById(req.params.id)
    .populate({
      path: 'ship',
      select: 'name imoNumber type company photo',
    })
    .populate({
      path: 'dock',
      select: 'name location status',
    })
    .populate({
      path: 'createdBy',
      select: 'name email company',
    })
    .populate({
      path: 'approvedBy',
      select: 'name email',
    })
    .populate({
      path: 'cargoDetails.owner',
      select: 'name email company',
    })
    .populate({
      path: 'cargoDetails.processedBy',
      select: 'name email',
    });

  if (!berthing) {
    return next(
      new ErrorResponse(`Berthing not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is authorized to view this berthing
  if (
    berthing.createdBy._id.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'port_authority'
  ) {
    // Check if user is a cargo owner for any of the cargo in this berthing
    const isCargoOwner = berthing.cargoDetails.some(
      cargo => cargo.owner && cargo.owner._id.toString() === req.user.id
    );

    if (!isCargoOwner) {
      return next(
        new ErrorResponse(
          `User not authorized to access this berthing`,
          401
        )
      );
    }
  }

  res.status(200).json({
    success: true,
    data: berthing,
  });
});

// @desc    Update berthing
// @route   PUT /api/berthings/:id
// @access  Private
export const updateBerthing = asyncHandler(async (req, res, next) => {
  let berthing = await Berthing.findById(req.params.id);

  if (!berthing) {
    return next(
      new ErrorResponse(`Berthing not found with id of ${req.params.id}`, 404)
    );
  }

  const currentDate = new Date();

  // Make sure user is authorized to update this berthing
  // if (
  //   berthing.createdBy.toString() !== req.user.id &&
  //   req.user.role !== 'admin' &&
  //   req.user.role !== 'port_authority'
  // ) {
  //   return next(
  //     new ErrorResponse(
  //       `User not authorized to update this berthing`,
  //       401
  //     )
  //   );
  // }

  // If status is being updated to approved, set approvedBy
  if (req.body.status === 'approved' && !berthing.approvedBy) {
    console.log(req.body)
    req.body.approvedBy = req.body.userId;
  }
  

  // If status is being updated to completed, free up the dock
  if (req.body.status === 'completed') {
    await Dock.findByIdAndUpdate(berthing.dock, { status: 'available',rejectedBy: req.body.userId });
  }
  if (req.body.status === 'rejected') {
    await Dock.findByIdAndUpdate(berthing.dock, { status: 'available',rejectedBy: req.body.userId });
  }

  berthing = await Berthing.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: berthing,
  });
});

// @desc    Delete berthing
// @route   DELETE /api/berthings/:id
// @access  Private
export const deleteBerthing = asyncHandler(async (req, res, next) => {
  const berthing = await Berthing.findById(req.params.id);

  if (!berthing) {
    return next(
      new ErrorResponse(`Berthing not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is authorized to delete this berthing
  if (
    berthing.createdBy.toString() !== req.user.id &&
    req.user.role !== 'admin' &&
    req.user.role !== 'port_authority'
  ) {
    return next(
      new ErrorResponse(
        `User not authorized to delete this berthing`,
        401
      )
    );
  }

  // Free up the dock if berthing was active
  if (berthing.status === 'approved') {
    await Dock.findByIdAndUpdate(berthing.dock, { status: 'available' });
  }

  await berthing.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Approve berthing
// @route   PUT /api/berthings/:id/approve
// @access  Private/Admin
export const approveBerthing = asyncHandler(async (req, res, next) => {
  const berthing = await Berthing.findById(req.params.id);

  if (!berthing) {
    return next(
      new ErrorResponse(`Berthing not found with id of ${req.params.id}`, 404)
    );
  }

  if (berthing.status !== 'pending') {
    return next(
      new ErrorResponse(
        `Only pending berthings can be approved. Current status: ${berthing.status}`,
        400
      )
    );
  }

  // Update berthing status and set approvedBy
  berthing.status = 'approved';
  berthing.approvedBy = req.user.id;
  
  // Update dock status to occupied
  await Dock.findByIdAndUpdate(berthing.dock, { status: 'occupied' });

  await berthing.save();

  // Notify the user who created the berthing
  const creator = await User.findById(berthing.createdBy);
  if (creator) {
    await Notification.create({
      user: creator._id,
      title: 'Berthing Approved',
      message: `Your berthing request has been approved.`,
      type: 'berthing_approved',
      relatedDocument: berthing._id,
      relatedDocumentModel: 'Berthing',
      actionUrl: `/berthings/${berthing._id}`
    });

    // Send email notification
    const email = new Email(creator, {
      firstName: creator.name,
      url: `${req.protocol}://${req.get('host')}/berthings/${berthing._id}`,
      berthing: {
        ...berthing.toObject(),
        ship: await Ship.findById(berthing.ship).select('name imoNumber'),
        dock: await Dock.findById(berthing.dock).select('name location')
      }
    });

    email.sendBerthingNotification().catch(console.error);
  }

  res.status(200).json({
    success: true,
    data: berthing,
  });
});

// @desc    Reject berthing
// @route   PUT /api/berthings/:id/reject
// @access  Private/Admin
export const rejectBerthing = asyncHandler(async (req, res, next) => {
  const { reason } = req.body.reason;
  const { userId } = req.body.reason;
  
  if (!reason) {
    return next(
      new ErrorResponse('Please provide a reason for rejection', 400)
    );
  }

  const berthing = await Berthing.findById(req.params.id);

  if (!berthing) {
    return next(
      new ErrorResponse(`Berthing not found with id of ${req.params.id}`, 404)
    );
  }

  if (berthing.status !== 'pending') {
    return next(
      new ErrorResponse(
        `Only pending berthings can be rejected. Current status: ${berthing.status}`,
        400
      )
    );
  }

  // Update berthing status and set rejection reason
  berthing.status = 'rejected';
  berthing.rejectionReason = reason;
  berthing.rejectedBy = userId;
  
  // Free up the dock
  await Dock.findByIdAndUpdate(berthing.dock, { status: 'available' });

  await berthing.save();

  // Notify the user who created the berthing
  const creator = await User.findById(berthing.createdBy);
  if (creator) {
    await Notification.create({
      user: creator._id,
      title: 'Berthing Rejected',
      message: `Your berthing request has been rejected. Reason: ${reason}`,
      type: 'berthing_rejected',
      relatedDocument: berthing._id,
      relatedDocumentModel: 'Berthing',
      actionUrl: `/berthings/${berthing._id}`
    });
  }

  res.status(200).json({
    success: true,
    data: berthing,
  });
});

// @desc    Get berthings for a specific user
// @route   GET /api/berthings/user/:userId
// @access  Private/Admin or self
export const getUserBerthings = asyncHandler(async (req, res, next) => {
  // Check if the requested user is the same as the logged in user or if the requester is an admin
  if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Not authorized to access this resource', 403)
    );
  }

  const berthings = await Berthing.find({ createdBy: req.params.userId })
    .populate('ship', 'name imoNumber type')
    .populate('dock', 'name location')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: berthings.length,
    data: berthings,
  });
});

// @desc    Get cargo for a specific user
// @route   GET /api/berthings/cargo/my-cargo
// @access  Private/Cargo Owner
export const getUserCargo = asyncHandler(async (req, res, next) => {
  // Find all berthings where the user is listed as a cargo owner
  console.log(req.query.userId);
  const berthings = await Berthing.find({
    'cargoDetails.cargoOwnerId': req.query.userId,
  })
    .populate('ship', 'name imoNumber type')
    .populate('dock', 'name location')
    .populate({
      path: 'cargoDetails',
      match: { owner: req.query.userId },
      populate: {
        path: 'owner processedBy',
        select: 'name email company',
      },
    })
    .sort('-createdAt');
    // console.log(berthings);

  // Filter and format the response to only include the user's cargo
  const userCargo = [];
  
  berthings.forEach(berthing => {
    const cargoItems = berthing.cargoDetails.filter(
      cargo => cargo.cargoOwnerId && cargo.cargoOwnerId.toString() === req.query.userId
    );
    console.log(cargoItems);

    if (cargoItems.length > 0) {
      userCargo.push({
        berthingId: berthing._id,
        ship: berthing.ship,
        dock: berthing.dock,
        arrivalDate: berthing.arrivalDate,
        departureDate: berthing.departureDate,
        status: berthing.status,
        cargo: cargoItems,
      });
    }
  });
  console.log(userCargo); 

  res.status(200).json({
    success: true,
    count: userCargo.length,
    data: userCargo,
  });
});

// @desc    Update cargo status (for customs brokers)
// @route   PUT /api/berthings/cargo/:cargoId/status
// @access  Private/Customs Broker
export const updateCargoStatus = asyncHandler(async (req, res, next) => {
  const { status, notes } = req.body;
  
  if (!status) {
    return next(new ErrorResponse('Please provide a status', 400));
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

  // Find the cargo item to update
  const cargoItem = berthing.cargoDetails.id(req.params.cargoId);
  if (!cargoItem) {
    return next(
      new ErrorResponse(`No cargo found with id ${req.params.cargoId}`, 404)
    );
  }

  // Update cargo status and processedBy
  cargoItem.customsStatus = status;
  cargoItem.processedBy = req.user.id;
  if (notes) cargoItem.notes = notes;

  // Mark the cargoDetails array as modified
  berthing.markModified('cargoDetails');
  await berthing.save();

  // Get the cargo owner
  const cargoOwner = await User.findById(cargoItem.owner);
  
  if (cargoOwner) {
    // Notify the cargo owner
    await Notification.create({
      user: cargoOwner._id,
      title: 'Cargo Status Updated',
      message: `Status for your cargo has been updated to: ${status}`,
      type: 'cargo_update',
      relatedDocument: berthing._id,
      relatedDocumentModel: 'Berthing',
      actionUrl: `/my-cargo/${cargoItem._id}`
    });
  }

  res.status(200).json({
    success: true,
    data: cargoItem,
  });
});

// @desc    Get berthing statistics
// @route   GET /api/berthings/stats
// @access  Private/Admin
export const getBerthingStats = asyncHandler(async (req, res, next) => {
  const stats = await Berthing.aggregate([
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 },
        avgDuration: { $avg: { $subtract: ['$departureDate', '$arrivalDate'] } },
      },
    },
    {
      $addFields: {
        month: {
          $let: {
            vars: {
              monthsInString: [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ]
            },
            in: {
              $arrayElemAt: ['$$monthsInString', { $subtract: ['$_id', 1] }]
            }
          }
        },
        avgDurationInHours: { $divide: ['$avgDuration', 1000 * 60 * 60] }
      }
    },
    { $sort: { _id: 1 } },
  ]);

  // Get count of berthings by status
  const statusCount = await Berthing.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // Get count of berthings by ship type
  const shipTypeCount = await Berthing.aggregate([
    {
      $lookup: {
        from: 'ships',
        localField: 'ship',
        foreignField: '_id',
        as: 'shipData',
      },
    },
    { $unwind: '$shipData' },
    {
      $group: {
        _id: '$shipData.type',
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      monthlyStats: stats,
      statusCount,
      shipTypeCount,
    },
  });
});

export const getAvailableBerthings = asyncHandler(async (req, res, next) => {
  const berthings = await Berthing.find({
    status: 'available',
    operationalStatus: 'operational'
  })
  
  res.status(200).json({
    success: true,
    count: berthings.length,
    data: berthings
  });
});