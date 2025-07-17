import axiosInstance from '@/config/axios.config';
import { Dock } from '@/types';
import { ENDPOINTS } from '@/config/endpoints';

const DOCK_ENDPOINT = ENDPOINTS.DOCKS.BASE;

export const dockService = {
  // Get all docks
  async getDocks(): Promise<Dock[]> {
    try {
      const response = await axiosInstance.get(DOCK_ENDPOINT);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching docks:', error);
      throw error;
    }
  },

  // Get a single dock by ID
  async getDockById(id: string): Promise<Dock> {
    try {
      const response = await axiosInstance.get(ENDPOINTS.DOCKS.getById(id));
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching dock ${id}:`, error);
      throw error;
    }
  },

  // Create a new dock
  async createDock(dockData: Omit<Dock, '_id' | 'createdAt' | 'updatedAt'>): Promise<Dock> {
    try {
      const response = await axiosInstance.post(DOCK_ENDPOINT, dockData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating dock:', error);
      throw error;
    }
  },

  // Update an existing dock
  async updateDock(id: string, dockData: Partial<Dock>): Promise<Dock> {
    try {
      const response = await axiosInstance.put(ENDPOINTS.DOCKS.getById(id), dockData);
      return response.data;
    } catch (error) {
      console.error(`Error updating dock ${id}:`, error);
      throw error;
    }
  },

  // Delete a dock
  async deleteDock(id: string): Promise<void> {
    try {
      await axiosInstance.delete(ENDPOINTS.DOCKS.getById(id));
    } catch (error) {
      console.error(`Error deleting dock ${id}:`, error);
      throw error;
    }
  },

  // Get available docks
  async getAvailableDocks(): Promise<Dock[]> {
    try {
      const response = await axiosInstance.get(ENDPOINTS.DOCKS.getAvailable);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching available docks:', error);
      throw error;
    }
  },

  // Update dock status
  async updateDockStatus(id: string, status: 'available' | 'occupied' | 'maintenance'): Promise<Dock> {
    try {
      const response = await axiosInstance.patch(ENDPOINTS.DOCKS.updateStatus(id), { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for dock ${id}:`, error);
      throw error;
    }
  }
};

export default dockService;

