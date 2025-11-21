import { Request, Response } from 'express';
import { enhancedSearchService, AdvancedSearchFilters } from '../services/search/enhanced-search.service';
import { searchSuggestionsService } from '../services/search/search-suggestions.service';
import { searchHistoryService } from '../services/search/search-history.service';
import logger from '../utils/logger';
import { API_LIMITS, HTTP_STATUS } from '../constants';

export class SearchController {
  /**
   * POST /api/search
   * Advanced search with filters
   */
  async search(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      // Extract filters from request body
      const filters: AdvancedSearchFilters = {
        query: req.body.query || req.query.q as string || '',
        categoryId: req.body.categoryId || req.query.categoryId as string,
        contentType: req.body.contentType || req.query.contentType as string,
        source: req.body.source || req.query.source as string,
        tags: req.body.tags || (req.query.tags ? [req.query.tags as string] : undefined),
        author: req.body.author || req.query.author as string,
        minQualityScore: req.body.minQualityScore ? Number(req.body.minQualityScore) : undefined,
        sortBy: req.body.sortBy || req.query.sortBy as any || 'relevance',
        sortOrder: req.body.sortOrder || req.query.sortOrder as any || 'desc',
      };

      // Parse date filters
      if (req.body.dateFrom) {
        filters.dateFrom = new Date(req.body.dateFrom);
      }
      if (req.body.dateTo) {
        filters.dateTo = new Date(req.body.dateTo);
      }

      // Pagination
      const page = Number(req.query.page) || 1;
      const limit = Math.min(
        Number(req.query.limit) || API_LIMITS.DEFAULT_PAGE_SIZE,
        API_LIMITS.MAX_PAGE_SIZE
      );

      // Perform search
      const results = await enhancedSearchService.search(filters, userId, page, limit);

      return res.json({
        success: true,
        data: results,
      });
    } catch (error: any) {
      logger.error('Search failed', { error: error.message, query: req.body.query });
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Search failed',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/search/suggestions?q=query
   * Get search suggestions for autocomplete
   */
  async getSuggestions(req: Request, res: Response) {
    try {
      const query = (req.query.q as string) || '';
      const userId = (req as any).user?.id;
      const limit = Math.min(
        Number(req.query.limit) || API_LIMITS.MAX_AUTOCOMPLETE_RESULTS,
        API_LIMITS.MAX_SEARCH_SUGGESTIONS
      );

      const suggestions = await searchSuggestionsService.getSuggestions(query, userId, limit);

      return res.json({
        success: true,
        data: suggestions,
      });
    } catch (error: any) {
      logger.error('Failed to get search suggestions', { error: error.message, query: req.query.q });
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to get suggestions',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/search/trending
   * Get trending searches
   */
  async getTrendingSearches(req: Request, res: Response) {
    try {
      const limit = Math.min(
        Number(req.query.limit) || API_LIMITS.MAX_AUTOCOMPLETE_RESULTS,
        API_LIMITS.MAX_SEARCH_SUGGESTIONS
      );

      const trending = await searchSuggestionsService.getTrendingSearches(limit);

      return res.json({
        success: true,
        data: trending,
      });
    } catch (error: any) {
      logger.error('Failed to get trending searches', { error: error.message });
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to get trending searches',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/search/history
   * Get user's search history (requires auth)
   */
  async getHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const limit = Math.min(
        Number(req.query.limit) || API_LIMITS.DEFAULT_PAGE_SIZE,
        API_LIMITS.MAX_PAGE_SIZE
      );

      const history = await searchHistoryService.getUserSearchHistory(userId, limit);

      return res.json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      logger.error('Failed to get search history', { userId: (req as any).user?.id, error: error.message });
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to get search history',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/search/history/recent
   * Get recent unique searches (deduplicated)
   */
  async getRecentSearches(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const limit = Math.min(
        Number(req.query.limit) || API_LIMITS.MAX_AUTOCOMPLETE_RESULTS,
        API_LIMITS.MAX_SEARCH_SUGGESTIONS
      );

      const searches = await searchHistoryService.getRecentUniqueSearches(userId, limit);

      return res.json({
        success: true,
        data: searches,
      });
    } catch (error: any) {
      logger.error('Failed to get recent searches', { userId: (req as any).user?.id, error: error.message });
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to get recent searches',
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/search/history
   * Clear user's search history
   */
  async clearHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        });
      }

      await searchHistoryService.clearUserHistory(userId);

      return res.json({
        success: true,
        message: 'Search history cleared',
      });
    } catch (error: any) {
      logger.error('Failed to clear search history', { userId: (req as any).user?.id, error: error.message });
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to clear search history',
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/search/history/:searchId
   * Delete a specific search from history
   */
  async deleteSearch(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const searchId = req.params.searchId;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        });
      }

      await searchHistoryService.deleteSearch(userId, searchId);

      return res.json({
        success: true,
        message: 'Search deleted',
      });
    } catch (error: any) {
      logger.error('Failed to delete search', {
        userId: (req as any).user?.id,
        searchId: req.params.searchId,
        error: error.message
      });
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to delete search',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/search/analytics
   * Get user's search analytics
   */
  async getAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const analytics = await searchHistoryService.getUserSearchAnalytics(userId);

      return res.json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      logger.error('Failed to get search analytics', { userId: (req as any).user?.id, error: error.message });
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to get search analytics',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/search/facets?q=query
   * Get search facets (available filters and their counts)
   */
  async getFacets(req: Request, res: Response) {
    try {
      const query = (req.query.q as string) || '';

      const facets = await enhancedSearchService.getSearchFacets(query);

      return res.json({
        success: true,
        data: facets,
      });
    } catch (error: any) {
      logger.error('Failed to get search facets', { query: req.query.q, error: error.message });
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to get search facets',
        error: error.message,
      });
    }
  }
}

export const searchController = new SearchController();
