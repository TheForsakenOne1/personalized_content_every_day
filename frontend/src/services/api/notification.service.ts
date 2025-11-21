/**
 * Notification API Service
 */

import { apiClient } from '@/lib/api-client';

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'content_recommendation'
  | 'achievement'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export const notificationService = {
  /**
   * Get user notifications
   */
  async getNotifications(
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<NotificationsResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      unreadOnly: unreadOnly.toString(),
    });

    const response = await apiClient.get<{
      success: boolean;
      data: NotificationsResponse;
    }>(`/api/notifications?${params.toString()}`);

    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{
      success: boolean;
      data: { count: number };
    }>('/api/notifications/unread-count');

    return response.data.count;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await apiClient.patch<{
      success: boolean;
      data: { notification: Notification };
    }>(`/api/notifications/${notificationId}/read`);

    // Clear cache
    apiClient.clearCache('/api/notifications/unread-count');

    return response.data.notification;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<number> {
    const response = await apiClient.patch<{
      success: boolean;
      data: { count: number };
    }>('/api/notifications/read-all');

    // Clear cache
    apiClient.clearCache('/api/notifications/unread-count');

    return response.data.count;
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`/api/notifications/${notificationId}`);

    // Clear cache
    apiClient.clearCache('/api/notifications/unread-count');
  },

  /**
   * Create notification (for testing)
   */
  async createNotification(
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    metadata?: Record<string, any>
  ): Promise<Notification> {
    const response = await apiClient.post<{
      success: boolean;
      data: { notification: Notification };
    }>('/api/notifications', {
      type,
      title,
      message,
      link,
      metadata,
    });

    // Clear cache
    apiClient.clearCache('/api/notifications/unread-count');

    return response.data.notification;
  },
};

export default notificationService;
