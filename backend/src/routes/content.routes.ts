import { Router } from 'express';
import { ContentController } from '../controllers/content.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = Router();
const contentController = new ContentController();

// Public routes
router.get('/', optionalAuth, validateQuery(schemas.getContent), contentController.getContent.bind(contentController));
router.get('/search', validateQuery(schemas.searchContent), contentController.searchContent.bind(contentController));
router.get('/trending', validateQuery(schemas.trendingContent), contentController.getTrendingContent.bind(contentController));
router.get('/freshness', authenticate, validateQuery(schemas.contentFreshness), contentController.checkContentFreshness.bind(contentController));
router.post('/refresh', authenticate, validateBody(schemas.refreshContent), contentController.refreshContent.bind(contentController));
router.get('/:id', optionalAuth, validateParams(schemas.contentId), contentController.getContentById.bind(contentController));

// Admin routes (TODO: Add admin middleware)
router.post('/', authenticate, validateBody(schemas.createContent), contentController.createContent.bind(contentController));
router.patch('/:id', authenticate, validateParams(schemas.contentId), validateBody(schemas.updateContent), contentController.updateContent.bind(contentController));
router.delete('/:id', authenticate, validateParams(schemas.contentId), contentController.deleteContent.bind(contentController));
router.post('/:id/tags', authenticate, validateParams(schemas.contentId), validateBody(schemas.addTags), contentController.addTags.bind(contentController));
router.delete('/:id/tags', authenticate, validateParams(schemas.contentId), validateBody(schemas.addTags), contentController.removeTags.bind(contentController));

export default router;
