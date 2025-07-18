import axiosInstance from '@/config/axios.config';

export interface CargoDocument {
  _id: string;
  name: string;
  url: string;
  type: string;
}

export interface CargoItem {
  _id: string;
  description: string;
  type: string;
  weight: number;
  unit: string;
  quantity: number;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled' | 'at_port';
  owner: string;
  createdAt: string;
  updatedAt: string;
  documents?: CargoDocument[];
}

const cargoService = {
  /**
   * Get all cargo items for a specific user
   * @param userId The ID of the user whose cargo to fetch
   */
  async getMyCargo(userId: string): Promise<CargoItem[]> {
    try {
      const response = await axiosInstance.get('/berthings/user/cargo', {params: {userId}});
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching cargo items:', error);
      throw new Error('Failed to fetch cargo items');
    }
  },

  /**
   * Get cargo item by ID
   */
  async getCargoById(id: string): Promise<CargoItem> {
    try {
      const response = await axiosInstance.get(`/cargo/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching cargo item ${id}:`, error);
      throw new Error('Failed to fetch cargo item');
    }
  },

  /**
   * Create a new cargo item
   */
  async createCargo(cargoData: Omit<CargoItem, '_id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<CargoItem> {
    try {
      const response = await axiosInstance.post('/cargo', cargoData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating cargo:', error);
      throw new Error('Failed to create cargo');
    }
  },

  /**
   * Update a cargo item
   */
  async updateCargo(id: string, updates: Partial<CargoItem>): Promise<CargoItem> {
    try {
      const response = await axiosInstance.patch(`/cargo/${id}`, updates);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating cargo ${id}:`, error);
      throw new Error('Failed to update cargo');
    }
  },

  /**
   * Delete a cargo item
   */
  async deleteCargo(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/cargo/${id}`);
    } catch (error) {
      console.error(`Error deleting cargo ${id}:`, error);
      throw new Error('Failed to delete cargo');
    }
  },

  /**
   * Upload document for a cargo item
   */
  async uploadDocument(
    cargoId: string, 
    file: File, 
    type: string
  ): Promise<CargoDocument> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await axiosInstance.post(`/cargo/${cargoId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Failed to upload document');
    }
  },

  /**
   * Delete a document from a cargo item
   */
  async deleteDocument(cargoId: string, documentId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/cargo/${cargoId}/documents/${documentId}`);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  }
};

export default cargoService;
