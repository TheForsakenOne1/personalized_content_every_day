-- Manual SQLite Database Setup for EduHub
-- Run this with: sqlite3 dev.db < prisma/manual-setup.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  email_verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  last_login_at TEXT,
  is_active INTEGER DEFAULT 1
);

-- User Preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  content_frequency TEXT DEFAULT 'daily',
  preferred_content_types TEXT DEFAULT '["video", "article", "paper", "blog"]',
  notification_enabled INTEGER DEFAULT 1,
  email_digest INTEGER DEFAULT 1,
  theme TEXT DEFAULT 'light',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  is_default INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- User Categories table
CREATE TABLE IF NOT EXISTS user_categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  priority INTEGER DEFAULT 5,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(user_id, category_id)
);
CREATE INDEX IF NOT EXISTS idx_user_categories_user_id ON user_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_categories_priority ON user_categories(priority);

-- Content table
CREATE TABLE IF NOT EXISTS content (
  id TEXT PRIMARY KEY,
  external_id TEXT,
  content_type TEXT NOT NULL,
  source TEXT NOT NULL,
  category_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  author TEXT,
  published_at TEXT,
  duration INTEGER,
  word_count INTEGER,
  language TEXT DEFAULT 'en',
  metadata TEXT DEFAULT '{}',
  quality_score REAL DEFAULT 0.5,
  popularity_score REAL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  UNIQUE(external_id, source)
);
CREATE INDEX IF NOT EXISTS idx_content_category_id ON content(category_id);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(content_type);
CREATE INDEX IF NOT EXISTS idx_content_published_at ON content(published_at);
CREATE INDEX IF NOT EXISTS idx_content_quality_score ON content(quality_score);
CREATE INDEX IF NOT EXISTS idx_content_source ON content(source);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Content Tags table
CREATE TABLE IF NOT EXISTS content_tags (
  content_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (content_id, tag_id),
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_content_tags_content_id ON content_tags(content_id);
CREATE INDEX IF NOT EXISTS idx_content_tags_tag_id ON content_tags(tag_id);

-- User Content Interaction table
CREATE TABLE IF NOT EXISTS user_content_interaction (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content_id TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  read_at TEXT,
  read_progress REAL DEFAULT 0,
  time_spent INTEGER,
  rating INTEGER,
  is_saved INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
  UNIQUE(user_id, content_id)
);
CREATE INDEX IF NOT EXISTS idx_user_content_interaction_user_id ON user_content_interaction(user_id);
CREATE INDEX IF NOT EXISTS idx_user_content_interaction_status ON user_content_interaction(status);
CREATE INDEX IF NOT EXISTS idx_user_content_interaction_read_at ON user_content_interaction(read_at);

-- Daily Feeds table
CREATE TABLE IF NOT EXISTS daily_feeds (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content_id TEXT NOT NULL,
  feed_date TEXT NOT NULL,
  recommendation_score REAL NOT NULL,
  position INTEGER NOT NULL,
  reason TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
  UNIQUE(user_id, content_id, feed_date)
);
CREATE INDEX IF NOT EXISTS idx_daily_feeds_user_id_feed_date ON daily_feeds(user_id, feed_date);
CREATE INDEX IF NOT EXISTS idx_daily_feeds_recommendation_score ON daily_feeds(recommendation_score);

-- Content Sources table
CREATE TABLE IF NOT EXISTS content_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  category_id TEXT NOT NULL,
  source_url TEXT NOT NULL,
  api_key_encrypted TEXT,
  fetch_frequency TEXT DEFAULT 'daily',
  is_active INTEGER DEFAULT 1,
  last_fetched_at TEXT,
  config TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
CREATE INDEX IF NOT EXISTS idx_content_sources_is_active ON content_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_content_sources_category_id ON content_sources(category_id);

-- User Activity Log table
CREATE TABLE IF NOT EXISTS user_activity_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id_created_at ON user_activity_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_type ON user_activity_log(activity_type);

-- Refresh Tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  revoked_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

-- Password Reset Tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  used_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);

-- Email Verification Tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  used_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token_hash ON email_verification_tokens(token_hash);

-- Seed default categories
INSERT OR IGNORE INTO categories (id, name, slug, description, icon, is_default) VALUES
  ('cat-machine-learning', 'Machine Learning', 'machine-learning', 'AI and machine learning topics', 'Brain', 1),
  ('cat-web-dev', 'Web Development', 'web-development', 'Web technologies and frameworks', 'Code', 1),
  ('cat-data-science', 'Data Science', 'data-science', 'Data analysis and visualization', 'Database', 1),
  ('cat-security', 'Cybersecurity', 'cybersecurity', 'Security and privacy topics', 'Shield', 1),
  ('cat-cloud', 'Cloud Computing', 'cloud-computing', 'Cloud platforms and services', 'Cloud', 1),
  ('cat-mobile', 'Mobile Development', 'mobile-development', 'iOS and Android development', 'Smartphone', 1);
