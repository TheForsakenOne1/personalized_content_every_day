// User Types
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

// Category Types
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
  priority: number;
  isActive: boolean;
  createdAt: Date;
}

// Content Types
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
  duration: number | null;
  wordCount: number | null;
  language: string;
  metadata: Record<string, any>;
  qualityScore: number;
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

// Interaction Types
export type InteractionStatus = 'unread' | 'read' | 'saved' | 'dismissed';

export interface UserContentInteraction {
  id: string;
  userId: string;
  contentId: string;
  content?: Content;
  status: InteractionStatus;
  readAt: Date | null;
  readProgress: number;
  timeSpent: number | null;
  rating: number | null;
  isSaved: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Feed Types
export interface DailyFeed {
  id: string;
  userId: string;
  contentId: string;
  content?: Content;
  feedDate: Date;
  recommendationScore: number;
  position: number;
  reason: string | null;
  createdAt: Date;
}

export interface FeedItem extends Content {
  recommendationScore: number;
  recommendationReason: string | null;
  userInteraction?: UserContentInteraction;
}

// API Response Types
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

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
