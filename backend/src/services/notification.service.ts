import logger from '../utils/logger';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'content_recommendation'
  | 'achievement'
  | 'system';

export class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    metadata?: Record<string, any>
  ) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          link,
          metadata: metadata || {},
        },
      });

      logger.info('Notification created', {
        notificationId: notification.id,
        userId,
        type,
      });

      return notification;
    } catch (error) {
      logger.error('Failed to create notification', { error, userId, type });
      throw new AppError('Failed to create notification', 500);
    }
  }

  /**
   * Get user notifications with pagination and filters
   */
  async getUserNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false
  ) {
    try {
      const where: any = { userId };
      if (unreadOnly) {
        where.isRead = false;
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.notification.count({ where }),
      ]);

      return {
        notifications,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      };
    } catch (error) {
      logger.error('Failed to fetch notifications', { error, userId });
      throw new AppError('Failed to fetch notifications', 500);
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    try {
      // First verify the notification belongs to the user
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        throw new AppError('Notification not found', 404);
      }

      if (notification.isRead) {
        return notification; // Already read
      }

      const updatedNotification = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      logger.info('Notification marked as read', { notificationId, userId });

      return updatedNotification;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Failed to mark notification as read', {
        error,
        notificationId,
        userId,
      });
      throw new AppError('Failed to update notification', 500);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      logger.info('All notifications marked as read', {
        userId,
        count: result.count,
      });

      return result;
    } catch (error) {
      logger.error('Failed to mark all notifications as read', {
        error,
        userId,
      });
      throw new AppError('Failed to update notifications', 500);
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    try {
      // First verify the notification belongs to the user
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        throw new AppError('Notification not found', 404);
      }

      await prisma.notification.delete({
        where: { id: notificationId },
      });

      logger.info('Notification deleted', { notificationId, userId });

      return { success: true };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Failed to delete notification', {
        error,
        notificationId,
        userId,
      });
      throw new AppError('Failed to delete notification', 500);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return { count };
    } catch (error) {
      logger.error('Failed to get unread count', { error, userId });
      throw new AppError('Failed to get unread count', 500);
    }
  }

  /**
   * Delete old read notifications (cleanup helper)
   */
  async deleteOldReadNotifications(daysOld: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await prisma.notification.deleteMany({
        where: {
          isRead: true,
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      logger.info('Old notifications cleaned up', { count: result.count });

      return result;
    } catch (error) {
      logger.error('Failed to delete old notifications', { error });
      throw new AppError('Failed to delete old notifications', 500);
    }
  }
}
