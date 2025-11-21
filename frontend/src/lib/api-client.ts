/**
 * Production-Level API Client
 * Features:
 * - Automatic token refresh
 * - Request/response interceptors
 * - Error handling with retries
 * - Request deduplication
 * - Caching support
 * - TypeScript support
 */

import { toast } from 'sonner';
import { logger } from '@/lib/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface RequestConfig extends Omit<RequestInit, 'cache'> {
  skipAuth?: boolean;
  retry?: number;
  retryDelay?: number;
  enableCache?: boolean;
  cacheTime?: number;
}

interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const pendingRequests = new Map<string, Promise<any>>();

export class ApiClient {
  private baseUrl: string;
  private refreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get access token from storage
   */
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  /**
   * Set access token in storage
   */
  private setAccessToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', token);
  }

  /**
   * Clear authentication
   */
  private clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
  }

  /**
   * Refresh access token
   */
  private async refreshToken(): Promise<boolean> {
    if (this.refreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          this.clearAuth();
          return false;
        }

        const data = await response.json();
        if (data.success && data.data.accessToken) {
          this.setAccessToken(data.data.accessToken);
          return true;
        }

        this.clearAuth();
        return false;
      } catch (error) {
        logger.error('Token refresh failed', error);
        this.clearAuth();
        return false;
      } finally {
        this.refreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Generate cache key
   */
  private getCacheKey(url: string, options: RequestInit): string {
    return `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || {})}`;
  }

  /**
   * Get from cache
   */
  private getFromCache(key: string, maxAge: number): any | null {
    const cached = cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > maxAge) {
      cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set in cache
   */
  private setInCache(key: string, data: any): void {
    cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Make HTTP request with retries
   */
  private async makeRequest<T>(
    url: string,
    options: RequestConfig = {}
  ): Promise<T> {
    const {
      skipAuth = false,
      retry = 3,
      retryDelay = 1000,
      enableCache: useCache = false,
      cacheTime = 5 * 60 * 1000, // 5 minutes default
      ...fetchOptions
    } = options;

    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

    // Check cache for GET requests
    if (useCache && fetchOptions.method === 'GET') {
      const cacheKey = this.getCacheKey(fullUrl, fetchOptions);
      const cached = this.getFromCache(cacheKey, cacheTime);
      if (cached) {
        return cached;
      }

      // Check for pending request (deduplication)
      if (pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey)!;
      }
    }

    // Build headers
    const headers = new Headers(fetchOptions.headers);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (!skipAuth) {
      const token = this.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    const config: RequestInit = {
      ...fetchOptions,
      headers,
      credentials: 'include',
    };

    // Retry logic
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < retry; attempt++) {
      try {
        const response = await fetch(fullUrl, config);

        // Handle 401 Unauthorized - try token refresh
        if (response.status === 401 && !skipAuth && attempt === 0) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            const newToken = this.getAccessToken();
            if (newToken) {
              headers.set('Authorization', `Bearer ${newToken}`);
              const retryResponse = await fetch(fullUrl, { ...config, headers });

              if (retryResponse.ok) {
                const data = await retryResponse.json();
                return data;
              }
            }
          } else {
            // Refresh failed, redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            throw new Error('Authentication failed');
          }
        }

        // Handle other errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `HTTP error! status: ${response.status}`,
          }));

          const apiError: ApiError = {
            message: errorData.error?.message || errorData.message || 'An error occurred',
            code: errorData.error?.code || errorData.code,
            status: response.status,
          };

          // Don't retry client errors (4xx except 429)
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw apiError;
          }

          throw apiError;
        }

        const data = await response.json();

        // Cache successful GET requests
        if (useCache && fetchOptions.method === 'GET') {
          const cacheKey = this.getCacheKey(fullUrl, fetchOptions);
          this.setInCache(cacheKey, data);
          pendingRequests.delete(cacheKey);
        }

        return data;
      } catch (error: any) {
        lastError = error;

        // Don't retry on client errors
        if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error;
        }

        // Wait before retrying
        if (attempt < retry - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        }
      }
    }

    // All retries failed
    throw lastError || new Error('Request failed');
  }

  /**
   * Core request methods
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'GET',
      enableCache: config?.enableCache !== false, // Enable cache by default for GET
    });
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'DELETE',
    });
  }

  /**
   * Clear cache
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      cache.clear();
      return;
    }

    Array.from(cache.keys()).forEach(key => {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    });
  }

  /**
   * Handle errors globally
   */
  handleError(error: any): void {
    const message = error.message || 'An unexpected error occurred';
    const isNetworkError = error.message?.includes('fetch') || !error.status;

    if (isNetworkError) {
      toast.error('Network error. Please check your connection.');
    } else if (error.status === 401) {
      toast.error('Session expired. Please log in again.');
    } else if (error.status === 403) {
      toast.error('You don\'t have permission to perform this action.');
    } else if (error.status === 404) {
      toast.error('Resource not found.');
    } else if (error.status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (error.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }

    logger.error('API Error', error);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export default for convenience
export default apiClient;
