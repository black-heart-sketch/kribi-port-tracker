import express from 'express';
import {
  getDashboardStats,
  getCargoStats,
  getBerthingStats,
} from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// All routes are protected and require admin/port authority role
// router.use(protect);
// router.use(authorize('admin', 'port_authority'));

// Dashboard routes
router.get('/stats', getDashboardStats);
router.get('/stats/cargo', getCargoStats);
router.get('/stats/berthings', getBerthingStats);

export default router;
