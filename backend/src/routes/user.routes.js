import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserPhoto,
  getUserDashboardStats,
  getUserActivity,
  updateUserPreferences,
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.js';
import advancedResults from '../middleware/advancedResults.js';
import User from '../models/user.model.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User profile routes
router.get('/me', (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

router.put('/me', updateUser);
router.put('/me/photo', uploadUserPhoto);
router.get('/me/dashboard', getUserDashboardStats);
router.get('/me/activity', getUserActivity);
router.put('/me/preferences', updateUserPreferences);

// Admin only routes
router.use(authorize('admin', 'port_authority'));

router.get('/', advancedResults(User), getUsers);
router.post('/', createUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
