import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { ContentService } from '../services/content.service';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { aggregatorService } from '../services/aggregation/aggregator.service';

const contentService = new ContentService();

export class ContentController {
  async getContent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        categoryId,
        contentType,
        source,
        search,
        tags,
        dateFrom,
        dateTo,
        page = '1',
        limit = '20',
        sortBy = 'publishedAt',
        sortOrder = 'desc',
      } = req.query;

      const filters = {
        categoryId: categoryId as string,
        contentType: contentType as string,
        source: source as string,
        search: search as string,
        tags: tags ? (tags as string).split(',') : undefined,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
      };

      const options = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const result = await contentService.getContent(filters, options);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getContentById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const content = await contentService.getContentById(id, userId);

      res.json({
        success: true,
        data: { content },
      });
    } catch (error) {
      next(error);
    }
  }

  async searchContent(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, limit = '20' } = req.query;

      if (!q) {
        throw new AppError('Search query is required', 400);
      }

      const content = await contentService.searchContent(
        q as string,
        parseInt(limit as string, 10)
      );

      res.json({
        success: true,
        data: { content },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrendingContent(req: Request, res: Response, next: NextFunction) {
    try {
      const { days = '7', limit = '10' } = req.query;

      const content = await contentService.getTrendingContent(
        parseInt(days as string, 10),
        parseInt(limit as string, 10)
      );

      res.json({
        success: true,
        data: { content },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoints
  async createContent(req: Request, res: Response, next: NextFunction) {
    try {
      const content = await contentService.createContent(req.body);

      res.status(201).json({
        success: true,
        data: { content },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateContent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const content = await contentService.updateContent(id, req.body);

      res.json({
        success: true,
        data: { content },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteContent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await contentService.deleteContent(id);

      res.json({
        success: true,
        data: { message: 'Content deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  async addTags(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { tags } = req.body;

      if (!tags || !Array.isArray(tags)) {
        throw new AppError('Tags array is required', 400);
      }

      const addedTags = await contentService.addTagsToContent(id, tags);

      res.json({
        success: true,
        data: { tags: addedTags },
      });
    } catch (error) {
      next(error);
    }
  }

  async removeTags(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { tags } = req.body;

      if (!tags || !Array.isArray(tags)) {
        throw new AppError('Tags array is required', 400);
      }

      await contentService.removeTagsFromContent(id, tags);

      res.json({
        success: true,
        data: { message: 'Tags removed successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/content/freshness
   * Check if content is stale (older than 6 hours)
   */
  async checkContentFreshness(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.query;

      const freshness = await contentService.checkContentFreshness(
        categoryId as string | undefined
      );

      res.json({
        success: true,
        data: freshness,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/content/refresh
   * Trigger on-demand content aggregation
   */
  async refreshContent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { categoryId, categoryName } = req.body;

      // Trigger aggregation in background
      if (categoryId && categoryName) {
        aggregatorService.aggregateForCategory(categoryId, categoryName).catch((err) => {
          logger.error('Aggregation error:', err);
        });
      } else {
        aggregatorService.aggregateAll().catch((err) => {
          logger.error('Content aggregation failed', { error: err.message });
        });
      }

      res.json({
        success: true,
        data: {
          message: 'Content refresh started',
          note: 'Aggregation is running in the background',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
