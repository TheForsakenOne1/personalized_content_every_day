import { Request, Response } from 'express';
import { enhancedSearchService, AdvancedSearchFilters } from '../services/search/enhanced-search.service';
import { searchSuggestionsService } from '../services/search/search-suggestions.service';
import { searchHistoryService } from '../services/search/search-history.service';

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
      const limit = Math.min(Number(req.query.limit) || 20, 100); // Cap at 100

      // Perform search
      const results = await enhancedSearchService.search(filters, userId, page, limit);

      res.json({
        success: true,
        data: results,
      });
    } catch (error: any) {
      console.error('Search error:', error);
      res.status(500).json({
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
      const limit = Math.min(Number(req.query.limit) || 10, 20); // Cap at 20

      const suggestions = await searchSuggestionsService.getSuggestions(query, userId, limit);

      res.json({
        success: true,
        data: suggestions,
      });
    } catch (error: any) {
      console.error('Suggestions error:', error);
      res.status(500).json({
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
      const limit = Math.min(Number(req.query.limit) || 10, 20);

      const trending = await searchSuggestionsService.getTrendingSearches(limit);

      res.json({
        success: true,
        data: trending,
      });
    } catch (error: any) {
      console.error('Trending searches error:', error);
      res.status(500).json({
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
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const limit = Math.min(Number(req.query.limit) || 20, 100);

      const history = await searchHistoryService.getUserSearchHistory(userId, limit);

      res.json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      console.error('Search history error:', error);
      res.status(500).json({
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
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const limit = Math.min(Number(req.query.limit) || 10, 20);

      const searches = await searchHistoryService.getRecentUniqueSearches(userId, limit);

      res.json({
        success: true,
        data: searches,
      });
    } catch (error: any) {
      console.error('Recent searches error:', error);
      res.status(500).json({
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
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      await searchHistoryService.clearUserHistory(userId);

      res.json({
        success: true,
        message: 'Search history cleared',
      });
    } catch (error: any) {
      console.error('Clear history error:', error);
      res.status(500).json({
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
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      await searchHistoryService.deleteSearch(userId, searchId);

      res.json({
        success: true,
        message: 'Search deleted',
      });
    } catch (error: any) {
      console.error('Delete search error:', error);
      res.status(500).json({
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
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const analytics = await searchHistoryService.getUserSearchAnalytics(userId);

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      console.error('Search analytics error:', error);
      res.status(500).json({
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

      res.json({
        success: true,
        data: facets,
      });
    } catch (error: any) {
      console.error('Search facets error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get search facets',
        error: error.message,
      });
    }
  }
}

export const searchController = new SearchController();
