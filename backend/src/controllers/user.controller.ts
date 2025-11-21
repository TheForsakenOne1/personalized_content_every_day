import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const userService = new UserService();

export class UserController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const user = await userService.getUserProfile(req.user.id);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { fullName, avatarUrl, email, username } = req.body;

      const user = await userService.updateUserProfile(req.user.id, {
        fullName,
        avatarUrl,
        email,
        username,
      });

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const preferences = await userService.getUserPreferences(req.user.id);

      res.json({
        success: true,
        data: { preferences },
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const {
        contentFrequency,
        preferredContentTypes,
        notificationEnabled,
        emailDigest,
        theme,
      } = req.body;

      const preferences = await userService.updateUserPreferences(req.user.id, {
        contentFrequency,
        preferredContentTypes,
        notificationEnabled,
        emailDigest,
        theme,
      });

      res.json({
        success: true,
        data: { preferences },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const categories = await userService.getUserCategories(req.user.id);

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { categoryIds, priorities } = req.body;

      if (!categoryIds || !Array.isArray(categoryIds)) {
        throw new AppError('Category IDs array is required', 400);
      }

      const categories = await userService.updateUserCategories(
        req.user.id,
        categoryIds,
        priorities
      );

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  }

  async saveContent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { contentId } = req.params;

      const interaction = await userService.saveContent(req.user.id, contentId);

      res.json({
        success: true,
        data: { interaction },
      });
    } catch (error) {
      next(error);
    }
  }

  async unsaveContent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { contentId } = req.params;

      const interaction = await userService.unsaveContent(
        req.user.id,
        contentId
      );

      res.json({
        success: true,
        data: { interaction },
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { contentId } = req.params;

      const interaction = await userService.markAsRead(req.user.id, contentId);

      res.json({
        success: true,
        data: { interaction },
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeed(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { filter } = req.query;

      const content = await userService.getUserFeed(
        req.user.id,
        filter as 'all' | 'unread' | 'saved'
      );

      res.json({
        success: true,
        data: { content },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSavedContent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const content = await userService.getSavedContent(req.user.id);

      res.json({
        success: true,
        data: { content },
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const stats = await userService.getUserStats(req.user.id);

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }
}
