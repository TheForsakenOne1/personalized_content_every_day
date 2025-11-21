import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = Router();
const categoryController = new CategoryController();

// Public routes
router.get('/', categoryController.getAllCategories.bind(categoryController));
router.get('/:id', validateParams(schemas.categoryId), categoryController.getCategoryById.bind(categoryController));
router.get('/slug/:slug', validateParams(schemas.categorySlug), categoryController.getCategoryBySlug.bind(categoryController));

// User category management (authenticated)
router.get('/user/subscriptions', authenticate, categoryController.getUserCategories.bind(categoryController));
router.post('/user/subscribe', authenticate, validateBody(schemas.subscribe), categoryController.subscribeToCategory.bind(categoryController));
router.patch('/user/:id/priority', authenticate, validateParams(schemas.userCategoryId), validateBody(schemas.updateCategoryPriority), categoryController.updateCategoryPriority.bind(categoryController));
router.patch('/user/:id/toggle', authenticate, validateParams(schemas.userCategoryId), categoryController.toggleCategoryStatus.bind(categoryController));
router.delete('/user/:id', authenticate, validateParams(schemas.userCategoryId), categoryController.unsubscribeFromCategory.bind(categoryController));

export default router;
