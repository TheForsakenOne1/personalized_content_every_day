import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { auth } from '../middleware/auth';

const router = Router();

/**
 * Analytics Routes
 * Base path: /api/analytics
 * All routes require authentication
 */

// GET /api/analytics/reading-stats - Get reading statistics
router.get('/reading-stats', auth, analyticsController.getReadingStats.bind(analyticsController));

// GET /api/analytics/streak - Get reading streak
router.get('/streak', auth, analyticsController.getReadingStreak.bind(analyticsController));

// GET /api/analytics/topics - Get topic breakdown
router.get('/topics', auth, analyticsController.getTopicBreakdown.bind(analyticsController));

// GET /api/analytics/activity - Get activity timeline
router.get('/activity', auth, analyticsController.getActivityTimeline.bind(analyticsController));

// GET /api/analytics/dashboard - Get comprehensive dashboard analytics
router.get('/dashboard', auth, analyticsController.getDashboardAnalytics.bind(analyticsController));

// GET /api/analytics/recommendations - Get recommendation performance metrics
router.get('/recommendations', auth, analyticsController.getRecommendationMetrics.bind(analyticsController));

export default router;
