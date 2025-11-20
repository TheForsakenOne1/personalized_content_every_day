-- ============================================================================
-- EDUCATIONAL CONTENT AGGREGATOR - COMPLETE DATABASE SCHEMA
-- PostgreSQL 15+
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USER MANAGEMENT TABLES
-- ============================================================================

-- Users table - Core user authentication and profile
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,

    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT username_format CHECK (username ~* '^[a-zA-Z0-9_]{3,20}$')
);

-- User preferences table - User settings and notification preferences
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    content_frequency VARCHAR(50) DEFAULT 'daily',
    preferred_content_types JSONB DEFAULT '["video", "article", "paper", "blog"]',
    notification_enabled BOOLEAN DEFAULT TRUE,
    email_digest BOOLEAN DEFAULT TRUE,
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT content_frequency_check CHECK (content_frequency IN ('daily', 'twice_daily', 'custom')),
    CONSTRAINT theme_check CHECK (theme IN ('light', 'dark', 'auto'))
);

-- Refresh tokens table - JWT refresh token management
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP,

    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- CONTENT ORGANIZATION TABLES
-- ============================================================================

-- Categories table - Main topic categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT slug_format CHECK (slug ~* '^[a-z0-9-]+$')
);

-- User categories table - User's selected topics with priorities
CREATE TABLE user_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    category_id UUID NOT NULL,
    priority INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    CONSTRAINT priority_range CHECK (priority >= 1 AND priority <= 10),
    UNIQUE (user_id, category_id)
);

-- Tags table - Flexible content tagging
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT tag_slug_format CHECK (slug ~* '^[a-z0-9-]+$')
);

-- ============================================================================
-- CONTENT TABLES
-- ============================================================================

-- Content table - Main content repository (videos, articles, papers, blogs)
CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255),
    content_type VARCHAR(50) NOT NULL,
    source VARCHAR(100) NOT NULL,
    category_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    author VARCHAR(255),
    published_at TIMESTAMP,
    duration INTEGER, -- in seconds for videos
    word_count INTEGER, -- for articles/papers
    language VARCHAR(10) DEFAULT 'en',
    metadata JSONB DEFAULT '{}',
    quality_score DECIMAL(3,2) DEFAULT 0.50,
    popularity_score DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT content_type_check CHECK (content_type IN ('video', 'article', 'paper', 'blog')),
    CONSTRAINT source_check CHECK (source IN ('youtube', 'arxiv', 'medium', 'rss', 'substack', 'manual')),
    CONSTRAINT quality_score_range CHECK (quality_score >= 0 AND quality_score <= 1),
    CONSTRAINT language_format CHECK (language ~* '^[a-z]{2}$'),
    UNIQUE (external_id, source)
);

-- Content tags table - Many-to-many relationship between content and tags
CREATE TABLE content_tags (
    content_id UUID NOT NULL,
    tag_id UUID NOT NULL,

    PRIMARY KEY (content_id, tag_id),
    CONSTRAINT fk_content FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
    CONSTRAINT fk_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- ============================================================================
-- USER INTERACTION TABLES
-- ============================================================================

-- User content interaction table - Track reading history and engagement
CREATE TABLE user_content_interaction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    content_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'unread',
    read_at TIMESTAMP,
    read_progress DECIMAL(3,2) DEFAULT 0.00,
    time_spent INTEGER, -- seconds spent on content
    rating INTEGER,
    is_saved BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_content FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
    CONSTRAINT status_check CHECK (status IN ('unread', 'read', 'saved', 'dismissed')),
    CONSTRAINT progress_range CHECK (read_progress >= 0 AND read_progress <= 1),
    CONSTRAINT rating_range CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
    UNIQUE (user_id, content_id)
);

-- User activity log table - Track all user activities for recommendations
CREATE TABLE user_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT activity_type_check CHECK (activity_type IN ('view', 'click', 'read', 'save', 'rate', 'search', 'filter', 'dismiss')),
    CONSTRAINT entity_type_check CHECK (entity_type IS NULL OR entity_type IN ('content', 'category', 'tag'))
);

-- ============================================================================
-- RECOMMENDATION & FEED TABLES
-- ============================================================================

-- Daily feeds table - Pre-computed personalized recommendations
CREATE TABLE daily_feeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    content_id UUID NOT NULL,
    feed_date DATE NOT NULL,
    recommendation_score DECIMAL(5,2) NOT NULL,
    position INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_content FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
    CONSTRAINT score_range CHECK (recommendation_score >= 0 AND recommendation_score <= 100),
    CONSTRAINT position_positive CHECK (position > 0),
    UNIQUE (user_id, content_id, feed_date)
);

-- ============================================================================
-- CONTENT SOURCE MANAGEMENT TABLES
-- ============================================================================

-- Content sources table - External content sources for n8n integration
CREATE TABLE content_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    category_id UUID NOT NULL,
    source_url TEXT NOT NULL,
    api_key_encrypted TEXT,
    fetch_frequency VARCHAR(50) DEFAULT 'daily',
    is_active BOOLEAN DEFAULT TRUE,
    last_fetched_at TIMESTAMP,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT source_type_check CHECK (source_type IN ('youtube_channel', 'youtube_search', 'rss_feed', 'api', 'manual')),
    CONSTRAINT fetch_frequency_check CHECK (fetch_frequency IN ('hourly', 'daily', 'weekly'))
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- User preferences indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Refresh tokens indexes
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Category indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_default ON categories(is_default);

-- User categories indexes
CREATE INDEX idx_user_categories_user ON user_categories(user_id);
CREATE INDEX idx_user_categories_category ON user_categories(category_id);
CREATE INDEX idx_user_categories_priority ON user_categories(priority DESC);
CREATE INDEX idx_user_categories_active ON user_categories(is_active);

-- Tags indexes
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_name ON tags(name);

-- Content indexes
CREATE INDEX idx_content_category ON content(category_id);
CREATE INDEX idx_content_type ON content(content_type);
CREATE INDEX idx_content_source ON content(source);
CREATE INDEX idx_content_published ON content(published_at DESC);
CREATE INDEX idx_content_quality ON content(quality_score DESC);
CREATE INDEX idx_content_popularity ON content(popularity_score DESC);
CREATE INDEX idx_content_created ON content(created_at DESC);
CREATE INDEX idx_content_external_source ON content(external_id, source);
CREATE INDEX idx_content_language ON content(language);
-- Full-text search index
CREATE INDEX idx_content_title_text ON content USING gin(to_tsvector('english', title));
CREATE INDEX idx_content_description_text ON content USING gin(to_tsvector('english', description));

-- Content tags indexes
CREATE INDEX idx_content_tags_content ON content_tags(content_id);
CREATE INDEX idx_content_tags_tag ON content_tags(tag_id);

-- User content interaction indexes
CREATE INDEX idx_interaction_user ON user_content_interaction(user_id);
CREATE INDEX idx_interaction_content ON user_content_interaction(content_id);
CREATE INDEX idx_interaction_status ON user_content_interaction(status);
CREATE INDEX idx_interaction_read_at ON user_content_interaction(read_at DESC);
CREATE INDEX idx_interaction_saved ON user_content_interaction(is_saved) WHERE is_saved = TRUE;
CREATE INDEX idx_interaction_rating ON user_content_interaction(rating) WHERE rating IS NOT NULL;

-- User activity log indexes
CREATE INDEX idx_activity_log_user_created ON user_activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_log_type ON user_activity_log(activity_type);
CREATE INDEX idx_activity_log_entity ON user_activity_log(entity_type, entity_id);

-- Daily feeds indexes
CREATE INDEX idx_daily_feed_user_date ON daily_feeds(user_id, feed_date DESC);
CREATE INDEX idx_daily_feed_score ON daily_feeds(recommendation_score DESC);
CREATE INDEX idx_daily_feed_position ON daily_feeds(position);
CREATE INDEX idx_daily_feed_date ON daily_feeds(feed_date DESC);

-- Content sources indexes
CREATE INDEX idx_content_sources_active ON content_sources(is_active);
CREATE INDEX idx_content_sources_category ON content_sources(category_id);
CREATE INDEX idx_content_sources_type ON content_sources(source_type);
CREATE INDEX idx_content_sources_last_fetched ON content_sources(last_fetched_at);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interaction_updated_at BEFORE UPDATE ON user_content_interaction
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_sources_updated_at BEFORE UPDATE ON content_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: User feed summary
CREATE VIEW user_feed_summary AS
SELECT
    u.id as user_id,
    u.username,
    u.email,
    COUNT(DISTINCT df.id) as total_feed_items,
    COUNT(DISTINCT CASE WHEN uci.status = 'unread' THEN df.content_id END) as unread_count,
    COUNT(DISTINCT CASE WHEN uci.status = 'read' THEN df.content_id END) as read_count,
    COUNT(DISTINCT CASE WHEN uci.is_saved = TRUE THEN df.content_id END) as saved_count,
    MAX(df.feed_date) as last_feed_date
FROM users u
LEFT JOIN daily_feeds df ON u.id = df.user_id
LEFT JOIN user_content_interaction uci ON df.content_id = uci.content_id AND u.id = uci.user_id
GROUP BY u.id, u.username, u.email;

-- View: Content statistics
CREATE VIEW content_statistics AS
SELECT
    c.id,
    c.title,
    c.content_type,
    c.source,
    c.quality_score,
    c.popularity_score,
    COUNT(DISTINCT uci.user_id) as total_views,
    COUNT(DISTINCT CASE WHEN uci.status = 'read' THEN uci.user_id END) as read_count,
    COUNT(DISTINCT CASE WHEN uci.is_saved = TRUE THEN uci.user_id END) as saved_count,
    AVG(uci.rating) as average_rating,
    AVG(uci.time_spent) as avg_time_spent
FROM content c
LEFT JOIN user_content_interaction uci ON c.id = uci.content_id
GROUP BY c.id, c.title, c.content_type, c.source, c.quality_score, c.popularity_score;

-- View: Category popularity
CREATE VIEW category_popularity AS
SELECT
    cat.id,
    cat.name,
    cat.slug,
    COUNT(DISTINCT c.id) as content_count,
    COUNT(DISTINCT uc.user_id) as subscriber_count,
    AVG(uc.priority) as avg_priority,
    COUNT(DISTINCT uci.user_id) as engagement_count
FROM categories cat
LEFT JOIN content c ON cat.id = c.category_id
LEFT JOIN user_categories uc ON cat.id = uc.category_id AND uc.is_active = TRUE
LEFT JOIN user_content_interaction uci ON c.id = uci.content_id
GROUP BY cat.id, cat.name, cat.slug
ORDER BY subscriber_count DESC, engagement_count DESC;

-- View: User reading analytics
CREATE VIEW user_reading_analytics AS
SELECT
    u.id as user_id,
    u.username,
    COUNT(DISTINCT uci.content_id) as total_interactions,
    COUNT(DISTINCT CASE WHEN uci.status = 'read' THEN uci.content_id END) as read_count,
    COUNT(DISTINCT CASE WHEN uci.is_saved = TRUE THEN uci.content_id END) as saved_count,
    AVG(uci.rating) as average_rating,
    SUM(uci.time_spent) as total_time_spent,
    COUNT(DISTINCT ual.id) as total_activities,
    MAX(ual.created_at) as last_activity_at
FROM users u
LEFT JOIN user_content_interaction uci ON u.id = uci.user_id
LEFT JOIN user_activity_log ual ON u.id = ual.user_id
GROUP BY u.id, u.username;

-- ============================================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ============================================================================

-- Function: Get user's personalized content recommendations
CREATE OR REPLACE FUNCTION get_user_recommendations(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    content_id UUID,
    title TEXT,
    content_type VARCHAR(50),
    category_name VARCHAR(100),
    recommendation_score DECIMAL(5,2),
    reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.title,
        c.content_type,
        cat.name,
        df.recommendation_score,
        df.reason
    FROM daily_feeds df
    JOIN content c ON df.content_id = c.id
    JOIN categories cat ON c.category_id = cat.id
    WHERE df.user_id = p_user_id
        AND df.feed_date = CURRENT_DATE
        AND NOT EXISTS (
            SELECT 1 FROM user_content_interaction uci
            WHERE uci.user_id = p_user_id
                AND uci.content_id = c.id
                AND uci.status IN ('read', 'dismissed')
        )
    ORDER BY df.position
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function: Mark content as read and update statistics
CREATE OR REPLACE FUNCTION mark_content_read(
    p_user_id UUID,
    p_content_id UUID,
    p_time_spent INTEGER DEFAULT NULL,
    p_progress DECIMAL DEFAULT 1.00
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_content_interaction (
        user_id,
        content_id,
        status,
        read_at,
        read_progress,
        time_spent
    )
    VALUES (
        p_user_id,
        p_content_id,
        'read',
        CURRENT_TIMESTAMP,
        p_progress,
        p_time_spent
    )
    ON CONFLICT (user_id, content_id)
    DO UPDATE SET
        status = 'read',
        read_at = CURRENT_TIMESTAMP,
        read_progress = GREATEST(user_content_interaction.read_progress, p_progress),
        time_spent = COALESCE(p_time_spent, user_content_interaction.time_spent),
        updated_at = CURRENT_TIMESTAMP;

    -- Log the activity
    INSERT INTO user_activity_log (user_id, activity_type, entity_type, entity_id)
    VALUES (p_user_id, 'read', 'content', p_content_id);
END;
$$ LANGUAGE plpgsql;

-- Function: Get user's reading streak
CREATE OR REPLACE FUNCTION get_reading_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    streak INTEGER := 0;
    current_date_check DATE := CURRENT_DATE;
BEGIN
    LOOP
        IF EXISTS (
            SELECT 1
            FROM user_content_interaction
            WHERE user_id = p_user_id
                AND DATE(read_at) = current_date_check
                AND status = 'read'
        ) THEN
            streak := streak + 1;
            current_date_check := current_date_check - INTERVAL '1 day';
        ELSE
            EXIT;
        END IF;
    END LOOP;

    RETURN streak;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, is_default) VALUES
    ('Astronomy', 'astronomy', 'Space, planets, stars, and the universe', 'telescope', TRUE),
    ('Geopolitics', 'geopolitics', 'International relations, politics, and global affairs', 'globe', TRUE),
    ('History', 'history', 'Historical events, civilizations, and cultures', 'book', TRUE),
    ('Geography', 'geography', 'Earth sciences, landscapes, and natural phenomena', 'map', TRUE),
    ('Software', 'software', 'Programming, development, and technology', 'code', TRUE),
    ('Science', 'science', 'General science, research, and discoveries', 'flask', FALSE),
    ('Mathematics', 'mathematics', 'Math concepts, theories, and applications', 'calculator', FALSE),
    ('Philosophy', 'philosophy', 'Philosophical thought, ethics, and logic', 'brain', FALSE)
ON CONFLICT (slug) DO NOTHING;

-- Insert default tags
INSERT INTO tags (name, slug) VALUES
    ('Beginner Friendly', 'beginner-friendly'),
    ('Advanced', 'advanced'),
    ('Tutorial', 'tutorial'),
    ('Research', 'research'),
    ('News', 'news'),
    ('Analysis', 'analysis'),
    ('Guide', 'guide'),
    ('Interview', 'interview'),
    ('Documentary', 'documentary'),
    ('Lecture', 'lecture')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- ANALYTICS & REPORTING QUERIES
-- ============================================================================

-- Example: Get most popular content this week
/*
SELECT
    c.title,
    c.content_type,
    cat.name as category,
    COUNT(DISTINCT uci.user_id) as unique_views,
    AVG(uci.rating) as avg_rating,
    SUM(uci.time_spent) as total_time_spent
FROM content c
JOIN categories cat ON c.category_id = cat.id
LEFT JOIN user_content_interaction uci ON c.id = uci.content_id
WHERE c.created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY c.id, c.title, c.content_type, cat.name
ORDER BY unique_views DESC
LIMIT 10;
*/

-- Example: Get user engagement metrics
/*
SELECT
    u.username,
    COUNT(DISTINCT uci.content_id) as items_read,
    COUNT(DISTINCT CASE WHEN uci.is_saved THEN uci.content_id END) as items_saved,
    AVG(uci.rating) as avg_rating,
    SUM(uci.time_spent) / 60.0 as total_hours
FROM users u
LEFT JOIN user_content_interaction uci ON u.id = uci.user_id
WHERE uci.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.id, u.username
ORDER BY items_read DESC;
*/

-- ============================================================================
-- MAINTENANCE & CLEANUP
-- ============================================================================

-- Clean up old refresh tokens (run periodically)
/*
DELETE FROM refresh_tokens
WHERE expires_at < CURRENT_TIMESTAMP
    OR revoked_at IS NOT NULL;
*/

-- Archive old activity logs (run monthly)
/*
-- Create archive table if needed
CREATE TABLE IF NOT EXISTS user_activity_log_archive (LIKE user_activity_log INCLUDING ALL);

-- Move old records
INSERT INTO user_activity_log_archive
SELECT * FROM user_activity_log
WHERE created_at < CURRENT_DATE - INTERVAL '90 days';

-- Delete from main table
DELETE FROM user_activity_log
WHERE created_at < CURRENT_DATE - INTERVAL '90 days';
*/

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE users IS 'Core user accounts with authentication credentials';
COMMENT ON TABLE user_preferences IS 'User settings and notification preferences';
COMMENT ON TABLE categories IS 'Content categories and topics';
COMMENT ON TABLE user_categories IS 'User topic subscriptions with priority weighting';
COMMENT ON TABLE content IS 'Main content repository for all educational materials';
COMMENT ON TABLE user_content_interaction IS 'User reading history and engagement tracking';
COMMENT ON TABLE daily_feeds IS 'Pre-computed daily personalized content recommendations';
COMMENT ON TABLE content_sources IS 'External content sources for automated aggregation';
COMMENT ON TABLE user_activity_log IS 'Detailed activity tracking for recommendation engine';

COMMENT ON COLUMN content.quality_score IS 'AI-generated quality score (0-1) based on content analysis';
COMMENT ON COLUMN content.popularity_score IS 'Popularity metric based on views, citations, engagement';
COMMENT ON COLUMN user_content_interaction.read_progress IS 'Reading progress (0-1) for resuming content';
COMMENT ON COLUMN daily_feeds.recommendation_score IS 'Personalized recommendation score (0-100)';
COMMENT ON COLUMN user_categories.priority IS 'User priority for category (1-10, higher = more important)';
