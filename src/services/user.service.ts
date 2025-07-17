import api from '@/config/axios.config';

export type UserRole = 'maritime_agent' | 'cargo_owner' | 'customs_broker' | 'admin' | 'port_authority' | 'viewer';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  phone?: string;
  company?: string;
  position?: string;
  department?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  profileImage?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  lastIpAddress?: string;
  loginCount?: number;
}

const userService = {
  // Get all users (admin only)
  async getUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data.data;
  },

  // Get single user by ID
  async getUser(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  // Update user status (active/inactive)
  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    const response = await api.patch(`/users/${id}/status`, { isActive });
    return response.data.data;
  },

  // Update user role
  async updateUserRole(id: string, role: UserRole): Promise<User> {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data.data;
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },


};

export default userService;
