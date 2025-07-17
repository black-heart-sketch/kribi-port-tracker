// Base API URL (can be moved to environment variables)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
  ME: `${API_BASE_URL}/auth/me`,
};

// Dock endpoints
export const DOCK_ENDPOINTS = {
  BASE: `${API_BASE_URL}/docks`,
  getById: (id: string) => `${API_BASE_URL}/docks/${id}`,
  getAvailable: `${API_BASE_URL}/docks/available`,
  updateStatus: (id: string) => `${API_BASE_URL}/docks/${id}/status`,
};

// Ship endpoints
export const SHIP_ENDPOINTS = {
  BASE: `${API_BASE_URL}/ships`,
  getById: (id: string) => `${API_BASE_URL}/ships/${id}`,
  getAvailable: `${API_BASE_URL}/ships/available`,
  search: `${API_BASE_URL}/ships/search`,
  updateStatus: (id: string) => `${API_BASE_URL}/ships/${id}/status`,
};

// Berthing endpoints
export const BERTHING_ENDPOINTS = {
  BASE: `${API_BASE_URL}/berthings`,
  getById: (id: string) => `${API_BASE_URL}/berthings/${id}`,
  getCurrent: `${API_BASE_URL}/berthings/current`,
  getByShip: (shipId: string) => `${API_BASE_URL}/berthings/ship/${shipId}`,
  getByDock: (dockId: string) => `${API_BASE_URL}/berthings/dock/${dockId}`,
  getMyRequests: `${API_BASE_URL}/berthings/my-requests`,
};

// User endpoints
export const USER_ENDPOINTS = {
  BASE: `${API_BASE_URL}/users`,
  getById: (id: string) => `${API_BASE_URL}/users/${id}`,
  updateProfile: `${API_BASE_URL}/users/profile`,
  changePassword: `${API_BASE_URL}/users/change-password`,
};



// Export all endpoints as a single object for easy importing
export const ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  DOCKS: DOCK_ENDPOINTS,
  SHIPS: SHIP_ENDPOINTS,
  BERTHINGS: BERTHING_ENDPOINTS,
  USERS: USER_ENDPOINTS,
};

export default ENDPOINTS;
