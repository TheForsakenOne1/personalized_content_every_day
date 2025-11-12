import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();
const categoryController = new CategoryController();

// Public routes
router.get('/', categoryController.getAllCategories.bind(categoryController));
router.get('/:id', categoryController.getCategoryById.bind(categoryController));
router.get('/slug/:slug', categoryController.getCategoryBySlug.bind(categoryController));

// User category management (authenticated)
router.get('/user/subscriptions', authenticate, categoryController.getUserCategories.bind(categoryController));
router.post('/user/subscribe', authenticate, categoryController.subscribeToCategory.bind(categoryController));
router.patch('/user/:id/priority', authenticate, categoryController.updateCategoryPriority.bind(categoryController));
router.patch('/user/:id/toggle', authenticate, categoryController.toggleCategoryStatus.bind(categoryController));
router.delete('/user/:id', authenticate, categoryController.unsubscribeFromCategory.bind(categoryController));

export default router;
