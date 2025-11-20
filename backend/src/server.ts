import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';

import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { rateLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';
import { initializeContentAggregation } from './jobs/content-aggregation.job';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import contentRoutes from './routes/content.routes';
import searchRoutes from './routes/search.routes';
import analyticsRoutes from './routes/analytics.routes';
import adminRoutes from './routes/admin.routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const httpServer = createServer(app);

// Trust proxy - Required for rate limiting behind Render's proxy
app.set('trust proxy', true);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
// CORS configuration - Allow production and preview URLs from Vercel
const corsOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  // Allow requests with no origin (mobile apps, curl, etc.)
  if (!origin) {
    return callback(null, true);
  }

  // Get allowed origins from config
  const allowedOrigins = config.corsOrigin.split(',').map(o => o.trim());

  // Check if origin matches any allowed origin
  const isAllowed = allowedOrigins.some(allowed => {
    // Exact match
    if (origin === allowed) return true;

    // Allow all Vercel preview URLs for the same app
    // e.g., if allowed is https://myapp.vercel.app, also allow https://myapp-*.vercel.app
    if (allowed.includes('.vercel.app')) {
      const baseApp = allowed.replace('https://', '').split('.')[0];
      const originWithoutProtocol = origin.replace('https://', '');
      // Match pattern: myapp.vercel.app OR myapp-*.vercel.app OR myapp-git-*.vercel.app
      if (originWithoutProtocol === `${baseApp}.vercel.app` ||
          originWithoutProtocol.startsWith(`${baseApp}-`) && originWithoutProtocol.endsWith('.vercel.app')) {
        return true;
      }
    }

    return false;
  });

  if (isAllowed) {
    callback(null, true);
  } else {
    logger.warn('CORS blocked origin:', { origin, allowedOrigins });
    callback(new Error('Not allowed by CORS'));
  }
};

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Limit request body size
app.use(cookieParser());

// Rate limiting
app.use('/api', rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port || 4000;

httpServer.listen(PORT, () => {
  logger.info('Server started successfully', {
    port: PORT,
    environment: config.nodeEnv,
    corsOrigin: config.corsOrigin,
  });

  // Initialize content aggregation job in production
  if (config.nodeEnv === 'production') {
    logger.info('🚀 Initializing content aggregation job...');
    initializeContentAggregation(true); // Run immediately and schedule
  } else {
    logger.info('⚠️  Content aggregation disabled in development mode');
    logger.info('   To enable manually: POST /api/admin/aggregate');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed gracefully');
    process.exit(0);
  });
});

export default app;
