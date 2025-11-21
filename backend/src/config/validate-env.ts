/**
 * Environment Variable Validation
 * Validates all required environment variables on startup
 */

import { z } from 'zod';
import logger from '../utils/logger';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('4000'),
  API_VERSION: z.string().default('v1'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis (Optional in development)
  REDIS_URL: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),

  // JWT
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security')
    .refine(
      (val) => val !== 'your-super-secret-jwt-key-change-this-in-production',
      'JWT_SECRET must be changed from default value'
    ),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).transform(Number).default('100'),

  // App URL
  APP_URL: z.string().url().default('http://localhost:3000'),

  // External APIs (Optional)
  YOUTUBE_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  IEEE_API_KEY: z.string().optional(),
  SPRINGER_API_KEY: z.string().optional(),
  SERP_API_KEY: z.string().optional(),

  // n8n Integration (Optional)
  N8N_WEBHOOK_SECRET: z.string().optional(),
  N8N_API_URL: z.string().url().optional(),

  // Email (Optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
  SMTP_SECURE: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
});

export type ValidatedEnv = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Exits process if validation fails
 */
export function validateEnv(): ValidatedEnv {
  try {
    const validated = envSchema.parse(process.env);

    logger.info('✅ Environment variables validated successfully');

    // Log configuration (without sensitive data)
    logger.info('Configuration loaded:', {
      nodeEnv: validated.NODE_ENV,
      port: validated.PORT,
      corsOrigin: validated.CORS_ORIGIN,
      hasRedis: !!validated.REDIS_URL,
      hasYouTubeAPI: !!validated.YOUTUBE_API_KEY,
      hasOpenAI: !!validated.OPENAI_API_KEY,
      hasEmailConfig: !!(validated.SMTP_HOST && validated.SMTP_USER),
    });

    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('❌ Environment variable validation failed:');

      error.errors.forEach((err) => {
        const field = err.path.join('.');
        logger.error(`  • ${field}: ${err.message}`);
      });

      logger.error('\n💡 Tip: Check your .env file and ensure all required variables are set');
      logger.error('See .env.example for reference\n');
    } else {
      logger.error('❌ Unexpected error validating environment:', error);
    }

    process.exit(1);
  }
}

/**
 * Get validated environment configuration
 * Call validateEnv() first to ensure validation has run
 */
export function getEnv(): ValidatedEnv {
  return process.env as unknown as ValidatedEnv;
}
