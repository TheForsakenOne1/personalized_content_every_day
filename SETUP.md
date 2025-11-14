# 🚀 EduHub - Complete Setup Guide

## Project Overview

EduHub is a personalized educational content aggregator that curates research papers, articles, and videos based on your interests.

**Current Status:**
- ✅ Frontend: Fully functional with mock data
- ✅ Dev Mode: Shift+A bypass for testing
- ⚠️ Backend: Ready to deploy (requires setup)

---

## Quick Start (Frontend Only - No Backend Required)

The easiest way to explore the application:

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000 and press **Shift + A** to activate dev mode!

---

## Full Stack Setup (Backend + Frontend)

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ OR SQLite (for development)
- npm or yarn

### Option 1: SQLite (Recommended for Development)

#### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# The .env file is already configured for SQLite
# DATABASE_URL="file:./dev.db"

# Generate Prisma client
npx prisma generate

# Run migrations to create database
npx prisma migrate dev --name init

# Seed the database with categories
npx prisma db seed

# Start the backend server
npm run dev
```

Backend will run on: **http://localhost:4000**

#### 2. Frontend Setup

```bash
cd frontend

# Dependencies already installed
npm run dev
```

Frontend will run on: **http://localhost:3000**

### Option 2: PostgreSQL (Production)

#### 1. Create PostgreSQL Database

```bash
# Create database
createdb content_aggregator

# Or using psql
psql -U postgres
CREATE DATABASE content_aggregator;
```

#### 2. Update Backend Configuration

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/content_aggregator?schema=public"
```

#### 3. Run Migrations

```bash
cd backend

# Update schema to use postgresql
# Edit prisma/schema.prisma:
#   datasource db {
#     provider = "postgresql"  # change from sqlite
#     url      = env("DATABASE_URL")
#   }

npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Server
NODE_ENV=development
PORT=4000

# Database (choose one)
DATABASE_URL="file:./dev.db"  # SQLite
# DATABASE_URL="postgresql://user:pass@localhost:5432/content_aggregator"  # PostgreSQL

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@eduhub.com
```

### Frontend (`frontend/.env.local`) - Optional

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Testing the Backend

### 1. Register a New User

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123!@#",
    "fullName": "Test User"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 3. Test in Browser

1. Visit http://localhost:3000
2. Click "Create Account" or "Sign In"
3. Register/Login with real credentials
4. Authentication should work!

---

## Project Structure

```
personalized_content_every_day/
├── frontend/                 # Next.js 14 application
│   ├── src/
│   │   ├── app/             # Pages and layouts
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities and API clients
│   │   ├── store/           # Zustand stores
│   │   └── types/           # TypeScript types
│   └── public/              # Static assets
│
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, rate limiting
│   │   ├── utils/           # Helper functions
│   │   └── server.ts        # App entry point
│   └── prisma/
│       ├── schema.prisma    # Database schema
│       └── seed.ts          # Database seeder
│
└── SETUP.md                 # This file
```

---

## Available Features

### Frontend (Fully Implemented)

✅ Authentication UI (Register, Login, Password Reset)
✅ Dashboard with content feed
✅ Content detail views (Papers, Articles, Videos)
✅ Topic preferences with priorities
✅ Onboarding flow (4 steps)
✅ Mobile navigation
✅ Dark mode support
✅ Dev mode (Shift+A) for testing

### Backend API (Ready to Deploy)

✅ User registration with validation
✅ Email/password login
✅ JWT authentication (access + refresh tokens)
✅ Password reset flow
✅ Email verification
✅ Protected routes middleware
✅ Rate limiting
✅ CORS configuration
✅ Error handling

### Not Yet Implemented

⏳ Content aggregation (n8n workflows)
⏳ Search functionality
⏳ Bookmarks/saved items
⏳ Trending algorithm
⏳ Recommendation engine
⏳ Push notifications
⏳ Social features

---

## Development Workflow

### Running Both Servers

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Using Dev Mode (No Backend)

Just press **Shift + A** on any page to bypass authentication!

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Issues

```bash
cd backend

# Reset database
npx prisma migrate reset

# Or delete and recreate
rm prisma/dev.db
npx prisma migrate dev
npx prisma db seed
```

### Prisma Client Issues

```bash
cd backend
npx prisma generate
```

### Clear Browser State

- Clear localStorage
- Clear cookies
- Hard refresh (Cmd/Ctrl + Shift + R)

---

## Next Steps

Once the backend is running, you can:

1. **Remove Dev Mode** - Delete `src/components/dev-tools.tsx`
2. **Add Content Aggregation** - Set up n8n workflows
3. **Implement Search** - Add full-text search
4. **Build Bookmarks** - Save and organize content
5. **Deploy** - See DEPLOYMENT.md (coming soon)

---

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand (State Management)
- Sonner (Notifications)

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL / SQLite
- JWT Authentication
- bcrypt

---

## Support

Having issues? Check:

1. Node version: `node --version` (should be 18+)
2. Ports 3000 and 4000 are free
3. Database is running (if PostgreSQL)
4. `.env` file exists in backend/
5. Dependencies installed in both folders

---

## License

MIT

---

**Happy Learning! 🎓**
