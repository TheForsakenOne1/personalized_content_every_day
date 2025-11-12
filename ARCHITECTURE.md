# Educational Content Aggregator Platform - System Architecture

## Executive Summary

This document outlines the complete system architecture for an educational content aggregator platform that delivers personalized daily content feeds from multiple sources (YouTube, research papers, articles, blogs) across various topics including Astronomy, Geopolitics, History, Geography, Software, and custom user-defined categories.

---

## 1. Frontend Tech Stack

### Core Framework
- **Next.js 14+** (App Router)
  - Server-side rendering for SEO optimization
  - Built-in API routes for BFF (Backend for Frontend) pattern
  - Excellent performance with React Server Components
  - Image optimization out of the box

### UI Framework & Styling
- **React 18+** with TypeScript
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** component library
  - AirBnB/Stripe-like professional components
  - Fully customizable and accessible
  - Built on Radix UI primitives

### State Management
- **React Query (TanStack Query)**
  - Server state management
  - Caching and synchronization
  - Optimistic updates
- **Zustand** for client-side global state
  - Lightweight and performant
  - Simple API
  - TypeScript support

### Additional Libraries
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form handling with Zod validation
- **Next-Auth/Auth.js** - Authentication on frontend
- **date-fns** - Date manipulation
- **Lucide React** - Icon library
- **React Virtuoso** - Infinite scroll for content feed

### Build Tools
- **Turbopack** (Next.js default)
- **ESLint** + **Prettier** for code quality
- **Husky** for git hooks

---

## 2. Backend Architecture

### Core Framework
- **Node.js** with **Express.js** or **Fastify**
  - RESTful API design
  - Alternative: **NestJS** for enterprise-grade structure

### Database Layer

#### Primary Database: PostgreSQL
- ACID compliance for user data and transactional integrity
- Full-text search capabilities
- JSON support for flexible content metadata

#### Caching Layer: Redis
- Session storage
- Rate limiting
- Content feed caching
- Real-time recommendation scores

#### Search Engine: Elasticsearch (Optional)
- Advanced content search
- Full-text search across articles
- Aggregations for analytics

### Database Schema

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- User Preferences Table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_frequency VARCHAR(50) DEFAULT 'daily', -- daily, twice_daily, custom
    preferred_content_types JSONB DEFAULT '["video", "article", "paper", "blog"]',
    notification_enabled BOOLEAN DEFAULT TRUE,
    email_digest BOOLEAN DEFAULT TRUE,
    theme VARCHAR(20) DEFAULT 'light', -- light, dark, auto
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Categories (Many-to-Many)
CREATE TABLE user_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 5, -- 1-10, higher = more important
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id)
);

CREATE INDEX idx_user_categories_user ON user_categories(user_id);
CREATE INDEX idx_user_categories_priority ON user_categories(priority DESC);

-- Content Table
CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(255), -- YouTube video ID, arXiv ID, etc.
    content_type VARCHAR(50) NOT NULL, -- video, article, paper, blog
    source VARCHAR(100) NOT NULL, -- youtube, arxiv, medium, etc.
    category_id UUID REFERENCES categories(id),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    author VARCHAR(255),
    published_at TIMESTAMP,
    duration INTEGER, -- in seconds for videos
    word_count INTEGER, -- for articles/papers
    language VARCHAR(10) DEFAULT 'en',
    metadata JSONB, -- source-specific data
    quality_score DECIMAL(3,2), -- 0.00-1.00
    popularity_score DECIMAL(10,2), -- based on views, citations, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(external_id, source)
);

CREATE INDEX idx_content_category ON content(category_id);
CREATE INDEX idx_content_type ON content(content_type);
CREATE INDEX idx_content_published ON content(published_at DESC);
CREATE INDEX idx_content_quality ON content(quality_score DESC);
CREATE INDEX idx_content_source ON content(source);

-- Content Tags (for better categorization)
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE content_tags (
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, tag_id)
);

CREATE INDEX idx_content_tags_content ON content_tags(content_id);
CREATE INDEX idx_content_tags_tag ON content_tags(tag_id);

-- User Content Interaction Table
CREATE TABLE user_content_interaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'unread', -- unread, read, saved, dismissed
    read_at TIMESTAMP,
    read_progress DECIMAL(3,2) DEFAULT 0.00, -- 0.00-1.00 (percentage)
    time_spent INTEGER, -- seconds spent on content
    rating INTEGER, -- 1-5 stars (optional)
    is_saved BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, content_id)
);

CREATE INDEX idx_interaction_user ON user_content_interaction(user_id);
CREATE INDEX idx_interaction_status ON user_content_interaction(status);
CREATE INDEX idx_interaction_read_at ON user_content_interaction(read_at DESC);

-- Daily Feed Table (Pre-computed personalized feeds)
CREATE TABLE daily_feeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    feed_date DATE NOT NULL,
    recommendation_score DECIMAL(5,2), -- 0.00-100.00
    position INTEGER, -- order in feed
    reason TEXT, -- why this was recommended
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, content_id, feed_date)
);

CREATE INDEX idx_daily_feed_user_date ON daily_feeds(user_id, feed_date DESC);
CREATE INDEX idx_daily_feed_score ON daily_feeds(recommendation_score DESC);

-- Content Sources (for n8n integration)
CREATE TABLE content_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- youtube_channel, rss_feed, api, etc.
    category_id UUID REFERENCES categories(id),
    source_url TEXT NOT NULL,
    api_key_encrypted TEXT,
    fetch_frequency VARCHAR(50) DEFAULT 'daily', -- hourly, daily, weekly
    is_active BOOLEAN DEFAULT TRUE,
    last_fetched_at TIMESTAMP,
    config JSONB, -- source-specific configuration
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_sources_active ON content_sources(is_active);
CREATE INDEX idx_content_sources_category ON content_sources(category_id);

-- User Activity Log (for recommendation engine)
CREATE TABLE user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- view, click, read, save, rate, etc.
    entity_type VARCHAR(50), -- content, category, tag
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_log_user ON user_activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_log_type ON user_activity_log(activity_type);

-- Refresh Tokens (for JWT authentication)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
```

### API Structure

```
/api
├── /auth
│   ├── POST   /register          # User registration
│   ├── POST   /login             # User login
│   ├── POST   /logout            # User logout
│   ├── POST   /refresh           # Refresh access token
│   ├── POST   /verify-email      # Email verification
│   └── POST   /reset-password    # Password reset
│
├── /users
│   ├── GET    /me                # Get current user profile
│   ├── PATCH  /me                # Update user profile
│   ├── DELETE /me                # Delete account
│   └── GET    /me/stats          # User statistics
│
├── /preferences
│   ├── GET    /                  # Get user preferences
│   └── PATCH  /                  # Update preferences
│
├── /categories
│   ├── GET    /                  # List all categories
│   ├── GET    /:id               # Get category details
│   ├── POST   /                  # Create custom category (admin)
│   └── GET    /user              # Get user's categories with priorities
│
├── /user-categories
│   ├── GET    /                  # Get user's category subscriptions
│   ├── POST   /                  # Subscribe to category
│   ├── PATCH  /:id               # Update category priority
│   └── DELETE /:id               # Unsubscribe from category
│
├── /content
│   ├── GET    /                  # List content (filtered, paginated)
│   ├── GET    /:id               # Get content details
│   ├── GET    /search            # Search content
│   └── GET    /trending          # Get trending content
│
├── /feed
│   ├── GET    /                  # Get personalized daily feed
│   ├── GET    /today             # Today's feed
│   ├── GET    /history           # Past feeds
│   └── POST   /refresh           # Trigger feed regeneration
│
├── /interactions
│   ├── POST   /                  # Create/update interaction
│   ├── PATCH  /:id/status        # Update read status
│   ├── POST   /:id/progress      # Update read progress
│   ├── POST   /:id/save          # Save content
│   ├── POST   /:id/rate          # Rate content
│   └── GET    /saved             # Get saved content
│
├── /recommendations
│   ├── GET    /                  # Get recommendations
│   └── POST   /feedback          # Submit feedback on recommendation
│
├── /sources (admin)
│   ├── GET    /                  # List content sources
│   ├── POST   /                  # Add new source
│   ├── PATCH  /:id               # Update source
│   ├── DELETE /:id               # Remove source
│   └── POST   /:id/fetch         # Trigger manual fetch
│
└── /webhooks
    └── POST   /n8n               # Webhook for n8n content updates
```

---

## 3. n8n Workflow Design for Content Aggregation

### Workflow Architecture

n8n will handle automated content discovery, fetching, processing, and curation. Below are the key workflows:

#### Workflow 1: YouTube Content Aggregator

```
┌─────────────────┐
│   Schedule      │ (Daily at 6 AM)
│   Trigger       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Get User       │
│  Categories     │ (Query PostgreSQL)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Loop Through   │
│  Active Sources │ (YouTube channels/keywords)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  YouTube API    │
│  Search/Channel │ (Fetch latest videos)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Filter &       │
│  Deduplicate    │ (Check existing content)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  OpenAI API     │
│  Content Quality│ (Analyze transcript/description)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Calculate      │
│  Quality Score  │ (Based on relevance, views, etc.)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Insert to DB   │
│  (PostgreSQL)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Webhook to     │
│  Backend API    │ (Trigger recommendation update)
└─────────────────┘
```

**n8n Nodes Configuration:**
- **Schedule Trigger**: Cron: `0 6 * * *` (6 AM daily)
- **PostgreSQL Node**: Query active content sources filtered by YouTube
- **HTTP Request Node**: YouTube Data API v3
  - Endpoint: `GET https://www.googleapis.com/youtube/v3/search`
  - Endpoint: `GET https://www.googleapis.com/youtube/v3/videos`
- **Function Node**: Deduplication logic
- **OpenAI Node**: GPT-4 for content analysis and quality scoring
- **PostgreSQL Node**: Batch insert new content
- **HTTP Request Node**: POST to `/api/webhooks/n8n` with new content IDs

#### Workflow 2: Research Papers Aggregator (arXiv)

```
┌─────────────────┐
│   Schedule      │ (Daily at 7 AM)
│   Trigger       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Get Research   │
│  Categories     │ (Astronomy, Software, etc.)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  arXiv API      │
│  Query          │ (Fetch recent papers)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Parse XML      │
│  Response       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Filter by      │
│  Date & Topic   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  OpenAI API     │
│  Abstract       │ (Analyze relevance & complexity)
│  Analysis       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Insert to DB   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Notify Backend │
└─────────────────┘
```

**arXiv Categories:**
- `astro-ph.*` - Astronomy & Astrophysics
- `cs.*` - Computer Science
- `physics.geo-ph` - Geophysics
- Custom search queries for other topics

#### Workflow 3: RSS Feed Aggregator (Blogs & News)

```
┌─────────────────┐
│   Schedule      │ (Every 6 hours)
│   Trigger       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Get RSS        │
│  Feed Sources   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  RSS Feed Read  │
│  Node           │ (Parse RSS/Atom feeds)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Extract        │
│  Metadata       │ (Title, author, content, etc.)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Readability    │
│  API            │ (Extract clean article content)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  OpenAI API     │
│  Summarize &    │ (Generate summary, categorize)
│  Categorize     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Insert to DB   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Notify Backend │
└─────────────────┘
```

**RSS Sources Examples:**
- Astronomy: NASA Blog, Space.com
- Geopolitics: The Diplomat, Foreign Affairs
- History: HistoryNet, Smithsonian
- Geography: National Geographic
- Software: Dev.to, Hacker News (via RSS)

#### Workflow 4: Content Quality & Tagging Enhancement

```
┌─────────────────┐
│   Webhook       │
│   Trigger       │ (When new content added)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fetch Content  │
│  Details        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  OpenAI API     │
│  GPT-4          │ (Extract topics, generate tags)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Update Content │
│  with Tags      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Calculate      │
│  Popularity     │ (Fetch view counts, citations)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Update DB      │
└─────────────────┘
```

#### Workflow 5: Daily Feed Generator

```
┌─────────────────┐
│   Schedule      │ (Daily at 5 AM)
│   Trigger       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Get All Active │
│  Users          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Loop Through   │
│  Users          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HTTP Request   │
│  to Backend     │ (POST /api/feed/generate/{userId})
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Log Results    │
└─────────────────┘
```

### n8n Environment Configuration

```json
{
  "variables": {
    "POSTGRES_HOST": "your-db-host",
    "POSTGRES_DB": "content_aggregator",
    "POSTGRES_USER": "n8n_user",
    "POSTGRES_PASSWORD": "encrypted",
    "YOUTUBE_API_KEY": "encrypted",
    "OPENAI_API_KEY": "encrypted",
    "BACKEND_API_URL": "https://api.yourdomain.com",
    "BACKEND_API_KEY": "encrypted",
    "REDIS_URL": "redis://localhost:6379"
  }
}
```

### n8n Best Practices
1. **Error Handling**: Add error workflows with Slack/email notifications
2. **Rate Limiting**: Respect API rate limits (YouTube: 10,000 units/day)
3. **Monitoring**: Log all workflow executions to database
4. **Retry Logic**: Configure retry on failure for API calls
5. **Data Validation**: Validate all data before database insertion
6. **Credentials**: Use n8n credential system, never hardcode

---

## 4. Authentication Flow

### JWT-Based Authentication

```
┌─────────────┐                    ┌─────────────┐
│   Client    │                    │   Backend   │
│  (Next.js)  │                    │   (API)     │
└──────┬──────┘                    └──────┬──────┘
       │                                   │
       │  1. POST /api/auth/register      │
       │  (email, password, name)         │
       ├──────────────────────────────────>│
       │                                   │
       │  2. Hash password (bcrypt)       │
       │     Create user in DB            │
       │     Send verification email      │
       │                                   │
       │  3. Return user data (no token)  │
       │<──────────────────────────────────┤
       │                                   │
       │  4. POST /api/auth/verify-email  │
       │  (token from email)              │
       ├──────────────────────────────────>│
       │                                   │
       │  5. Mark email as verified       │
       │                                   │
       │  6. Success response             │
       │<──────────────────────────────────┤
       │                                   │
       │  7. POST /api/auth/login         │
       │  (email, password)               │
       ├──────────────────────────────────>│
       │                                   │
       │  8. Verify password              │
       │     Generate access token (15min)│
       │     Generate refresh token (7d)  │
       │     Store refresh token in DB    │
       │                                   │
       │  9. Return tokens + user data    │
       │<──────────────────────────────────┤
       │                                   │
       │  10. Store tokens                │
       │      Access: Memory              │
       │      Refresh: httpOnly cookie    │
       │                                   │
       │  11. Authenticated requests      │
       │  Authorization: Bearer {token}   │
       ├──────────────────────────────────>│
       │                                   │
       │  12. Verify JWT signature        │
       │      Check expiration            │
       │      Extract user ID             │
       │                                   │
       │  13. Return requested data       │
       │<──────────────────────────────────┤
       │                                   │
       │  14. POST /api/auth/refresh      │
       │  (when access token expires)     │
       ├──────────────────────────────────>│
       │                                   │
       │  15. Verify refresh token        │
       │      Check if revoked            │
       │      Generate new access token   │
       │                                   │
       │  16. Return new access token     │
       │<──────────────────────────────────┤
       │                                   │
       │  17. POST /api/auth/logout       │
       ├──────────────────────────────────>│
       │                                   │
       │  18. Revoke refresh token        │
       │      Clear cookie                │
       │                                   │
       │  19. Success response            │
       │<──────────────────────────────────┤
       │                                   │
```

### Token Structure

**Access Token (JWT):**
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "iat": 1699123456,
    "exp": 1699124356,
    "type": "access"
  }
}
```

**Refresh Token (JWT):**
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_uuid",
    "jti": "token_uuid",
    "iat": 1699123456,
    "exp": 1699728256,
    "type": "refresh"
  }
}
```

### Frontend Authentication Implementation (Next.js)

```typescript
// lib/auth.ts
export const authService = {
  async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include' // Include cookies
    });

    const data = await response.json();
    // Store access token in memory (Zustand store)
    // Refresh token automatically stored in httpOnly cookie
    return data;
  },

  async refreshToken() {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });
    return response.json();
  },

  async logout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    // Clear local state
  }
};
```

### Security Measures

1. **Password Security**
   - bcrypt hashing with salt rounds: 12
   - Minimum password requirements: 8 chars, 1 uppercase, 1 number, 1 special

2. **Token Security**
   - Access tokens: Short-lived (15 minutes)
   - Refresh tokens: Longer-lived (7 days), httpOnly cookies
   - Refresh token rotation: Issue new refresh token on use
   - Token revocation: Blacklist in Redis

3. **API Security**
   - Rate limiting: 100 requests per 15 minutes per IP
   - CORS: Whitelist frontend domain
   - Helmet.js: Security headers
   - Input validation: Joi/Zod schemas

4. **Additional Measures**
   - HTTPS only in production
   - CSRF protection for state-changing operations
   - Account lockout after 5 failed login attempts
   - Email verification required before full access
   - Optional: 2FA with TOTP (future enhancement)

---

## 5. Data Models

### TypeScript Interfaces

```typescript
// types/user.ts
export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  isActive: boolean;
}

export interface UserPreferences {
  id: string;
  userId: string;
  contentFrequency: 'daily' | 'twice_daily' | 'custom';
  preferredContentTypes: ContentType[];
  notificationEnabled: boolean;
  emailDigest: boolean;
  theme: 'light' | 'dark' | 'auto';
  createdAt: Date;
  updatedAt: Date;
}

// types/category.ts
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  isDefault: boolean;
  createdAt: Date;
}

export interface UserCategory {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  priority: number; // 1-10
  isActive: boolean;
  createdAt: Date;
}

// types/content.ts
export type ContentType = 'video' | 'article' | 'paper' | 'blog';
export type ContentSource = 'youtube' | 'arxiv' | 'medium' | 'rss' | 'substack';

export interface Content {
  id: string;
  externalId: string | null;
  contentType: ContentType;
  source: ContentSource;
  categoryId: string;
  category?: Category;
  title: string;
  description: string | null;
  url: string;
  thumbnailUrl: string | null;
  author: string | null;
  publishedAt: Date | null;
  duration: number | null; // seconds
  wordCount: number | null;
  language: string;
  metadata: Record<string, any>;
  qualityScore: number; // 0-1
  popularityScore: number;
  tags?: Tag[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface ContentTag {
  contentId: string;
  tagId: string;
}

// types/interaction.ts
export type InteractionStatus = 'unread' | 'read' | 'saved' | 'dismissed';

export interface UserContentInteraction {
  id: string;
  userId: string;
  contentId: string;
  content?: Content;
  status: InteractionStatus;
  readAt: Date | null;
  readProgress: number; // 0-1
  timeSpent: number | null; // seconds
  rating: number | null; // 1-5
  isSaved: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// types/feed.ts
export interface DailyFeed {
  id: string;
  userId: string;
  contentId: string;
  content?: Content;
  feedDate: Date;
  recommendationScore: number; // 0-100
  position: number;
  reason: string | null;
  createdAt: Date;
}

export interface FeedItem extends Content {
  recommendationScore: number;
  recommendationReason: string | null;
  userInteraction?: UserContentInteraction;
}

// types/source.ts
export interface ContentSource {
  id: string;
  name: string;
  sourceType: 'youtube_channel' | 'youtube_search' | 'rss_feed' | 'api' | 'manual';
  categoryId: string;
  category?: Category;
  sourceUrl: string;
  apiKeyEncrypted: string | null;
  fetchFrequency: 'hourly' | 'daily' | 'weekly';
  isActive: boolean;
  lastFetchedAt: Date | null;
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// types/activity.ts
export type ActivityType =
  | 'view'
  | 'click'
  | 'read'
  | 'save'
  | 'rate'
  | 'search'
  | 'filter'
  | 'dismiss';

export interface UserActivityLog {
  id: string;
  userId: string;
  activityType: ActivityType;
  entityType: 'content' | 'category' | 'tag' | null;
  entityId: string | null;
  metadata: Record<string, any>;
  createdAt: Date;
}
```

### API Response Types

```typescript
// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ContentFilters extends PaginationParams {
  categoryId?: string;
  contentType?: ContentType;
  source?: ContentSource;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  tags?: string[];
}

export interface FeedResponse {
  date: Date;
  items: FeedItem[];
  stats: {
    total: number;
    unread: number;
    read: number;
    saved: number;
  };
}
```

---

## 6. Content Recommendation Engine

### Recommendation Algorithm

The recommendation engine uses a hybrid approach combining:

1. **Collaborative Filtering**: Users with similar reading patterns
2. **Content-Based Filtering**: Based on user's category preferences and interaction history
3. **Popularity-Based**: Trending content in user's categories
4. **Diversity**: Ensure variety in content types and topics

### Scoring Formula

```
Final Score =
  (0.30 × Category Match Score) +
  (0.25 × User History Score) +
  (0.20 × Content Quality Score) +
  (0.15 × Recency Score) +
  (0.10 × Popularity Score)
```

**Component Breakdown:**

1. **Category Match Score** (0-100)
   ```
   Score = Σ(category_priority × category_match) / total_priorities
   ```

2. **User History Score** (0-100)
   - Tags from previously read content: +20 points per matching tag
   - Similar authors: +15 points
   - Similar content type preference: +10 points
   - Time of day preference: +5 points

3. **Content Quality Score** (0-100)
   - Normalized quality_score from database (0-1) × 100

4. **Recency Score** (0-100)
   ```
   Score = 100 × e^(-days_old / 7)
   ```
   - Exponential decay, half-life of 7 days

5. **Popularity Score** (0-100)
   - Normalized popularity_score from database

### Implementation Approach

**Backend Service (Node.js):**

```typescript
// services/recommendationService.ts
export class RecommendationService {
  async generateDailyFeed(userId: string, date: Date): Promise<FeedItem[]> {
    // 1. Get user preferences and categories
    const userCategories = await this.getUserCategories(userId);
    const userHistory = await this.getUserHistory(userId, 30); // last 30 days

    // 2. Get candidate content (last 7 days, unread)
    const candidates = await this.getCandidateContent(
      userCategories.map(c => c.categoryId),
      date,
      7
    );

    // 3. Score each candidate
    const scoredContent = await Promise.all(
      candidates.map(content => this.scoreContent(content, userCategories, userHistory))
    );

    // 4. Apply diversity filter
    const diversified = this.ensureDiversity(scoredContent);

    // 5. Sort by score and take top N (e.g., 20 items)
    const topContent = diversified
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    // 6. Save to daily_feeds table
    await this.saveDailyFeed(userId, date, topContent);

    return topContent;
  }

  private async scoreContent(
    content: Content,
    userCategories: UserCategory[],
    userHistory: UserContentInteraction[]
  ): Promise<ScoredContent> {
    const categoryScore = this.calculateCategoryScore(content, userCategories);
    const historyScore = this.calculateHistoryScore(content, userHistory);
    const qualityScore = content.qualityScore * 100;
    const recencyScore = this.calculateRecencyScore(content.publishedAt);
    const popularityScore = this.normalizePopularity(content.popularityScore);

    const finalScore =
      0.30 * categoryScore +
      0.25 * historyScore +
      0.20 * qualityScore +
      0.15 * recencyScore +
      0.10 * popularityScore;

    return {
      ...content,
      score: finalScore,
      reason: this.generateReason(categoryScore, historyScore, qualityScore)
    };
  }

  private ensureDiversity(items: ScoredContent[]): ScoredContent[] {
    // Ensure mix of content types
    const result: ScoredContent[] = [];
    const typeCount: Record<ContentType, number> = {
      video: 0,
      article: 0,
      paper: 0,
      blog: 0
    };
    const maxPerType = 8;

    // First pass: take highest scored items with diversity constraint
    for (const item of items.sort((a, b) => b.score - a.score)) {
      if (typeCount[item.contentType] < maxPerType) {
        result.push(item);
        typeCount[item.contentType]++;
      }
    }

    return result;
  }
}
```

### Real-Time Adjustments

- **User Feedback Loop**: When user rates content, update recommendation weights
- **A/B Testing**: Test different scoring formulas for optimization
- **Cold Start Problem**: For new users, use popularity-based recommendations
- **Redis Caching**: Cache recommendation scores for 24 hours

---

## 7. Integration Points Between Components

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Next.js Frontend (Port 3000)                    │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │   Feed   │  │  Explore │  │ Settings │  │  Profile │   │ │
│  │  │   Page   │  │   Page   │  │   Page   │  │   Page   │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  │                                                              │ │
│  │  React Query (Caching) + Zustand (State)                   │ │
│  └─────────────────────┬────────────────────────────────────────┘ │
│                        │                                          │
└────────────────────────┼──────────────────────────────────────────┘
                         │ HTTPS/REST API
                         │
┌────────────────────────▼──────────────────────────────────────────┐
│                    BACKEND SERVICES                               │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │         Express.js API Server (Port 4000)                    │ │
│  │                                                              │ │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────────────┐ │ │
│  │  │    Auth    │  │   Content    │  │   Recommendation   │ │ │
│  │  │  Service   │  │   Service    │  │      Engine        │ │ │
│  │  └────────────┘  └──────────────┘  └────────────────────┘ │ │
│  │                                                              │ │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────────────┐ │ │
│  │  │   User     │  │     Feed     │  │    Interaction     │ │ │
│  │  │  Service   │  │   Service    │  │      Service       │ │ │
│  │  └────────────┘  └──────────────┘  └────────────────────┘ │ │
│  └──────────────┬───────────────┬───────────────┬─────────────┘ │
│                 │               │               │               │
└─────────────────┼───────────────┼───────────────┼───────────────┘
                  │               │               │
    ┌─────────────▼───────┐  ┌────▼────────┐  ┌──▼──────────┐
    │   PostgreSQL        │  │    Redis    │  │ Elasticsearch│
    │   (Port 5432)       │  │ (Port 6379) │  │  (Port 9200) │
    │                     │  │             │  │   (Optional) │
    │ • Users             │  │ • Sessions  │  │              │
    │ • Content           │  │ • Cache     │  │ • Full-text  │
    │ • Interactions      │  │ • Rate Limit│  │   Search     │
    │ • Categories        │  │ • Job Queue │  │              │
    └─────────────────────┘  └─────────────┘  └──────────────┘
                  ▲
                  │
┌─────────────────┴─────────────────────────────────────────────────┐
│                    CONTENT AGGREGATION LAYER                      │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                 n8n (Port 5678)                              │ │
│  │                                                              │ │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────────────┐ │ │
│  │  │  YouTube   │  │    arXiv     │  │    RSS Feeds       │ │ │
│  │  │ Aggregator │  │  Aggregator  │  │   Aggregator       │ │ │
│  │  └────────────┘  └──────────────┘  └────────────────────┘ │ │
│  │                                                              │ │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────────────┐ │ │
│  │  │  Content   │  │     Feed     │  │    Webhook         │ │ │
│  │  │  Quality   │  │  Generator   │  │    Handler         │ │ │
│  │  └────────────┘  └──────────────┘  └────────────────────┘ │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                              │                                    │
└──────────────────────────────┼────────────────────────────────────┘
                               │
                               │ API Calls
                               ▼
        ┌──────────────────────────────────────────┐
        │       External APIs                      │
        │                                          │
        │  • YouTube Data API v3                  │
        │  • arXiv API                            │
        │  • OpenAI API (GPT-4)                   │
        │  • Various RSS Feeds                    │
        │  • Mercury Parser / Readability         │
        └──────────────────────────────────────────┘
```

### Integration Flow Details

#### 1. User Authentication Flow
```
Frontend → Backend API (/api/auth/login)
         ↓
Backend → PostgreSQL (verify credentials)
         ↓
Backend → Redis (store session)
         ↓
Backend → Frontend (return JWT tokens)
         ↓
Frontend → Store in memory + httpOnly cookie
```

#### 2. Daily Feed Generation Flow
```
n8n Scheduler (5 AM daily)
         ↓
n8n → PostgreSQL (get active users)
         ↓
n8n → Loop through users
         ↓
n8n → Backend API (POST /api/feed/generate/{userId})
         ↓
Backend → PostgreSQL (get user preferences, history)
         ↓
Backend → PostgreSQL (get candidate content)
         ↓
Backend → Recommendation Engine (score content)
         ↓
Backend → PostgreSQL (insert daily_feeds records)
         ↓
Backend → Redis (cache feed for quick access)
         ↓
Backend → n8n (return success)
```

#### 3. Content Aggregation Flow
```
n8n Scheduler (periodic)
         ↓
n8n → External API (YouTube/arXiv/RSS)
         ↓
n8n → OpenAI API (analyze & score content)
         ↓
n8n → PostgreSQL (insert new content)
         ↓
n8n → Backend Webhook (/api/webhooks/n8n)
         ↓
Backend → Trigger recommendation update
         ↓
Backend → Redis (invalidate relevant caches)
```

#### 4. User Interaction Flow
```
Frontend (user reads content)
         ↓
Frontend → Backend API (POST /api/interactions)
         ↓
Backend → PostgreSQL (insert/update interaction)
         ↓
Backend → Redis (update user activity stream)
         ↓
Backend → UserActivityLog table (for recommendations)
         ↓
Backend → Frontend (return updated status)
         ↓
Frontend → React Query (update cache)
         ↓
Frontend → UI update (mark as read)
```

#### 5. Real-Time Content Search Flow
```
Frontend (user searches)
         ↓
Frontend → Backend API (GET /api/content/search?q=...)
         ↓
Backend → Check Redis cache
         ↓
Cache Miss → Elasticsearch (if available) OR PostgreSQL full-text search
         ↓
Backend → Redis (cache results for 1 hour)
         ↓
Backend → Frontend (return results)
```

### API Integration Configuration

**Frontend Environment Variables (.env.local):**
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
NEXT_PUBLIC_ENV=production
```

**Backend Environment Variables (.env):**
```bash
# Server
NODE_ENV=production
PORT=4000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/content_aggregator
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=content_aggregator
POSTGRES_USER=api_user
POSTGRES_PASSWORD=secure_password

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=secure_password

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# External APIs
YOUTUBE_API_KEY=your-youtube-api-key
OPENAI_API_KEY=your-openai-api-key

# n8n
N8N_WEBHOOK_SECRET=shared-secret-with-n8n
N8N_API_URL=http://localhost:5678

# Email (for verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# CORS
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**n8n Environment Variables:**
```bash
N8N_PORT=5678
N8N_PROTOCOL=https
N8N_HOST=n8n.yourdomain.com

# Database (n8n internal)
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=localhost
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n_user
DB_POSTGRESDB_PASSWORD=secure_password

# Execution
EXECUTIONS_MODE=regular
EXECUTIONS_TIMEOUT=300
EXECUTIONS_TIMEOUT_MAX=3600

# Encryption
N8N_ENCRYPTION_KEY=your-encryption-key

# Webhook
WEBHOOK_URL=https://n8n.yourdomain.com/
```

---

## 8. Deployment Architecture

### Production Deployment Diagram

```
                        ┌─────────────────┐
                        │   CloudFlare    │
                        │   CDN + DDoS    │
                        └────────┬────────┘
                                 │
                ┌────────────────┴────────────────┐
                │                                 │
         ┌──────▼──────┐                  ┌──────▼──────┐
         │   Vercel    │                  │   Railway   │
         │  (Frontend) │                  │  (Backend)  │
         │             │                  │             │
         │  Next.js    │◄─────API────────►│  Express.js │
         │  SSR/SSG    │                  │    API      │
         └─────────────┘                  └──────┬──────┘
                                                 │
                        ┌────────────────────────┼────────────────┐
                        │                        │                │
                 ┌──────▼──────┐          ┌──────▼──────┐  ┌─────▼─────┐
                 │  PostgreSQL │          │    Redis    │  │    n8n    │
                 │   (Supabase │          │   (Upstash  │  │  (Railway │
                 │   or Railway)│          │   or Railway)│  │  or Self- │
                 │             │          │             │  │  hosted)  │
                 └─────────────┘          └─────────────┘  └───────────┘
```

### Recommended Hosting

1. **Frontend**: Vercel (optimized for Next.js)
2. **Backend API**: Railway, Render, or DigitalOcean App Platform
3. **Database**: Supabase (PostgreSQL) or Railway
4. **Redis**: Upstash (serverless) or Railway
5. **n8n**: Self-hosted on Railway or DigitalOcean Droplet
6. **CDN**: CloudFlare for static assets

### Scaling Considerations

1. **Horizontal Scaling**
   - Load balancer for API servers
   - Read replicas for PostgreSQL
   - Redis cluster for high availability

2. **Caching Strategy**
   - CDN for static assets (images, thumbnails)
   - Redis for API responses
   - Next.js ISR for semi-static pages

3. **Database Optimization**
   - Indexed columns (see schema)
   - Connection pooling (PgBouncer)
   - Regular VACUUM and ANALYZE

4. **Monitoring**
   - Sentry for error tracking
   - DataDog or New Relic for APM
   - Grafana + Prometheus for metrics

---

## 9. Development Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] Set up development environment
- [ ] Initialize Next.js frontend with shadcn/ui
- [ ] Set up Express.js backend with TypeScript
- [ ] Configure PostgreSQL database and run migrations
- [ ] Implement basic authentication (register, login, logout)
- [ ] Create user dashboard layout

### Phase 2: Content Aggregation (Weeks 5-8)
- [ ] Set up n8n instance
- [ ] Build YouTube content aggregator workflow
- [ ] Build arXiv research paper aggregator
- [ ] Build RSS feed aggregator
- [ ] Implement content quality scoring with OpenAI
- [ ] Create content management API endpoints

### Phase 3: Personalization (Weeks 9-12)
- [ ] Build user preference management UI
- [ ] Implement category subscription system
- [ ] Develop recommendation engine
- [ ] Create daily feed generation workflow
- [ ] Build personalized feed UI

### Phase 4: Interactions & Tracking (Weeks 13-15)
- [ ] Implement read/unread tracking
- [ ] Build content reading interface
- [ ] Add save/bookmark functionality
- [ ] Create reading progress tracking
- [ ] Implement rating system

### Phase 5: Polish & Launch (Weeks 16-18)
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] User onboarding flow
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Testing and bug fixes
- [ ] Production deployment

---

## 10. Technology Stack Summary

### Frontend
- **Framework**: Next.js 14+ (React 18+, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React Query + Zustand
- **Forms**: React Hook Form + Zod
- **Auth**: NextAuth.js
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js or Fastify
- **Language**: TypeScript
- **ORM**: Prisma or Drizzle
- **Validation**: Zod
- **Auth**: JWT (jsonwebtoken)

### Database & Cache
- **Primary DB**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Search**: Elasticsearch 8+ (optional)

### Automation
- **Workflow**: n8n (self-hosted)
- **Cron Jobs**: n8n scheduler

### External Services
- **YouTube**: YouTube Data API v3
- **AI**: OpenAI GPT-4 API
- **Email**: SendGrid or AWS SES
- **Storage**: AWS S3 or CloudFlare R2 (for user uploads)

### DevOps
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel (frontend) + Railway (backend)
- **Monitoring**: Sentry + Grafana
- **Logs**: Better Stack or Loki

---

## 11. Security Considerations

### Data Protection
1. **Encryption at Rest**: Database encryption enabled
2. **Encryption in Transit**: TLS 1.3 for all connections
3. **API Keys**: Stored encrypted in database (AES-256)
4. **Secrets Management**: Use environment variables, never commit secrets

### Authentication & Authorization
1. **Password Policy**: Strong requirements enforced
2. **Token Security**: Short-lived access tokens, rotating refresh tokens
3. **Rate Limiting**: Prevent brute force attacks
4. **CSRF Protection**: For state-changing operations

### API Security
1. **Input Validation**: All inputs validated with Zod schemas
2. **SQL Injection Prevention**: Parameterized queries via ORM
3. **XSS Prevention**: Content sanitization
4. **CORS**: Strict origin policy

### Privacy
1. **GDPR Compliance**: User data export and deletion
2. **Cookie Consent**: Required for EU users
3. **Data Minimization**: Only collect necessary data
4. **Audit Logs**: Track sensitive operations

---

## 12. Testing Strategy

### Frontend Testing
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright or Cypress
- **Visual Tests**: Chromatic (optional)

### Backend Testing
- **Unit Tests**: Jest
- **Integration Tests**: Supertest
- **Load Tests**: k6 or Artillery

### n8n Testing
- **Workflow Tests**: n8n built-in test mode
- **Mock APIs**: Use HTTP Request node with mock data

---

## Conclusion

This architecture provides a scalable, maintainable foundation for your educational content aggregator platform. The modular design allows for incremental development and easy feature additions. The use of modern, proven technologies ensures long-term viability and community support.

Key strengths:
- **Professional UI**: shadcn/ui provides AirBnB/Stripe-level polish
- **Scalable Backend**: PostgreSQL + Redis + proper caching
- **Smart Automation**: n8n handles complex content aggregation
- **Personalization**: Sophisticated recommendation engine
- **Security**: JWT auth, encryption, rate limiting
- **Extensibility**: Easy to add new content sources and features

Next steps: Begin with Phase 1 (Foundation) and iterate based on user feedback.
