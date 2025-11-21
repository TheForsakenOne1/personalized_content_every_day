/**
 * Analytics API Service
 */

import { apiClient } from '@/lib/api-client';

export interface ReadingStats {
  totalContentRead: number;
  totalReadingTimeMinutes: number;
  averageReadingTimeMinutes: number;
  contentCompletionRate: number;
}

export interface ContentTypeBreakdown {
  contentType: string;
  count: number;
  percentage: number;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  count: number;
  percentage: number;
}

export interface TimeSeriesData {
  date: string;
  count: number;
  readingTimeMinutes: number;
}

export interface EngagementMetrics {
  savedContentCount: number;
  ratedContentCount: number;
  averageRating: number;
  mostEngagedCategories: Array<{
    categoryId: string;
    categoryName: string;
    engagementScore: number;
  }>;
}

export interface LearningInsights {
  topCategories: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
  }>;
  contentDiversityScore: number;
  recommendedTopics: string[];
  personalGrowthMetrics: {
    weeklyGrowth: number;
    monthlyGrowth: number;
    consistencyScore: number;
  };
}

export interface AnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  period?: '7d' | '30d' | '90d' | 'all';
}

export const analyticsService = {
  /**
   * Get reading statistics
   */
  async getReadingStats(filters?: AnalyticsFilters): Promise<ReadingStats> {
    const queryParams = new URLSearchParams();
    if (filters?.period) queryParams.append('period', filters.period);
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);

    const queryString = queryParams.toString();
    const response = await apiClient.get<{ success: boolean; data: ReadingStats }>(
      `/api/analytics/reading-stats${queryString ? `?${queryString}` : ''}`,
      { enableCache: true, cacheTime: 60000 } // Cache for 1 minute
    );

    return response.data;
  },

  /**
   * Get category statistics
   */
  async getCategoryStats(filters?: AnalyticsFilters): Promise<CategoryStats[]> {
    const queryParams = new URLSearchParams();
    if (filters?.period) queryParams.append('period', filters.period);
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);

    const queryString = queryParams.toString();
    const response = await apiClient.get<{ success: boolean; data: CategoryStats[] }>(
      `/api/analytics/category-stats${queryString ? `?${queryString}` : ''}`,
      { enableCache: true, cacheTime: 60000 }
    );

    return response.data;
  },

  /**
   * Get content type breakdown
   */
  async getContentTypeBreakdown(filters?: AnalyticsFilters): Promise<ContentTypeBreakdown[]> {
    const queryParams = new URLSearchParams();
    if (filters?.period) queryParams.append('period', filters.period);
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);

    const queryString = queryParams.toString();
    const response = await apiClient.get<{ success: boolean; data: ContentTypeBreakdown[] }>(
      `/api/analytics/content-type-breakdown${queryString ? `?${queryString}` : ''}`,
      { enableCache: true, cacheTime: 60000 }
    );

    return response.data;
  },

  /**
   * Get time series activity data
   */
  async getTimeSeriesData(filters?: AnalyticsFilters): Promise<TimeSeriesData[]> {
    const queryParams = new URLSearchParams();
    if (filters?.period) queryParams.append('period', filters.period);
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);

    const queryString = queryParams.toString();
    const response = await apiClient.get<{ success: boolean; data: TimeSeriesData[] }>(
      `/api/analytics/time-series${queryString ? `?${queryString}` : ''}`,
      { enableCache: true, cacheTime: 60000 }
    );

    return response.data;
  },

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics(filters?: AnalyticsFilters): Promise<EngagementMetrics> {
    const queryParams = new URLSearchParams();
    if (filters?.period) queryParams.append('period', filters.period);
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);

    const queryString = queryParams.toString();
    const response = await apiClient.get<{ success: boolean; data: EngagementMetrics }>(
      `/api/analytics/engagement${queryString ? `?${queryString}` : ''}`,
      { enableCache: true, cacheTime: 60000 }
    );

    return response.data;
  },

  /**
   * Get learning insights
   */
  async getLearningInsights(filters?: AnalyticsFilters): Promise<LearningInsights> {
    const queryParams = new URLSearchParams();
    if (filters?.period) queryParams.append('period', filters.period);
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);

    const queryString = queryParams.toString();
    const response = await apiClient.get<{ success: boolean; data: LearningInsights }>(
      `/api/analytics/insights${queryString ? `?${queryString}` : ''}`,
      { enableCache: true, cacheTime: 60000 }
    );

    return response.data;
  },
};

export default analyticsService;
