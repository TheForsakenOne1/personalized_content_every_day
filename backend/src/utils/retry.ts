/**
 * Retry utility for handling transient failures
 */

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    maxDelayMs = 30000,
    onRetry,
  } = options;

  let lastError: any;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }

      // Last attempt - throw error
      if (attempt === maxAttempts) {
        throw error;
      }

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, error);
      }

      // Wait before retrying
      await delay(currentDelay);

      // Exponential backoff
      currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelayMs);
    }
  }

  throw lastError;
}

/**
 * Delay for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with linear backoff
 */
export async function retryLinear<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  return retryWithBackoff(fn, {
    maxAttempts,
    delayMs,
    backoffMultiplier: 1, // Linear - no exponential growth
  });
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return true;
  }

  // Server errors (5xx)
  if (error.response?.status >= 500) {
    return true;
  }

  // Rate limit errors (429)
  if (error.response?.status === 429) {
    return true;
  }

  return false;
}
