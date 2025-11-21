import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { auth, optionalAuth } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = Router();

/**
 * Search Routes
 * Base path: /api/search
 */

// POST /api/search - Advanced search with filters (supports both GET and POST)
router.post('/', optionalAuth, validateBody(schemas.advancedSearch), searchController.search.bind(searchController));
router.get('/', optionalAuth, validateQuery(schemas.advancedSearch), searchController.search.bind(searchController));

// GET /api/search/suggestions - Get autocomplete suggestions
router.get('/suggestions', optionalAuth, validateQuery(schemas.searchSuggestions), searchController.getSuggestions.bind(searchController));

// GET /api/search/trending - Get trending searches
router.get('/trending', validateQuery(schemas.searchHistory), searchController.getTrendingSearches.bind(searchController));

// GET /api/search/facets - Get search facets (available filters)
router.get('/facets', validateQuery(schemas.searchSuggestions), searchController.getFacets.bind(searchController));

// GET /api/search/history - Get user's search history (auth required)
router.get('/history', auth, validateQuery(schemas.searchHistory), searchController.getHistory.bind(searchController));

// GET /api/search/history/recent - Get recent unique searches (auth required)
router.get('/history/recent', auth, validateQuery(schemas.searchHistory), searchController.getRecentSearches.bind(searchController));

// DELETE /api/search/history - Clear user's search history (auth required)
router.delete('/history', auth, searchController.clearHistory.bind(searchController));

// DELETE /api/search/history/:searchId - Delete specific search (auth required)
router.delete('/history/:searchId', auth, validateParams(schemas.deleteSearch), searchController.deleteSearch.bind(searchController));

// GET /api/search/analytics - Get user's search analytics (auth required)
router.get('/analytics', auth, searchController.getAnalytics.bind(searchController));

export default router;
