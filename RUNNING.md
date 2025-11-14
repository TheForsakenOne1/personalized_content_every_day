# Running the Personalized Content Aggregator

This guide explains how to run the complete full-stack application with both backend and frontend.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Quick Start

### Option 1: Run Both Servers (Recommended)

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

The backend API will start on http://localhost:4000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The frontend will start on http://localhost:3000

### Option 2: Automated Setup (First Time)

If running for the first time, you can set up the database automatically:

```bash
cd backend
chmod +x setup.sh
./setup.sh
npm run dev
```

Then in another terminal:
```bash
cd frontend
npm run dev
```

## Accessing the Application

1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:4000
3. **API Health Check**: http://localhost:4000/health

## User Flows

### 1. Standard Authentication Flow

1. Navigate to http://localhost:3000
2. Click "Create Account" to register
3. Fill in the registration form with:
   - Email
   - Username
   - Password (must include: 8+ chars, uppercase, lowercase, number, special char)
   - Full Name (optional)
4. Click "Sign up"
5. Log in with your credentials
6. Complete the onboarding flow
7. Access the dashboard

### 2. Development Mode (Quick Testing)

For testing and demos, you can bypass authentication:

1. Navigate to http://localhost:3000
2. Press `Shift + A` anywhere on the page
3. You'll be automatically logged in with mock user data
4. Access all features immediately

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout current session
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/send-verification` - Resend verification email

### User Management
- `GET /api/users/me` - Get current user profile (protected)
- `PUT /api/users/me` - Update user profile (protected)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/user` - Get user's category preferences (protected)
- `POST /api/categories/user` - Update category preferences (protected)

### Content (Coming Soon)
- Content discovery endpoints
- Feed generation
- Interaction tracking

## Environment Variables

### Backend (.env in backend folder)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET=dev-secret-key-change-in-production-abc123xyz789
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local in frontend folder)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_ENV=development
```

## Database

The application uses SQLite for development. The database file is located at:
```
backend/dev.db
```

### Database Tables

- `users` - User accounts and profiles
- `user_preferences` - User content preferences
- `categories` - Content categories (pre-seeded with 6 categories)
- `user_categories` - User category subscriptions and priorities
- `refresh_tokens` - JWT refresh tokens
- `password_reset_tokens` - Password reset tokens
- `email_verification_tokens` - Email verification tokens
- `content` - Educational content items (papers, articles, videos)
- `tags` - Content tags
- `user_content_interaction` - User interactions with content
- `daily_feeds` - Personalized daily content feeds
- And more...

### Pre-seeded Categories

1. Machine Learning
2. Web Development
3. Data Science
4. Cybersecurity
5. Cloud Computing
6. Mobile Development

## Testing the Integration

### 1. Test Backend API Directly

```bash
# Register a user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123!",
    "fullName": "Test User"
  }'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Get current user (use token from login response)
curl -X GET http://localhost:4000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. Test Frontend

1. Open http://localhost:3000
2. Register a new account
3. Login with your credentials
4. Complete onboarding
5. Explore the dashboard

### 3. Test Dev Mode

1. Open http://localhost:3000
2. Press `Shift + A`
3. Verify you're logged in with mock data
4. Explore all features

## Troubleshooting

### Backend won't start

**Issue**: Database errors or missing dependencies

**Solution**:
```bash
cd backend
npm install
rm dev.db  # Remove old database
node scripts/setup-db.js  # Recreate database
npm run dev
```

### Frontend won't connect to backend

**Issue**: CORS errors or API connection refused

**Solution**:
1. Verify backend is running on port 4000
2. Check `.env.local` in frontend has correct API URL
3. Clear browser cache and reload
4. Check browser console for specific errors

### TypeScript errors in backend

**Issue**: Compilation errors when building

**Solution**:
The backend uses `tsx` for development which handles TypeScript compilation. If you see errors:
```bash
cd backend
npm run dev  # Uses tsx, not tsc
```

For production builds, use:
```bash
npm run build  # This may show TypeScript errors that don't affect dev mode
```

### Port already in use

**Issue**: Port 3000 or 4000 is already taken

**Solution**:
```bash
# For port 4000 (backend)
lsof -ti:4000 | xargs kill

# For port 3000 (frontend)
lsof -ti:3000 | xargs kill
```

## Development Workflow

1. **Make changes** to backend code → Hot reload automatic
2. **Make changes** to frontend code → Next.js fast refresh
3. **Database changes** → Update `backend/prisma/manual-setup.sql` and recreate DB
4. **API changes** → Update backend routes and frontend API clients

## Project Structure

```
.
├── backend/                 # Express.js backend API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── lib/          # Database client
│   │   └── utils/        # Utilities
│   ├── prisma/
│   │   └── manual-setup.sql  # Database schema
│   ├── scripts/
│   │   └── setup-db.js    # Database setup script
│   └── dev.db            # SQLite database
│
├── frontend/              # Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   ├── components/   # React components
│   │   ├── lib/         # Utilities and API clients
│   │   ├── store/       # Zustand state management
│   │   └── types/       # TypeScript types
│   └── public/          # Static assets
│
├── SETUP.md             # Detailed setup documentation
└── RUNNING.md          # This file
```

## Next Steps

After getting the application running:

1. **Explore the UI**: Navigate through onboarding, dashboard, preferences
2. **Test Authentication**: Try register, login, logout flows
3. **Check Categories**: View and customize your topic preferences
4. **Customize**: Modify code and see live changes
5. **Build Features**: Add content aggregation, recommendations, etc.

## Support

For issues or questions:
- Check SETUP.md for detailed configuration
- Review error logs in terminal
- Verify all environment variables are set
- Ensure both servers are running

## Production Deployment

For production deployment:

1. Update environment variables with secure values
2. Use proper database (PostgreSQL recommended)
3. Enable HTTPS
4. Configure proper JWT secrets
5. Set up email service for verification
6. Add rate limiting and security headers
7. Use a process manager (PM2) for backend
8. Deploy frontend to Vercel/Netlify
9. Deploy backend to Railway/Render/Heroku

---

**Happy Coding! 🚀**
