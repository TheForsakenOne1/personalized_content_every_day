/**
 * Sentry Server-Side Configuration
 * Tracks errors in Next.js server-side code
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',

  // Filter sensitive data
  beforeSend(event) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
    }

    // Remove sensitive query parameters
    if (event.request?.query_string) {
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
    /extensions\//i,
    /^Non-Error/,
    'Network request failed',
    'NetworkError',
  ],

  // Don't send in development
  enabled: process.env.NODE_ENV !== 'development',
});
