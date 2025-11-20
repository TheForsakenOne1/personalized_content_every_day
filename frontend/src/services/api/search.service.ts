/**
 * Search API Service
 */

import { apiClient } from '@/lib/api-client';

export interface SearchSuggestion {
  query: string;
  type: 'content' | 'category' | 'tag';
  count?: number;
  relevance?: number;
}

export interface SearchResult {
  id: string;
  type: 'article' | 'video' | 'paper' | 'blog';
  title: string;
  description?: string;
  author?: string;
  source: string;
  category?: string;
  tags?: string[];
  url: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  duration?: number;
  wordCount?: number;
}

export const searchService = {
  /**
   * Get search suggestions based on query
   */
  async getSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });

    const response = await apiClient.get<{ success: boolean; data: SearchSuggestion[] }>(
      `/api/search/suggestions?${params.toString()}`
    );

    return response.data;
  },

  /**
   * Search content
   */
  async search(
    query: string,
    filters?: {
      type?: string;
      category?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ results: SearchResult[]; total: number }> {
    const params = new URLSearchParams({ q: query });

    if (filters?.type) params.append('type', filters.type);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await apiClient.get<{
      success: boolean;
      data: {
        results: SearchResult[];
        total: number;
      };
    }>(`/api/search?${params.toString()}`);

    return response.data;
  },

  /**
   * Get trending searches
   */
  async getTrending(limit: number = 10): Promise<string[]> {
    const response = await apiClient.get<{ success: boolean; data: string[] }>(
      `/api/search/trending?limit=${limit}`
    );

    return response.data;
  },
};
