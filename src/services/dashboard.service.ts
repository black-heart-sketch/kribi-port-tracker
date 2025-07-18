import axiosInstance from '@/config/axios.config';

export interface DashboardStats {
  totalShips: number;
  totalBerthings: number;
  totalCargo: number;
  totalUsers: number;
  pendingBerthings: number;
  activeBerthings: number;
  cargoByStatus: Record<string, number>;
  berthingsByMonth: Array<{ month: string; count: number }>;
  recentActivities: Array<{
    id: string;
    action: string;
    timestamp: string;
    user?: {
      _id: string;
      name: string;
      email: string;
    };
  }>;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axiosInstance.get('/dashboard/stats');
  return response.data.data;
};

const dashboardService = {
  getDashboardStats,
  
  /**
   * Get cargo statistics by status
   */
  async getCargoStats() {
    const response = await axiosInstance.get('/dashboard/stats/cargo');
    return response.data.data;
  },

  /**
   * Get berthing statistics
   */
  async getBerthingStats() {
    const response = await axiosInstance.get('/dashboard/stats/berthings');
    return response.data.data;
  },
};

export default dashboardService;
