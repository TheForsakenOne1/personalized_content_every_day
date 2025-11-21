/**
 * API Services Barrel Export
 */

export { authService, type User, type LoginCredentials, type RegisterCredentials, type AuthResponse } from './auth.service';
export { contentService, type Content, type ContentFilters, type PaginatedResponse } from './content.service';
export { userService, type UserPreferences, type UserCategory, type UserStats } from './user.service';
export { categoryService, type Category } from './category.service';
export { searchService, type SearchSuggestion, type SearchResult } from './search.service';
export { contentRefreshService, type ContentFreshness } from './content-refresh.service';

// Re-export API client for direct access if needed
export { apiClient } from '@/lib/api-client';
