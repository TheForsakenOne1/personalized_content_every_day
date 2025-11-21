/**
 * Sentry Edge Runtime Configuration
 * Tracks errors in Edge runtime (middleware, edge API routes)
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

  // Don't send in development
  enabled: process.env.NODE_ENV !== 'development',
});
