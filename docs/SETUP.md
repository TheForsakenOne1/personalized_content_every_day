# Setup Guide

This guide will help you set up the Educational Content Aggregator Platform on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+** - [Download](https://nodejs.org/)
- **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/)
- **Redis 7+** - [Download](https://redis.io/download/)
- **npm or yarn** - Comes with Node.js

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd personalized_content_every_day
```

## Step 2: Install Dependencies

Install root dependencies and all workspace dependencies:

```bash
npm run install:all
```

Or install individually:

```bash
# Root
npm install

# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend && npm install && cd ..
```

## Step 3: Set Up Environment Variables

### Backend (.env)

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/content_aggregator?schema=public

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Other settings...
```

### Frontend (.env.local)

Create a `.env.local` file in the `frontend` directory:

```bash
cd frontend
cp .env.example .env.local
```

Edit the `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Step 4: Set Up the Database

### Create PostgreSQL Database

```bash
createdb content_aggregator
```

Or using psql:

```sql
CREATE DATABASE content_aggregator;
```

### Run Migrations

```bash
cd backend
npm run prisma:generate
npm run migrate
```

### Seed the Database

```bash
npm run db:seed
```

This will create:
- 8 default categories (Astronomy, Geopolitics, History, Geography, Software, Science, Mathematics, Philosophy)
- 10 common tags

## Step 5: Start Development Servers

### Option 1: Start All Services (from root)

```bash
npm run dev
```

This will start both frontend and backend concurrently.

### Option 2: Start Individually

**Backend:**
```bash
cd backend
npm run dev
```
Server will run on http://localhost:4000

**Frontend:**
```bash
cd frontend
npm run dev
```
App will run on http://localhost:3000

## Step 6: Verify Installation

1. Open http://localhost:3000 in your browser
2. You should be redirected to the login page
3. Click "Sign up" to create a new account
4. After registration, log in with your credentials
5. You should see the dashboard

## API Endpoints

The backend API is available at http://localhost:4000/api

Key endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

Health check: http://localhost:4000/health

## Database Tools

### Prisma Studio

View and edit your database data with Prisma Studio:

```bash
cd backend
npm run prisma:studio
```

Opens at http://localhost:5555

## Troubleshooting

### Port Already in Use

If ports 3000 or 4000 are already in use:

**Frontend:**
```bash
PORT=3001 npm run dev
```

**Backend:**
Update `PORT` in `backend/.env`

### Database Connection Error

1. Verify PostgreSQL is running:
```bash
pg_isready
```

2. Check your DATABASE_URL in `backend/.env`

3. Ensure the database exists:
```bash
psql -l | grep content_aggregator
```

### Redis Connection Error

1. Verify Redis is running:
```bash
redis-cli ping
```

Should return: `PONG`

2. Start Redis if not running:
```bash
# macOS (Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Windows
redis-server
```

### Migration Errors

Reset and recreate migrations:

```bash
cd backend
npx prisma migrate reset
npm run migrate
npm run db:seed
```

## Next Steps

Phase 1 is now complete! The following features are available:

- ✅ User authentication (register, login, logout)
- ✅ JWT-based security
- ✅ PostgreSQL database with Prisma ORM
- ✅ Professional UI with shadcn/ui
- ✅ Basic dashboard

### Coming in Phase 2:

- Content aggregation with n8n
- YouTube video fetching
- arXiv research paper integration
- RSS feed aggregation
- Content recommendation engine

## Development Commands

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

### Backend

```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run lint         # Run ESLint
npm run migrate      # Run database migrations
npm run db:seed      # Seed database
npm run prisma:studio # Open Prisma Studio
```

## Additional Resources

- [Architecture Documentation](../ARCHITECTURE.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
