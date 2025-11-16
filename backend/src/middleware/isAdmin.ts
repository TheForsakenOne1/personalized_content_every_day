import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

/**
 * Admin Middleware
 * Verifies that the authenticated user has admin privileges
 */
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // TODO: Uncomment when Prisma is generated and User model has isAdmin field
    /*
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });

    if (!user || !user.isAdmin) {
      return res.status(403).json({
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
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
