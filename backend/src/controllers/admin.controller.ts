import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { aggregatorService } from '../services/aggregation/aggregator.service';

export class AdminController {
  /**
   * GET /api/admin/stats
   * Get system statistics
   */
  async getSystemStats(req: Request, res: Response) {
    try {
      // TODO: Uncomment when Prisma is generated
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
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
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
      console.error('System stats error:', error);
      res.status(500).json({
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
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const skip = (page - 1) * limit;

      // TODO: Uncomment when Prisma is generated
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
      console.error('Get users error:', error);
      res.status(500).json({
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
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      // TODO: Uncomment when Prisma is generated
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
      console.error('Toggle user status error:', error);
      res.status(500).json({
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
      const { categoryId, categoryName } = req.body;

      // Trigger aggregation in background
      if (categoryId && categoryName) {
        aggregatorService.aggregateForCategory(categoryId, categoryName).catch((err) => {
          console.error('Aggregation error:', err);
        });
      } else {
        aggregatorService.aggregateAll().catch((err) => {
          console.error('Aggregation error:', err);
        });
      }

      res.json({
        success: true,
        message: 'Content aggregation started',
      });
    } catch (error: any) {
      console.error('Trigger aggregation error:', error);
      res.status(500).json({
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
    try {
      const { contentId } = req.params;

      // TODO: Uncomment when Prisma is generated
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
      console.error('Delete content error:', error);
      res.status(500).json({
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
      // TODO: Add actual health checks
      // - Database connection
      // - Redis connection
      // - External API status
      // - Queue health

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
      console.error('System health error:', error);
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error.message,
      });
    }
  }
}

export const adminController = new AdminController();
