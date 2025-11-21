import { Router } from 'express';
import { ContentController } from '../controllers/content.controller';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();
const contentController = new ContentController();

// Public routes
router.get('/', optionalAuth, contentController.getContent.bind(contentController));
router.get('/search', contentController.searchContent.bind(contentController));
router.get('/trending', contentController.getTrendingContent.bind(contentController));
router.get('/freshness', authenticate, contentController.checkContentFreshness.bind(contentController));
router.post('/refresh', authenticate, contentController.refreshContent.bind(contentController));
router.get('/:id', optionalAuth, contentController.getContentById.bind(contentController));

// Admin routes (TODO: Add admin middleware)
router.post('/', authenticate, contentController.createContent.bind(contentController));
router.patch('/:id', authenticate, contentController.updateContent.bind(contentController));
router.delete('/:id', authenticate, contentController.deleteContent.bind(contentController));
router.post('/:id/tags', authenticate, contentController.addTags.bind(contentController));
router.delete('/:id/tags', authenticate, contentController.removeTags.bind(contentController));

export default router;
