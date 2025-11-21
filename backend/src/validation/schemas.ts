/**
 * Validation Schemas using Zod
 * Provides comprehensive input validation for all endpoints
 */

import { z } from 'zod';
import { VALIDATION } from '../constants';

// ============= COMMON SCHEMAS =============

export const idSchema = z.string().uuid({ message: 'Invalid UUID format' });

export const emailSchema = z
  .string()
  .email({ message: 'Invalid email format' })
  .max(VALIDATION.MAX_EMAIL_LENGTH, { message: 'Email too long' })
  .toLowerCase()
  .trim();

export const usernameSchema = z
  .string()
  .min(VALIDATION.MIN_USERNAME_LENGTH, { message: 'Username too short' })
  .max(VALIDATION.MAX_USERNAME_LENGTH, { message: 'Username too long' })
  .regex(/^[a-zA-Z0-9_-]+$/, { message: 'Username can only contain letters, numbers, underscores, and hyphens' })
  .trim();

export const passwordSchema = z
  .string()
  .min(VALIDATION.MIN_PASSWORD_LENGTH, { message: 'Password must be at least 8 characters' })
  .max(VALIDATION.MAX_PASSWORD_LENGTH, { message: 'Password too long' })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  });

export const urlSchema = z
  .string()
  .url({ message: 'Invalid URL format' })
  .max(2048, { message: 'URL too long' });

export const dateSchema = z.coerce.date();

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ============= AUTH SCHEMAS =============

export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  fullName: z.string().max(100, { message: 'Full name too long' }).trim().optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' }),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Token is required' }),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, { message: 'Token is required' }),
});

// ============= USER SCHEMAS =============

export const updateProfileSchema = z.object({
  fullName: z.string().max(100).trim().optional(),
  avatarUrl: urlSchema.optional(),
  email: emailSchema.optional(),
  username: usernameSchema.optional(),
});

export const updatePreferencesSchema = z.object({
  contentFrequency: z.enum(['daily', 'weekly', 'realtime']).optional(),
  preferredContentTypes: z.array(z.string()).max(20, { message: 'Too many content types' }).optional(),
  notificationEnabled: z.boolean().optional(),
  emailDigest: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
});

export const updateCategoriesSchema = z.object({
  categoryIds: z
    .array(z.string().uuid())
    .min(1, { message: 'At least one category is required' })
    .max(50, { message: 'Maximum 50 categories allowed' }),
  priorities: z.record(z.number().int().min(0).max(100)).optional(),
});

export const contentIdParamSchema = z.object({
  contentId: idSchema,
});

export const queryFilterSchema = z.object({
  filter: z.enum(['all', 'unread', 'saved']).optional(),
});

// ============= CONTENT SCHEMAS =============

export const getContentSchema = z.object({
  categoryId: z.string().uuid().optional(),
  contentType: z.enum(['paper', 'video', 'article']).optional(),
  source: z.string().max(100).optional(),
  search: z.string().max(500).optional(),
  tags: z.string().max(500).optional(), // Comma-separated
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().max(50).default('publishedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createContentSchema = z.object({
  externalId: z.string().max(255).optional(),
  contentType: z.enum(['paper', 'video', 'article']),
  source: z.string().max(100),
  categoryId: idSchema,
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  url: urlSchema,
  thumbnailUrl: urlSchema.optional(),
  author: z.string().max(255).optional(),
  publishedAt: dateSchema.optional(),
  duration: z.number().int().positive().optional(),
  wordCount: z.number().int().positive().optional(),
  language: z.string().length(2).optional(), // ISO 639-1 code
  metadata: z.record(z.any()).optional(),
  qualityScore: z.number().min(0).max(1).optional(),
  popularityScore: z.number().min(0).optional(),
  tags: z.array(z.string().max(50)).max(20, { message: 'Maximum 20 tags allowed' }).optional(),
});

export const updateContentSchema = createContentSchema.partial().omit({ contentType: true });

export const contentIdSchema = z.object({
  id: idSchema,
});

export const addTagsSchema = z.object({
  tags: z
    .array(z.string().max(50).regex(/^[a-z0-9-]+$/))
    .min(1)
    .max(20, { message: 'Maximum 20 tags allowed' }),
});

export const searchContentSchema = z.object({
  q: z.string().min(1).max(500, { message: 'Search query too long' }),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const trendingContentSchema = z.object({
  days: z.coerce.number().int().positive().max(90).default(7),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export const contentFreshnessSchema = z.object({
  categoryId: z.string().uuid().optional(),
});

export const refreshContentSchema = z.object({
  categoryId: z.string().uuid().optional(),
  categoryName: z.string().max(100).optional(),
});

// ============= SEARCH SCHEMAS =============

export const advancedSearchSchema = z.object({
  query: z.string().max(500).optional(),
  q: z.string().max(500).optional(),
  categoryId: z.string().uuid().optional(),
  contentType: z.enum(['paper', 'video', 'article']).optional(),
  source: z.string().max(100).optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  author: z.string().max(255).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  minQualityScore: z.coerce.number().min(0).max(1).optional(),
  sortBy: z.enum(['relevance', 'date', 'quality', 'popularity']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const searchSuggestionsSchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().positive().max(20).default(10),
});

export const searchHistorySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const deleteSearchSchema = z.object({
  searchId: idSchema,
});

// ============= CATEGORY SCHEMAS =============

export const categoryIdSchema = z.object({
  id: idSchema,
});

export const categorySlugSchema = z.object({
  slug: z.string().max(100).regex(/^[a-z0-9-]+$/),
});

export const subscribeSchema = z.object({
  categoryId: idSchema,
  priority: z.number().int().min(0).max(100).default(50),
});

export const updateCategoryPrioritySchema = z.object({
  priority: z.number().int().min(0).max(100),
});

export const userCategoryIdSchema = z.object({
  id: idSchema,
});

// ============= ANALYTICS SCHEMAS =============

export const analyticsDateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  days: z.coerce.number().int().positive().max(365).default(30),
});

// ============= ADMIN SCHEMAS =============

export const adminUserIdSchema = z.object({
  userId: idSchema,
});

export const toggleUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const triggerAggregationSchema = z.object({
  categoryId: z.string().uuid().optional(),
  categoryName: z.string().max(100).optional(),
});

export const adminContentIdSchema = z.object({
  contentId: idSchema,
});

export const adminGetUsersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Export all schemas as a single object for convenience
export const schemas = {
  // Common
  id: idSchema,
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  url: urlSchema,
  date: dateSchema,
  pagination: paginationSchema,

  // Auth
  register: registerSchema,
  login: loginSchema,
  refreshToken: refreshTokenSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  verifyEmail: verifyEmailSchema,

  // User
  updateProfile: updateProfileSchema,
  updatePreferences: updatePreferencesSchema,
  updateCategories: updateCategoriesSchema,
  contentIdParam: contentIdParamSchema,
  queryFilter: queryFilterSchema,

  // Content
  getContent: getContentSchema,
  createContent: createContentSchema,
  updateContent: updateContentSchema,
  contentId: contentIdSchema,
  addTags: addTagsSchema,
  searchContent: searchContentSchema,
  trendingContent: trendingContentSchema,
  contentFreshness: contentFreshnessSchema,
  refreshContent: refreshContentSchema,

  // Search
  advancedSearch: advancedSearchSchema,
  searchSuggestions: searchSuggestionsSchema,
  searchHistory: searchHistorySchema,
  deleteSearch: deleteSearchSchema,

  // Category
  categoryId: categoryIdSchema,
  categorySlug: categorySlugSchema,
  subscribe: subscribeSchema,
  updateCategoryPriority: updateCategoryPrioritySchema,
  userCategoryId: userCategoryIdSchema,

  // Analytics
  analyticsDateRange: analyticsDateRangeSchema,

  // Admin
  adminUserId: adminUserIdSchema,
  toggleUserStatus: toggleUserStatusSchema,
  triggerAggregation: triggerAggregationSchema,
  adminContentId: adminContentIdSchema,
  adminGetUsers: adminGetUsersSchema,
};
