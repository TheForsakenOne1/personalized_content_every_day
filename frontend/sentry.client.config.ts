/**
 * Sentry Client-Side Configuration
 * Tracks errors in the browser
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',

  // Filter sensitive data
  beforeSend(event) {
    // Remove sensitive data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
        if (breadcrumb.data) {
          // Remove sensitive fields
          delete breadcrumb.data.password;
          delete breadcrumb.data.token;
          delete breadcrumb.data.authorization;
        }
        return breadcrumb;
      });
    }

    // Remove sensitive data from extra context
    if (event.extra) {
      delete event.extra.password;
      delete event.extra.token;
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    /extensions\//i,
    /^Non-Error/,
    // Network errors
    'Network request failed',
    'NetworkError',
    'Failed to fetch',
    // Chunk loading errors (usually due to deployments)
    /Loading chunk [\d]+ failed/,
    'ChunkLoadError',
    // ResizeObserver errors (benign)
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
  ],

  // Don't send in development
  enabled: process.env.NODE_ENV !== 'development',
});
