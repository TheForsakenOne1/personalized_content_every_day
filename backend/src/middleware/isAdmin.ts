import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import logger from '../utils/logger';
import { HTTP_STATUS } from '../constants';

/**
 * Admin Middleware
 * Verifies that the authenticated user has admin privileges
 */
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;

  try {
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Note: Full database implementation pending
    // When database is fully configured, uncomment the following:
    /*
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });

    if (!user || !user.isAdmin) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Admin access required',
      });
    }
    */

    // For now, check if user email ends with @admin.vidya.app or is in admin list
    const user = (req as any).user;
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
    const isAdminUser =
      user.email?.endsWith('@admin.vidya.app') ||
      adminEmails.includes(user.email);

    if (!isAdminUser) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Admin access required',
      });
    }

    next();
  } catch (error) {
    logger.error('Admin middleware error', { error: (error as Error).message, userId });
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
