# API Documentation

## Base URL

```
Development: http://localhost:4000/api
Production: https://api.yourdomain.com/api
```

## Authentication

Most endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Response Format

All responses follow this structure:

```json
{
  "success": boolean,
  "data": object | null,
  "error": {
    "code": string,
    "message": string
  } | null,
  "meta": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number,
    "hasMore": boolean
  } | null
}
```

---

## Authentication Endpoints

### Register User

`POST /auth/register`

**Body**:
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "fullName": "John Doe" // optional
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "fullName": "John Doe",
      "emailVerified": false,
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    "message": "Registration successful. Please check your email for verification."
  }
}
```

### Login

`POST /auth/login`

**Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "fullName": "John Doe",
      "emailVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

*Note*: Refresh token is set as httpOnly cookie

### Refresh Token

`POST /auth/refresh`

**Cookies**: refreshToken (httpOnly)

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Logout

`POST /auth/logout` 🔒

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### Get Current User

`GET /auth/me` 🔒

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "fullName": "John Doe",
      "avatarUrl": "https://...",
      "emailVerified": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "lastLoginAt": "2024-01-16T08:30:00.000Z"
    }
  }
}
```

---

## Category Endpoints

### Get All Categories

`GET /categories`

**Query Parameters**:
- `includeStats` (boolean): Include content count and subscriber count

**Response**:
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
        "contentCount": 1234,  // if includeStats=true
        "subscriberCount": 567  // if includeStats=true
      }
    ]
  }
}
```

### Get Category by ID

`GET /categories/:id`

**Response**:
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

### Get Category by Slug

`GET /categories/slug/:slug`

**Response**: Same as Get Category by ID

### Get User's Categories

`GET /categories/user/subscriptions` 🔒

**Response**:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "priority": 9,
        "isActive": true,
        "createdAt": "2024-01-15T10:00:00.000Z",
        "category": {
          "id": "uuid",
          "name": "Astronomy",
          "slug": "astronomy",
          "description": "...",
          "icon": "telescope"
        }
      }
    ]
  }
}
```

### Subscribe to Category

`POST /categories/user/subscribe` 🔒

**Body**:
```json
{
  "categoryId": "uuid",
  "priority": 8  // 1-10, default: 5
}
```

**Response**:
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
      "category": { ... }
    }
  }
}
```

### Update Category Priority

`PATCH /categories/user/:id/priority` 🔒

**Body**:
```json
{
  "priority": 10
}
```

**Response**: Same as Subscribe to Category

### Toggle Category Status

`PATCH /categories/user/:id/toggle` 🔒

**Response**: Same as Subscribe to Category

### Unsubscribe from Category

`DELETE /categories/user/:id` 🔒

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Unsubscribed successfully"
  }
}
```

---

## Content Endpoints

### Get Content (List with Filters)

`GET /content`

**Query Parameters**:
- `categoryId` (UUID): Filter by category
- `contentType` (string): video | article | paper | blog
- `source` (string): youtube | arxiv | medium | rss | substack
- `search` (string): Search in title, description, author
- `tags` (string): Comma-separated tag slugs
- `dateFrom` (ISO date): Published after this date
- `dateTo` (ISO date): Published before this date
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `sortBy` (string): Field to sort by (default: publishedAt)
- `sortOrder` (string): asc | desc (default: desc)

**Response**:
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
        "description": "A comprehensive overview...",
        "url": "https://youtube.com/watch?v=...",
        "thumbnailUrl": "https://i.ytimg.com/...",
        "author": "Physics Explained",
        "publishedAt": "2024-01-15T10:00:00.000Z",
        "duration": 1200,  // seconds
        "wordCount": null,
        "language": "en",
        "qualityScore": 0.85,
        "popularityScore": 50000,
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

### Get Content by ID

`GET /content/:id`

**Response**:
```json
{
  "success": true,
  "data": {
    "content": {
      // Same fields as list
      "userInteraction": {  // Only if authenticated
        "id": "uuid",
        "status": "read",
        "readAt": "2024-01-16T08:00:00.000Z",
        "readProgress": 0.75,
        "timeSpent": 900,
        "rating": 5,
        "isSaved": true,
        "notes": "Great explanation of quantum tunneling"
      }
    }
  }
}
```

### Search Content

`GET /content/search`

**Query Parameters**:
- `q` (string, required): Search query
- `limit` (number): Max results (default: 20)

**Response**: Same format as Get Content

### Get Trending Content

`GET /content/trending`

**Query Parameters**:
- `days` (number): Look back period (default: 7)
- `limit` (number): Max results (default: 10)

**Response**:
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "title": "...",
        "contentType": "video",
        "categoryName": "Science",
        "uniqueViews": 1234,
        "readCount": 890,
        "saveCount": 156,
        "avgRating": 4.5,
        "trendingScore": 5678
      }
    ]
  }
}
```

### Create Content (Admin)

`POST /content` 🔒

**Body**:
```json
{
  "externalId": "optional-external-id",
  "contentType": "video",
  "source": "youtube",
  "categoryId": "uuid",
  "title": "Content Title",
  "description": "Description text",
  "url": "https://...",
  "thumbnailUrl": "https://...",
  "author": "Author Name",
  "publishedAt": "2024-01-15T10:00:00.000Z",
  "duration": 1200,  // for videos
  "wordCount": 2000,  // for articles/papers
  "language": "en",
  "metadata": {},
  "qualityScore": 0.85,
  "popularityScore": 1000,
  "tags": ["beginner-friendly", "tutorial"]  // optional
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "content": { ... }
  }
}
```

### Update Content (Admin)

`PATCH /content/:id` 🔒

**Body**: Partial content object (same fields as Create)

**Response**: Same as Create

### Delete Content (Admin)

`DELETE /content/:id` 🔒

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Content deleted successfully"
  }
}
```

### Add Tags to Content (Admin)

`POST /content/:id/tags` 🔒

**Body**:
```json
{
  "tags": ["advanced", "research"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "tags": [
      {
        "id": "uuid",
        "name": "Advanced",
        "slug": "advanced"
      }
    ]
  }
}
```

### Remove Tags from Content (Admin)

`DELETE /content/:id/tags` 🔒

**Body**: Same as Add Tags

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Tags removed successfully"
  }
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data"
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

## Rate Limiting

- General API: **100 requests per 15 minutes** per IP
- Auth endpoints: **5 requests per 15 minutes** per IP

Headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641398400000
```

---

## Pagination

For endpoints that return lists, use these query parameters:

- `page`: Page number (1-indexed)
- `limit`: Items per page (max: 100)

Response includes `pagination` object:
```json
{
  "page": 1,
  "limit": 20,
  "total": 1234,
  "totalPages": 62,
  "hasMore": true
}
```

---

## Filtering & Sorting

### Filtering

Use query parameters to filter results:

```
GET /content?categoryId=uuid&contentType=video&source=youtube
```

### Sorting

Use `sortBy` and `sortOrder`:

```
GET /content?sortBy=qualityScore&sortOrder=desc
```

Available sort fields:
- `publishedAt` (default)
- `createdAt`
- `qualityScore`
- `popularityScore`
- `title`

---

## Best Practices

1. **Always check `success` field** before accessing `data`
2. **Handle errors gracefully** with user-friendly messages
3. **Implement token refresh** logic for seamless UX
4. **Cache responses** where appropriate (categories, etc.)
5. **Use pagination** for large datasets
6. **Respect rate limits** and implement exponential backoff
7. **Validate inputs** before sending requests
8. **Use HTTPS** in production

---

## Examples

### Fetch User's Personalized Feed

```javascript
// 1. Get user's subscribed categories
const categories = await fetch('/api/categories/user/subscriptions', {
  headers: { Authorization: `Bearer ${token}` }
});

// 2. Fetch content from those categories
const categoryIds = categories.data.categories
  .filter(c => c.isActive)
  .sort((a, b) => b.priority - a.priority)
  .map(c => c.category.id);

const content = await Promise.all(
  categoryIds.map(id =>
    fetch(`/api/content?categoryId=${id}&limit=5&sortBy=qualityScore&sortOrder=desc`)
  )
);

// 3. Merge and sort by recommendation score
const feed = content.flatMap(r => r.data.content)
  .sort((a, b) => b.qualityScore - a.qualityScore)
  .slice(0, 20);
```

### Search with Filters

```javascript
const results = await fetch(
  '/api/content?' + new URLSearchParams({
    search: 'quantum physics',
    contentType: 'video',
    dateFrom: '2024-01-01',
    tags: 'beginner-friendly,tutorial',
    limit: 10
  })
);
```

### Handle Token Refresh

```javascript
async function apiRequest(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${getAccessToken()}`
    }
  });

  if (response.status === 401) {
    // Try to refresh token
    await refreshAccessToken();
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${getAccessToken()}`
      }
    });
  }

  return response.json();
}
```

---

## Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- Authentication endpoints
- Category management
- Content CRUD operations
- Search and filtering

---

## Support

For API issues or questions:
- Check this documentation
- Review error messages carefully
- Check server logs
- Create issue in project repository

For feature requests:
- Open discussion in repository
- Provide use case and examples
- Consider contributing
