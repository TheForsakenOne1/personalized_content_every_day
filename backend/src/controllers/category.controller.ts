import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { HTTP_STATUS } from '../constants';
import { CategoryService } from '../services/category.service';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const categoryService = new CategoryService();

export class CategoryController {
  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { includeStats = 'false' } = req.query;

      const categories = await categoryService.getAllCategories(
        includeStats === 'true'
      );

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const category = await categoryService.getCategoryById(id);

      res.json({
        success: true,
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;

      const category = await categoryService.getCategoryBySlug(slug);

      res.json({
        success: true,
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserCategories(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const categories = await categoryService.getUserCategories(req.user.id);

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  }

  async subscribeToCategory(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { categoryId, priority = 5 } = req.body;

      if (!categoryId) {
        throw new AppError('Category ID is required', 400);
      }

      const userCategory = await categoryService.subscribeToCategory(
        req.user.id,
        categoryId,
        priority
      );

      res.status(201).json({
        success: true,
        data: { userCategory },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategoryPriority(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { id } = req.params;
      const { priority } = req.body;

      if (priority === undefined || priority < 1 || priority > 10) {
        throw new AppError('Priority must be between 1 and 10', 400);
      }

      const userCategory = await categoryService.updateCategoryPriority(
        req.user.id,
        id,
        priority
      );

      res.json({
        success: true,
        data: { userCategory },
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleCategoryStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { id } = req.params;

      const userCategory = await categoryService.toggleCategoryStatus(
        req.user.id,
        id
      );

      res.json({
        success: true,
        data: { userCategory },
      });
    } catch (error) {
      next(error);
    }
  }

  async unsubscribeFromCategory(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { id } = req.params;

      await categoryService.unsubscribeFromCategory(req.user.id, id);

      res.json({
        success: true,
        data: { message: 'Unsubscribed successfully' },
      });
    } catch (error) {
      next(error);
    }
  }
}
