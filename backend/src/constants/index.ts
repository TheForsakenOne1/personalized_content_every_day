/**
 * Application Constants
 * Centralized location for all magic numbers and constant values
 */

// === REDIS CONFIGURATION ===
export const REDIS_CONSTANTS = {
  /** Maximum number of Redis reconnection attempts */
  MAX_RECONNECT_ATTEMPTS: 10,
  /** Base delay for reconnection in milliseconds */
  RECONNECT_BASE_DELAY_MS: 50,
  /** Maximum reconnection delay in milliseconds */
  RECONNECT_MAX_DELAY_MS: 3000,
} as const;

// === API LIMITS ===
export const API_LIMITS = {
  /** Default page size for pagination */
  DEFAULT_PAGE_SIZE: 20,
  /** Maximum page size to prevent abuse */
  MAX_PAGE_SIZE: 100,
  /** Maximum results for search suggestions */
  MAX_SEARCH_SUGGESTIONS: 20,
  /** Maximum results for autocomplete */
  MAX_AUTOCOMPLETE_RESULTS: 10,
  /** Maximum days for analytics queries */
  MAX_ANALYTICS_DAYS: 365, // 1 year
  /** Default analytics period in days */
  DEFAULT_ANALYTICS_DAYS: 30,
} as const;

// === EXTERNAL API LIMITS ===
export const EXTERNAL_API_LIMITS = {
  /** SerpAPI (Google Scholar) maximum results per request */
  SERP_API_MAX_RESULTS: 20,
  /** IEEE Xplore API maximum records per request */
  IEEE_MAX_RECORDS: 200,
  /** Springer API maximum results per page */
  SPRINGER_MAX_RESULTS: 100,
} as const;

// === SCORING AND RANKING ===
export const SCORING_CONSTANTS = {
  /** Maximum score for search suggestions */
  MAX_SUGGESTION_SCORE: 90,
  /** Score multiplier for search suggestion frequency */
  SUGGESTION_FREQUENCY_MULTIPLIER: 5,
  /** Maximum collaborative filtering score */
  MAX_COLLABORATIVE_SCORE: 15,
  /** Minimum quality score */
  MIN_QUALITY_SCORE: 0,
  /** Maximum quality score */
  MAX_QUALITY_SCORE: 1.0,
} as const;

// === TIME CONSTANTS ===
export const TIME_CONSTANTS = {
  /** Milliseconds in one second */
  ONE_SECOND_MS: 1000,
  /** Milliseconds in one minute */
  ONE_MINUTE_MS: 60 * 1000,
  /** Milliseconds in one hour */
  ONE_HOUR_MS: 60 * 60 * 1000,
  /** Milliseconds in one day */
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
  /** Milliseconds in one week */
  ONE_WEEK_MS: 7 * 24 * 60 * 60 * 1000,
  /** Seconds in one hour */
  ONE_HOUR_SECONDS: 3600,
  /** Seconds in one day */
  ONE_DAY_SECONDS: 86400,
} as const;

// === CACHE TTL (Time To Live) ===
export const CACHE_TTL = {
  /** Search results cache TTL in seconds (1 hour) */
  SEARCH_RESULTS: TIME_CONSTANTS.ONE_HOUR_SECONDS,
  /** Trending content cache TTL in seconds (15 minutes) */
  TRENDING: 900,
  /** User feed cache TTL in seconds (5 minutes) */
  USER_FEED: 300,
  /** Category list cache TTL in seconds (1 day) */
  CATEGORIES: TIME_CONSTANTS.ONE_DAY_SECONDS,
} as const;

// === VALIDATION CONSTANTS ===
export const VALIDATION = {
  /** Minimum password length */
  MIN_PASSWORD_LENGTH: 8,
  /** Maximum password length */
  MAX_PASSWORD_LENGTH: 128,
  /** Minimum username length */
  MIN_USERNAME_LENGTH: 3,
  /** Maximum username length */
  MAX_USERNAME_LENGTH: 30,
  /** Maximum email length */
  MAX_EMAIL_LENGTH: 255,
} as const;

// === HTTP STATUS CODES (for consistency) ===
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// === RETRY CONFIGURATION ===
export const RETRY_CONFIG = {
  /** Maximum number of retry attempts for external APIs */
  MAX_ATTEMPTS: 3,
  /** Base delay between retries in milliseconds */
  BASE_DELAY_MS: 1000,
  /** Maximum delay between retries in milliseconds */
  MAX_DELAY_MS: 5000,
} as const;

// === CONTENT AGGREGATION ===
export const AGGREGATION = {
  /** Default number of content items to fetch */
  DEFAULT_FETCH_COUNT: 10,
  /** Maximum number of content items to fetch */
  MAX_FETCH_COUNT: 50,
  /** Minimum quality score for content to be included */
  MIN_QUALITY_THRESHOLD: 0.3,
} as const;

// Export all constants as a single object for convenience
export const CONSTANTS = {
  REDIS: REDIS_CONSTANTS,
  API_LIMITS,
  EXTERNAL_API_LIMITS,
  SCORING: SCORING_CONSTANTS,
  TIME: TIME_CONSTANTS,
  CACHE_TTL,
  VALIDATION,
  HTTP_STATUS,
  RETRY: RETRY_CONFIG,
  AGGREGATION,
} as const;

export default CONSTANTS;
