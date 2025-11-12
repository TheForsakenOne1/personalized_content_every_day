# Educational Content Aggregator Platform

A personalized daily content feed platform that aggregates educational content from YouTube, research papers, articles, and blogs across various topics.

## Features

- 🎯 Personalized daily content feeds
- 📚 Multi-source aggregation (YouTube, arXiv, RSS feeds)
- 🔐 Secure authentication system
- 📊 Content recommendation engine
- ✅ Read/unread tracking
- 🏷️ Custom categories and tags
- 🤖 n8n automation for content curation

## Tech Stack

### Frontend
- Next.js 14+ (App Router)
- React 18+ with TypeScript
- Tailwind CSS + shadcn/ui
- React Query + Zustand

### Backend
- Node.js + Express.js
- TypeScript
- PostgreSQL with Prisma ORM
- Redis for caching
- JWT authentication

### Automation
- n8n for content aggregation workflows

## Project Structure

```
.
├── frontend/          # Next.js frontend application
├── backend/           # Express.js API server
├── n8n/              # n8n workflow configurations
└── docs/             # Additional documentation
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd personalized_content_every_day
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd backend
npm install
```

4. Set up environment variables (see .env.example in each directory)

5. Run database migrations
```bash
cd backend
npm run migrate
```

6. Start development servers

Frontend:
```bash
cd frontend
npm run dev
```

Backend:
```bash
cd backend
npm run dev
```

## Documentation

- [Architecture Documentation](./ARCHITECTURE.md)
- API Documentation: Available at `/api/docs` when running backend

## Development Roadmap

- [x] Phase 1: Foundation (Weeks 1-4)
- [ ] Phase 2: Content Aggregation (Weeks 5-8)
- [ ] Phase 3: Personalization (Weeks 9-12)
- [ ] Phase 4: Interactions & Tracking (Weeks 13-15)
- [ ] Phase 5: Polish & Launch (Weeks 16-18)

## License

MIT

## Contributing

Contributions are welcome! Please read the contributing guidelines first.
