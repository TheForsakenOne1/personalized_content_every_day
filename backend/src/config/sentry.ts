/**
 * Sentry Error Tracking Configuration
 * Monitors errors and performance in production
 */

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { getEnv } from './validate-env';

/**
 * Initialize Sentry for error tracking
 */
export function initializeSentry(): void {
  const env = getEnv();

  // Only initialize in non-development environments
  if (env.NODE_ENV === 'development') {
    return;
  }

  // Check if SENTRY_DSN is configured
  const sentryDsn = process.env.SENTRY_DSN;
  if (!sentryDsn) {
    console.warn('⚠️  SENTRY_DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: env.NODE_ENV,

    // Performance Monitoring
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in production, 100% in staging

    // Profiling
    profilesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      nodeProfilingIntegration(),
    ],

    // Release tracking
    release: process.env.APP_VERSION || 'unknown',

    // Filter sensitive data
    beforeSend(event) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }

      // Remove sensitive query parameters
      if (event.request?.query_string && typeof event.request.query_string === 'string') {
        const sanitized = event.request.query_string
          .replace(/token=[^&]*/gi, 'token=[REDACTED]')
          .replace(/password=[^&]*/gi, 'password=[REDACTED]')
          .replace(/secret=[^&]*/gi, 'secret=[REDACTED]');
        event.request.query_string = sanitized;
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      /extensions\//i,
      /^Non-Error/,
      // Network errors that we can't control
      'Network request failed',
      'NetworkError',
      // Expected validation errors
      'ValidationError',
    ],
  });

  console.log('✅ Sentry initialized for error tracking');
}

/**
 * Manually capture an error to Sentry
 */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: { id: string; email: string; username: string }): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, data?: Record<string, unknown>): void {
  Sentry.addBreadcrumb({
    message,
    data,
    level: 'info',
    timestamp: Date.now() / 1000,
  });
}
