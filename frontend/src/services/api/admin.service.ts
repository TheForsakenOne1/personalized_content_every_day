/**
 * Admin API Service
 * Provides administrative functions for the EduHub platform
 */

import { apiClient } from '@/lib/api-client';
import type { User } from './auth.service';
import type { Content } from './content.service';

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalContent: number;
  contentByType: {
    video: number;
    article: number;
    paper: number;
    blog: number;
  };
  contentByCategory: Array<{
    name: string;
    count: number;
  }>;
  recentActivity: {
    newUsersToday: number;
    contentAddedToday: number;
    interactionsToday: number;
  };
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    lastAggregation?: string;
    databaseSize?: string;
  };
}

export interface AdminUser extends User {
  lastLoginAt: string | null;
  isActive: boolean;
  contentInteractionCount?: number;
  joinedAt: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isAdmin?: boolean;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'email' | 'username';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedUsers {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  database: {
    status: 'connected' | 'disconnected';
    responseTime: number;
  };
  lastAggregation: {
    timestamp: string | null;
    status: 'success' | 'failed' | 'pending' | 'never';
    duration?: number;
  };
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
}

export interface AggregationResponse {
  success: boolean;
  message: string;
  contentAdded: number;
  duration: number;
}

export interface ContentDeleteResponse {
  success: boolean;
  message: string;
}

export const adminService = {
  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<SystemStats> {
    const response = await apiClient.get<{ success: boolean; data: SystemStats }>(
      '/api/admin/stats',
      { enableCache: true, cacheTime: 30000 } // Cache for 30 seconds
    );

    return response.data;
  },

  /**
   * Get all users with filters and pagination
   */
  async getUsers(params?: UserListParams): Promise<PaginatedUsers> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const response = await apiClient.get<{ success: boolean; data: PaginatedUsers }>(
      `/api/admin/users${queryString ? `?${queryString}` : ''}`,
      { enableCache: false } // Don't cache user list
    );

    return response.data;
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<AdminUser> {
    const response = await apiClient.get<{ success: boolean; data: { user: AdminUser } }>(
      `/api/admin/users/${userId}`
    );

    return response.data.user;
  },

  /**
   * Toggle user active status
   */
  async toggleUserStatus(userId: string, isActive: boolean): Promise<AdminUser> {
    const response = await apiClient.patch<{ success: boolean; data: { user: AdminUser } }>(
      `/api/admin/users/${userId}/status`,
      { isActive }
    );

    // Clear cache
    apiClient.clearCache('/api/admin/users');
    apiClient.clearCache('/api/admin/stats');

    return response.data.user;
  },

  /**
   * Toggle user admin status
   */
  async toggleAdminStatus(userId: string, isAdmin: boolean): Promise<AdminUser> {
    const response = await apiClient.patch<{ success: boolean; data: { user: AdminUser } }>(
      `/api/admin/users/${userId}/admin`,
      { isAdmin }
    );

    // Clear cache
    apiClient.clearCache('/api/admin/users');

    return response.data.user;
  },

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ success: boolean; data: { message: string } }>(
      `/api/admin/users/${userId}`
    );

    // Clear cache
    apiClient.clearCache('/api/admin/users');
    apiClient.clearCache('/api/admin/stats');

    return response.data;
  },

  /**
   * Get all content with admin filters
   */
  async getContent(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    contentType?: string;
    source?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ content: Content[]; pagination: any }> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const response = await apiClient.get<{
      success: boolean;
      data: { content: Content[]; pagination: any };
    }>(`/api/admin/content${queryString ? `?${queryString}` : ''}`, {
      enableCache: false,
    });

    return response.data;
  },

  /**
   * Delete content
   */
  async deleteContent(contentId: string): Promise<ContentDeleteResponse> {
    const response = await apiClient.delete<{ success: boolean; data: ContentDeleteResponse }>(
      `/api/admin/content/${contentId}`
    );

    // Clear caches
    apiClient.clearCache('/api/admin/content');
    apiClient.clearCache('/api/admin/stats');
    apiClient.clearCache('/api/content');

    return response.data;
  },

  /**
   * Bulk delete content
   */
  async bulkDeleteContent(contentIds: string[]): Promise<{ deleted: number; message: string }> {
    const response = await apiClient.post<{
      success: boolean;
      data: { deleted: number; message: string };
    }>('/api/admin/content/bulk-delete', { contentIds });

    // Clear caches
    apiClient.clearCache('/api/admin/content');
    apiClient.clearCache('/api/admin/stats');
    apiClient.clearCache('/api/content');

    return response.data;
  },

  /**
   * Trigger content aggregation
   */
  async triggerAggregation(categoryId?: string): Promise<AggregationResponse> {
    const response = await apiClient.post<{ success: boolean; data: AggregationResponse }>(
      '/api/admin/aggregate',
      categoryId ? { categoryId } : undefined,
      { retry: 1 } // Don't retry aggregation
    );

    // Clear content caches
    apiClient.clearCache('/api/content');
    apiClient.clearCache('/api/admin/stats');
    apiClient.clearCache('/api/users/feed');

    return response.data;
  },

  /**
   * Get system health
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await apiClient.get<{ success: boolean; data: SystemHealth }>(
      '/api/admin/health',
      { enableCache: true, cacheTime: 10000 } // Cache for 10 seconds
    );

    return response.data;
  },

  /**
   * Get system logs
   */
  async getSystemLogs(params?: {
    level?: 'error' | 'warn' | 'info' | 'debug';
    limit?: number;
    offset?: number;
  }): Promise<{
    logs: Array<{
      timestamp: string;
      level: string;
      message: string;
      metadata?: any;
    }>;
    total: number;
  }> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const response = await apiClient.get<{
      success: boolean;
      data: {
        logs: Array<{
          timestamp: string;
          level: string;
          message: string;
          metadata?: any;
        }>;
        total: number;
      };
    }>(`/api/admin/logs${queryString ? `?${queryString}` : ''}`, {
      enableCache: false,
    });

    return response.data;
  },

  /**
   * Get activity logs
   */
  async getActivityLogs(params?: {
    userId?: string;
    activityType?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    activities: Array<{
      id: string;
      userId: string;
      activityType: string;
      entityType?: string;
      entityId?: string;
      metadata: any;
      createdAt: string;
      user?: {
        username: string;
        email: string;
      };
    }>;
    total: number;
  }> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const response = await apiClient.get<{
      success: boolean;
      data: {
        activities: Array<{
          id: string;
          userId: string;
          activityType: string;
          entityType?: string;
          entityId?: string;
          metadata: any;
          createdAt: string;
          user?: {
            username: string;
            email: string;
          };
        }>;
        total: number;
      };
    }>(`/api/admin/activity${queryString ? `?${queryString}` : ''}`, {
      enableCache: false,
    });

    return response.data;
  },
};

export default adminService;
