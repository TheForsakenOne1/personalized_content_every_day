import { Router } from 'express';
import { ContentController } from '../controllers/content.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import { schemas } from '../validation/schemas';

const router = Router();
const contentController = new ContentController();

// Public routes
/**
 * @swagger
 * /api/content:
 *   get:
 *     summary: Get content list
 *     description: Retrieve a paginated list of content items, optionally filtered by category
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - {}
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by specific category
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, title, popularity]
 *           default: date
 *         description: Sort order for content
 *     responses:
 *       200:
 *         description: Content list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Content'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', optionalAuth, validateQuery(schemas.getContent), contentController.getContent.bind(contentController));

/**
 * @swagger
 * /api/content/search:
 *   get:
 *     summary: Search content
 *     description: Search for content by keywords in title, description, or tags
 *     tags: [Content]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *         example: technology trends
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter search results by category
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Content'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', validateQuery(schemas.searchContent), contentController.searchContent.bind(contentController));

/**
 * @swagger
 * /api/content/trending:
 *   get:
 *     summary: Get trending content
 *     description: Retrieve currently trending content based on views, saves, and recency
 *     tags: [Content]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of trending items to return
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter trending content by category
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: week
 *         description: Timeframe for trending calculation
 *     responses:
 *       200:
 *         description: Trending content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Content'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/trending', validateQuery(schemas.trendingContent), contentController.getTrendingContent.bind(contentController));

/**
 * @swagger
 * /api/content/freshness:
 *   get:
 *     summary: Check content freshness
 *     description: Check if content needs to be refreshed based on staleness threshold
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: categories
 *         schema:
 *           type: string
 *         description: Comma-separated list of categories to check
 *     responses:
 *       200:
 *         description: Freshness status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isStale:
 *                   type: boolean
 *                   example: false
 *                 lastUpdated:
 *                   type: string
 *                   format: date-time
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       isStale:
 *                         type: boolean
 *                       lastUpdated:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/freshness', authenticate, validateQuery(schemas.contentFreshness), contentController.checkContentFreshness.bind(contentController));

/**
 * @swagger
 * /api/content/refresh:
 *   post:
 *     summary: Refresh content
 *     description: Trigger on-demand content aggregation for specified categories
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Categories to refresh (optional, refreshes user preferences if not provided)
 *                 example: [technology, science]
 *               force:
 *                 type: boolean
 *                 default: false
 *                 description: Force refresh even if content is fresh
 *     responses:
 *       200:
 *         description: Content refresh initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Content refresh initiated
 *                 jobId:
 *                   type: string
 *                   description: ID for tracking the refresh job
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh', authenticate, validateBody(schemas.refreshContent), contentController.refreshContent.bind(contentController));

/**
 * @swagger
 * /api/content/{id}:
 *   get:
 *     summary: Get content by ID
 *     description: Retrieve a specific content item by its ID
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *       - {}
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   $ref: '#/components/schemas/Content'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Content not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', optionalAuth, validateParams(schemas.contentId), contentController.getContentById.bind(contentController));

// Admin routes (TODO: Add admin middleware)
/**
 * @swagger
 * /api/content:
 *   post:
 *     summary: Create content (Admin)
 *     description: Create a new content item (requires authentication, admin role recommended)
 *     tags: [Content, Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - url
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: Understanding Machine Learning
 *               description:
 *                 type: string
 *                 example: A comprehensive guide to machine learning fundamentals
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/ml-guide
 *               category:
 *                 type: string
 *                 example: technology
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [machine-learning, ai, tutorial]
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/image.jpg
 *               author:
 *                 type: string
 *                 example: John Doe
 *               source:
 *                 type: string
 *                 example: Tech Blog
 *     responses:
 *       201:
 *         description: Content created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   $ref: '#/components/schemas/Content'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticate, validateBody(schemas.createContent), contentController.createContent.bind(contentController));

/**
 * @swagger
 * /api/content/{id}:
 *   patch:
 *     summary: Update content (Admin)
 *     description: Update an existing content item (requires authentication, admin role recommended)
 *     tags: [Content, Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               url:
 *                 type: string
 *                 format: uri
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               author:
 *                 type: string
 *               source:
 *                 type: string
 *     responses:
 *       200:
 *         description: Content updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   $ref: '#/components/schemas/Content'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Content not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id', authenticate, validateParams(schemas.contentId), validateBody(schemas.updateContent), contentController.updateContent.bind(contentController));

/**
 * @swagger
 * /api/content/{id}:
 *   delete:
 *     summary: Delete content (Admin)
 *     description: Delete a content item (requires authentication, admin role recommended)
 *     tags: [Content, Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Content deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Content deleted successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Content not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticate, validateParams(schemas.contentId), contentController.deleteContent.bind(contentController));

/**
 * @swagger
 * /api/content/{id}/tags:
 *   post:
 *     summary: Add tags to content (Admin)
 *     description: Add one or more tags to a content item (requires authentication, admin role recommended)
 *     tags: [Content, Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tags
 *             properties:
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 example: [trending, featured]
 *     responses:
 *       200:
 *         description: Tags added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   $ref: '#/components/schemas/Content'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Content not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/tags', authenticate, validateParams(schemas.contentId), validateBody(schemas.addTags), contentController.addTags.bind(contentController));

/**
 * @swagger
 * /api/content/{id}/tags:
 *   delete:
 *     summary: Remove tags from content (Admin)
 *     description: Remove one or more tags from a content item (requires authentication, admin role recommended)
 *     tags: [Content, Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tags
 *             properties:
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 example: [outdated]
 *     responses:
 *       200:
 *         description: Tags removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   $ref: '#/components/schemas/Content'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Content not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id/tags', authenticate, validateParams(schemas.contentId), validateBody(schemas.addTags), contentController.removeTags.bind(contentController));

export default router;
