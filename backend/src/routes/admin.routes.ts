import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { auth } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = Router();

/**
 * Admin Routes
 * Base path: /api/admin
 * All routes require authentication + admin privileges
 */

// Apply auth middleware to all admin routes
router.use(auth);
router.use(isAdmin);

// GET /api/admin/stats - Get system statistics
router.get('/stats', adminController.getSystemStats.bind(adminController));

// GET /api/admin/users - Get all users (paginated)
router.get('/users', adminController.getUsers.bind(adminController));

// PATCH /api/admin/users/:userId/status - Toggle user active status
router.patch('/users/:userId/status', adminController.toggleUserStatus.bind(adminController));

// POST /api/admin/aggregate - Manually trigger content aggregation
router.post('/aggregate', adminController.triggerAggregation.bind(adminController));

// DELETE /api/admin/content/:contentId - Delete content (moderation)
router.delete('/content/:contentId', adminController.deleteContent.bind(adminController));

// GET /api/admin/health - System health check
router.get('/health', adminController.getSystemHealth.bind(adminController));

export default router;
