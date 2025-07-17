import express from 'express';
import {
  getShips,
  getShip,
  createShip,
  updateShip,
  deleteShip,
  shipPhotoUpload,
  getShipsByCompany,
  getShipStats,
  getAvailableShips,
} from '../controllers/ship.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.js';
import advancedResults from '../middleware/advancedResults.js';
import Ship from '../models/ship.model.js';

const router = express.Router();

// All routes are protected
//router.use(protect);

// Public routes (no authentication required for public data)
router.get(
  '/public',
  advancedResults(Ship, null, { isActive: true }),
  (req, res) => res.status(200).json(res.advancedResults)
);

// Routes accessible to all authenticated users
router.get('/', advancedResults(Ship), getShips);
router.get('/available', getAvailableShips);
router.get('/company/:company', getShipsByCompany);
router.get('/:id', getShip);

// Routes for maritime agents, admins, and port authority
router.post(
  '/',
 // authorize('maritime_agent', 'admin', 'port_authority'),
  createShip
);

router.put(
  '/:id',
 // authorize('maritime_agent', 'admin', 'port_authority'),
  updateShip
);

// Photo upload route
router.put(
  '/:id/photo',
 // authorize('maritime_agent', 'admin', 'port_authority'),
  shipPhotoUpload
);

// Admin and port authority only routes
router.delete(
  '/:id',
 // authorize('admin', 'port_authority'),
  deleteShip
);

router.get(
  '/stats/overview',
 // authorize('admin', 'port_authority'),
  getShipStats
);

export default router;
