# Vidya API Documentation - Phase 3 Week 10

**Version**: 1.0
**Base URL**: `http://localhost:3001/api` (development)
**Production**: `https://api.vidya.app/api`

---

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

Tokens are obtained via the `/auth/login` or `/auth/register` endpoints.

**Token Expiry**:
- Access token: 15 minutes
- Refresh token: 7 days

---

## API Endpoints Summary

### Authentication (`/auth`)
- POST `/register` - Create new account
- POST `/login` - User login
- POST `/refresh` - Refresh access token
- POST `/logout` - Logout user
- GET `/me` - Get current user
- POST `/forgot-password` - Request password reset
- POST `/reset-password` - Reset password with token
- POST `/send-verification` - Resend verification email
- POST `/verify-email` - Verify email with token

### Users (`/users`)
- GET `/me` - Get user profile
- PATCH `/me` - Update user profile
- GET `/preferences` - Get user preferences
- PATCH `/preferences` - Update user preferences
- GET `/categories` - Get user categories
- PUT `/categories` - Update user categories
- POST `/content/:id/save` - Save content
- DELETE `/content/:id/save` - Unsave content
- POST `/content/:id/read` - Mark as read
- GET `/feed` - Get personalized feed
- GET `/saved` - Get saved content
- GET `/stats` - Get user statistics

### Categories (`/categories`)
- GET `/` - List all categories
- GET `/:id` - Get category by ID
- GET `/slug/:slug` - Get category by slug
- GET `/user/subscriptions` - Get user subscriptions
- POST `/user/subscribe` - Subscribe to category
- PATCH `/user/:id/priority` - Update category priority
- PATCH `/user/:id/toggle` - Toggle category
- DELETE `/user/:id` - Unsubscribe

### Content (`/content`)
- GET `/` - List content (with filters)
- GET `/search` - Search content
- GET `/trending` - Get trending content
- GET `/:id` - Get content by ID
- POST `/` - Create content (admin)
- PATCH `/:id` - Update content (admin)
- DELETE `/:id` - Delete content (admin)
- POST `/:id/tags` - Add tags (admin)
- DELETE `/:id/tags` - Remove tags (admin)

### Search (`/search`)
- POST `/` - Advanced search
- GET `/suggestions` - Autocomplete suggestions
- GET `/trending` - Trending searches
- GET `/facets` - Search facets
- GET `/history` - User search history
- GET `/history/recent` - Recent searches
- DELETE `/history` - Clear history
- DELETE `/history/:id` - Delete search
- GET `/analytics` - Search analytics

### Analytics (`/analytics`)
- GET `/reading-stats` - Reading statistics
- GET `/streak` - Reading streak
- GET `/topics` - Topic breakdown
- GET `/activity` - Activity timeline
- GET `/dashboard` - Dashboard analytics
- GET `/recommendations` - Recommendation metrics

### Admin (`/admin`)
- GET `/stats` - System statistics
- GET `/users` - List all users
- PATCH `/users/:id/status` - Toggle user status
- POST `/aggregate` - Trigger aggregation
- DELETE `/content/:id` - Delete content
- GET `/health` - System health

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

---

## Rate Limiting

**Global Rate Limit**: 100 requests per 15 minutes per IP

**Endpoint-Specific Limits**:
- Auth endpoints: 5 requests per 15 minutes
- Search: 30 requests per minute
- Other endpoints: No additional limits

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642348800
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

---

## Versioning

Current version: v1 (implicit)

Future versions will use URL path:
```
/api/v2/users/me
```

---

## OpenAPI/Swagger Specification

### Installation

```bash
npm install swagger-jsdoc swagger-ui-express
npm install --save-dev @types/swagger-jsdoc @types/swagger-ui-express
```

### Configuration

```typescript
// src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vidya API',
      version: '1.0.0',
      description: 'Personalized content platform API',
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server',
      },
      {
        url: 'https://api.vidya.app/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to API routes
};

export const swaggerSpec = swaggerJsdoc(options);
```

### Server Integration

```typescript
// src/server.ts
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// ... existing middleware

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ... rest of server setup
```

### Example Route Documentation

```typescript
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/me', auth, userController.getProfile);
```

Access documentation at: `http://localhost:3001/api-docs`

---

## Best Practices

### 1. Always Use HTTPS in Production

### 2. Validate Input
- Use validation middleware
- Sanitize user input
- Check data types and ranges

### 3. Handle Errors Gracefully
- Return meaningful error messages
- Log errors for debugging
- Don't expose sensitive information

### 4. Use Proper HTTP Methods
- GET: Retrieve data
- POST: Create new resource
- PATCH: Partial update
- PUT: Full replacement
- DELETE: Remove resource

### 5. Pagination for Large Datasets
```
GET /api/content?page=1&limit=20
```

### 6. Include Metadata in Responses
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

---

**Created By**: Claude Code Agent
**Date**: November 16, 2025
**Phase**: 3 Week 10 - API Improvements
