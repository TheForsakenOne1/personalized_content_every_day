# EduHub - Personalized Educational Content Platform

A beautiful, full-stack personalized learning platform that aggregates educational content from research papers, articles, and videos, tailored to your interests.

## ✨ Features

### 🔐 Authentication System
- Complete user registration and login flow
- JWT-based authentication with refresh tokens
- Password reset and email verification (email service pending)
- Secure session management with HttpOnly cookies
- Protected routes and API endpoints

### 🎯 Personalization
- Elegant topic selection interface
- Priority-based content preferences (Low, Medium, High)
- Customizable content frequency (Daily, Weekly, Monthly)
- Pre-seeded categories: Machine Learning, Web Development, Data Science, Cybersecurity, Cloud Computing, Mobile Development

### 📱 User Experience
- Engaging multi-step onboarding wizard
- Professional dashboard inspired by Stripe/AirBnB aesthetics
- Dedicated views for papers, articles, and videos
- Read/unread tracking and bookmarking
- Fully responsive design with mobile-optimized navigation
- Dark mode support

### 🛠️ Developer Features
- Shift+A dev mode for instant testing without authentication
- Comprehensive API documentation
- Hot reload for both frontend and backend
- SQLite database for easy local development
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
- **SQLite** - Lightweight database (better-sqlite3)
- **JWT** - Secure authentication
- **Custom DB Adapter** - Prisma-like API without Prisma Client

### Infrastructure
- Custom database client mimicking Prisma API
- Automated database setup and seeding
- Development-ready with minimal configuration

## Project Structure

```
.
├── frontend/          # Next.js frontend application
├── backend/           # Express.js API server
├── n8n/              # n8n workflow configurations
└── docs/             # Additional documentation
```

## 🏁 Quick Start

### Prerequisites

- **Node.js 18+** (includes npm)
- That's it! No PostgreSQL, Redis, or complex setup required.

### Running the Application

**Option 1: Manual Setup (Recommended)**

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```
Backend will start on http://localhost:4000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on http://localhost:3000

**Option 2: Automated Setup (First Time)**

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

### Access the Application

1. Open http://localhost:3000 in your browser
2. **Option A**: Register a new account and login
3. **Option B**: Press `Shift + A` for instant dev mode access
4. Complete the onboarding flow
5. Explore your personalized dashboard!

> 💡 **Pro Tip**: Use `Shift + A` anywhere to bypass authentication for quick testing and demos.

## 📚 Documentation

- **[RUNNING.md](./RUNNING.md)** - Complete guide to running and testing the application
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions and troubleshooting
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design decisions

## 🎯 Current Status

### ✅ Completed Features

- **Authentication System**
  - User registration with password validation
  - Secure login with JWT tokens
  - Password reset flow (backend ready, email service pending)
  - Email verification (backend ready, email service pending)
  - Protected routes and middleware
  - Refresh token rotation

- **Frontend UI**
  - Landing page with authentication flows
  - Engaging onboarding wizard (4 steps)
  - Professional dashboard layout
  - Topic preferences interface
  - Content detail views (papers, articles, videos)
  - Mobile-responsive navigation
  - Dev mode for quick testing (Shift+A)

- **Backend API**
  - RESTful API with Express.js
  - Custom SQLite database client
  - 14 database tables with relations
  - Authentication endpoints
  - User management endpoints
  - Category management endpoints
  - CORS and security middleware

- **Database**
  - SQLite with automated setup
  - 6 pre-seeded content categories
  - User preferences and interactions
  - Token management tables
  - Full schema with relations

### 🚧 In Progress / Coming Soon

- **Content Aggregation**
  - YouTube API integration
  - arXiv research paper fetching
  - RSS feed parsing for articles
  - Content quality scoring

- **Recommendation Engine**
  - Personalized feed algorithm
  - Category-based filtering
  - Reading history analysis
  - Daily digest generation

- **Enhanced Features**
  - Email service integration
  - Search functionality
  - Content filtering and sorting
  - User activity analytics
  - Social features (sharing, comments)

## License

MIT

## Contributing

Contributions are welcome! Please read the contributing guidelines first.
