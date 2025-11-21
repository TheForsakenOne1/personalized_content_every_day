import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { auth } from '../middleware/auth';
import { validateQuery } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = Router();

/**
 * Analytics Routes
 * Base path: /api/analytics
 * All routes require authentication
 */

// GET /api/analytics/reading-stats - Get reading statistics
router.get('/reading-stats', auth, validateQuery(schemas.analyticsDateRange), analyticsController.getReadingStats.bind(analyticsController));

// GET /api/analytics/streak - Get reading streak
router.get('/streak', auth, analyticsController.getReadingStreak.bind(analyticsController));

// GET /api/analytics/topics - Get topic breakdown
router.get('/topics', auth, validateQuery(schemas.analyticsDateRange), analyticsController.getTopicBreakdown.bind(analyticsController));

// GET /api/analytics/category-stats - Get category statistics (alias for topics)
router.get('/category-stats', auth, validateQuery(schemas.analyticsDateRange), analyticsController.getTopicBreakdown.bind(analyticsController));

// GET /api/analytics/activity - Get activity timeline
router.get('/activity', auth, validateQuery(schemas.analyticsDateRange), analyticsController.getActivityTimeline.bind(analyticsController));

// GET /api/analytics/time-series - Get time series data (alias for activity)
router.get('/time-series', auth, validateQuery(schemas.analyticsDateRange), analyticsController.getActivityTimeline.bind(analyticsController));

// GET /api/analytics/content-type-breakdown - Get content type breakdown
router.get('/content-type-breakdown', auth, validateQuery(schemas.analyticsDateRange), analyticsController.getContentTypeBreakdown.bind(analyticsController));

// GET /api/analytics/engagement - Get engagement metrics
router.get('/engagement', auth, validateQuery(schemas.analyticsDateRange), analyticsController.getEngagementMetrics.bind(analyticsController));

// GET /api/analytics/insights - Get learning insights
router.get('/insights', auth, validateQuery(schemas.analyticsDateRange), analyticsController.getLearningInsights.bind(analyticsController));

// GET /api/analytics/dashboard - Get comprehensive dashboard analytics
router.get('/dashboard', auth, validateQuery(schemas.analyticsDateRange), analyticsController.getDashboardAnalytics.bind(analyticsController));

// GET /api/analytics/recommendations - Get recommendation performance metrics
router.get('/recommendations', auth, validateQuery(schemas.analyticsDateRange), analyticsController.getRecommendationMetrics.bind(analyticsController));

export default router;
