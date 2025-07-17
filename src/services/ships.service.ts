import axiosInstance from '@/config/axios.config';
import { Ship } from '@/types';
import { ENDPOINTS } from '@/config/endpoints';

const SHIP_ENDPOINT = ENDPOINTS.SHIPS.BASE;

export const shipService = {
  // Get all ships
  async getShips(): Promise<Ship[]> {
    try {
      const response = await axiosInstance.get(SHIP_ENDPOINT);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching ships:', error);
      throw error;
    }
  },

  // Get a single ship by ID
  async getShipById(id: string): Promise<Ship> {
    try {
      const response = await axiosInstance.get(ENDPOINTS.SHIPS.getById(id));
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching ship ${id}:`, error);
      throw error;
    }
  },

  // Create a new ship
  async createShip(shipData: Omit<Ship, '_id' | 'createdAt' | 'updatedAt'>): Promise<Ship> {
    try {
      const response = await axiosInstance.post(SHIP_ENDPOINT, shipData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating ship:', error);
      throw error;
    }
  },

  // Update an existing ship
  async updateShip(id: string, shipData: Partial<Ship>): Promise<Ship> {
    try {
      const response = await axiosInstance.put(ENDPOINTS.SHIPS.getById(id), shipData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating ship ${id}:`, error);
      throw error;
    }
  },

  // Delete a ship
  async deleteShip(id: string): Promise<void> {
    try {
      await axiosInstance.delete(ENDPOINTS.SHIPS.getById(id));
    } catch (error) {
      console.error(`Error deleting ship ${id}:`, error);
      throw error;
    }
  },

  // Get available ships
  async getAvailableShips(): Promise<Ship[]> {
    try {
      const response = await axiosInstance.get(ENDPOINTS.SHIPS.getAvailable);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching available ships:', error);
      throw error;
    }
  },

  // Update ship status
  async updateShipStatus(id: string, status: 'active' | 'inactive' | 'maintenance'): Promise<Ship> {
    try {
      const response = await axiosInstance.patch(ENDPOINTS.SHIPS.updateStatus(id), { status });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating status for ship ${id}:`, error);
      throw error;
    }
  },

  // Search ships by name or IMO
  async searchShips(query: string): Promise<Ship[]> {
    try {
      const response = await axiosInstance.get(ENDPOINTS.SHIPS.search, { params: { query } });
      return response.data.data;
    } catch (error) {
      console.error('Error searching ships:', error);
      throw error;
    }
  }
};
export default shipService;