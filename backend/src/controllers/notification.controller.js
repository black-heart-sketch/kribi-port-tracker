import Notification from '../models/notification.model.js';
import ErrorResponse from '../utils/errorResponse.js';
import { asyncHandler } from '../middleware/async.middleware.js';

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res, next) => {
  const { read, type, limit = 20, page = 1 } = req.query;
  
  // Build query
  const query = { user: req.user.id };
  
  if (read === 'true' || read === 'false') {
    query.read = read === 'true';
  }
  
  if (type) {
    query.type = type;
  }
  
  // Execute query with pagination
  const total = await Notification.countDocuments(query);
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  
  // Mark notifications as read if requested
  if (req.query.markRead === 'true') {
    await Notification.updateMany(
      { _id: { $in: notifications.map(n => n._id) }, read: false },
      { $set: { read: true } }
    );
    
    // Update the returned notifications to show they've been read
    notifications.forEach(notification => {
      notification.read = true;
    });
  }
  
  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: notifications,
  });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Notification.countDocuments({
    user: req.user.id,
    read: false,
  });
  
  res.status(200).json({
    success: true,
    count,
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { read: true },
    { new: true, runValidators: true }
  );
  
  if (!notification) {
    return next(
      new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404)
    );
  }
  
  res.status(200).json({
    success: true,
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { $set: { read: true } }
  );
  
  const count = await Notification.countDocuments({
    user: req.user.id,
    read: false,
  });
  
  res.status(200).json({
    success: true,
    unreadCount: count,
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });
  
  if (!notification) {
    return next(
      new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404)
    );
  }
  
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Clear all read notifications
// @route   DELETE /api/notifications/clear-read
// @access  Private
export const clearReadNotifications = asyncHandler(async (req, res, next) => {
  await Notification.deleteMany({
    user: req.user.id,
    read: true,
  });
  
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
export const getNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user.id,
  });
  
  if (!notification) {
    return next(
      new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Mark as read when retrieved
  if (!notification.read) {
    notification.read = true;
    await notification.save();
  }
  
  res.status(200).json({
    success: true,
    data: notification,
  });
});

// @desc    Create a notification (for testing and admin use)
// @route   POST /api/notifications
// @access  Private/Admin
export const createNotification = asyncHandler(async (req, res, next) => {
  // Only admins can create notifications for other users
  // if (req.body.user && req.user.role !== 'admin') {
  //   return next(
  //     new ErrorResponse('Not authorized to create notifications for other users', 403)
  //   );
  // }
  console.log(req.body);
  // Default to current user if no user specified
  const userId = req.body.userId || req.user.id;
  
  const notification = await Notification.create({
    user: userId,
    title: req.body.title,
    message: req.body.message,
    type: req.body.type || 'system',
    relatedDocument: req.body.relatedDocument,
    relatedDocumentModel: req.body.relatedDocumentModel,
    actionUrl: req.body.actionUrl,
    fromUser: req.body.fromUser,
  });
  
  res.status(201).json({
    success: true,
    data: notification,
  });
});
