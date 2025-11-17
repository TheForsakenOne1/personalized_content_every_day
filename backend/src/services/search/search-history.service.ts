import logger from '../../utils/logger';
import { prisma } from '../../utils/prisma';

export interface SearchHistoryEntry {
  id: string;
  userId: string;
  query: string;
  resultsCount: number;
  createdAt: Date;
}

/**
 * Search History Service
 * Tracks user search queries for personalization and analytics
 */
export class SearchHistoryService {
  /**
   * Record a search query
   */
  async recordSearch(userId: string, query: string, resultsCount: number): Promise<void> {
    try {
      // TODO: Uncomment when Prisma is generated
      /*
      await prisma.searchHistory.create({
        data: {
          userId,
          query: query.toLowerCase().trim(),
          resultsCount,
        },
      });
      */

      logger.info(`📝 Search recorded: user=${userId}, query="${query}", results=${resultsCount}`);
    } catch (error) {
      logger.error('Error recording search:', error);
      // Don't throw - search history is non-critical
    }
  }

  /**
   * Get user's search history
   */
  async getUserSearchHistory(userId: string, limit: number = 20): Promise<SearchHistoryEntry[]> {
    try {
      // TODO: Uncomment when Prisma is generated
      /*
      const history = await prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          userId: true,
          query: true,
          resultsCount: true,
          createdAt: true,
        },
      });

      return history;
      */

      return [];
    } catch (error) {
      logger.error('Error fetching search history:', error);
      return [];
    }
  }

  /**
   * Get unique recent searches (deduplicated)
   */
  async getRecentUniqueSearches(userId: string, limit: number = 10): Promise<string[]> {
    try {
      // TODO: Uncomment when Prisma is generated
      /*
      const history = await prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50, // Get more to deduplicate
        select: { query: true },
      });

      // Deduplicate while preserving order
      const uniqueQueries = [...new Set(history.map(h => h.query))];
      return uniqueQueries.slice(0, limit);
      */

      return [];
    } catch (error) {
      logger.error('Error fetching recent searches:', error);
      return [];
    }
  }

  /**
   * Clear user's search history
   */
  async clearUserHistory(userId: string): Promise<void> {
    try {
      // TODO: Uncomment when Prisma is generated
      /*
      await prisma.searchHistory.deleteMany({
        where: { userId },
      });
      */

      logger.info(`🗑️ Search history cleared for user=${userId}`);
    } catch (error) {
      logger.error('Error clearing search history:', error);
      throw error;
    }
  }

  /**
   * Delete a specific search from history
   */
  async deleteSearch(userId: string, searchId: string): Promise<void> {
    try {
      // TODO: Uncomment when Prisma is generated
      /*
      await prisma.searchHistory.delete({
        where: {
          id: searchId,
          userId, // Ensure user owns this search
        },
      });
      */

      logger.info(`🗑️ Search deleted: id=${searchId}, user=${userId}`);
    } catch (error) {
      logger.error('Error deleting search:', error);
      throw error;
    }
  }

  /**
   * Get search history analytics for user
   */
  async getUserSearchAnalytics(userId: string): Promise<{
    totalSearches: number;
    uniqueQueries: number;
    topSearches: Array<{ query: string; count: number }>;
  }> {
    try {
      // TODO: Uncomment when Prisma is generated
      /*
      const history = await prisma.searchHistory.findMany({
        where: { userId },
        select: { query: true },
      });

      const totalSearches = history.length;

      // Count unique queries
      const uniqueQueries = new Set(history.map(h => h.query)).size;

      // Count frequency of each query
      const queryFrequency = new Map<string, number>();
      history.forEach(h => {
        queryFrequency.set(h.query, (queryFrequency.get(h.query) || 0) + 1);
      });

      // Get top 5 most searched queries
      const topSearches = Array.from(queryFrequency.entries())
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalSearches,
        uniqueQueries,
        topSearches,
      };
      */

      return {
        totalSearches: 0,
        uniqueQueries: 0,
        topSearches: [],
      };
    } catch (error) {
      logger.error('Error fetching search analytics:', error);
      return {
        totalSearches: 0,
        uniqueQueries: 0,
        topSearches: [],
      };
    }
  }
}

export const searchHistoryService = new SearchHistoryService();
