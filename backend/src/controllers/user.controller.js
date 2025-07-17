import User from '../models/user.model.js';
import ErrorResponse from '../utils/errorResponse.js';
import { asyncHandler } from '../middleware/async.middleware.js';
import path from 'path';
import Notification from '../models/notification.model.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Only admin can access other user's profile
  // if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
  //   return next(
  //     new ErrorResponse(
  //       `User ${req.params.id} is not authorized to view this user`,
  //       401
  //     )
  //   );
  // }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
export const createUser = asyncHandler(async (req, res, next) => {
  // Check for existing user with same email
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return next(
      new ErrorResponse(`User with email ${req.body.email} already exists`, 400)
    );
  }

  // Create user
  const user = await User.create(req.body);

  // Send welcome email
  const welcomeUrl = `${req.protocol}://${req.get('host')}/dashboard`;
  const message = `Welcome to Kribi Port Authority System!\n\nYour account has been created by an administrator.`;
  
  try {
    await sendEmail({
      email: user.email,
      subject: 'Welcome to Kribi Port Authority',
      message,
    });
  } catch (err) {
    console.error('Error sending welcome email:', err);
    // Don't fail the request if email sending fails
  }

  res.status(201).json({
    success: true,
    data: user,
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is updating their own profile or is admin
  if (req.user.id !== user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this user`,
        401
      )
    );
  }

  // Prevent role escalation unless admin
  if (
    req.body.role &&
    req.user.role !== 'admin' &&
    req.body.role !== user.role
  ) {
    return next(
      new ErrorResponse('Not authorized to change user role', 403)
    );
  }

  // Update user
  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Prevent deleting self
  if (req.user.id === user.id) {
    return next(new ErrorResponse('You cannot delete your own account', 400));
  }

  // Check if user has any associated berthings
  const berthingCount = await Berthing.countDocuments({ createdBy: user._id });
  if (berthingCount > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete user with ${berthingCount} associated berthings`,
        400
      )
    );
  }

  await user.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Upload user photo
// @route   PUT /api/users/photo
// @access  Private
export const uploadUserPhoto = asyncHandler(async (req, res, next) => {
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
  file.name = `photo_${req.user._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/users/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: file.name },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  });
});

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard/stats
// @access  Private
export const getUserDashboardStats = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  
  let stats = {};
  
  // Common stats for all users
  stats.unreadNotifications = await Notification.countDocuments({
    user: userId,
    read: false,
  });
  
  // Role-specific stats
  if (userRole === 'maritime_agent') {
    const [berthings, pendingBerthings, rejectedBerthings] = await Promise.all([
      Berthing.countDocuments({ createdBy: userId }),
      Berthing.countDocuments({ createdBy: userId, status: 'pending' }),
      Berthing.countDocuments({ createdBy: userId, status: 'rejected' }),
    ]);
    
    stats.berthings = berthings;
    stats.pendingBerthings = pendingBerthings;
    stats.rejectedBerthings = rejectedBerthings;
    
  } else if (userRole === 'cargo_owner') {
    const cargoQuery = { 'cargoDetails.owner': userId };
    const [totalCargo, pendingCargo, clearedCargo] = await Promise.all([
      Berthing.countDocuments(cargoQuery),
      Berthing.countDocuments({
        ...cargoQuery,
        'cargoDetails.customsStatus': 'not_verified',
      }),
      Berthing.countDocuments({
        ...cargoQuery,
        'cargoDetails.customsStatus': 'cleared',
      }),
    ]);
    
    stats.totalCargo = totalCargo;
    stats.pendingCargo = pendingCargo;
    stats.clearedCargo = clearedCargo;
    
  } else if (userRole === 'customs_broker') {
    const [totalProcessed, pendingProcessing] = await Promise.all([
      Berthing.countDocuments({
        'cargoDetails.processedBy': userId,
      }),
      Berthing.countDocuments({
        'cargoDetails.customsStatus': 'in_progress',
        'cargoDetails.processedBy': userId,
      }),
    ]);
    
    stats.totalProcessed = totalProcessed;
    stats.pendingProcessing = pendingProcessing;
    
  } else if (userRole === 'admin' || userRole === 'port_authority') {
    const [
      totalBerthings,
      pendingBerthings,
      totalShips,
      totalDocks,
      activeBerthings,
    ] = await Promise.all([
      Berthing.countDocuments(),
      Berthing.countDocuments({ status: 'pending' }),
      Ship.countDocuments(),
      Dock.countDocuments(),
      Berthing.countDocuments({
        status: 'approved',
        arrivalDate: { $lte: new Date() },
        departureDate: { $gte: new Date() },
      }),
    ]);
    
    stats.totalBerthings = totalBerthings;
    stats.pendingBerthings = pendingBerthings;
    stats.totalShips = totalShips;
    stats.totalDocks = totalDocks;
    stats.activeBerthings = activeBerthings;
  }
  
  res.status(200).json({
    success: true,
    data: stats,
  });
});

// @desc    Get user activity
// @route   GET /api/users/activity
// @access  Private
// @desc    Update user role
// @route   PATCH /api/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  const userId = req.params.id;

  // Check if role is provided
  if (!role) {
    return next(new ErrorResponse('Please provide a role', 400));
  }

  // Check if role is valid
  const validRoles = [
    'maritime_agent',
    'cargo_owner',
    'customs_broker',
    'admin',
    'port_authority',
    'viewer',
  ];

  if (!validRoles.includes(role)) {
    return next(new ErrorResponse(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400));
  }

  // Find user and update role
  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${userId}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const getUserActivity = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { limit = 10 } = req.query;
  
  // Get user's recent notifications
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));
  
  // Get user's recent berthings (if applicable)
  let recentBerthings = [];
  
  if (req.user.role === 'maritime_agent' || req.user.role === 'admin' || req.user.role === 'port_authority') {
    recentBerthings = await Berthing.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('ship', 'name imoNumber')
      .populate('dock', 'name');
  }
  
  // Get user's recent cargo (if applicable)
  let recentCargo = [];
  
  if (req.user.role === 'cargo_owner') {
    const berthings = await Berthing.find({ 'cargoDetails.owner': userId })
      .sort({ 'cargoDetails.updatedAt': -1 })
      .limit(5)
      .populate('ship', 'name imoNumber')
      .populate('dock', 'name');
    
    // Flatten the cargo details with berthing info
    berthings.forEach(berthing => {
      const userCargo = berthing.cargoDetails.filter(
        cargo => cargo.owner && cargo.owner.toString() === userId
      );
      
      userCargo.forEach(cargo => {
        recentCargo.push({
          _id: cargo._id,
          description: cargo.description,
          status: cargo.customsStatus,
          updatedAt: cargo.updatedAt,
          berthing: {
            id: berthing._id,
            ship: berthing.ship,
            dock: berthing.dock,
            arrivalDate: berthing.arrivalDate,
            departureDate: berthing.departureDate,
          },
        });
      });
    });
    
    // Sort by updatedAt and limit
    recentCargo.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5);
  }
  
  res.status(200).json({
    success: true,
    data: {
      notifications,
      recentBerthings,
      recentCargo,
    },
  });
});

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
export const updateUserPreferences = asyncHandler(async (req, res, next) => {
  const updates = {};
  
  // Update notification preferences if provided
  if (req.body.notifications) {
    updates['preferences.notifications'] = {
      ...req.user.preferences.notifications,
      ...req.body.notifications,
    };
  }
  
  // Update language preference if provided
  if (req.body.language) {
    updates['preferences.language'] = req.body.language;
  }
  
  // Update other preferences as needed
  
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updates },
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    data: user.preferences,
  });
});
