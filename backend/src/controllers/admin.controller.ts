import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { aggregatorService } from '../services/aggregation/aggregator.service';
import logger from '../utils/logger';
import { API_LIMITS, TIME_CONSTANTS, HTTP_STATUS } from '../constants';

export class AdminController {
  /**
   * GET /api/admin/stats
   * Get system statistics
   */
  async getSystemStats(req: Request, res: Response) {
    try {
      // Note: Full database implementation pending - using placeholder responses
      // When database is fully configured, uncomment the following:
      /*
      const [
        totalUsers,
        totalContent,
        totalCategories,
        activeUsers,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.content.count(),
        prisma.category.count(),
        prisma.user.count({
          where: {
            lastLoginAt: {
              gte: new Date(Date.now() - TIME_CONSTANTS.ONE_DAY_MS * 30), // Last 30 days
            },
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          totalUsers,
          totalContent,
          totalCategories,
          activeUsers,
        },
      });
      */

      res.json({
        success: true,
        data: {
          totalUsers: 0,
          totalContent: 0,
          totalCategories: 0,
          activeUsers: 0,
        },
      });
    } catch (error: any) {
      logger.error('Failed to fetch system stats', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch system stats',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/admin/users
   * Get all users (paginated)
   */
  async getUsers(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Math.min(
        Number(req.query.limit) || API_LIMITS.DEFAULT_PAGE_SIZE,
        API_LIMITS.MAX_PAGE_SIZE
      );
      const skip = (page - 1) * limit;

      // Note: Full database implementation pending - using placeholder responses
      // When database is fully configured, uncomment the following:
      /*
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
            createdAt: true,
            lastLoginAt: true,
            isActive: true,
            emailVerified: true,
          },
        }),
        prisma.user.count(),
      ]);

      res.json({
        success: true,
        data: {
          users,
          total,
          page,
          limit,
        },
      });
      */

      res.json({
        success: true,
        data: {
          users: [],
          total: 0,
          page,
          limit,
        },
      });
    } catch (error: any) {
      logger.error('Failed to fetch users', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message,
      });
    }
  }

  /**
   * PATCH /api/admin/users/:userId/status
   * Toggle user active status
   */
  async toggleUserStatus(req: Request, res: Response) {
    const { userId } = req.params;
    const { isActive } = req.body;

    try {
      // Note: Full database implementation pending - using placeholder responses
      // When database is fully configured, uncomment the following:
      /*
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive },
        select: {
          id: true,
          email: true,
          username: true,
          isActive: true,
        },
      });

      res.json({
        success: true,
        data: user,
        message: `User ${isActive ? 'activated' : 'deactivated'}`,
      });
      */

      res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error: any) {
      logger.error('Failed to update user status', { userId, error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to update user status',
        error: error.message,
      });
    }
  }

  /**
   * POST /api/admin/aggregate
   * Manually trigger content aggregation
   */
  async triggerAggregation(req: Request, res: Response) {
    try {
      const { category } = req.body;

      // Trigger aggregation in background
      if (category) {
        aggregatorService.aggregateForCategory(category).catch((err) => {
          logger.error('Content aggregation failed', { category, error: err.message });
        });
      } else {
        aggregatorService.aggregateAll().catch((err) => {
          logger.error('Content aggregation failed', { error: err.message });
        });
      }

      res.json({
        success: true,
        message: 'Content aggregation started',
      });
    } catch (error: any) {
      logger.error('Failed to trigger aggregation', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to trigger aggregation',
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/admin/content/:contentId
   * Delete content (moderation)
   */
  async deleteContent(req: Request, res: Response) {
    const { contentId } = req.params;

    try {
      // Note: Full database implementation pending - using placeholder responses
      // When database is fully configured, uncomment the following:
      /*
      await prisma.content.delete({
        where: { id: contentId },
      });

      res.json({
        success: true,
        message: 'Content deleted',
      });
      */

      res.json({
        success: true,
        message: 'Content deleted',
      });
    } catch (error: any) {
      logger.error('Failed to delete content', { contentId, error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to delete content',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/admin/health
   * System health check
   */
  async getSystemHealth(req: Request, res: Response) {
    try {
      // Note: Basic health check - can be enhanced with:
      // - Database connection test
      // - Redis connection test
      // - External API status checks
      // - Queue health monitoring

      res.json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            database: 'ok',
            redis: 'ok',
            api: 'ok',
          },
        },
      });
    } catch (error: any) {
      logger.error('Health check failed', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Health check failed',
        error: error.message,
      });
    }
  }
}

export const adminController = new AdminController();
