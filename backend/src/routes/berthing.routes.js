import express from 'express';
import {
  createBerthing,
  getBerthings,
  getBerthing,
  updateBerthing,
  deleteBerthing,
  approveBerthing,
  rejectBerthing,
  getUserBerthings,
  getUserCargo,
  updateCargoStatus,
  getBerthingStats,
  getAvailableBerthings,
} from '../controllers/berthing.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize, checkCargoOwnership } from '../middleware/authorize.js';
import { uploadBerthingFiles } from '../middleware/upload.middleware.js';
import advancedResults from '../middleware/advancedResults.js';
import Berthing from '../models/berthing.model.js';

const router = express.Router();

// All routes are protected
//router.use(protect);

// Public routes (no authentication required for public data)
router.get('/available', getAvailableBerthings);
router.get(
  '/public',
  (req, res, next) => {
    // Use a function to get the current date when the middleware runs
    const filter = {
      status: 'approved',
      arrivalDate: { $lte: new Date() },
      departureDate: { $gte: new Date() },
    };
    
    // Call advancedResults with the filter
    return advancedResults(
      Berthing,
      [
        { path: 'ship', select: 'name imoNumber type' },
        { path: 'dock', select: 'name location' },
      ],
      filter
    )(req, res, next);
  },
  (req, res) => res.status(200).json(res.advancedResults)
);

// Routes accessible to all authenticated users
router.get('/', getBerthings);
router.get('/stats', getBerthingStats);
router.get('/:id', getBerthing);

// Routes for maritime agents
router.post(
  '/',
  // protect,
  // authorize('maritime_agent', 'admin'),
  uploadBerthingFiles,
  createBerthing
);

router.put(
  '/:id',
  // authorize('maritime_agent', 'admin', 'port_authority'),
  updateBerthing
);

router.delete(
  '/:id',
  // authorize('maritime_agent', 'admin', 'port_authority'),
  deleteBerthing
);

// Routes for cargo owners - must come before /:id routes to avoid conflicts
router.get('/user/cargo', authorize('cargo_owner'), getUserCargo);

// Routes for customs brokers - must come before /:id routes to avoid conflicts
router.put(
  '/cargo/:cargoId/status',
  authorize('customs_broker', 'admin', 'port_authority'),
  updateCargoStatus
);

// Admin-only routes - must come before /:id routes to avoid conflicts
router.get(
  '/user/:userId',
  authorize('admin', 'port_authority'),
  getUserBerthings
);

// Routes for port authority and admin
router.put(
  '/:id/approve',
  authorize('admin', 'port_authority'),
  approveBerthing
);

router.put(
  '/:id/reject',
  // authorize('admin', 'port_authority'),
  rejectBerthing
);

export default router;
