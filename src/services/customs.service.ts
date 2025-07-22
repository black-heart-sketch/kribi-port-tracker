import axiosInstance from '@/config/axios.config';

export interface CargoForClearance {
  _id: string;
  description: string;
  type: string;
  weight: number;
  unit: string;
  quantity: number;
  customsStatus: string;
  customsNotes?: string;
  clearedBy?: string;
  clearedAt?: string;
  auditTrail?: Array<{
    action: string;
    user: { _id: string; name: string; email: string };
    timestamp: string;
    details?: Record<string, any>;
  }>;
  berthing: {
    _id: string;
    arrivalDate: string;
    departureDate: string;
    status: string;
    ship: {
      _id: string;
      name: string;
      imoNumber: string;
    };
    dock: {
      _id: string;
      name: string;
      location: string;
    };
  };
}

const customsService = {
  /**
   * Get all cargo items that need customs clearance
   */
  async getCargoForClearance(): Promise<CargoForClearance[]> {
    const response = await axiosInstance.get('/customs/clearance');
    return response.data.data || [];
  },

  /**
   * Update the customs status of a cargo item
   */
  async updateCargoStatus(
    cargoId: string,
    status: string,
    notes?: string,
    userId?: string
  ): Promise<CargoForClearance> {
    const response = await axiosInstance.put(`/customs/clearance/${cargoId}`, {
      status,
      notes,
      userId
    });
    return response.data.data;
  },

  /**
   * Get the clearance history for a cargo item
   */
  async getClearanceHistory(cargoId: string) {
    const response = await axiosInstance.get(`/customs/clearance/${cargoId}/history`);
    return response.data.data || [];
  },
};

export default customsService;
