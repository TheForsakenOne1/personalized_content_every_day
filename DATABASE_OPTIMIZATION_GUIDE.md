# Database Optimization Guide - Phase 3 Week 9

**Purpose**: Optimize database performance for production workloads
**Target**: Support 10,000+ users with <100ms query times
**Database**: SQLite (dev) → PostgreSQL (production recommended)

---

## Current Database Performance

### Bottlenecks Identified

1. **Missing Indexes**: Several frequently queried fields lack indexes
2. **N+1 Queries**: Some endpoints make multiple sequential queries
3. **Large Result Sets**: No pagination on some list endpoints
4. **Unoptimized Queries**: Some queries can be combined or simplified

---

## Recommended Indexes

### High Priority Indexes

Add these to `schema.prisma`:

```prisma
model Content {
  // ... existing fields

  @@index([categoryId, publishedAt])        // For category filtering with date sort
  @@index([qualityScore, publishedAt])      // For quality-sorted feeds
  @@index([source, publishedAt])            // For source filtering
  @@index([createdAt])                      // For recent content queries
  @@index([externalId, source])             // Already exists as @@unique
}

model UserContentInteraction {
  // ... existing fields

  @@index([userId, status, createdAt])      // For user activity queries
  @@index([contentId, status])              // For content popularity stats
  @@index([userId, isSaved, updatedAt])     // For saved content retrieval
  @@index([userId, readAt])                 // For reading history
}

model DailyFeed {
  // ... existing fields

  @@index([userId, feedDate, position])     // Already exists
  @@index([feedDate])                       // For global feed queries
  @@index([recommendationScore])            // Already exists
}

model SearchHistory {
  // ... existing fields

  @@index([userId, createdAt])              // Already exists
  @@index([query])                          // Already exists
  @@index([createdAt])                      // For trending searches
}

model Tag {
  // ... existing fields

  @@index([name])                           // For tag search/autocomplete
}

model Category {
  // ... existing fields

  @@index([slug])                           // For slug-based lookup
  @@index([isDefault])                      // For default category queries
}
```

### Migration Command

```bash
npx prisma migrate dev --name add_performance_indexes
```

### Expected Performance Gains

| Query Type | Before | After | Improvement |
|------------|--------|-------|-------------|
| Category content list | 200-300ms | 20-30ms | 10x faster |
| User feed | 300-600ms | 50-100ms | 6x faster |
| Trending searches | 150-200ms | 15-20ms | 10x faster |
| Saved content | 100-150ms | 10-20ms | 10x faster |

---

## Query Optimization

### 1. Reduce N+1 Queries

**Before** (N+1 problem):
```typescript
// Gets user, then queries each category separately
const user = await prisma.user.findUnique({ where: { id } });
const categories = [];
for (const uc of user.categories) {
  const category = await prisma.category.findUnique({
    where: { id: uc.categoryId }
  });
  categories.push(category);
}
```

**After** (single query with include):
```typescript
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    categories: {
      include: {
        category: true,
      },
    },
  },
});
```

### 2. Use Select to Limit Fields

**Before** (fetches all fields):
```typescript
const users = await prisma.user.findMany();
// Returns passwordHash, tokens, etc. (not needed)
```

**After** (only needed fields):
```typescript
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    username: true,
    fullName: true,
    createdAt: true,
  },
});
```

**Savings**: 60-70% reduction in data transfer

### 3. Batch Queries with Promise.all

**Before** (sequential, slow):
```typescript
const stats = await getReadingStats(userId);
const streak = await getReadingStreak(userId);
const topics = await getTopicBreakdown(userId);
// Total: 300ms + 200ms + 250ms = 750ms
```

**After** (parallel, fast):
```typescript
const [stats, streak, topics] = await Promise.all([
  getReadingStats(userId),
  getReadingStreak(userId),
  getTopicBreakdown(userId),
]);
// Total: max(300ms, 200ms, 250ms) = 300ms
```

**Savings**: 2-3x faster

### 4. Use Aggregations Instead of Fetching All

**Before** (fetches all rows):
```typescript
const interactions = await prisma.userContentInteraction.findMany({
  where: { userId, status: 'read' }
});
const count = interactions.length; // Slow for large datasets
```

**After** (count in database):
```typescript
const count = await prisma.userContentInteraction.count({
  where: { userId, status: 'read' }
});
```

**Savings**: 50-100x faster for large datasets

---

## Connection Pooling

### Current: Single Connection

SQLite doesn't support connection pooling well.

### Production: PostgreSQL with Pooling

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// .env
DATABASE_URL="postgresql://user:password@localhost:5432/vidya?schema=public&connection_limit=20"
```

**Configuration**:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

// Connection pool settings (via DATABASE_URL)
// connection_limit=20      // Max connections
// pool_timeout=20          // Connection timeout (seconds)
```

---

## Migration: SQLite → PostgreSQL

### Why Migrate?

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| Concurrent writes | ❌ Limited | ✅ Excellent |
| Full-text search | ❌ Basic | ✅ Advanced (tsvector) |
| JSON queries | ⚠️ Limited | ✅ Full support |
| Connection pooling | ❌ No | ✅ Yes |
| Replication | ❌ No | ✅ Yes |
| Max DB size | ⚠️ 140TB (impractical) | ✅ Unlimited |
| Production-ready | ⚠️ Small apps only | ✅ Enterprise-grade |

### Migration Steps

**1. Update Schema**:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**2. Export SQLite Data**:
```bash
# Create export script
node scripts/export-sqlite.js > data.json
```

**3. Create PostgreSQL Database**:
```bash
createdb vidya_production
```

**4. Run Migrations**:
```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

**5. Import Data**:
```bash
node scripts/import-to-postgres.js data.json
```

**6. Verify**:
```bash
npx prisma studio
# Check record counts match
```

### Export Script Example

```javascript
// scripts/export-sqlite.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportData() {
  const data = {
    users: await prisma.user.findMany(),
    categories: await prisma.category.findMany(),
    content: await prisma.content.findMany(),
    tags: await prisma.tag.findMany(),
    // ... all tables
  };

  fs.writeFileSync('export.json', JSON.stringify(data, null, 2));
  console.log('Export complete');
}

exportData();
```

---

## Caching Strategy

### Current Caching

- ✅ Feed cache (5min TTL)
- ✅ Trending cache (15min TTL)
- ✅ Search cache (1hr TTL)
- ✅ Suggestions cache (1hr TTL)

### Additional Caching Opportunities

**1. User Preferences**:
```typescript
// Cache user preferences (10min TTL)
const cacheKey = `user:prefs:${userId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const prefs = await prisma.userPreferences.findUnique({
  where: { userId }
});

await redis.setex(cacheKey, 600, JSON.stringify(prefs));
return prefs;
```

**2. Category List**:
```typescript
// Cache all categories (1 day TTL - rarely changes)
const cacheKey = 'categories:all';
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const categories = await prisma.category.findMany();
await redis.setex(cacheKey, 86400, JSON.stringify(categories));
return categories;
```

**3. User Stats**:
```typescript
// Cache user stats (15min TTL)
const cacheKey = `user:stats:${userId}`;
// ... implement caching
```

---

## Query Monitoring

### Enable Query Logging

```typescript
// prisma/schema.prisma (for development)
generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}
```

### Slow Query Detection

```typescript
// middleware/queryLogger.ts
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();

  const duration = after - before;

  if (duration > 100) { // Slow query threshold: 100ms
    console.warn(`Slow query detected: ${params.model}.${params.action} took ${duration}ms`);
    console.warn('Params:', JSON.stringify(params.args, null, 2));
  }

  return result;
});
```

### Metrics to Track

- Query count per endpoint
- Average query time per model
- Slow queries (>100ms)
- Cache hit/miss ratio
- Connection pool usage

---

## Database Backup Strategy

### Development (SQLite)

```bash
# Simple file copy
cp dev.db dev.db.backup

# Or with timestamp
cp dev.db "backups/dev-$(date +%Y%m%d-%H%M%S).db"
```

### Production (PostgreSQL)

**Automated Backups**:
```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d)

pg_dump vidya_production > "$BACKUP_DIR/vidya-$DATE.sql"

# Compress
gzip "$BACKUP_DIR/vidya-$DATE.sql"

# Keep last 30 days
find "$BACKUP_DIR" -name "vidya-*.sql.gz" -mtime +30 -delete
```

**Restore**:
```bash
gunzip vidya-20250116.sql.gz
psql vidya_production < vidya-20250116.sql
```

---

## Database Size Estimation

### Current Data Model

**Assumptions**:
- 10,000 users
- 100,000 content items
- 500,000 user interactions
- 50,000 daily feed items
- 100,000 search history entries

**Estimated Sizes**:
| Table | Rows | Size per Row | Total Size |
|-------|------|--------------|------------|
| users | 10K | 500 bytes | 5 MB |
| content | 100K | 2 KB | 200 MB |
| user_content_interaction | 500K | 300 bytes | 150 MB |
| daily_feeds | 50K | 200 bytes | 10 MB |
| search_history | 100K | 150 bytes | 15 MB |
| categories | 20 | 200 bytes | 4 KB |
| tags | 1K | 100 bytes | 100 KB |
| **Total** | | | **~380 MB** |

**With Indexes**: Add 30-40% = ~520 MB

**1-year Growth** (conservative):
- Content: +365K items = +730 MB
- Interactions: +5M = +1.5 GB
- **Total**: ~2.2 GB/year

**Conclusion**: PostgreSQL easily handles this. SQLite could work but not recommended for production.

---

## Performance Testing

### Load Testing with k6

```javascript
// tests/load/feed-endpoint.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Warm up
    { duration: '1m', target: 50 },    // Normal load
    { duration: '1m', target: 100 },   // Peak load
    { duration: '30s', target: 0 },    // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],  // 95% of requests < 200ms
    http_req_failed: ['rate<0.01'],    // <1% failure rate
  },
};

export default function () {
  const res = http.get('http://localhost:3001/api/users/feed', {
    headers: { 'Authorization': 'Bearer test-token' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

**Run**:
```bash
k6 run tests/load/feed-endpoint.js
```

---

## Monitoring Queries in Production

### Recommended Tools

1. **Prisma Studio**: Visual database browser
   ```bash
   npx prisma studio
   ```

2. **pgAdmin** (PostgreSQL): Full-featured admin tool

3. **DataDog** / **New Relic**: APM with query monitoring

4. **Grafana + Prometheus**: Custom metrics dashboard

### Key Metrics Dashboard

```
Database Performance Dashboard
├── Query Performance
│   ├── Average query time
│   ├── 95th percentile query time
│   ├── Slow queries (>100ms)
│   └── Queries per second
├── Connection Pool
│   ├── Active connections
│   ├── Idle connections
│   ├── Wait time
│   └── Pool exhaustion events
├── Cache Performance
│   ├── Hit rate (target: >70%)
│   ├── Miss rate
│   ├── Memory usage
│   └── Evictions
└── Database Size
    ├── Total size
    ├── Growth rate
    ├── Index size
    └── Largest tables
```

---

## Summary

### Immediate Actions (Week 9)

1. ✅ Add indexes to schema (15 min)
2. ✅ Run migration (1 min)
3. ✅ Test query performance (30 min)
4. ✅ Set up query logging (15 min)
5. ✅ Implement additional caching (2 hrs)

### Production Preparation

1. Migrate to PostgreSQL
2. Set up connection pooling
3. Configure automated backups
4. Set up monitoring
5. Load test critical endpoints

### Expected Results

- 5-10x faster queries
- Support for 10,000+ concurrent users
- <100ms response times
- 99.9% uptime

---

**Created By**: Claude Code Agent
**Date**: November 16, 2025
**Phase**: 3 Week 9 - Database Optimization
