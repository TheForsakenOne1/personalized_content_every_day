import { logger } from '@/lib/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the request with new token
          const newToken = localStorage.getItem('accessToken');
          if (newToken) {
            headers.set('Authorization', `Bearer ${newToken}`);
            const retryResponse = await fetch(url, { ...config, headers });
            if (!retryResponse.ok) {
              throw new Error(`HTTP error! status: ${retryResponse.status}`);
            }
            const data = await retryResponse.json();
            return data;
          }
        } else {
          // Refresh failed, redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            window.location.href = '/auth/login';
          }
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: 'An error occurred',
        }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('API request failed', error);
      throw error;
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.success && data.data.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Auth endpoints
  async register(data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    return this.request<{
      success: boolean;
      data: { user: any; accessToken: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request<{
      success: boolean;
      data: { user: any };
    }>('/auth/me');
  }

  // User endpoints
  async getUserProfile() {
    return this.request<{
      success: boolean;
      data: { user: any };
    }>('/users/me');
  }

  async updateUserProfile(data: {
    fullName?: string;
    avatarUrl?: string;
    email?: string;
    username?: string;
  }) {
    return this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getUserPreferences() {
    return this.request<{
      success: boolean;
      data: { preferences: any };
    }>('/users/preferences');
  }

  async updateUserPreferences(data: {
    contentFrequency?: string;
    preferredContentTypes?: string[];
    notificationEnabled?: boolean;
    emailDigest?: boolean;
    theme?: string;
  }) {
    return this.request('/users/preferences', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getUserCategories() {
    return this.request<{
      success: boolean;
      data: { categories: any[] };
    }>('/users/categories');
  }

  async updateUserCategories(categoryIds: string[], priorities?: number[]) {
    return this.request('/users/categories', {
      method: 'PUT',
      body: JSON.stringify({ categoryIds, priorities }),
    });
  }

  async saveContent(contentId: string) {
    return this.request(`/users/content/${contentId}/save`, {
      method: 'POST',
    });
  }

  async unsaveContent(contentId: string) {
    return this.request(`/users/content/${contentId}/save`, {
      method: 'DELETE',
    });
  }

  async markAsRead(contentId: string) {
    return this.request(`/users/content/${contentId}/read`, {
      method: 'POST',
    });
  }

  async getUserFeed(filter?: 'all' | 'unread' | 'saved') {
    const queryParam = filter ? `?filter=${filter}` : '';
    return this.request<{
      success: boolean;
      data: { content: any[] };
    }>(`/users/feed${queryParam}`);
  }

  async getSavedContent() {
    return this.request<{
      success: boolean;
      data: { content: any[] };
    }>('/users/saved');
  }

  async getUserStats() {
    return this.request<{
      success: boolean;
      data: { stats: { totalRead: number; totalSaved: number; readToday: number } };
    }>('/users/stats');
  }

  // Content endpoints
  async getContent(filters?: {
    categoryId?: string;
    contentType?: string;
    source?: string;
    search?: string;
    tags?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else if (value instanceof Date) {
            queryParams.append(key, value.toISOString());
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const queryString = queryParams.toString();
    return this.request<{
      success: boolean;
      data: any;
    }>(`/content${queryString ? `?${queryString}` : ''}`);
  }

  async getContentById(id: string) {
    return this.request<{
      success: boolean;
      data: { content: any };
    }>(`/content/${id}`);
  }

  async searchContent(query: string, limit?: number) {
    const queryParams = new URLSearchParams({ q: query });
    if (limit) queryParams.append('limit', String(limit));
    return this.request<{
      success: boolean;
      data: { content: any[] };
    }>(`/content/search?${queryParams.toString()}`);
  }

  async getTrendingContent(days?: number, limit?: number) {
    const queryParams = new URLSearchParams();
    if (days) queryParams.append('days', String(days));
    if (limit) queryParams.append('limit', String(limit));
    return this.request<{
      success: boolean;
      data: { content: any[] };
    }>(`/content/trending${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
  }

  // Categories endpoints
  async getCategories() {
    return this.request<{
      success: boolean;
      data: { categories: any[] };
    }>('/categories');
  }

  async getCategoryById(id: string) {
    return this.request<{
      success: boolean;
      data: { category: any };
    }>(`/categories/${id}`);
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
