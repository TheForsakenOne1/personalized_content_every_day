/**
 * Sanitization Utilities
 * Provides XSS protection by sanitizing user input
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 * Converts: < > & " ' / to their HTML entity equivalents
 */
export function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') return unsafe;

  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strip HTML tags from string
 * Removes all HTML/XML tags leaving only text content
 */
export function stripHtmlTags(html: string): string {
  if (typeof html !== 'string') return html;

  return html.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize user input for safe storage and display
 * Combines HTML escaping and whitespace normalization
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input;

  // Strip HTML tags
  let sanitized = stripHtmlTags(input);

  // Escape remaining special characters
  sanitized = escapeHtml(sanitized);

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
}

/**
 * Sanitize an object's string properties
 * Recursively sanitizes all string values in an object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Sanitize specific fields in user profile data
 */
export function sanitizeUserProfile(profile: {
  fullName?: string;
  username?: string;
  email?: string;
  [key: string]: any;
}) {
  return {
    ...profile,
    fullName: profile.fullName ? sanitizeInput(profile.fullName) : profile.fullName,
    username: profile.username ? sanitizeInput(profile.username) : profile.username,
    // Email is validated by zod, but we can still sanitize
    email: profile.email ? profile.email.trim().toLowerCase() : profile.email,
  };
}

/**
 * Sanitize content data
 */
export function sanitizeContentData(content: {
  title?: string;
  description?: string;
  author?: string;
  source?: string;
  [key: string]: any;
}) {
  return {
    ...content,
    title: content.title ? sanitizeInput(content.title) : content.title,
    description: content.description ? sanitizeInput(content.description) : content.description,
    author: content.author ? sanitizeInput(content.author) : content.author,
    source: content.source ? sanitizeInput(content.source) : content.source,
  };
}

/**
 * Validate and sanitize search query
 * Prevents search injection attacks
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') return '';

  // Remove special SQL/NoSQL characters that could be used for injection
  let sanitized = query
    .replace(/[;&|<>]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');

  // Strip HTML
  sanitized = stripHtmlTags(sanitized);

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Limit length
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500);
  }

  return sanitized;
}

/**
 * Check if string contains potential XSS payload
 * Returns true if suspicious content is detected
 */
export function containsXSSPattern(input: string): boolean {
  if (typeof input !== 'string') return false;

  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // event handlers like onclick=
    /<iframe[\s\S]*?>/gi,
    /<object[\s\S]*?>/gi,
    /<embed[\s\S]*?>/gi,
    /eval\(/gi,
    /expression\(/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Sanitize and validate URL
 * Ensures URL is safe and doesn't contain javascript: or data: protocols
 */
export function sanitizeUrl(url: string): string | null {
  if (typeof url !== 'string') return null;

  const trimmedUrl = url.trim();

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = trimmedUrl.toLowerCase();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return null;
    }
  }

  // Only allow http, https, and mailto
  if (!/^(https?|mailto):/i.test(trimmedUrl)) {
    return null;
  }

  return trimmedUrl;
}
