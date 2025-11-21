/**
 * Content Refresh Service
 * Handles content freshness checks and on-demand aggregation
 */

import { apiClient } from '@/lib/api-client';

export interface ContentFreshness {
  isStale: boolean;
  lastUpdated: string | null;
  ageInHours: number | null;
  totalContent: number;
  freshContent: number;
  staleContent: number;
  freshnessPercentage: number;
  shouldRefresh: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export const contentRefreshService = {
  /**
   * Check if content is stale (older than 6 hours)
   */
  async checkFreshness(categoryId?: string): Promise<ContentFreshness> {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    const response = await apiClient.get<{ success: boolean; data: ContentFreshness }>(
      `/api/content/freshness${params}`
    );

    return response.data;
  },

  /**
   * Trigger on-demand content aggregation
   */
  async refreshContent(options?: {
    categoryId?: string;
    categoryName?: string;
  }): Promise<void> {
    await apiClient.post('/api/content/refresh', options || {});
  },

  /**
   * Smart refresh: Check freshness and trigger refresh if needed
   * Returns true if refresh was triggered, false otherwise
   */
  async smartRefresh(categoryId?: string, categoryName?: string): Promise<boolean> {
    try {
      const freshness = await this.checkFreshness(categoryId);

      if (freshness.shouldRefresh) {
        // Trigger refresh in background
        this.refreshContent({ categoryId, categoryName }).catch(err => {
          console.error('Failed to trigger content refresh:', err);
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to check content freshness:', error);
      return false;
    }
  },
};

export default contentRefreshService;
