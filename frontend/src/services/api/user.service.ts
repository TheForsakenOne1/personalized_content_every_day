/**
 * User API Service
 */

import { apiClient } from '@/lib/api-client';
import type { User } from './auth.service';
import type { Content } from './content.service';

export interface UserPreferences {
  id: string;
  userId: string;
  contentFrequency: string;
  preferredContentTypes: string[];
  notificationEnabled: boolean;
  emailDigest: boolean;
  theme: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCategory {
  id: string;
  userId: string;
  categoryId: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
  };
}

export interface UserStats {
  totalRead: number;
  totalSaved: number;
  readToday: number;
  contentTypeBreakdown: {
    article: number;
    video: number;
    paper: number;
    blog: number;
  };
  totalReadingTimeMinutes: number;
  topCategories: Array<{
    name: string;
    count: number;
  }>;
  streakDays?: number;
}

export const userService = {
  /**
   * Get user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: { user: User } }>(
      '/api/users/me',
      { enableCache: true, cacheTime: 60000 }
    );

    return response.data.user;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: {
    fullName?: string;
    avatarUrl?: string;
    email?: string;
    username?: string;
  }): Promise<User> {
    const response = await apiClient.patch<{ success: boolean; data: { user: User } }>(
      '/api/users/me',
      data
    );

    // Clear cache
    apiClient.clearCache('/api/users/me');
    apiClient.clearCache('/api/auth/me');

    return response.data.user;
  },

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    const response = await apiClient.get<{ success: boolean; data: { preferences: UserPreferences } }>(
      '/api/users/preferences',
      { enableCache: true, cacheTime: 120000 }
    );

    return response.data.preferences;
  },

  /**
   * Update user preferences
   */
  async updatePreferences(data: {
    contentFrequency?: string;
    preferredContentTypes?: string[];
    notificationEnabled?: boolean;
    emailDigest?: boolean;
    theme?: string;
  }): Promise<UserPreferences> {
    const response = await apiClient.patch<{ success: boolean; data: { preferences: UserPreferences } }>(
      '/api/users/preferences',
      data
    );

    // Clear cache
    apiClient.clearCache('/api/users/preferences');

    return response.data.preferences;
  },

  /**
   * Get user categories
   */
  async getCategories(): Promise<UserCategory[]> {
    const response = await apiClient.get<{ success: boolean; data: { categories: UserCategory[] } }>(
      '/api/users/categories',
      { enableCache: true, cacheTime: 120000 }
    );

    return response.data.categories;
  },

  /**
   * Update user categories
   */
  async updateCategories(categoryIds: string[], priorities?: number[]): Promise<void> {
    await apiClient.put('/api/users/categories', {
      categoryIds,
      priorities,
    });

    // Clear cache
    apiClient.clearCache('/api/users/categories');
  },

  /**
   * Save content
   */
  async saveContent(contentId: string): Promise<void> {
    await apiClient.post(`/api/users/content/${contentId}/save`);

    // Clear related caches
    apiClient.clearCache('/api/users/saved');
    apiClient.clearCache('/api/users/stats');
  },

  /**
   * Unsave content
   */
  async unsaveContent(contentId: string): Promise<void> {
    await apiClient.delete(`/api/users/content/${contentId}/save`);

    // Clear related caches
    apiClient.clearCache('/api/users/saved');
    apiClient.clearCache('/api/users/stats');
  },

  /**
   * Mark content as read
   */
  async markAsRead(contentId: string): Promise<void> {
    await apiClient.post(`/api/users/content/${contentId}/read`);

    // Clear related caches
    apiClient.clearCache('/api/users/feed');
    apiClient.clearCache('/api/users/stats');
  },

  /**
   * Get user feed
   */
  async getFeed(filter?: 'all' | 'unread' | 'saved'): Promise<Content[]> {
    const queryParam = filter ? `?filter=${filter}` : '';
    const response = await apiClient.get<{ success: boolean; data: { content: Content[] } }>(
      `/api/users/feed${queryParam}`,
      { enableCache: true, cacheTime: 60000 }
    );

    return response.data.content;
  },

  /**
   * Get saved content
   */
  async getSavedContent(): Promise<Content[]> {
    const response = await apiClient.get<{ success: boolean; data: { content: Content[] } }>(
      '/api/users/saved',
      { enableCache: true, cacheTime: 60000 }
    );

    return response.data.content;
  },

  /**
   * Get user stats
   */
  async getStats(): Promise<UserStats> {
    const response = await apiClient.get<{ success: boolean; data: { stats: UserStats } }>(
      '/api/users/stats',
      { enableCache: true, cacheTime: 60000 }
    );

    return response.data.stats;
  },
};

export default userService;
