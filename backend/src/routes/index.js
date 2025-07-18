import { Router } from 'express';
import authRoutes from './auth.routes.js';
import berthingRoutes from './berthing.routes.js';
import shipRoutes from './ship.routes.js';
import dockRoutes from './dock.routes.js';
import notificationRoutes from './notification.routes.js';
import userRoutes from './user.routes.js';
import customsRoutes from './customs.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/berthings', berthingRoutes);
router.use('/ships', shipRoutes);
router.use('/docks', dockRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);
router.use('/customs', customsRoutes);
router.use('/dashboard', dashboardRoutes);

//Catch-all for undefined API routes
// router.all('/*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     error: `Cannot ${req.method} ${req.originalUrl}`,
//   });
// });

export default router;


