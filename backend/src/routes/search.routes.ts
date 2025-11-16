import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { auth, optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * Search Routes
 * Base path: /api/search
 */

// POST /api/search - Advanced search with filters (supports both GET and POST)
router.post('/', optionalAuth, searchController.search.bind(searchController));
router.get('/', optionalAuth, searchController.search.bind(searchController));

// GET /api/search/suggestions - Get autocomplete suggestions
router.get('/suggestions', optionalAuth, searchController.getSuggestions.bind(searchController));

// GET /api/search/trending - Get trending searches
router.get('/trending', searchController.getTrendingSearches.bind(searchController));

// GET /api/search/facets - Get search facets (available filters)
router.get('/facets', searchController.getFacets.bind(searchController));

// GET /api/search/history - Get user's search history (auth required)
router.get('/history', auth, searchController.getHistory.bind(searchController));

// GET /api/search/history/recent - Get recent unique searches (auth required)
router.get('/history/recent', auth, searchController.getRecentSearches.bind(searchController));

// DELETE /api/search/history - Clear user's search history (auth required)
router.delete('/history', auth, searchController.clearHistory.bind(searchController));

// DELETE /api/search/history/:searchId - Delete specific search (auth required)
router.delete('/history/:searchId', auth, searchController.deleteSearch.bind(searchController));

// GET /api/search/analytics - Get user's search analytics (auth required)
router.get('/analytics', auth, searchController.getAnalytics.bind(searchController));

export default router;
