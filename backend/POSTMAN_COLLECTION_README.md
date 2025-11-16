# Postman Collection - Personalized Content API

Complete Postman collection for testing all backend API endpoints.

## 📦 Files Included

1. **Personalized_Content_API.postman_collection.json** - Main collection with all 60+ API endpoints
2. **Personalized_Content_API.postman_environment.json** - Environment variables configuration

## 🚀 Quick Start

### 1. Import into Postman

**Option A: Import Collection + Environment**
```
1. Open Postman
2. Click "Import" button (top left)
3. Drag and drop both JSON files:
   - Personalized_Content_API.postman_collection.json
   - Personalized_Content_API.postman_environment.json
4. Click "Import"
```

**Option B: Import via URL** (if hosted on GitHub)
```
1. Open Postman
2. Click "Import" → "Link"
3. Paste the raw GitHub URL to the collection file
4. Click "Continue" → "Import"
```

### 2. Configure Environment

```
1. Click the environment dropdown (top right)
2. Select "Personalized Content API - Local"
3. Verify the variables:
   - baseUrl: http://localhost:4000
   - accessToken: (auto-populated after login)
   - refreshToken: (auto-populated after login)
   - userId: (auto-populated after login)
```

### 3. Start Testing

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test the health endpoint:**
   - Open the collection
   - Navigate to "Health Check"
   - Click "Send"
   - Should return: `{"status": "ok", "timestamp": "..."}`

3. **Register a user:**
   - Navigate to "Authentication" → "Register User"
   - Click "Send"
   - User will be created

4. **Login:**
   - Navigate to "Authentication" → "Login"
   - Click "Send"
   - ✨ Access token is **automatically saved** to environment variables

5. **Test authenticated endpoints:**
   - All user, analytics, and admin routes now have the token
   - Just click "Send" on any authenticated endpoint

## 📚 Collection Structure

```
Personalized Content API/
├── Authentication (9 endpoints)
│   ├── Register User
│   ├── Login (auto-saves token)
│   ├── Get Current User
│   ├── Refresh Token
│   ├── Logout
│   ├── Forgot Password
│   ├── Reset Password
│   ├── Send Verification Email
│   └── Verify Email
│
├── Categories (8 endpoints)
│   ├── Get All Categories
│   ├── Get Category by ID
│   ├── Get Category by Slug
│   ├── Get User Subscriptions
│   ├── Subscribe to Category
│   ├── Update Category Priority
│   ├── Toggle Category Status
│   └── Unsubscribe from Category
│
├── Content (9 endpoints)
│   ├── Get All Content
│   ├── Get Content by ID
│   ├── Search Content
│   ├── Get Trending Content
│   ├── Create Content (Admin)
│   ├── Update Content (Admin)
│   ├── Delete Content (Admin)
│   ├── Add Tags to Content (Admin)
│   └── Remove Tags from Content (Admin)
│
├── User (12 endpoints)
│   ├── Get User Profile
│   ├── Update User Profile
│   ├── Get User Preferences
│   ├── Update User Preferences
│   ├── Get User Categories
│   ├── Update User Categories
│   ├── Save Content
│   ├── Unsave Content
│   ├── Mark Content as Read
│   ├── Get User Feed
│   ├── Get Saved Content
│   └── Get User Stats
│
├── Search (10 endpoints)
│   ├── Search (GET)
│   ├── Search (POST)
│   ├── Get Search Suggestions
│   ├── Get Trending Searches
│   ├── Get Search Facets
│   ├── Get Search History
│   ├── Get Recent Searches
│   ├── Clear Search History
│   ├── Delete Specific Search
│   └── Get Search Analytics
│
├── Analytics (6 endpoints)
│   ├── Get Reading Stats
│   ├── Get Reading Streak
│   ├── Get Topic Breakdown
│   ├── Get Activity Timeline
│   ├── Get Dashboard Analytics
│   └── Get Recommendation Metrics
│
├── Admin (6 endpoints)
│   ├── Get System Stats
│   ├── Get All Users
│   ├── Toggle User Status
│   ├── Trigger Content Aggregation
│   ├── Delete Content (Moderation)
│   └── System Health Check
│
└── Health Check (1 endpoint)
    └── Basic health check
```

**Total Endpoints: 61**

## 🔐 Authentication Flow

### Automatic Token Management

The collection includes a **test script** on the "Login" endpoint that automatically:
1. Extracts the `accessToken` from the login response
2. Saves it to the environment variable `{{accessToken}}`
3. Saves the `userId` for reference

All authenticated endpoints use: `Authorization: Bearer {{accessToken}}`

### Manual Token Setup (if needed)

If you need to manually set a token:
```
1. Send a login request
2. Copy the accessToken from the response
3. Click the environment (top right)
4. Click the eye icon
5. Paste token into "accessToken" current value
6. Save
```

## 🎯 Testing Workflows

### Workflow 1: New User Registration & Login

```
1. POST /api/auth/register
   → Create user account

2. POST /api/auth/login
   → Get access token (auto-saved)

3. GET /api/auth/me
   → Verify authentication working

4. GET /api/users/preferences
   → View default preferences
```

### Workflow 2: Content Discovery

```
1. GET /api/categories
   → View all categories

2. GET /api/content?page=1&limit=20
   → Browse all content

3. GET /api/content/trending
   → See what's trending

4. GET /api/content/search?q=machine learning
   → Search for specific content
```

### Workflow 3: User Personalization

```
1. POST /api/categories/user/subscribe
   → Subscribe to categories

2. PATCH /api/users/preferences
   → Update preferences

3. GET /api/users/feed
   → Get personalized feed

4. POST /api/users/content/:id/save
   → Save favorite content
```

### Workflow 4: Analytics & Insights

```
1. GET /api/analytics/dashboard
   → Get comprehensive analytics

2. GET /api/analytics/reading-stats
   → View reading statistics

3. GET /api/analytics/streak
   → Check reading streak

4. GET /api/analytics/topics
   → See topic breakdown
```

### Workflow 5: Admin Operations

```
1. POST /api/auth/login
   → Login as admin user

2. GET /api/admin/stats
   → View system statistics

3. GET /api/admin/users
   → List all users

4. POST /api/admin/aggregate
   → Trigger content aggregation
```

## 📝 Example Request Bodies

### Register User
```json
{
  "email": "user@example.com",
  "username": "testuser",
  "password": "SecurePass123@",
  "fullName": "Test User"
}
```

### Login
```json
{
  "email": "user@example.com",
  "password": "SecurePass123@"
}
```

### Update Preferences
```json
{
  "contentFrequency": "daily",
  "preferredContentTypes": ["article", "video", "paper"],
  "notificationEnabled": true,
  "emailDigest": true,
  "theme": "dark"
}
```

### Create Content (Admin)
```json
{
  "contentType": "article",
  "source": "Manual",
  "categoryId": "category-id-here",
  "title": "Introduction to Machine Learning",
  "description": "A comprehensive guide",
  "url": "https://example.com/article",
  "author": "John Doe",
  "publishedAt": "2025-11-15T00:00:00Z",
  "tags": ["machine-learning", "ai"]
}
```

### Advanced Search (POST)
```json
{
  "query": "machine learning",
  "filters": {
    "categoryId": "cat-id",
    "contentType": "article",
    "dateFrom": "2025-01-01",
    "dateTo": "2025-12-31"
  },
  "limit": 20
}
```

## 🔧 Environment Variables

| Variable | Description | Auto-Set | Example |
|----------|-------------|----------|---------|
| `baseUrl` | API base URL | No | `http://localhost:4000` |
| `accessToken` | JWT access token | Yes (on login) | `eyJhbGc...` |
| `refreshToken` | JWT refresh token | Yes (on login) | `eyJhbGc...` |
| `userId` | Current user ID | Yes (on login) | `uuid-string` |

## 🌍 Multiple Environments

You can create different environments for different deployments:

### Local Development
```json
{
  "baseUrl": "http://localhost:4000"
}
```

### Staging
```json
{
  "baseUrl": "https://staging-api.example.com"
}
```

### Production
```json
{
  "baseUrl": "https://api.example.com"
}
```

To switch environments:
1. Click the environment dropdown (top right)
2. Select the desired environment

## 🐛 Troubleshooting

### Issue: 401 Unauthorized

**Solution:**
```
1. Make sure you've logged in
2. Check that accessToken is set in environment
3. Token expires after 15 minutes - login again
```

### Issue: 500 Server Error on Content Routes

**Solution:**
```
This is a known issue with the database abstraction layer.
Check ROUTE_VERIFICATION_REPORT.md for details.
```

### Issue: Redis Connection Errors

**Solution:**
```
Redis is optional. The API gracefully falls back to database queries.
To enable Redis: redis-server
```

### Issue: Cannot find category/content IDs

**Solution:**
```
1. First run: GET /api/categories
2. Copy a category ID from the response
3. Use it in subsequent requests
```

## 📖 API Documentation

For detailed API documentation, see:
- **ROUTE_VERIFICATION_REPORT.md** - Complete route verification
- **BACKEND_ARCHITECTURE_PROPOSAL.md** - Original proposal
- **API_DOCUMENTATION.md** - Detailed API specs

## 🎨 Tips & Tricks

### 1. Use Collection Runner
```
1. Click "..." on collection
2. Select "Run collection"
3. Select endpoints to test
4. Click "Run"
```

### 2. Save Example Responses
```
1. Send a request
2. Click "Save Response"
3. Select "Save as example"
4. Future users will see example responses
```

### 3. Use Variables in URLs
```
Instead of hardcoding:
{{baseUrl}}/api/content/12345

Use:
{{baseUrl}}/api/content/{{contentId}}
```

### 4. Pre-request Scripts
```javascript
// Generate random email for testing
pm.environment.set("randomEmail",
  `test${Date.now()}@example.com`
);
```

### 5. Test Scripts
```javascript
// Auto-save response data
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.environment.set("contentId", jsonData.data.id);
});
```

## 🚀 Advanced Usage

### Batch Testing

Create a CSV file with test data and use Postman's Collection Runner:

**users.csv:**
```csv
email,username,password,fullName
user1@test.com,user1,Pass123@,User One
user2@test.com,user2,Pass123@,User Two
```

### Newman (CLI Testing)

Run the collection from command line:

```bash
# Install Newman
npm install -g newman

# Run collection
newman run Personalized_Content_API.postman_collection.json \
  -e Personalized_Content_API.postman_environment.json

# Generate HTML report
newman run Personalized_Content_API.postman_collection.json \
  -e Personalized_Content_API.postman_environment.json \
  -r html
```

### CI/CD Integration

```yaml
# .github/workflows/api-tests.yml
name: API Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Newman
        run: npm install -g newman
      - name: Run API Tests
        run: |
          newman run backend/Personalized_Content_API.postman_collection.json \
            -e backend/Personalized_Content_API.postman_environment.json
```

## 📊 Coverage

This collection covers:
- ✅ **60+ endpoints** (113% of proposal)
- ✅ All authentication flows
- ✅ Complete CRUD operations
- ✅ Advanced search & filters
- ✅ Analytics & reporting
- ✅ Admin operations
- ✅ Error scenarios
- ✅ Pagination examples
- ✅ Filter combinations

## 🤝 Contributing

To add new endpoints to this collection:

1. Add the endpoint in the appropriate folder
2. Include example request body
3. Add description
4. Update this README
5. Commit and push

## 📄 License

This collection is part of the Personalized Content project.

---

**Last Updated:** 2025-11-16
**Collection Version:** 1.0.0
**Total Endpoints:** 61
**Maintained By:** Claude
