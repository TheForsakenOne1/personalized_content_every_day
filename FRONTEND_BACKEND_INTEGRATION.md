# Frontend-Backend Integration Guide

## Overview

This document describes the production-level integration between the EduHub frontend (Next.js) and backend (Express.js). The integration includes proper authentication, error handling, caching, retries, and type safety.

## Architecture

### Backend Stack
- **Framework**: Express.js with TypeScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **Database Adapter**: Custom better-sqlite3 adapter (Prisma-compatible API)
- **Authentication**: JWT with refresh tokens
- **Security**: Helmet, CORS, rate limiting

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **State Management**: Zustand
- **HTTP Client**: Custom ApiClient with retry logic
- **Form Validation**: React Hook Form + Zod
- **Notifications**: Sonner

## API Client Features

### Production-Level ApiClient (`frontend/src/lib/api-client.ts`)

#### Features
1. **Automatic Token Refresh**
   - Detects 401 errors
   - Automatically refreshes access token
   - Retries failed requests with new token
   - Redirects to login on refresh failure

2. **Request Retry Logic**
   - Configurable retry count (default: 3)
   - Exponential backoff
   - Skips retry for 4xx client errors (except 429)

3. **Request Caching**
   - In-memory cache for GET requests
   - Configurable cache time
   - Cache invalidation support
   - Request deduplication

4. **Error Handling**
   - Automatic error toasts
   - Network error detection
   - HTTP status code handling
   - User-friendly error messages

5. **Type Safety**
   - Full TypeScript support
   - Generic request methods
   - Type-safe responses

#### Usage Example

```typescript
import { apiClient } from '@/lib/api-client';

// GET request with caching
const data = await apiClient.get('/api/users/me', {
  cache: true,
  cacheTime: 60000 // 1 minute
});

// POST request with retry
const result = await apiClient.post('/api/users/preferences', {
  theme: 'dark'
}, {
  retry: 3,
  retryDelay: 1000
});

// Clear cache
apiClient.clearCache('/api/users');
```

## API Services

All API interactions are organized into service modules for better code organization and reusability.

### Auth Service (`frontend/src/services/api/auth.service.ts`)

```typescript
import { authService } from '@/services/api';

// Register
const { user, accessToken } = await authService.register({
  email: 'user@example.com',
  username: 'johndoe',
  password: 'SecurePass123!',
  fullName: 'John Doe'
});

// Login
const { user, accessToken } = await authService.login({
  email: 'user@example.com',
  password: 'SecurePass123!'
});

// Get current user
const user = await authService.getCurrentUser();

// Logout
await authService.logout();
```

### Content Service (`frontend/src/services/api/content.service.ts`)

```typescript
import { contentService } from '@/services/api';

// Get content with filters
const { data, pagination } = await contentService.getContent({
  categoryId: 'some-category-id',
  contentType: 'video',
  page: 1,
  limit: 20,
  sortBy: 'publishedAt',
  sortOrder: 'desc'
});

// Get content by ID
const content = await contentService.getContentById('content-id');

// Search content
const results = await contentService.searchContent('machine learning', 10);

// Get trending content
const trending = await contentService.getTrendingContent(7, 10);
```

### User Service (`frontend/src/services/api/user.service.ts`)

```typescript
import { userService } from '@/services/api';

// Get user profile
const profile = await userService.getProfile();

// Update profile
await userService.updateProfile({
  fullName: 'Jane Doe',
  avatarUrl: 'https://example.com/avatar.jpg'
});

// Get preferences
const preferences = await userService.getPreferences();

// Update preferences
await userService.updatePreferences({
  theme: 'dark',
  contentFrequency: 'daily',
  preferredContentTypes: ['video', 'article']
});

// Get user categories
const categories = await userService.getCategories();

// Update categories
await userService.updateCategories(
  ['cat-1', 'cat-2', 'cat-3'],
  [10, 8, 6] // priorities
);

// Save/unsave content
await userService.saveContent('content-id');
await userService.unsaveContent('content-id');

// Mark as read
await userService.markAsRead('content-id');

// Get user feed
const feed = await userService.getFeed('unread');

// Get saved content
const saved = await userService.getSavedContent();

// Get user stats
const stats = await userService.getStats();
```

### Category Service (`frontend/src/services/api/category.service.ts`)

```typescript
import { categoryService } from '@/services/api';

// Get all categories
const categories = await categoryService.getCategories();

// Get category by ID
const category = await categoryService.getCategoryById('cat-id');

// Get category by slug
const category = await categoryService.getCategoryBySlug('machine-learning');
```

## Environment Configuration

### Backend Environment Variables

#### Development (`.env`)
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=file:./dev.db
JWT_SECRET=dev-secret-key
CORS_ORIGIN=http://localhost:3000
```

#### Production (`.env.production`)
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/eduhub_prod
JWT_SECRET=<strong-secret-at-least-32-characters>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=https://yourdomain.com
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<sendgrid-api-key>
EMAIL_FROM=noreply@yourdomain.com
```

### Frontend Environment Variables

#### Development (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_ENABLE_DEV_MODE=true
```

#### Production (`.env.production`)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
```

## Database Setup

### Initialize Database

```bash
# Navigate to backend
cd backend

# Initialize SQLite database
node init-db.js

# Verify database
node -e "const Database = require('better-sqlite3'); const db = new Database('dev.db'); console.log('Categories:', db.prepare('SELECT COUNT(*) as count FROM categories').get()); db.close();"
```

### Database Adapter

The custom database adapter (`backend/src/lib/db.ts` and `backend/src/lib/db-extended.ts`) provides a Prisma-compatible API using better-sqlite3.

**Supported Operations**:
- All CRUD operations
- Relations (include, select)
- Filtering (where, orderBy)
- Pagination (take, skip)
- Transactions
- Upsert operations
- Count operations
- Raw SQL queries

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/send-verification` - Send verification email
- `POST /api/auth/verify-email` - Verify email

### Users
- `GET /api/users/me` - Get user profile
- `PATCH /api/users/me` - Update user profile
- `GET /api/users/preferences` - Get user preferences
- `PATCH /api/users/preferences` - Update user preferences
- `GET /api/users/categories` - Get user categories
- `PUT /api/users/categories` - Update user categories
- `POST /api/users/content/:id/save` - Save content
- `DELETE /api/users/content/:id/save` - Unsave content
- `POST /api/users/content/:id/read` - Mark content as read
- `GET /api/users/feed` - Get user feed
- `GET /api/users/saved` - Get saved content
- `GET /api/users/stats` - Get user stats

### Content
- `GET /api/content` - Get content list (with filters)
- `GET /api/content/:id` - Get content by ID
- `GET /api/content/search` - Search content
- `GET /api/content/trending` - Get trending content

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm install
node init-db.js  # First time only
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Production Mode

**Backend:**
```bash
cd backend
npm install
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
npm start
```

## Security Considerations

### Authentication
- JWT tokens stored in localStorage
- Refresh tokens in HTTP-only cookies
- Automatic token rotation
- Secure password hashing with bcrypt

### CORS
- Configured for specific origin
- Credentials enabled for cookies
- Preflight requests handled

### Rate Limiting
- 100 requests per 15 minutes (development)
- 50 requests per 15 minutes (production)
- Per-IP tracking

### Input Validation
- Zod schemas on frontend
- Express-validator on backend
- SQL injection prevention via prepared statements

## Error Handling

### Frontend Error Handling

```typescript
import { apiClient } from '@/lib/api-client';

try {
  const data = await apiClient.get('/api/users/me');
} catch (error) {
  // Automatic error toasts
  // apiClient.handleError(error); // Optional manual handling
  console.error('Failed to fetch user:', error);
}
```

### Backend Error Handling

All errors are caught by the global error handler:
- Validation errors: 400 Bad Request
- Authentication errors: 401 Unauthorized
- Authorization errors: 403 Forbidden
- Not found errors: 404 Not Found
- Server errors: 500 Internal Server Error

## Testing

### Backend Health Check
```bash
curl http://localhost:4000/health
```

### Frontend Test
```bash
# Open browser
open http://localhost:3000

# Try authentication flow
# 1. Register new account
# 2. Login
# 3. Complete onboarding
# 4. Navigate dashboard
```

## Performance Optimization

### Frontend
- Request caching (GET requests)
- Request deduplication
- Lazy loading components
- Image optimization
- Code splitting

### Backend
- Database indexes
- Query optimization
- Response compression
- Connection pooling (production)
- Redis caching (optional)

## Monitoring

### Recommended Tools
- **Error Tracking**: Sentry
- **Performance**: New Relic, DataDog
- **Logs**: Winston + CloudWatch/Logtail
- **Uptime**: UptimeRobot, Pingdom

## Deployment

### Backend Deployment (Example: Railway/Render)
1. Connect GitHub repository
2. Set environment variables
3. Build command: `cd backend && npm install && npm run build`
4. Start command: `cd backend && npm start`

### Frontend Deployment (Vercel)
1. Connect GitHub repository
2. Framework preset: Next.js
3. Build command: `cd frontend && npm run build`
4. Output directory: `.next`
5. Environment variables: Set all `NEXT_PUBLIC_*` vars

## Troubleshooting

### Common Issues

**1. CORS Errors**
- Check `CORS_ORIGIN` in backend `.env`
- Ensure frontend URL matches exactly
- Restart backend after changing

**2. Authentication Fails**
- Check JWT_SECRET is set
- Verify token in localStorage
- Check cookie settings

**3. Database Errors**
- Run `node init-db.js` to reset
- Check file permissions on `dev.db`
- Verify schema is up to date

**4. API Not Found (404)**
- Verify API_URL in frontend `.env.local`
- Check backend is running on correct port
- Verify endpoint exists in backend routes

## Production Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Update CORS_ORIGIN to production domain
- [ ] Configure production database (PostgreSQL)
- [ ] Set up Redis for caching
- [ ] Configure SMTP for emails
- [ ] Enable HTTPS
- [ ] Set up error tracking (Sentry)
- [ ] Configure monitoring and alerts
- [ ] Set up automated backups
- [ ] Review and test rate limiting
- [ ] Enable compression
- [ ] Set up CDN for static assets
- [ ] Configure logging
- [ ] Run security audit
- [ ] Load testing
- [ ] Create runbooks for common issues

## Support

For issues or questions:
1. Check this documentation
2. Review error logs
3. Check GitHub issues
4. Contact development team

---

**Last Updated**: November 2025
**Version**: 1.0.0
