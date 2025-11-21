import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const notificationService = new NotificationService();

export class NotificationController {
  /**
   * Get user notifications
   */
  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const unreadOnly = req.query.unreadOnly === 'true';

      const result = await notificationService.getUserNotifications(
        req.user.id,
        limit,
        offset,
        unreadOnly
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const result = await notificationService.getUnreadCount(req.user.id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { id } = req.params;

      if (!id) {
        throw new AppError('Notification ID is required', 400);
      }

      const notification = await notificationService.markAsRead(
        id,
        req.user.id
      );

      res.json({
        success: true,
        data: { notification },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const result = await notificationService.markAllAsRead(req.user.id);

      res.json({
        success: true,
        data: { count: result.count },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { id } = req.params;

      if (!id) {
        throw new AppError('Notification ID is required', 400);
      }

      await notificationService.deleteNotification(id, req.user.id);

      res.json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a notification (for testing/admin purposes)
   */
  async createNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { type, title, message, link, metadata } = req.body;

      if (!type || !title || !message) {
        throw new AppError('Type, title, and message are required', 400);
      }

      const notification = await notificationService.createNotification(
        req.user.id,
        type,
        title,
        message,
        link,
        metadata
      );

      res.json({
        success: true,
        data: { notification },
      });
    } catch (error) {
      next(error);
    }
  }
}
