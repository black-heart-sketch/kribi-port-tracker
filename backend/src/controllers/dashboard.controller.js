import asyncHandler from 'express-async-handler';
import Berthing from '../models/berthing.model.js';
import Ship from '../models/ship.model.js';
import User from '../models/user.model.js';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private/Admin
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    const [
      totalShips,
      totalBerthings,
      totalCargo,
      totalUsers,
      pendingBerthings,
      activeBerthings,
      berthings,
    ] = await Promise.all([
      Ship.countDocuments(),
      Berthing.countDocuments(),
      Berthing.aggregate([
        { $unwind: '$cargoDetails' },
        { $count: 'total' }
      ]),
      User.countDocuments(),
      Berthing.countDocuments({ status: 'pending' }),
      Berthing.countDocuments({ status: 'in_progress' }),
      Berthing.find({}).select('arrivalDate cargoDetails.customsStatus').lean(),
    ]);

    // Calculate cargo by status
    const cargoByStatus = {
      not_verified: 0,
      in_progress: 0,
      verified: 0,
      cleared: 0,
      held: 0,
    };

    berthings.forEach(berthing => {
      berthing.cargoDetails?.forEach(cargo => {
        if (cargo.customsStatus && cargoByStatus.hasOwnProperty(cargo.customsStatus)) {
          cargoByStatus[cargo.customsStatus]++;
        } else {
          cargoByStatus.not_verified++;
        }
      });
    });

    // Calculate berthings by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    
    const berthingsByMonth = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const month = date.toLocaleString('default', { month: 'short' });
      
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const count = await Berthing.countDocuments({
        arrivalDate: {
          $gte: startDate,
          $lte: endDate,
        },
      });
      
      berthingsByMonth.push({
        month,
        count,
      });
    }

    // Get recent activities (last 10 activities)
    const recentActivities = await Berthing.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('createdBy', 'name email')
      .select('status createdAt createdBy')
      .lean();

    const formattedActivities = recentActivities.map(activity => ({
      id: activity._id,
      action: `Berthing ${activity.status.replace('_', ' ')}`,
      timestamp: activity.createdAt,
      user: activity.createdBy,
      status: activity.status,
      details: {
        notes: activity.notes
      }
    }));

    res.status(200).json({
      success: true,
      data: {
        totalShips,
        totalBerthings,
        totalCargo: totalCargo[0]?.total || 0,
        totalUsers,
        pendingBerthings,
        activeBerthings,
        cargoByStatus,
        berthingsByMonth,
        recentActivities: formattedActivities,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
    });
  }
});

/**
 * @desc    Get cargo statistics
 * @route   GET /api/dashboard/stats/cargo
 * @access  Private/Admin
 */
export const getCargoStats = asyncHandler(async (req, res) => {
  try {
    const cargoStats = await Berthing.aggregate([
      { $unwind: '$cargoDetails' },
      {
        $group: {
          _id: '$cargoDetails.customsStatus',
          count: { $sum: 1 },
          totalWeight: { $sum: '$cargoDetails.weight' },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
          totalWeight: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: cargoStats,
    });
  } catch (error) {
    console.error('Error fetching cargo stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cargo statistics',
    });
  }
});

/**
 * @desc    Get berthing statistics
 * @route   GET /api/dashboard/stats/berthings
 * @access  Private/Admin
 */
export const getBerthingStats = asyncHandler(async (req, res) => {
  try {
    const berthingStats = await Berthing.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgDuration: { $avg: { $subtract: ['$departureDate', '$arrivalDate'] } },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
          avgDurationInHours: { $divide: ['$avgDuration', 1000 * 60 * 60] },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: berthingStats,
    });
  } catch (error) {
    console.error('Error fetching berthing stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching berthing statistics',
    });
  }
});
