import express from 'express';
import {
  getDocks,
  getDock,
  createDock,
  updateDock,
  deleteDock,
  getAvailableDocks,
  getDockUtilization,
  getDockStatus,
} from '../controllers/dock.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.js';
import advancedResults from '../middleware/advancedResults.js';
import Dock from '../models/dock.model.js';

const router = express.Router();

// All routes are protected
//router.use(protect);

// Public routes (no authentication required for public data)
router.get(
  '/public/status',
  getDockStatus
);

// Routes accessible to all authenticated users
router.get('/',
 //  advancedResults(Dock), 
   getDocks);
router.get('/available', getAvailableDocks);
router.get('/status', getDockStatus);
router.get('/:id', getDock);

// Routes for port authority and admin
//router.use(authorize('admin', 'port_authority'));

router.post('/', createDock);
router.put('/:id', updateDock);
router.delete('/:id', deleteDock);
router.get('/utilization/stats', getDockUtilization);

export default router;
