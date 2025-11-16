/**
 * Content API Service
 */

import { apiClient } from '@/lib/api-client';

export interface Content {
  id: string;
  externalId?: string;
  contentType: string;
  source: string;
  categoryId: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  author?: string;
  publishedAt?: string;
  duration?: number;
  wordCount?: number;
  language: string;
  metadata: any;
  qualityScore: number;
  popularityScore: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
  };
  tags?: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

export interface ContentFilters {
  categoryId?: string;
  contentType?: 'video' | 'article' | 'paper' | 'blog';
  source?: string;
  search?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'publishedAt' | 'qualityScore' | 'popularityScore' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const contentService = {
  /**
   * Get content list with filters
   */
  async getContent(filters?: ContentFilters): Promise<PaginatedResponse<Content>> {
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
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<Content> }>(
      `/api/content${queryString ? `?${queryString}` : ''}`,
      { enableCache: true, cacheTime: 120000 } // Cache for 2 minutes
    );

    return response.data;
  },

  /**
   * Get content by ID
   */
  async getContentById(id: string): Promise<Content> {
    const response = await apiClient.get<{ success: boolean; data: { content: Content } }>(
      `/api/content/${id}`,
      { enableCache: true, cacheTime: 300000 } // Cache for 5 minutes
    );

    return response.data.content;
  },

  /**
   * Search content
   */
  async searchContent(query: string, limit?: number): Promise<Content[]> {
    const queryParams = new URLSearchParams({ q: query });
    if (limit) queryParams.append('limit', String(limit));

    const response = await apiClient.get<{ success: boolean; data: { content: Content[] } }>(
      `/api/content/search?${queryParams.toString()}`,
      { enableCache: true, cacheTime: 60000 } // Cache for 1 minute
    );

    return response.data.content;
  },

  /**
   * Get trending content
   */
  async getTrendingContent(days?: number, limit?: number): Promise<Content[]> {
    const queryParams = new URLSearchParams();
    if (days) queryParams.append('days', String(days));
    if (limit) queryParams.append('limit', String(limit));

    const response = await apiClient.get<{ success: boolean; data: { content: Content[] } }>(
      `/api/content/trending${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      { enableCache: true, cacheTime: 180000 } // Cache for 3 minutes
    );

    return response.data.content;
  },

  /**
   * Get content by category
   */
  async getContentByCategory(categoryId: string, page = 1, limit = 20): Promise<PaginatedResponse<Content>> {
    return this.getContent({ categoryId, page, limit });
  },

  /**
   * Get content by type
   */
  async getContentByType(
    contentType: 'video' | 'article' | 'paper' | 'blog',
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Content>> {
    return this.getContent({ contentType, page, limit });
  },
};

export default contentService;
