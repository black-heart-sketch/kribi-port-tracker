import express from 'express';
import {
  getCargoForClearance,
  updateCustomsStatus,
  getClearanceHistory
} from '../controllers/customs.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// All routes are protected and require authentication
//router.use(protect);

// Routes for customs clearance
router.get(
  '/clearance',
 // authorize('customs_broker', 'admin', 'port_authority'),
  getCargoForClearance
);

router.put(
  '/clearance/:cargoId',
  //authorize('customs_broker', 'admin', 'port_authority'),
  updateCustomsStatus
);

router.get(
  '/clearance/:cargoId/history',
  //authorize('customs_broker', 'admin', 'port_authority'),
  getClearanceHistory
);

export default router;
