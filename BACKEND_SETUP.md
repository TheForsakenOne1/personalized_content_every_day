# Backend Setup Guide

Complete guide for running the EduHub personalized content platform backend.

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# The database uses SQLite with a custom adapter (network restrictions prevent Prisma Client download)
# Database file will be created at: backend/dev.db

# Start the development server
npm run dev
```

The backend will start on `http://localhost:4000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### User Profile

- `GET /api/users/me` - Get user profile
- `PATCH /api/users/me` - Update user profile

### User Preferences

- `GET /api/users/preferences` - Get user preferences
- `PATCH /api/users/preferences` - Update preferences

### User Categories

- `GET /api/users/categories` - Get user's selected categories
- `PUT /api/users/categories` - Update user categories

### Content Interactions

- `POST /api/users/content/:contentId/save` - Save/bookmark content
- `DELETE /api/users/content/:contentId/save` - Unsave content
- `POST /api/users/content/:contentId/read` - Mark content as read

### User Feed

- `GET /api/users/feed?filter=all|unread|saved` - Get personalized feed
- `GET /api/users/saved` - Get all saved content
- `GET /api/users/stats` - Get user stats (read count, saved count, etc.)

### Content

- `GET /api/content` - Get all content (with filters)
- `GET /api/content/:id` - Get content by ID
- `GET /api/content/search?q=query` - Search content
- `GET /api/content/trending` - Get trending content

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID

## Database Schema

The application uses SQLite for development with the following key tables:

- **users** - User accounts and authentication
- **user_preferences** - User settings and preferences
- **categories** - Content categories (Astronomy, Geopolitics, History, etc.)
- **user_categories** - User's selected categories with priorities
- **content** - Main content repository (videos, articles, papers)
- **tags** - Content tags
- **user_content_interaction** - Reading history, bookmarks, progress
- **refresh_tokens** - JWT refresh token management

## Frontend API Client

The frontend includes a complete API client at `frontend/src/lib/api.ts` with:

- Automatic token refresh on 401 errors
- TypeScript type safety
- All API endpoints
- Error handling

### Usage Example

```typescript
import api from '@/lib/api';

// Login
const response = await api.login('user@example.com', 'password');
localStorage.setItem('accessToken', response.data.accessToken);

// Get user feed
const feed = await api.getUserFeed('all');

// Save content
await api.saveContent(contentId);

// Mark as read
await api.markAsRead(contentId);
```

## Authentication Flow

1. User registers or logs in via `/api/auth/register` or `/api/auth/login`
2. Server returns:
   - `accessToken` (15 min expiry) - stored in localStorage
   - `refreshToken` (7 days expiry) - stored in httpOnly cookie
3. All protected endpoints require `Authorization: Bearer <accessToken>` header
4. When access token expires, client automatically calls `/api/auth/refresh` to get new token
5. Frontend auth bypass: Press `Shift+A` on login screen for instant dev mode access

## Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=file:./dev.db
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Development Features

### Authentication Bypass

Press `Shift+A` on the login page to bypass authentication in development mode. This creates a temporary dev user session.

### Onboarding Flow

New users go through a 4-step onboarding:
1. Welcome screen
2. Topic selection (choose categories)
3. Content preview
4. Tutorial/walkthrough

### Theme

The entire site uses a pinkish color theme:
- Light mode: Soft pink backgrounds (#FEF5F8)
- Dark mode: Deep burgundy/pink (#1A0D12)
- Maintains excellent accessibility contrast

## API Client Methods

### Auth

- `api.register(data)` - Register new user
- `api.login(email, password)` - Login
- `api.logout()` - Logout
- `api.getMe()` - Get current user

### User

- `api.getUserProfile()` - Get profile
- `api.updateUserProfile(data)` - Update profile
- `api.getUserPreferences()` - Get preferences
- `api.updateUserPreferences(data)` - Update preferences
- `api.getUserCategories()` - Get categories
- `api.updateUserCategories(categoryIds, priorities)` - Update categories

### Content

- `api.saveContent(contentId)` - Save/bookmark
- `api.unsaveContent(contentId)` - Remove bookmark
- `api.markAsRead(contentId)` - Mark as read
- `api.getUserFeed(filter)` - Get feed (all/unread/saved)
- `api.getSavedContent()` - Get saved items
- `api.getUserStats()` - Get stats
- `api.getContent(filters)` - Get content list
- `api.searchContent(query)` - Search
- `api.getTrendingContent()` - Get trending

### Categories

- `api.getCategories()` - Get all categories
- `api.getCategoryById(id)` - Get specific category

## Testing the Backend

### 1. Register a new user

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "fullName": "Test User"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Get user feed (with auth token)

```bash
curl http://localhost:4000/api/users/feed \
  -H "Authorization: Bearer <your-access-token>"
```

## Troubleshooting

### "Prisma Client could not be generated"

The app uses a custom SQLite adapter in `backend/src/lib/db.ts` to work around network restrictions. No action needed - this is expected.

### "Database file not found"

The database file (`dev.db`) is created automatically when you first run the backend. Make sure you're in the `/backend` directory.

### "CORS error"

Make sure:
1. Backend is running on port 4000
2. Frontend is running on port 3000
3. `CORS_ORIGIN=http://localhost:3000` is set in backend/.env

### "401 Unauthorized"

Your access token may have expired. The frontend automatically refreshes tokens, but if you're using curl/Postman, get a new token by logging in again.

## Production Deployment

For production:

1. Update environment variables:
   ```env
   NODE_ENV=production
   JWT_SECRET=<strong-random-secret>
   CORS_ORIGIN=https://yourdomain.com
   ```

2. Build frontend:
   ```bash
   cd frontend && npm run build
   ```

3. Build backend:
   ```bash
   cd backend && npm run build
   ```

4. Start production server:
   ```bash
   cd backend && npm start
   ```

5. Consider using PostgreSQL instead of SQLite for production (update DATABASE_URL)

## Database Notes

The backend currently uses SQLite with a custom database adapter due to network restrictions preventing Prisma Client download. The adapter is located in `backend/src/lib/db.ts` and provides Prisma-like query methods.

For production, you can:
1. Use PostgreSQL and the full Prisma Client (recommended)
2. Continue using the SQLite adapter (works fine for small-medium loads)

## Support

For issues or questions:
- Check this README
- Review the code comments in `backend/src/services/` and `frontend/src/lib/api.ts`
- Examine API responses in browser DevTools Network tab
