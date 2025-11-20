# EduHub - Personalized Educational Content Platform

A beautiful, full-stack personalized learning platform that aggregates educational content from research papers, articles, and videos, tailored to your interests.

## ✨ Features

### 🔐 Authentication System
- Complete user registration and login flow
- JWT-based authentication with refresh tokens
- Password reset and email verification
- Secure session management
- Protected routes and API endpoints

### 🎯 Personalization
- Elegant topic selection interface
- Priority-based content preferences (Low, Medium, High)
- Customizable content frequency (Daily, Weekly, Monthly)
- Pre-seeded categories: Machine Learning, Web Development, Data Science, Cybersecurity, Cloud Computing, Mobile Development

### 📱 User Experience
- Engaging multi-step onboarding wizard
- Professional dashboard inspired by Stripe/Airbnb aesthetics
- Dedicated views for papers, articles, and videos
- Read/unread tracking and bookmarking
- Fully responsive design with mobile-optimized navigation
- Dark mode support

### 🛠️ Developer Features
- Production-ready architecture
- Comprehensive API documentation
- Hot reload for both frontend and backend
- PostgreSQL database with Prisma ORM
- Automated setup scripts

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - State management
- **React Hook Form + Zod** - Form validation
- **Sonner** - Toast notifications

### Backend
- **Node.js + Express.js** - RESTful API server
- **TypeScript** - Type-safe backend
- **PostgreSQL** - Production database
- **Prisma ORM** - Type-safe database access
- **JWT** - Secure authentication

### Infrastructure
- Prisma for database management
- Automated migrations
- Production-ready with minimal configuration

## 🏁 Quick Start

### Prerequisites

- **Node.js 18+**
- **PostgreSQL 15+**

### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu:**
```bash
sudo apt install postgresql postgresql-contrib
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Create database
createdb eduhub_dev

# Copy and configure environment
cp .env.example .env
# Edit .env and set your DATABASE_URL

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database
npm run db:seed

# Start backend
npm run dev
```

Backend runs on http://localhost:4000

### 3. Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start frontend
npm run dev
```

Frontend runs on http://localhost:3000

## 📚 Documentation

- **[POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)** - PostgreSQL setup and troubleshooting
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design

## 🔐 Security

- JWT access tokens (15m expiry)
- Refresh tokens in HTTP-only cookies (7d expiry)
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention via Prisma

## 📊 Database

15 models including User Management, Content, Categories, Interactions, and Tracking.

See `backend/prisma/schema.prisma` for full schema.

## 🚀 Deployment

See [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md) for deployment instructions.

## 📝 License

MIT
