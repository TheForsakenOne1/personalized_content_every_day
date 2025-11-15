import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

// Profile routes
router.get('/me', authenticate, userController.getProfile.bind(userController));
router.patch('/me', authenticate, userController.updateProfile.bind(userController));

// Preferences routes
router.get('/preferences', authenticate, userController.getPreferences.bind(userController));
router.patch('/preferences', authenticate, userController.updatePreferences.bind(userController));

// Categories routes
router.get('/categories', authenticate, userController.getCategories.bind(userController));
router.put('/categories', authenticate, userController.updateCategories.bind(userController));

// Content interaction routes
router.post('/content/:contentId/save', authenticate, userController.saveContent.bind(userController));
router.delete('/content/:contentId/save', authenticate, userController.unsaveContent.bind(userController));
router.post('/content/:contentId/read', authenticate, userController.markAsRead.bind(userController));

// Feed routes
router.get('/feed', authenticate, userController.getFeed.bind(userController));
router.get('/saved', authenticate, userController.getSavedContent.bind(userController));

// Stats routes
router.get('/stats', authenticate, userController.getStats.bind(userController));

export default router;
