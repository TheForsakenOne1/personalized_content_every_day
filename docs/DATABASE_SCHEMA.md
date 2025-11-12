# Database Schema Documentation

## Overview

This document provides comprehensive documentation for the Educational Content Aggregator database schema. The schema is designed to support a personalized learning platform with content aggregation, user preferences, reading tracking, and intelligent recommendations.

## Database Design Principles

1. **Normalization**: 3NF compliance to reduce redundancy
2. **Performance**: Strategic indexing for common query patterns
3. **Scalability**: UUID primary keys for distributed systems
4. **Flexibility**: JSON columns for extensible metadata
5. **Data Integrity**: Foreign keys with CASCADE deletes
6. **Audit Trail**: Created/updated timestamps on all major tables

## Schema Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER LAYER                               │
│  ┌──────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │  users   │────│ user_preferences │    │refresh_tokens│  │
│  └──────────┘    └──────────────────┘    └──────────────┘  │
│       │                                                      │
└───────┼──────────────────────────────────────────────────────┘
        │
┌───────┼──────────────────────────────────────────────────────┐
│       │          CONTENT ORGANIZATION LAYER                  │
│       │                                                       │
│  ┌────▼────────┐    ┌────────────┐    ┌──────┐             │
│  │user_categories│──│ categories │    │ tags │             │
│  └─────────────┘    └────────────┘    └──────┘             │
│                            │              │                  │
└────────────────────────────┼──────────────┼──────────────────┘
                             │              │
┌────────────────────────────┼──────────────┼──────────────────┐
│                   CONTENT LAYER           │                  │
│                      ┌─────▼──────┐       │                  │
│  ┌───────────────┐  │  content   │◄──────┘                  │
│  │content_sources│  └────────────┘                           │
│  └───────────────┘       │   │                               │
│                          │   └──────┐                        │
└──────────────────────────┼──────────┼────────────────────────┘
                           │          │
┌──────────────────────────┼──────────┼────────────────────────┐
│              INTERACTION & TRACKING LAYER                    │
│                          │          │                        │
│  ┌──────────────────────▼┐    ┌────▼──────────┐             │
│  │user_content_interaction│    │content_tags  │             │
│  └───────────────────────┘    └───────────────┘             │
│           │                                                  │
│  ┌────────▼─────────┐                                       │
│  │user_activity_log │                                       │
│  └──────────────────┘                                       │
└──────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────────┐
│              RECOMMENDATION LAYER                            │
│                   ┌──────▼──────┐                            │
│                   │daily_feeds  │                            │
│                   └─────────────┘                            │
└──────────────────────────────────────────────────────────────┘
```

## Table Descriptions

### 1. User Management Tables

#### users
Primary table for user authentication and profiles.

**Key Columns:**
- `id` - UUID primary key
- `email` - Unique, validated email address
- `username` - Unique username (3-20 alphanumeric + underscore)
- `password_hash` - bcrypt hashed password (never store plain text)
- `email_verified` - Boolean flag for email verification
- `is_active` - Soft delete flag

**Constraints:**
- Email format validation regex
- Username format validation (alphanumeric + underscore, 3-20 chars)
- Unique constraints on email and username

**Sample Data:**
```sql
INSERT INTO users (email, username, password_hash, full_name) VALUES
('john@example.com', 'johndoe', '$2b$12$...', 'John Doe');
```

#### user_preferences
User-specific settings and preferences.

**Key Columns:**
- `content_frequency` - How often user wants content (daily, twice_daily, custom)
- `preferred_content_types` - JSON array of content types
- `notification_enabled` - Push notification toggle
- `email_digest` - Email summary toggle
- `theme` - UI theme preference

**Sample Data:**
```json
{
  "content_frequency": "daily",
  "preferred_content_types": ["video", "article", "paper"],
  "notification_enabled": true,
  "email_digest": true,
  "theme": "dark"
}
```

#### refresh_tokens
JWT refresh token storage for authentication.

**Key Columns:**
- `token_hash` - SHA-256 hash of refresh token
- `expires_at` - Token expiration timestamp
- `revoked_at` - NULL if active, timestamp if revoked

**Usage Pattern:**
- On login: Create new refresh token
- On logout: Set revoked_at
- On token refresh: Verify not revoked and not expired

---

### 2. Content Organization Tables

#### categories
Main topic categories for content classification.

**Default Categories:**
1. Astronomy
2. Geopolitics
3. History
4. Geography
5. Software
6. Science
7. Mathematics
8. Philosophy

**Key Columns:**
- `slug` - URL-friendly identifier
- `is_default` - Pre-installed category flag
- `icon` - Icon identifier for UI

**Sample Data:**
```sql
INSERT INTO categories (name, slug, description, icon, is_default) VALUES
('Astronomy', 'astronomy', 'Space, planets, stars, and the universe', 'telescope', TRUE);
```

#### user_categories
User's topic subscriptions with priority weighting.

**Key Columns:**
- `priority` - Integer 1-10 (higher = more important)
- `is_active` - Can be temporarily disabled

**Priority System:**
- 10 = Highest priority (top interests)
- 5 = Medium priority (default)
- 1 = Low priority (casual interest)

**Sample Data:**
```sql
-- User subscribes to Astronomy with high priority
INSERT INTO user_categories (user_id, category_id, priority, is_active)
VALUES ('user-uuid', 'astronomy-uuid', 9, TRUE);
```

#### tags
Flexible content tagging for detailed categorization.

**Default Tags:**
- beginner-friendly
- advanced
- tutorial
- research
- news
- analysis
- guide
- interview
- documentary
- lecture

**Use Cases:**
- Content filtering
- Recommendation refinement
- User preference learning

---

### 3. Content Tables

#### content
Main repository for all educational content.

**Content Types:**
- `video` - YouTube videos, educational clips
- `article` - Blog posts, web articles
- `paper` - Research papers (arXiv, etc.)
- `blog` - Blog entries

**Content Sources:**
- `youtube` - YouTube videos
- `arxiv` - Research papers
- `medium` - Medium articles
- `rss` - RSS feeds
- `substack` - Substack newsletters
- `manual` - Manually added

**Key Columns:**
- `external_id` - Source-specific ID (e.g., YouTube video ID)
- `quality_score` - AI-generated quality (0-1)
- `popularity_score` - Engagement metric
- `duration` - Video length in seconds
- `word_count` - Article/paper length
- `metadata` - JSON for source-specific data

**Metadata Examples:**

YouTube Video:
```json
{
  "video_id": "dQw4w9WgXcQ",
  "channel_id": "UCuAXFkgsw1L7xaCfnd5JJOw",
  "channel_name": "Example Channel",
  "view_count": 1000000,
  "like_count": 50000,
  "comment_count": 5000,
  "transcript_available": true
}
```

arXiv Paper:
```json
{
  "arxiv_id": "2301.12345",
  "categories": ["cs.AI", "cs.LG"],
  "pdf_url": "https://arxiv.org/pdf/2301.12345.pdf",
  "authors": ["Author One", "Author Two"],
  "citations": 42,
  "doi": "10.1234/arxiv.2301.12345"
}
```

RSS Article:
```json
{
  "feed_url": "https://example.com/feed",
  "original_url": "https://example.com/article",
  "read_time_minutes": 8,
  "featured_image": "https://example.com/image.jpg",
  "excerpt": "Article summary..."
}
```

**Sample Data:**
```sql
INSERT INTO content (
    external_id, content_type, source, category_id,
    title, description, url, thumbnail_url,
    author, published_at, duration, quality_score, metadata
) VALUES (
    'dQw4w9WgXcQ',
    'video',
    'youtube',
    'astronomy-uuid',
    'The Universe in 10 Minutes',
    'A comprehensive overview of our universe',
    'https://youtube.com/watch?v=dQw4w9WgXcQ',
    'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    'Science Explained',
    '2024-01-15 10:00:00',
    600,
    0.85,
    '{"channel_id": "UCxxx", "view_count": 500000}'::jsonb
);
```

#### content_tags
Many-to-many relationship between content and tags.

**Usage:**
```sql
-- Tag content as beginner-friendly tutorial
INSERT INTO content_tags (content_id, tag_id)
SELECT c.id, t.id
FROM content c, tags t
WHERE c.external_id = 'video-id'
  AND t.slug IN ('beginner-friendly', 'tutorial');
```

---

### 4. User Interaction Tables

#### user_content_interaction
Comprehensive tracking of user engagement with content.

**Status Values:**
- `unread` - In feed but not viewed
- `read` - Completed reading/viewing
- `saved` - Bookmarked for later
- `dismissed` - Explicitly hidden

**Key Columns:**
- `read_at` - Timestamp when marked as read
- `read_progress` - 0.00 to 1.00 (percentage completed)
- `time_spent` - Seconds spent on content
- `rating` - 1-5 stars (optional)
- `is_saved` - Bookmark flag
- `notes` - User's personal notes

**Sample Data:**
```sql
-- User reads 75% of an article, rates it 4 stars
INSERT INTO user_content_interaction (
    user_id, content_id, status, read_at,
    read_progress, time_spent, rating, is_saved
) VALUES (
    'user-uuid',
    'content-uuid',
    'read',
    CURRENT_TIMESTAMP,
    0.75,
    420,  -- 7 minutes
    4,
    TRUE
);
```

**Use Cases:**
1. Resume reading from last position
2. Calculate reading time analytics
3. Feed recommendation engine input
4. Content quality feedback
5. Personal library (saved items)

#### user_activity_log
Detailed activity tracking for ML recommendations.

**Activity Types:**
- `view` - Content viewed
- `click` - Content clicked
- `read` - Content read
- `save` - Content bookmarked
- `rate` - Content rated
- `search` - Search performed
- `filter` - Filters applied
- `dismiss` - Content dismissed

**Sample Data:**
```sql
-- Log user clicking on content
INSERT INTO user_activity_log (
    user_id, activity_type, entity_type, entity_id, metadata
) VALUES (
    'user-uuid',
    'click',
    'content',
    'content-uuid',
    '{"source": "daily_feed", "position": 3}'::jsonb
);
```

**Analytics Queries:**

Most active users:
```sql
SELECT
    u.username,
    COUNT(*) as activity_count,
    COUNT(DISTINCT DATE(ual.created_at)) as active_days
FROM user_activity_log ual
JOIN users u ON ual.user_id = u.id
WHERE ual.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.id, u.username
ORDER BY activity_count DESC
LIMIT 10;
```

---

### 5. Recommendation & Feed Tables

#### daily_feeds
Pre-computed daily personalized recommendations.

**Key Columns:**
- `feed_date` - Date this feed is for
- `recommendation_score` - 0-100 personalization score
- `position` - Ranking in feed (1 = top)
- `reason` - Human-readable explanation

**Recommendation Score Components:**
```
Score = (0.30 × Category Match) +
        (0.25 × User History) +
        (0.20 × Quality Score) +
        (0.15 × Recency) +
        (0.10 × Popularity)
```

**Reason Examples:**
- "Based on your interest in Astronomy"
- "Similar to highly-rated content you've enjoyed"
- "Trending in your favorite topics"
- "Recommended by users with similar interests"

**Sample Data:**
```sql
INSERT INTO daily_feeds (
    user_id, content_id, feed_date,
    recommendation_score, position, reason
) VALUES (
    'user-uuid',
    'content-uuid',
    CURRENT_DATE,
    87.5,
    1,
    'Top match for your Astronomy interest (priority 9)'
);
```

**Query Today's Feed:**
```sql
SELECT
    c.title,
    c.content_type,
    c.url,
    c.thumbnail_url,
    cat.name as category,
    df.recommendation_score,
    df.reason,
    uci.status
FROM daily_feeds df
JOIN content c ON df.content_id = c.id
JOIN categories cat ON c.category_id = cat.id
LEFT JOIN user_content_interaction uci
    ON df.content_id = uci.content_id
    AND df.user_id = uci.user_id
WHERE df.user_id = 'user-uuid'
    AND df.feed_date = CURRENT_DATE
ORDER BY df.position;
```

---

### 6. Content Source Management

#### content_sources
External content sources for n8n automation.

**Source Types:**
- `youtube_channel` - YouTube channel subscription
- `youtube_search` - YouTube search query
- `rss_feed` - RSS/Atom feed
- `api` - Custom API endpoint
- `manual` - Manual entry

**Fetch Frequencies:**
- `hourly` - Every hour
- `daily` - Once per day
- `weekly` - Once per week

**Config Examples:**

YouTube Channel:
```json
{
  "channel_id": "UCxxxxxx",
  "max_videos": 10,
  "min_views": 10000,
  "languages": ["en"]
}
```

RSS Feed:
```json
{
  "feed_url": "https://example.com/rss",
  "extract_full_text": true,
  "keywords": ["machine learning", "AI"]
}
```

**Sample Data:**
```sql
INSERT INTO content_sources (
    name, source_type, category_id, source_url,
    fetch_frequency, is_active, config
) VALUES (
    'Veritasium',
    'youtube_channel',
    'science-uuid',
    'https://youtube.com/c/veritasium',
    'daily',
    TRUE,
    '{"channel_id": "UCHnyfMqiRRG1u-2MsSQLbXA", "max_videos": 5}'::jsonb
);
```

---

## Advanced Queries

### 1. User Dashboard Statistics

```sql
SELECT
    u.username,
    u.email,
    -- Reading stats
    COUNT(DISTINCT CASE WHEN uci.status = 'read' THEN uci.content_id END) as total_read,
    COUNT(DISTINCT CASE WHEN uci.is_saved THEN uci.content_id END) as total_saved,
    -- Time stats
    COALESCE(SUM(uci.time_spent) / 60.0, 0) as total_hours,
    COALESCE(AVG(uci.rating), 0) as avg_rating,
    -- Streak
    get_reading_streak(u.id) as current_streak,
    -- Today's feed
    (SELECT COUNT(*) FROM daily_feeds df
     WHERE df.user_id = u.id AND df.feed_date = CURRENT_DATE) as today_feed_count
FROM users u
LEFT JOIN user_content_interaction uci ON u.id = uci.user_id
WHERE u.id = 'user-uuid'
GROUP BY u.id, u.username, u.email;
```

### 2. Content Discovery by Category

```sql
SELECT
    c.id,
    c.title,
    c.content_type,
    c.author,
    c.published_at,
    c.quality_score,
    cat.name as category,
    -- Engagement metrics
    COUNT(DISTINCT uci.user_id) as total_views,
    AVG(uci.rating) as avg_rating,
    -- Tags
    ARRAY_AGG(DISTINCT t.name) as tags
FROM content c
JOIN categories cat ON c.category_id = cat.id
LEFT JOIN user_content_interaction uci ON c.id = uci.content_id
LEFT JOIN content_tags ct ON c.id = ct.content_id
LEFT JOIN tags t ON ct.tag_id = t.id
WHERE cat.slug = 'astronomy'
    AND c.quality_score >= 0.7
    AND c.published_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY c.id, c.title, c.content_type, c.author, c.published_at, c.quality_score, cat.name
ORDER BY c.quality_score DESC, c.published_at DESC
LIMIT 20;
```

### 3. Trending Content (Last 7 Days)

```sql
WITH engagement_metrics AS (
    SELECT
        content_id,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*) FILTER (WHERE status = 'read') as read_count,
        COUNT(*) FILTER (WHERE is_saved) as save_count,
        AVG(rating) as avg_rating,
        SUM(time_spent) as total_time
    FROM user_content_interaction
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY content_id
)
SELECT
    c.title,
    c.content_type,
    cat.name as category,
    c.author,
    em.unique_users,
    em.read_count,
    em.save_count,
    ROUND(em.avg_rating::numeric, 2) as avg_rating,
    ROUND(em.total_time / 60.0, 1) as total_hours,
    -- Trending score
    (em.unique_users * 2 + em.read_count * 3 + em.save_count * 5) as trending_score
FROM content c
JOIN categories cat ON c.category_id = cat.id
JOIN engagement_metrics em ON c.id = em.content_id
ORDER BY trending_score DESC, em.unique_users DESC
LIMIT 10;
```

### 4. Personalized Recommendations (Manual Calculation)

```sql
WITH user_preferences AS (
    SELECT
        uc.category_id,
        uc.priority,
        cat.name as category_name
    FROM user_categories uc
    JOIN categories cat ON uc.category_id = cat.id
    WHERE uc.user_id = 'user-uuid'
        AND uc.is_active = TRUE
),
user_history AS (
    SELECT
        c.category_id,
        COUNT(*) as interactions,
        AVG(uci.rating) as avg_rating
    FROM user_content_interaction uci
    JOIN content c ON uci.content_id = c.id
    WHERE uci.user_id = 'user-uuid'
        AND uci.created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY c.category_id
),
candidate_content AS (
    SELECT
        c.*,
        cat.name as category_name,
        up.priority,
        uh.avg_rating as category_avg_rating,
        -- Calculate days since published
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - c.published_at)) / 86400.0 as days_old
    FROM content c
    JOIN categories cat ON c.category_id = cat.id
    LEFT JOIN user_preferences up ON cat.id = up.category_id
    LEFT JOIN user_history uh ON cat.id = uh.category_id
    WHERE c.published_at >= CURRENT_DATE - INTERVAL '7 days'
        AND NOT EXISTS (
            SELECT 1 FROM user_content_interaction uci
            WHERE uci.user_id = 'user-uuid'
                AND uci.content_id = c.id
        )
)
SELECT
    title,
    content_type,
    category_name,
    author,
    published_at,
    -- Calculate recommendation score
    (
        COALESCE(priority, 0) * 10.0 +  -- Category match (0-100)
        quality_score * 20.0 +           -- Quality (0-20)
        (1.0 / (1.0 + days_old / 7.0)) * 15.0 +  -- Recency (0-15)
        (popularity_score / 1000.0) * 10.0 +      -- Popularity (0-10)
        COALESCE(category_avg_rating, 3.0) * 5.0  -- History (0-25)
    ) as recommendation_score
FROM candidate_content
ORDER BY recommendation_score DESC
LIMIT 20;
```

### 5. User Reading Analytics

```sql
SELECT
    DATE(uci.read_at) as date,
    COUNT(*) as items_read,
    COUNT(DISTINCT c.content_type) as content_types,
    SUM(uci.time_spent) / 60.0 as minutes_spent,
    AVG(uci.rating) as avg_rating,
    -- Content type breakdown
    COUNT(*) FILTER (WHERE c.content_type = 'video') as videos,
    COUNT(*) FILTER (WHERE c.content_type = 'article') as articles,
    COUNT(*) FILTER (WHERE c.content_type = 'paper') as papers
FROM user_content_interaction uci
JOIN content c ON uci.content_id = c.id
WHERE uci.user_id = 'user-uuid'
    AND uci.status = 'read'
    AND uci.read_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(uci.read_at)
ORDER BY date DESC;
```

---

## Indexes & Performance

### Index Strategy

1. **Primary Lookups**: UUID primary keys with B-tree indexes
2. **Foreign Keys**: Automatic indexes on all FK columns
3. **Common Filters**: Indexes on frequently filtered columns
4. **Sorting**: Indexes on ORDER BY columns (DESC for timestamps)
5. **Full-Text Search**: GIN indexes on text columns
6. **Partial Indexes**: For frequently filtered subsets

### Critical Indexes

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Content discovery
CREATE INDEX idx_content_published ON content(published_at DESC);
CREATE INDEX idx_content_quality ON content(quality_score DESC);
CREATE INDEX idx_content_category ON content(category_id);

-- Feed generation
CREATE INDEX idx_daily_feed_user_date ON daily_feeds(user_id, feed_date DESC);

-- User activity
CREATE INDEX idx_interaction_user ON user_content_interaction(user_id);
CREATE INDEX idx_activity_log_user_created ON user_activity_log(user_id, created_at DESC);

-- Full-text search
CREATE INDEX idx_content_title_text ON content USING gin(to_tsvector('english', title));
```

### Query Optimization Tips

1. **Use EXPLAIN ANALYZE** to understand query plans
2. **Avoid SELECT \*** - specify needed columns
3. **Use covering indexes** where possible
4. **Partition large tables** (user_activity_log, daily_feeds) by date
5. **Archive old data** to keep tables lean
6. **Use materialized views** for expensive aggregations

---

## Maintenance Tasks

### Daily

```sql
-- Clean up expired refresh tokens
DELETE FROM refresh_tokens
WHERE expires_at < CURRENT_TIMESTAMP;

-- Update content popularity scores
UPDATE content SET popularity_score = (
    SELECT COUNT(*) * 1.0 +
           COUNT(*) FILTER (WHERE status = 'read') * 2.0 +
           COUNT(*) FILTER (WHERE is_saved) * 3.0
    FROM user_content_interaction
    WHERE content_id = content.id
);
```

### Weekly

```sql
-- Vacuum analyze for query planner
VACUUM ANALYZE users, content, user_content_interaction, daily_feeds;

-- Rebuild indexes on heavily modified tables
REINDEX TABLE user_content_interaction;
REINDEX TABLE user_activity_log;
```

### Monthly

```sql
-- Archive old activity logs
INSERT INTO user_activity_log_archive
SELECT * FROM user_activity_log
WHERE created_at < CURRENT_DATE - INTERVAL '90 days';

DELETE FROM user_activity_log
WHERE created_at < CURRENT_DATE - INTERVAL '90 days';

-- Clean old daily feeds
DELETE FROM daily_feeds
WHERE feed_date < CURRENT_DATE - INTERVAL '30 days';
```

---

## Security Considerations

1. **Never store passwords in plain text** - always use bcrypt
2. **Validate all user input** - use constraints and CHECK clauses
3. **Use parameterized queries** - prevent SQL injection
4. **Implement row-level security** for multi-tenant scenarios
5. **Encrypt sensitive data** - API keys, tokens
6. **Regular backups** - automated daily backups with PITR
7. **Monitor for anomalies** - unusual activity patterns

---

## Scaling Strategies

### Horizontal Scaling

1. **Read replicas** for analytics and reporting
2. **Partition by user_id** for user-specific tables
3. **Partition by date** for time-series data
4. **Connection pooling** (PgBouncer)

### Vertical Scaling

1. **Increase shared_buffers** to 25% of RAM
2. **Tune work_mem** for complex queries
3. **Enable parallel query execution**
4. **Optimize checkpoint settings**

### Caching

1. **Redis for hot data**
   - User sessions
   - Daily feeds
   - Popular content
2. **Application-level caching**
   - Category lists
   - Tag clouds
   - User preferences

---

## Migration Path

From development to production:

1. **Export schema**: `pg_dump --schema-only`
2. **Test on staging** with production-like data
3. **Run migrations** with zero-downtime strategy
4. **Validate data integrity** post-migration
5. **Monitor performance** for 24 hours
6. **Rollback plan** ready if needed

---

## Conclusion

This schema provides a robust foundation for an educational content aggregator with:

- ✅ Flexible content management
- ✅ Personalized recommendations
- ✅ Comprehensive user tracking
- ✅ Scalable architecture
- ✅ Performance optimizations
- ✅ Data integrity enforcement

For implementation details, see:
- `backend/prisma/schema.prisma` - Prisma ORM schema
- `backend/prisma/schema.sql` - Raw SQL DDL
- `docs/ARCHITECTURE.md` - System architecture
