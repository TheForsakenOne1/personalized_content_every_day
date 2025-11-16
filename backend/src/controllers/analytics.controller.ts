import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics/analytics.service';

export class AnalyticsController {
  /**
   * GET /api/analytics/reading-stats
   * Get user's reading statistics
   */
  async getReadingStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const stats = await analyticsService.getReadingStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Reading stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reading stats',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/analytics/streak
   * Get user's reading streak
   */
  async getReadingStreak(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const streak = await analyticsService.getReadingStreak(userId);

      res.json({
        success: true,
        data: streak,
      });
    } catch (error: any) {
      console.error('Reading streak error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reading streak',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/analytics/topics
   * Get topic breakdown
   */
  async getTopicBreakdown(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const breakdown = await analyticsService.getTopicBreakdown(userId);

      res.json({
        success: true,
        data: breakdown,
      });
    } catch (error: any) {
      console.error('Topic breakdown error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch topic breakdown',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/analytics/activity?days=30
   * Get daily activity timeline
   */
  async getActivityTimeline(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const days = Math.min(Number(req.query.days) || 30, 365); // Max 1 year

      const activity = await analyticsService.getActivityTimeline(userId, days);

      res.json({
        success: true,
        data: activity,
      });
    } catch (error: any) {
      console.error('Activity timeline error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch activity timeline',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/analytics/dashboard
   * Get comprehensive dashboard analytics
   */
  async getDashboardAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const analytics = await analyticsService.getDashboardAnalytics(userId);

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      console.error('Dashboard analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard analytics',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/analytics/recommendations
   * Get recommendation performance metrics
   */
  async getRecommendationMetrics(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const metrics = await analyticsService.getRecommendationMetrics(userId);

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      console.error('Recommendation metrics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recommendation metrics',
        error: error.message,
      });
    }
  }
}

export const analyticsController = new AnalyticsController();
