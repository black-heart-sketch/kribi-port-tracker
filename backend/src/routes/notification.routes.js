import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  getNotification,
  createNotification,
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// All routes are protected
//router.use(protect);

// User notification routes
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/:id', getNotification);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);
router.delete('/clear/read', clearReadNotifications);

// Admin only routes
router.post('/',
  //authorize('admin', 'port_authority'),
  createNotification);

export default router;
