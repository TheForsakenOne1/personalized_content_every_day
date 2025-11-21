-- Add Performance Indexes Migration
-- This migration adds indexes to optimize common query patterns identified in the codebase

-- ===== CONTENT TABLE INDEXES =====

-- Compound index for common filtering pattern: category + publishedAt + qualityScore
-- Used in: content.service.ts getContent() - filters by category and orders by publishedAt/qualityScore
CREATE INDEX IF NOT EXISTS "content_category_published_quality_idx"
ON "content" ("category_id", "published_at" DESC, "quality_score" DESC);

-- Index on createdAt for content freshness checks
-- Used in: content.service.ts checkContentFreshness() - orders by createdAt DESC
CREATE INDEX IF NOT EXISTS "content_created_at_idx"
ON "content" ("created_at" DESC);

-- Compound index for category + contentType filtering
-- Used in: content.service.ts getContent() - filters by both category and content type
CREATE INDEX IF NOT EXISTS "content_category_type_idx"
ON "content" ("category_id", "content_type");

-- Compound index for trending content queries
-- Used in: content.service.ts getTrendingContent() - joins with interactions
CREATE INDEX IF NOT EXISTS "content_published_quality_idx"
ON "content" ("published_at" DESC, "quality_score" DESC);


-- ===== USER_CONTENT_INTERACTION TABLE INDEXES =====

-- Compound index for common user interaction filtering pattern
-- Used in: user.service.ts getUserFeed(), getSavedContent() - filters by userId + status + isSaved
CREATE INDEX IF NOT EXISTS "user_interaction_user_status_saved_idx"
ON "user_content_interaction" ("user_id", "status", "is_saved");

-- Compound index for saved content queries with sorting
-- Used in: user.service.ts getSavedContent() - filters by userId + isSaved, orders by updatedAt
CREATE INDEX IF NOT EXISTS "user_interaction_user_saved_updated_idx"
ON "user_content_interaction" ("user_id", "is_saved", "updated_at" DESC);

-- Index on createdAt for trending and analytics queries
-- Used in: content.service.ts getTrendingContent(), analytics queries
CREATE INDEX IF NOT EXISTS "user_interaction_created_at_idx"
ON "user_content_interaction" ("created_at" DESC);

-- Compound index for collaborative filtering queries
-- Used in: collaborative-filter.ts findSimilarUsers() - filters by contentId + status/isSaved/rating
CREATE INDEX IF NOT EXISTS "user_interaction_content_status_idx"
ON "user_content_interaction" ("content_id", "status");

-- Index on rating for recommendation scoring
-- Used in: recommendation algorithms for filtering by rating thresholds
CREATE INDEX IF NOT EXISTS "user_interaction_rating_idx"
ON "user_content_interaction" ("rating") WHERE "rating" IS NOT NULL;

-- Compound index for collaborative filtering by userId with positive interactions
-- Used in: collaborative-filter.ts - finds similar users based on read/saved content
CREATE INDEX IF NOT EXISTS "user_interaction_user_content_status_idx"
ON "user_content_interaction" ("user_id", "content_id", "status");

-- Compound index for user stats queries with date filtering
-- Used in: user.service.ts getUserStats() - filters by userId + status + readAt date range
CREATE INDEX IF NOT EXISTS "user_interaction_user_read_date_idx"
ON "user_content_interaction" ("user_id", "read_at" DESC) WHERE "status" = 'read';


-- ===== USER_CATEGORIES TABLE INDEXES =====

-- Compound index for active user categories with priority
-- Used in: user.service.ts getUserFeed(), getUserCategories() - filters by userId + isActive, orders by priority
CREATE INDEX IF NOT EXISTS "user_categories_user_active_priority_idx"
ON "user_categories" ("user_id", "is_active", "priority" DESC);

-- Compound index for categoryId with active users
-- Used in: category.service.ts - counts users per category
CREATE INDEX IF NOT EXISTS "user_categories_category_active_idx"
ON "user_categories" ("category_id", "is_active");


-- ===== TOKEN TABLES INDEXES =====

-- Compound index for refresh token validation
-- Used in: auth.service.ts refreshAccessToken() - validates token with expiry and revocation
CREATE INDEX IF NOT EXISTS "refresh_tokens_hash_expires_revoked_idx"
ON "refresh_tokens" ("token_hash", "expires_at", "revoked_at");

-- Compound index for password reset token validation
-- Used in: auth.service.ts resetPassword() - validates token with expiry and usage
CREATE INDEX IF NOT EXISTS "password_reset_tokens_hash_expires_used_idx"
ON "password_reset_tokens" ("token_hash", "expires_at", "used_at");

-- Compound index for email verification token validation
-- Used in: auth.service.ts verifyEmail() - validates token with expiry and usage
CREATE INDEX IF NOT EXISTS "email_verification_tokens_hash_expires_used_idx"
ON "email_verification_tokens" ("token_hash", "expires_at", "used_at");


-- ===== USERS TABLE INDEXES =====

-- Compound index for admin queries on active users
-- Used in: admin.controller.ts getSystemStats() - counts active users by lastLoginAt
CREATE INDEX IF NOT EXISTS "users_active_last_login_idx"
ON "users" ("is_active", "last_login_at" DESC);

-- Index on emailVerified for filtering verified users
-- Used in: potential queries filtering by email verification status
CREATE INDEX IF NOT EXISTS "users_email_verified_idx"
ON "users" ("email_verified");


-- ===== SEARCH_HISTORY TABLE INDEXES =====

-- Index on createdAt for time-based queries
-- Used in: search-history.service.ts, analytics queries - orders by createdAt
CREATE INDEX IF NOT EXISTS "search_history_created_at_idx"
ON "search_history" ("created_at" DESC);


-- ===== DAILY_FEEDS TABLE INDEXES =====

-- Compound index for retrieving sorted user feeds
-- Used in: recommendation.service.ts - gets daily feed sorted by recommendationScore
CREATE INDEX IF NOT EXISTS "daily_feeds_user_date_score_idx"
ON "daily_feeds" ("user_id", "feed_date" DESC, "recommendation_score" DESC);

-- Index on feedDate for date-based feed queries
-- Used in: feed generation and retrieval by date
CREATE INDEX IF NOT EXISTS "daily_feeds_date_idx"
ON "daily_feeds" ("feed_date" DESC);


-- ===== CONTENT_SOURCES TABLE INDEXES =====

-- Compound index for active sources by category
-- Used in: aggregator service - finds active sources for content aggregation
CREATE INDEX IF NOT EXISTS "content_sources_active_category_idx"
ON "content_sources" ("is_active", "category_id");

-- Index on lastFetchedAt for scheduling fetches
-- Used in: aggregator service - determines when to fetch next
CREATE INDEX IF NOT EXISTS "content_sources_last_fetched_idx"
ON "content_sources" ("last_fetched_at" DESC) WHERE "is_active" = true;


-- ===== USER_ACTIVITY_LOG TABLE INDEXES =====

-- Compound index for entity-based activity queries
-- Used in: analytics - queries activity by entity type and ID
CREATE INDEX IF NOT EXISTS "user_activity_log_entity_idx"
ON "user_activity_log" ("entity_type", "entity_id", "created_at" DESC);


-- ===== CATEGORY TABLE INDEXES =====

-- Index on isDefault for quickly finding default categories
-- Used in: user onboarding - assigns default categories to new users
CREATE INDEX IF NOT EXISTS "categories_is_default_idx"
ON "categories" ("is_default") WHERE "is_default" = true;
