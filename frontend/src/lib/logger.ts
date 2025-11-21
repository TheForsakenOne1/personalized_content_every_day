/**
 * Frontend Structured Logger
 * Production-ready logging utility with environment-aware behavior
 */

import * as Sentry from '@sentry/nextjs';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Format log message with context
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Send logs to external service (Sentry)
   */
  private sendToExternalService(level: LogLevel, message: string, context?: LogContext): void {
    // Only send errors and warnings to external services in production
    if (this.isProduction && (level === 'error' || level === 'warn')) {
      Sentry.captureMessage(message, {
        level: level as Sentry.SeverityLevel,
        extra: context,
      });
    }
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  /**
   * Log info messages
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(this.formatMessage('info', message, context));
    }
    this.sendToExternalService('info', message, context);
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(this.formatMessage('warn', message, context));
    }
    this.sendToExternalService('warn', message, context);
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    };

    if (this.isDevelopment) {
      console.error(this.formatMessage('error', message, errorContext));
      if (error instanceof Error) {
        console.error(error);
      }
    }

    // Send to Sentry in production
    if (this.isProduction) {
      if (error instanceof Error) {
        Sentry.captureException(error, {
          extra: {
            ...context,
            logMessage: message,
          },
        });
      } else {
        this.sendToExternalService('error', message, errorContext);
      }
    }
  }

  /**
   * Track user events/analytics
   */
  track(event: string, properties?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[TRACK] ${event}`, properties);
    }

    // TODO: Send to analytics service (e.g., Google Analytics, Mixpanel)
    // Example: analytics.track(event, properties);
  }
}

export const logger = new Logger();
