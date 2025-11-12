# Complete RESTful API Specification

## Base URL

```
Development: http://localhost:4000/api
Production: https://api.yourdomain.com/api
```

## Authentication

### Authentication Header
Most endpoints require JWT authentication:
```
Authorization: Bearer <access_token>
```

### Token Lifecycle
- **Access Token**: 15 minutes expiry
- **Refresh Token**: 7 days expiry (httpOnly cookie)

---

## 🔐 Authentication Endpoints

### 1. Register User

**Endpoint**: `POST /auth/register`

**Authentication**: None

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "fullName": "John Doe"  // optional
}
```

**Validation Rules**:
- Email: Valid email format
- Username: 3-20 alphanumeric characters + underscore
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- Full name: Optional, max 255 chars

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "johndoe",
      "fullName": "John Doe",
      "avatarUrl": null,
      "emailVerified": false,
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    "message": "Registration successful. Please check your email for verification."
  }
}
```

**Error Responses**:
- 400: Validation error
- 409: Email or username already exists

**Implementation Status**: ✅ Implemented (Phase 1)

---

### 2. Login

**Endpoint**: `POST /auth/login`

**Authentication**: None

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "johndoe",
      "fullName": "John Doe",
      "avatarUrl": "https://cdn.example.com/avatars/johndoe.jpg",
      "emailVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Side Effects**:
- Sets `refreshToken` httpOnly cookie
- Updates `lastLoginAt` timestamp

**Error Responses**:
- 401: Invalid credentials
- 429: Too many login attempts

**Rate Limit**: 5 attempts per 15 minutes

**Implementation Status**: ✅ Implemented (Phase 1)

---

### 3. Refresh Access Token

**Endpoint**: `POST /auth/refresh`

**Authentication**: Refresh token (httpOnly cookie)

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- 401: Invalid or expired refresh token
- 401: Token revoked

**Implementation Status**: ✅ Implemented (Phase 1)

---

### 4. Logout

**Endpoint**: `POST /auth/logout`

**Authentication**: Required (Bearer token)

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Side Effects**:
- Revokes refresh token in database
- Clears `refreshToken` cookie

**Implementation Status**: ✅ Implemented (Phase 1)

---

### 5. Get Current User

**Endpoint**: `GET /auth/me`

**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "johndoe",
      "fullName": "John Doe",
      "avatarUrl": "https://cdn.example.com/avatars/johndoe.jpg",
      "emailVerified": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "lastLoginAt": "2024-01-16T08:30:00.000Z"
    }
  }
}
```

**Implementation Status**: ✅ Implemented (Phase 1)

---

### 6. Verify Email

**Endpoint**: `POST /auth/verify-email`

**Authentication**: None

**Request Body**:
```json
{
  "token": "verification-token-from-email"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Email verified successfully"
  }
}
```

**Error Responses**:
- 400: Invalid or expired token
- 409: Email already verified

**Implementation Status**: ❌ TODO (Phase 3)

---

### 7. Request Password Reset

**Endpoint**: `POST /auth/forgot-password`

**Authentication**: None

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "If the email exists, a password reset link has been sent."
  }
}
```

**Security Notes**:
- Always returns success (prevents email enumeration)
- Reset token expires in 1 hour
- Token can only be used once

**Rate Limit**: 3 attempts per hour per IP

**Implementation Status**: ❌ TODO (Phase 3)

---

### 8. Reset Password

**Endpoint**: `POST /auth/reset-password`

**Authentication**: None

**Request Body**:
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully. Please login with your new password."
  }
}
```

**Error Responses**:
- 400: Invalid or expired token
- 400: Password doesn't meet requirements

**Side Effects**:
- Invalidates all existing refresh tokens
- Sends confirmation email

**Implementation Status**: ❌ TODO (Phase 3)

---

### 9. Change Password

**Endpoint**: `POST /auth/change-password`

**Authentication**: Required

**Request Body**:
```json
{
  "currentPassword": "CurrentPass123!",
  "newPassword": "NewSecurePass123!"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

**Error Responses**:
- 401: Current password is incorrect
- 400: New password doesn't meet requirements

**Side Effects**:
- Invalidates all other refresh tokens (except current)

**Implementation Status**: ❌ TODO (Phase 3)

---

## 👤 User Profile Endpoints

### 10. Get User Profile

**Endpoint**: `GET /users/me`

**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "johndoe",
      "fullName": "John Doe",
      "avatarUrl": "https://cdn.example.com/avatars/johndoe.jpg",
      "emailVerified": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "lastLoginAt": "2024-01-16T08:30:00.000Z"
    }
  }
}
```

**Implementation Status**: ✅ Implemented (Phase 1)

---

### 11. Update User Profile

**Endpoint**: `PATCH /users/me`

**Authentication**: Required

**Request Body** (all fields optional):
```json
{
  "fullName": "John Smith",
  "avatarUrl": "https://cdn.example.com/avatars/new-avatar.jpg"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "johndoe",
      "fullName": "John Smith",
      "avatarUrl": "https://cdn.example.com/avatars/new-avatar.jpg",
      "emailVerified": true,
      "updatedAt": "2024-01-16T09:00:00.000Z"
    }
  }
}
```

**Validation**:
- Full name: Max 255 characters
- Avatar URL: Valid URL format

**Implementation Status**: ❌ TODO (Phase 3)

---

### 12. Upload Avatar

**Endpoint**: `POST /users/me/avatar`

**Authentication**: Required

**Request**:
- Content-Type: `multipart/form-data`
- Field name: `avatar`
- Max size: 5MB
- Allowed formats: JPG, PNG, GIF, WebP

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://cdn.example.com/avatars/550e8400.jpg"
  }
}
```

**Error Responses**:
- 400: Invalid file format
- 413: File too large

**Implementation Status**: ❌ TODO (Phase 4)

---

### 13. Delete Account

**Endpoint**: `DELETE /users/me`

**Authentication**: Required

**Request Body**:
```json
{
  "password": "CurrentPass123!",
  "confirm": "DELETE"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Account deleted successfully"
  }
}
```

**Side Effects**:
- Soft deletes user (sets `isActive = false`)
- Anonymizes personal data after 30 days
- Sends confirmation email

**Implementation Status**: ❌ TODO (Phase 4)

---

### 14. Get User Statistics

**Endpoint**: `GET /users/me/stats`

**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalRead": 1234,
      "totalSaved": 89,
      "totalTimeSpent": 45600,  // seconds
      "averageRating": 4.2,
      "readingStreak": 7,  // consecutive days
      "lastReadAt": "2024-01-16T08:00:00.000Z",
      "contentByType": {
        "video": 567,
        "article": 423,
        "paper": 189,
        "blog": 55
      },
      "topCategories": [
        {
          "categoryName": "Astronomy",
          "count": 345
        },
        {
          "categoryName": "Software",
          "count": 289
        }
      ]
    }
  }
}
```

**Implementation Status**: ❌ TODO (Phase 4)

---

## 🏷️ Category Endpoints

### 15. Get All Categories

**Endpoint**: `GET /categories`

**Authentication**: Optional

**Query Parameters**:
- `includeStats` (boolean): Include content count and subscriber count

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Astronomy",
        "slug": "astronomy",
        "description": "Space, planets, stars, and the universe",
        "icon": "telescope",
        "isDefault": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "contentCount": 1234,  // if includeStats=true
        "subscriberCount": 567  // if includeStats=true
      }
    ]
  }
}
```

**Implementation Status**: ✅ Implemented (Phase 2)

---

### 16. Get Category by ID

**Endpoint**: `GET /categories/:id`

**Authentication**: Optional

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "uuid",
      "name": "Astronomy",
      "slug": "astronomy",
      "description": "Space, planets, stars, and the universe",
      "icon": "telescope",
      "isDefault": true,
      "contentCount": 1234,
      "subscriberCount": 567
    }
  }
}
```

**Implementation Status**: ✅ Implemented (Phase 2)

---

### 17. Get User's Subscribed Categories

**Endpoint**: `GET /categories/user/subscriptions`

**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "user-category-uuid",
        "priority": 9,
        "isActive": true,
        "createdAt": "2024-01-15T10:00:00.000Z",
        "category": {
          "id": "category-uuid",
          "name": "Astronomy",
          "slug": "astronomy",
          "description": "Space, planets, stars, and the universe",
          "icon": "telescope"
        }
      }
    ]
  }
}
```

**Sort Order**: By priority (DESC), then category name (ASC)

**Implementation Status**: ✅ Implemented (Phase 2)

---

### 18. Subscribe to Category

**Endpoint**: `POST /categories/user/subscribe`

**Authentication**: Required

**Request Body**:
```json
{
  "categoryId": "uuid",
  "priority": 8  // 1-10, default: 5
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "userCategory": {
      "id": "uuid",
      "userId": "uuid",
      "categoryId": "uuid",
      "priority": 8,
      "isActive": true,
      "category": {
        "id": "uuid",
        "name": "Astronomy",
        "slug": "astronomy"
      }
    }
  }
}
```

**Error Responses**:
- 404: Category not found
- 409: Already subscribed (returns existing subscription)

**Implementation Status**: ✅ Implemented (Phase 2)

---

### 19. Update Category Priority

**Endpoint**: `PATCH /categories/user/:userCategoryId/priority`

**Authentication**: Required

**Request Body**:
```json
{
  "priority": 10
}
```

**Validation**: Priority must be 1-10

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "userCategory": {
      "id": "uuid",
      "priority": 10,
      "isActive": true,
      "category": { /* category details */ }
    }
  }
}
```

**Implementation Status**: ✅ Implemented (Phase 2)

---

### 20. Toggle Category Status

**Endpoint**: `PATCH /categories/user/:userCategoryId/toggle`

**Authentication**: Required

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "userCategory": {
      "id": "uuid",
      "isActive": false,  // toggled
      "priority": 8,
      "category": { /* category details */ }
    }
  }
}
```

**Use Case**: Temporarily disable category without unsubscribing

**Implementation Status**: ✅ Implemented (Phase 2)

---

### 21. Unsubscribe from Category

**Endpoint**: `DELETE /categories/user/:userCategoryId`

**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Unsubscribed successfully"
  }
}
```

**Implementation Status**: ✅ Implemented (Phase 2)

---

## 📚 Content Endpoints

### 22. List Content with Filters

**Endpoint**: `GET /content`

**Authentication**: Optional (shows user interactions if authenticated)

**Query Parameters**:
- `categoryId` (UUID): Filter by category
- `contentType` (string): `video` | `article` | `paper` | `blog`
- `source` (string): `youtube` | `arxiv` | `medium` | `rss` | `substack`
- `search` (string): Search in title, description, author
- `tags` (string): Comma-separated tag slugs (e.g., `beginner-friendly,tutorial`)
- `dateFrom` (ISO date): Published after this date
- `dateTo` (ISO date): Published before this date
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `sortBy` (string): `publishedAt` | `createdAt` | `qualityScore` | `popularityScore` | `title`
- `sortOrder` (string): `asc` | `desc` (default: `desc`)

**Example Request**:
```
GET /content?categoryId=uuid&contentType=video&tags=beginner-friendly&limit=10&sortBy=qualityScore&sortOrder=desc
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "externalId": "dQw4w9WgXcQ",
        "contentType": "video",
        "source": "youtube",
        "title": "Introduction to Quantum Physics",
        "description": "A comprehensive overview of quantum mechanics...",
        "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
        "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        "author": "Physics Explained",
        "publishedAt": "2024-01-15T10:00:00.000Z",
        "duration": 1200,  // seconds (20 minutes)
        "wordCount": null,
        "language": "en",
        "qualityScore": 0.85,
        "popularityScore": 50000,
        "metadata": {
          "video_id": "dQw4w9WgXcQ",
          "channel_id": "UCxxx",
          "view_count": 50000,
          "like_count": 4500
        },
        "category": {
          "id": "uuid",
          "name": "Science",
          "slug": "science"
        },
        "tags": [
          {
            "id": "uuid",
            "name": "Beginner Friendly",
            "slug": "beginner-friendly"
          },
          {
            "id": "uuid",
            "name": "Tutorial",
            "slug": "tutorial"
          }
        ],
        "createdAt": "2024-01-15T11:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1234,
      "totalPages": 62,
      "hasMore": true
    }
  }
}
```

**Implementation Status**: ✅ Implemented (Phase 2)

---

### 23. Get Content by ID

**Endpoint**: `GET /content/:id`

**Authentication**: Optional (shows user interaction if authenticated)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": {
      "id": "uuid",
      "externalId": "dQw4w9WgXcQ",
      "contentType": "video",
      "source": "youtube",
      "title": "Introduction to Quantum Physics",
      "description": "A comprehensive overview...",
      "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
      "thumbnailUrl": "https://i.ytimg.com/...",
      "author": "Physics Explained",
      "publishedAt": "2024-01-15T10:00:00.000Z",
      "duration": 1200,
      "qualityScore": 0.85,
      "popularityScore": 50000,
      "metadata": { /* source-specific data */ },
      "category": { /* category details */ },
      "tags": [ /* tag array */ ],
      "userInteraction": {  // Only if authenticated
        "id": "uuid",
        "status": "read",
        "readAt": "2024-01-16T08:00:00.000Z",
        "readProgress": 0.75,
        "timeSpent": 900,  // 15 minutes
        "rating": 5,
        "isSaved": true,
        "notes": "Great explanation of quantum tunneling"
      }
    }
  }
}
```

**Implementation Status**: ✅ Implemented (Phase 2)

---

### 24. Search Content

**Endpoint**: `GET /content/search`

**Authentication**: Optional

**Query Parameters**:
- `q` (string, required): Search query
- `limit` (number): Max results (default: 20)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "title": "Quantum Physics Explained",
        "description": "...",
        "relevanceScore": 0.92,  // search relevance
        /* ...other content fields */
      }
    ]
  }
}
```

**Search Behavior**:
- Searches across: title, description, author
- Case-insensitive
- Partial word matching
- Results sorted by relevance and quality score

**Implementation Status**: ✅ Implemented (Phase 2)

---

### 25. Get Trending Content

**Endpoint**: `GET /content/trending`

**Authentication**: Optional

**Query Parameters**:
- `days` (number): Look-back period (default: 7, max: 30)
- `limit` (number): Max results (default: 10, max: 50)
- `categoryId` (UUID): Filter by category (optional)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "title": "Breaking News in AI Research",
        "contentType": "article",
        "source": "arxiv",
        "categoryName": "Software",
        "url": "https://...",
        "thumbnailUrl": "https://...",
        "uniqueViews": 1234,
        "readCount": 890,
        "saveCount": 156,
        "avgRating": 4.5,
        "trendingScore": 5678,  // calculated score
        "publishedAt": "2024-01-14T10:00:00.000Z"
      }
    ]
  }
}
```

**Trending Score Formula**:
```
trendingScore = (uniqueViews × 2) + (readCount × 3) + (saveCount × 5)
```

**Implementation Status**: ✅ Implemented (Phase 2)

---

## 📖 Content Interaction Endpoints

### 26. Mark Content as Read

**Endpoint**: `POST /interactions/read`

**Authentication**: Required

**Request Body**:
```json
{
  "contentId": "uuid",
  "progress": 1.0,  // 0.0-1.0
  "timeSpent": 900,  // seconds
  "notes": "Excellent explanation of the topic"  // optional
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "interaction": {
      "id": "uuid",
      "userId": "uuid",
      "contentId": "uuid",
      "status": "read",
      "readAt": "2024-01-16T08:30:00.000Z",
      "readProgress": 1.0,
      "timeSpent": 900,
      "notes": "Excellent explanation of the topic",
      "updatedAt": "2024-01-16T08:30:00.000Z"
    }
  }
}
```

**Side Effects**:
- Creates or updates user_content_interaction record
- Logs activity in user_activity_log
- Updates user statistics
- May trigger recommendation recalculation

**Implementation Status**: ❌ TODO (Phase 4)

---

### 27. Update Reading Progress

**Endpoint**: `PATCH /interactions/:contentId/progress`

**Authentication**: Required

**Request Body**:
```json
{
  "progress": 0.45,  // 45% complete
  "timeSpent": 300   // additional 5 minutes
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "interaction": {
      "id": "uuid",
      "contentId": "uuid",
      "readProgress": 0.45,
      "timeSpent": 300,
      "status": "unread",  // still unread if progress < 1.0
      "updatedAt": "2024-01-16T08:35:00.000Z"
    }
  }
}
```

**Use Case**: Auto-save reading position for long articles/videos

**Implementation Status**: ❌ TODO (Phase 4)

---

### 28. Save/Bookmark Content

**Endpoint**: `POST /interactions/save`

**Authentication**: Required

**Request Body**:
```json
{
  "contentId": "uuid"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "interaction": {
      "id": "uuid",
      "contentId": "uuid",
      "isSaved": true,
      "savedAt": "2024-01-16T08:40:00.000Z"
    }
  }
}
```

**Implementation Status**: ❌ TODO (Phase 4)

---

### 29. Unsave/Remove Bookmark

**Endpoint**: `DELETE /interactions/save/:contentId`

**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Bookmark removed successfully"
  }
}
```

**Implementation Status**: ❌ TODO (Phase 4)

---

### 30. Rate Content

**Endpoint**: `POST /interactions/rate`

**Authentication**: Required

**Request Body**:
```json
{
  "contentId": "uuid",
  "rating": 5  // 1-5 stars
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "interaction": {
      "id": "uuid",
      "contentId": "uuid",
      "rating": 5,
      "ratedAt": "2024-01-16T08:45:00.000Z"
    }
  }
}
```

**Validation**: Rating must be integer 1-5

**Side Effects**:
- Updates content's average rating
- Influences future recommendations

**Implementation Status**: ❌ TODO (Phase 4)

---

### 31. Dismiss Content

**Endpoint**: `POST /interactions/dismiss`

**Authentication**: Required

**Request Body**:
```json
{
  "contentId": "uuid",
  "reason": "not_interested"  // optional: not_interested, already_read, too_advanced, etc.
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "interaction": {
      "id": "uuid",
      "contentId": "uuid",
      "status": "dismissed",
      "dismissedAt": "2024-01-16T08:50:00.000Z"
    }
  }
}
```

**Side Effects**:
- Removes from feed
- Signals recommendation engine to avoid similar content
- Logs reason for analysis

**Implementation Status**: ❌ TODO (Phase 4)

---

### 32. Get Saved Content (Library)

**Endpoint**: `GET /interactions/saved`

**Authentication**: Required

**Query Parameters**:
- `categoryId` (UUID): Filter by category
- `contentType` (string): Filter by type
- `page` (number): Page number
- `limit` (number): Items per page

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "title": "Quantum Physics Basics",
        /* ...content fields */,
        "savedAt": "2024-01-16T08:40:00.000Z",
        "interaction": {
          "status": "read",
          "rating": 5,
          "notes": "Must review this"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 89
    }
  }
}
```

**Sort Order**: Most recently saved first

**Implementation Status**: ❌ TODO (Phase 4)

---

### 33. Get Reading History

**Endpoint**: `GET /interactions/history`

**Authentication**: Required

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page (default: 20)
- `dateFrom` (ISO date): Filter by read date
- `dateTo` (ISO date): Filter by read date

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "interaction-uuid",
        "readAt": "2024-01-16T08:30:00.000Z",
        "timeSpent": 900,
        "readProgress": 1.0,
        "rating": 5,
        "content": {
          "id": "uuid",
          "title": "Quantum Mechanics 101",
          "contentType": "video",
          "thumbnailUrl": "https://...",
          "category": {
            "name": "Science"
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1234
    }
  }
}
```

**Sort Order**: Most recently read first

**Implementation Status**: ❌ TODO (Phase 4)

---

## 📊 Recommendation & Feed Endpoints

### 34. Get Daily Personalized Feed

**Endpoint**: `GET /feed/today`

**Authentication**: Required

**Query Parameters**:
- `limit` (number): Max items (default: 20)
- `includeRead` (boolean): Include already read items (default: false)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "feed": {
      "date": "2024-01-16",
      "items": [
        {
          "id": "feed-item-uuid",
          "position": 1,
          "recommendationScore": 95.5,
          "reason": "Top match for your Astronomy interest (priority 9)",
          "content": {
            "id": "uuid",
            "title": "Black Holes Explained",
            "contentType": "video",
            "source": "youtube",
            "url": "https://...",
            "thumbnailUrl": "https://...",
            "author": "Space Academy",
            "duration": 1800,
            "qualityScore": 0.92,
            "category": {
              "name": "Astronomy"
            },
            "tags": ["beginner-friendly", "documentary"]
          },
          "userInteraction": null  // or interaction object if exists
        }
      ],
      "stats": {
        "total": 20,
        "unread": 18,
        "read": 2,
        "saved": 1
      }
    }
  }
}
```

**Recommendation Score Components**:
- 30% - Category match (based on user priority)
- 25% - User history similarity
- 20% - Content quality score
- 15% - Recency bonus
- 10% - Popularity score

**Implementation Status**: ❌ TODO (Phase 3)

---

### 35. Get Feed by Date

**Endpoint**: `GET /feed/:date`

**Authentication**: Required

**Path Parameters**:
- `date` (string): Date in YYYY-MM-DD format

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "feed": {
      "date": "2024-01-15",
      "items": [ /* same as today's feed */ ],
      "stats": { /* feed statistics */ }
    }
  }
}
```

**Error Responses**:
- 400: Invalid date format
- 404: Feed not generated for this date

**Implementation Status**: ❌ TODO (Phase 3)

---

### 36. Refresh Feed

**Endpoint**: `POST /feed/refresh`

**Authentication**: Required

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Feed refresh started. Check back in a moment.",
    "estimatedTime": 30  // seconds
  }
}
```

**Process**:
- Triggers asynchronous feed regeneration
- Uses recommendation algorithm
- Replaces today's feed
- Notifies user when complete (optional webhook)

**Rate Limit**: 3 refreshes per day per user

**Implementation Status**: ❌ TODO (Phase 3)

---

### 37. Get Feed History

**Endpoint**: `GET /feed/history`

**Authentication**: Required

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page (default: 10 dates)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "feeds": [
      {
        "date": "2024-01-16",
        "totalItems": 20,
        "unreadCount": 18,
        "readCount": 2,
        "savedCount": 1,
        "generatedAt": "2024-01-16T05:00:00.000Z"
      },
      {
        "date": "2024-01-15",
        "totalItems": 20,
        "unreadCount": 5,
        "readCount": 15,
        "savedCount": 3,
        "generatedAt": "2024-01-15T05:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45
    }
  }
}
```

**Implementation Status**: ❌ TODO (Phase 3)

---

### 38. Get Personalized Recommendations

**Endpoint**: `GET /recommendations`

**Authentication**: Required

**Query Parameters**:
- `categoryId` (UUID): Get recommendations for specific category
- `contentType` (string): Filter by content type
- `limit` (number): Max items (default: 10)
- `excludeRead` (boolean): Exclude already read (default: true)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "contentId": "uuid",
        "score": 92.5,
        "reasons": [
          "Matches your high-priority Astronomy category",
          "Similar to highly-rated content you've enjoyed",
          "Recent publication (2 days old)"
        ],
        "content": {
          /* full content object */
        }
      }
    ]
  }
}
```

**Differs from Feed**:
- Real-time calculation (not pre-computed)
- Can filter by category/type
- Shows detailed scoring reasons
- Useful for "More like this" features

**Implementation Status**: ❌ TODO (Phase 3)

---

## 🎯 User Preferences Endpoints

### 39. Get User Preferences

**Endpoint**: `GET /preferences`

**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "preferences": {
      "id": "uuid",
      "userId": "uuid",
      "contentFrequency": "daily",  // daily, twice_daily, custom
      "preferredContentTypes": ["video", "article", "paper"],
      "notificationEnabled": true,
      "emailDigest": true,
      "theme": "dark",  // light, dark, auto
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-16T08:00:00.000Z"
    }
  }
}
```

**Implementation Status**: ❌ TODO (Phase 3)

---

### 40. Update User Preferences

**Endpoint**: `PATCH /preferences`

**Authentication**: Required

**Request Body** (all fields optional):
```json
{
  "contentFrequency": "twice_daily",
  "preferredContentTypes": ["video", "article"],
  "notificationEnabled": false,
  "emailDigest": true,
  "theme": "dark"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "preferences": {
      /* updated preferences object */
    }
  }
}
```

**Validation**:
- `contentFrequency`: must be `daily`, `twice_daily`, or `custom`
- `preferredContentTypes`: array of valid content types
- `theme`: must be `light`, `dark`, or `auto`

**Side Effects**:
- May trigger feed regeneration if content preferences changed
- Updates notification schedule

**Implementation Status**: ❌ TODO (Phase 3)

---

### 41. Get Notification Settings

**Endpoint**: `GET /preferences/notifications`

**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "notifications": {
      "pushEnabled": true,
      "emailEnabled": true,
      "digestFrequency": "daily",  // daily, weekly, never
      "digestTime": "08:00",  // HH:MM in user's timezone
      "categories": {
        "newContent": true,
        "recommendations": true,
        "trending": false,
        "achievements": true
      },
      "timezone": "America/New_York"
    }
  }
}
```

**Implementation Status**: ❌ TODO (Phase 4)

---

### 42. Update Notification Settings

**Endpoint**: `PATCH /preferences/notifications`

**Authentication**: Required

**Request Body** (all fields optional):
```json
{
  "pushEnabled": false,
  "emailEnabled": true,
  "digestFrequency": "weekly",
  "digestTime": "09:00",
  "categories": {
    "newContent": true,
    "recommendations": true,
    "trending": false
  },
  "timezone": "America/Los_Angeles"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "notifications": {
      /* updated notification settings */
    }
  }
}
```

**Implementation Status**: ❌ TODO (Phase 4)

---

## 📈 Analytics Endpoints

### 43. Get Reading Analytics

**Endpoint**: `GET /analytics/reading`

**Authentication**: Required

**Query Parameters**:
- `period` (string): `week` | `month` | `year` | `all` (default: month)
- `groupBy` (string): `day` | `week` | `month` (default: day)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "analytics": {
      "period": "month",
      "startDate": "2023-12-16",
      "endDate": "2024-01-16",
      "summary": {
        "totalRead": 156,
        "totalTimeSpent": 23400,  // seconds
        "averageTimePerItem": 150,  // seconds
        "averageRating": 4.3,
        "readingStreak": 7,  // consecutive days
        "longestStreak": 21
      },
      "byDay": [
        {
          "date": "2024-01-16",
          "itemsRead": 8,
          "timeSpent": 1200,
          "averageRating": 4.5
        }
      ],
      "byContentType": {
        "video": { "count": 67, "timeSpent": 12000 },
        "article": { "count": 56, "timeSpent": 8400 },
        "paper": { "count": 23, "timeSpent": 2400 },
        "blog": { "count": 10, "timeSpent": 600 }
      },
      "byCategory": [
        {
          "categoryName": "Astronomy",
          "count": 45,
          "timeSpent": 6750,
          "averageRating": 4.6
        }
      ],
      "topAuthors": [
        {
          "author": "Physics Explained",
          "count": 12,
          "averageRating": 4.8
        }
      ]
    }
  }
}
```

**Implementation Status**: ❌ TODO (Phase 4)

---

### 44. Get Category Analytics

**Endpoint**: `GET /analytics/categories`

**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "analytics": {
      "subscriptions": [
        {
          "category": {
            "id": "uuid",
            "name": "Astronomy",
            "priority": 9
          },
          "stats": {
            "contentRead": 45,
            "averageRating": 4.6,
            "timeSpent": 6750,
            "lastReadAt": "2024-01-16T08:30:00.000Z"
          }
        }
      ],
      "recommendations": {
        "mostEngaging": "Astronomy",
        "leastEngaging": "Mathematics",
        "suggestedCategories": [
          {
            "name": "Physics",
            "reason": "Similar to your Astronomy interest"
          }
        ]
      }
    }
  }
}
```

**Implementation Status**: ❌ TODO (Phase 4)

---

### 45. Get Engagement Heatmap

**Endpoint**: `GET /analytics/heatmap`

**Authentication**: Required

**Query Parameters**:
- `period` (string): `year` (default)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "heatmap": [
      {
        "date": "2024-01-16",
        "count": 8,
        "timeSpent": 1200,
        "intensity": 0.8  // 0-1 scale for visualization
      }
    ],
    "summary": {
      "totalDays": 365,
      "activeDays": 287,
      "longestStreak": 21,
      "currentStreak": 7
    }
  }
}
```

**Use Case**: GitHub-style contribution graph

**Implementation Status**: ❌ TODO (Phase 5)

---

## 🏆 Achievements & Gamification (Future)

### 46. Get Achievements

**Endpoint**: `GET /achievements`

**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "uuid",
        "name": "First Read",
        "description": "Read your first piece of content",
        "icon": "🎉",
        "unlockedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": "uuid",
        "name": "Week Warrior",
        "description": "Maintain a 7-day reading streak",
        "icon": "🔥",
        "progress": 7,
        "target": 7,
        "unlockedAt": "2024-01-16T08:00:00.000Z"
      }
    ],
    "locked": [
      {
        "id": "uuid",
        "name": "Century Reader",
        "description": "Read 100 pieces of content",
        "icon": "📚",
        "progress": 67,
        "target": 100
      }
    ]
  }
}
```

**Implementation Status**: ❌ Future (Phase 5)

---

## 🔔 Notification Endpoints

### 47. Get Notifications

**Endpoint**: `GET /notifications`

**Authentication**: Required

**Query Parameters**:
- `unreadOnly` (boolean): Show only unread (default: false)
- `page` (number): Page number
- `limit` (number): Items per page

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "new_content",
        "title": "New content in Astronomy",
        "message": "3 new videos added to your feed",
        "data": {
          "categoryId": "uuid",
          "count": 3
        },
        "read": false,
        "createdAt": "2024-01-16T09:00:00.000Z"
      }
    ],
    "unreadCount": 5,
    "pagination": { /* ... */ }
  }
}
```

**Implementation Status**: ❌ TODO (Phase 5)

---

### 48. Mark Notification as Read

**Endpoint**: `PATCH /notifications/:id/read`

**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "notification": {
      "id": "uuid",
      "read": true,
      "readAt": "2024-01-16T09:30:00.000Z"
    }
  }
}
```

**Implementation Status**: ❌ TODO (Phase 5)

---

### 49. Mark All Notifications as Read

**Endpoint**: `POST /notifications/read-all`

**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "All notifications marked as read",
    "count": 12
  }
}
```

**Implementation Status**: ❌ TODO (Phase 5)

---

## 📊 Admin Endpoints (Future)

### 50. Get Platform Statistics

**Endpoint**: `GET /admin/stats`

**Authentication**: Required (Admin role)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 10234,
      "active": 8567,
      "new": 156  // last 30 days
    },
    "content": {
      "total": 45678,
      "byType": {
        "video": 12345,
        "article": 23456,
        "paper": 7890,
        "blog": 1987
      }
    },
    "engagement": {
      "totalReads": 234567,
      "averageTimeSpent": 450,
      "averageRating": 4.2
    }
  }
}
```

**Implementation Status**: ❌ Future (Phase 5)

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No authorization token provided"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Resource already exists"
  }
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  }
}
```

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1641398400000
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

## Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| General API | 100 requests | 15 minutes |
| Authentication | 5 attempts | 15 minutes |
| Feed Refresh | 3 attempts | 24 hours |
| Password Reset | 3 attempts | 1 hour |
| Search | 30 requests | 1 minute |

---

## Implementation Status Summary

### ✅ Implemented (Phase 1-2): 25 endpoints
- Authentication (5): register, login, refresh, logout, me
- Categories (6): list, get, subscribe, update priority, toggle, unsubscribe
- Content (9): list, get, search, trending, create, update, delete, add tags, remove tags

### ❌ TODO (Phase 3-5): 25 endpoints
- Authentication (3): verify email, forgot password, reset password, change password
- User Profile (5): update profile, upload avatar, delete account, get stats
- Content Interactions (7): mark read, update progress, save, unsave, rate, dismiss, get saved, get history
- Feed & Recommendations (4): get today's feed, get feed by date, refresh feed, get recommendations
- Preferences (4): get preferences, update preferences, get notifications settings, update notifications
- Analytics (3): reading analytics, category analytics, engagement heatmap
- Notifications (3): get notifications, mark read, mark all read
- Admin (1): platform statistics

---

## Best Practices

1. **Always check `success` field** before accessing `data`
2. **Handle 401 errors** with automatic token refresh
3. **Implement exponential backoff** for rate limit errors
4. **Cache responses** where appropriate (categories, user preferences)
5. **Use pagination** for large datasets
6. **Validate inputs** client-side before API calls
7. **Show loading states** during API requests
8. **Handle network errors** gracefully
9. **Use optimistic updates** for better UX
10. **Log errors** for debugging

---

## Security Considerations

1. **Never expose tokens** in URLs or logs
2. **Store refresh tokens** in httpOnly cookies only
3. **Implement CSRF protection** for state-changing operations
4. **Validate all inputs** server-side
5. **Use HTTPS** in production
6. **Sanitize user content** to prevent XSS
7. **Rate limit sensitive endpoints**
8. **Implement request signing** for critical operations
9. **Log security events** (failed logins, etc.)
10. **Regular security audits**

---

## Changelog

### v1.0.0 (2024-01-16)
- Initial API specification
- Phases 1-2 implemented
- 25 endpoints operational
- 25 endpoints planned for future phases

---

## Next Steps

**Phase 3** (Weeks 9-12):
- Implement recommendation engine
- Build feed generation endpoints
- Add user preferences management
- Email verification system

**Phase 4** (Weeks 13-15):
- Content interaction tracking
- Reading history and analytics
- Saved content library
- Progress tracking

**Phase 5** (Weeks 16-18):
- Notifications system
- Achievements/gamification
- Admin dashboard
- Platform analytics
