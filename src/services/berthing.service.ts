import axiosInstance from '@/config/axios.config';
import { ENDPOINTS } from '@/config/endpoints';

const BERTHING_ENDPOINT = ENDPOINTS.BERTHINGS.BASE;

export interface CargoDetail {
  _id?: string;
  description: string;
  type: string;
  weight: number;
  quantity: number;
  unit: string;
  notes?: string;
  status?: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
}

export interface Berthing {
  _id: string;
  ship: string | {
    _id: string;
    name: string;
    imoNumber: string;
  };
  dock: string | {
    _id: string;
    name: string;
    location: string;
  };
  arrivalDate: string | Date;
  departureDate: string | Date;
  cargoDetails: CargoDetail[];
  documents: string[];
  specialRequirements?: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  createdBy: string | {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface BerthingStats {
  total: number;
  pending: number;
  approved: number;
  inProgress: number;
  completed: number;
  rejected: number;
  cancelled: number;
}

export const berthingService = {
  // Create a new berthing request
  async createBerthing(formData: FormData): Promise<Berthing> {
    try {
      const response = await axiosInstance.post(BERTHING_ENDPOINT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error creating berthing:', error);
      throw error;
    }
  },

  // Get all berthings (with optional filters)
  async getBerthings(params?: Record<string, any>): Promise<{ data: Berthing[], pagination: any }> {
    try {
      const response = await axiosInstance.get(BERTHING_ENDPOINT, { params });
      console.log('here is',response.data)
      return response.data.data;
    } catch (error) {
      console.error('Error fetching berthings:', error);
      throw error;
    }
  },

  // Get available berthings (public)
  async getAvailableBerthings(): Promise<Berthing[]> {
    try {
      const response = await axiosInstance.get(`${BERTHING_ENDPOINT}/available`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching available berthings:', error);
      throw error;
    }
  },

  // Get a single berthing by ID
  async getBerthingById(id: string): Promise<Berthing> {
    try {
      const response = await axiosInstance.get(`${BERTHING_ENDPOINT}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching berthing ${id}:`, error);
      throw error;
    }
  },

  // Update a berthing
  async updateBerthing(id: string, berthingData: Partial<Berthing>): Promise<Berthing> {
    try {
      const response = await axiosInstance.put(`${BERTHING_ENDPOINT}/${id}`, berthingData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating berthing ${id}:`, error);
      throw error;
    }
  },

  // Delete a berthing
  async deleteBerthing(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${BERTHING_ENDPOINT}/${id}`);
    } catch (error) {
      console.error(`Error deleting berthing ${id}:`, error);
      throw error;
    }
  },

  // Approve a berthing (admin/port authority only)
  async approveBerthing(id: string): Promise<Berthing> {
    try {
      const response = await axiosInstance.put(`${BERTHING_ENDPOINT}/${id}/approve`);
      return response.data.data;
    } catch (error) {
      console.error(`Error approving berthing ${id}:`, error);
      throw error;
    }
  },

  // Reject a berthing (admin/port authority only)
  async rejectBerthing(id: string, reason?: string): Promise<Berthing> {
    try {
      const response = await axiosInstance.put(`${BERTHING_ENDPOINT}/${id}/reject`, { reason });
      return response.data.data;
    } catch (error) {
      console.error(`Error rejecting berthing ${id}:`, error);
      throw error;
    }
  },

  // Get berthings for the current user
  async getUserBerthings(userId?: string): Promise<Berthing[]> {
    try {
      const url = userId 
        ? `${BERTHING_ENDPOINT}/user/${userId}`
        : BERTHING_ENDPOINT;
      const response = await axiosInstance.get(url);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user berthings:', error);
      throw error;
    }
  },

  // Get cargo for the current user (cargo owner)
  async getUserCargo(): Promise<Berthing[]> {
    try {
      const response = await axiosInstance.get(`${BERTHING_ENDPOINT}/user/cargo`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user cargo:', error);
      throw error;
    }
  },

  // Update cargo status (customs broker/admin/port authority)
  async updateCargoStatus(cargoId: string, status: string): Promise<CargoDetail> {
    try {
      const response = await axiosInstance.put(`${BERTHING_ENDPOINT}/cargo/${cargoId}/status`, { status });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating cargo status ${cargoId}:`, error);
      throw error;
    }
  },

  // Get berthing statistics
  async getBerthingStats(): Promise<BerthingStats> {
    try {
      const response = await axiosInstance.get(`${BERTHING_ENDPOINT}/stats`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching berthing stats:', error);
      throw error;
    }
  },

  // Search berthings
  async searchBerthings(query: string): Promise<Berthing[]> {
    try {
      const response = await axiosInstance.get(BERTHING_ENDPOINT, {
        params: { search: query }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error searching berthings:', error);
      throw error;
    }
  },
};

export default berthingService;
