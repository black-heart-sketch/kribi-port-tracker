import api from '@/config/axios.config';

export type NotificationType = 
  | 'berthing_request'
  | 'berthing_approved'
  | 'berthing_rejected'
  | 'cargo_update'
  | 'customs_update'
  | 'system';

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  relatedDocument?: string;
  relatedDocumentModel?: 'Berthing' | 'Cargo';
  actionUrl?: string;
  fromUser?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: T[];
}

interface GetNotificationsParams {
  read?: boolean;
  type?: NotificationType;
  limit?: number;
  page?: number;
  markRead?: boolean;
}

const notificationService = {
  /**
   * Get all notifications for the current user
   */
  async getNotifications(params?: GetNotificationsParams): Promise<PaginatedResponse<Notification>> {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  /**
   * Get unread notification count for the current user
   */
  async getUnreadCount(): Promise<{ success: boolean; count: number }> {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  /**
   * Get a single notification by ID
   */
  async getNotification(id: string): Promise<{ success: boolean; data: Notification }> {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<{ success: boolean; data: Notification }> {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read for the current user
   */
  async markAllAsRead(): Promise<{ success: boolean; unreadCount: number }> {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<{ success: boolean; data: {} }> {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  /**
   * Clear all read notifications for the current user
   */
  async clearReadNotifications(): Promise<{ success: boolean; data: {} }> {
    const response = await api.delete('/notifications/clear-read');
    return response.data;
  },

  /**
   * Create a new notification (admin only)
   */
  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    relatedDocument?: string;
    relatedDocumentModel?: 'Berthing' | 'Cargo';
    actionUrl?: string;
    fromUser?: string;
  }): Promise<{ success: boolean; data: Notification }> {
    const response = await api.post('/notifications', data);
    return response.data;
  },
};

export default notificationService;
