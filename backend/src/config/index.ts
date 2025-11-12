import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  apiVersion: process.env.API_VERSION || 'v1',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  redisPassword: process.env.REDIS_PASSWORD || '',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',

  // External APIs
  youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',

  // n8n
  n8nWebhookSecret: process.env.N8N_WEBHOOK_SECRET || '',
  n8nApiUrl: process.env.N8N_API_URL || '',

  // Email
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPassword: process.env.SMTP_PASSWORD || '',
  emailFrom: process.env.EMAIL_FROM || 'noreply@example.com',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // App URL
  appUrl: process.env.APP_URL || 'http://localhost:3000',
} as const;
