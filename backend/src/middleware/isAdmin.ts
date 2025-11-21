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

    // Check if user has admin role in database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isAdmin: true,
        email: true,
        username: true,
      },
    });

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isAdmin) {
      logger.warn('Unauthorized admin access attempt', {
        userId,
        email: user.email,
        username: user.username,
        path: req.path,
        method: req.method,
      });

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
