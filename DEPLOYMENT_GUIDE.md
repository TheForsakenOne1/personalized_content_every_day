# Deployment Guide - Phase 3 Week 12

**Target**: Production-ready deployment with monitoring
**Platforms**: Railway, Render, AWS, or Vercel (backend)
**Database**: PostgreSQL (Railway, Supabase, or AWS RDS)
**Redis**: Upstash or AWS ElastiCache
**Monitoring**: DataDog, New Relic, or Sentry

---

## Pre-Deployment Checklist

### Code Quality
- ✅ All tests passing
- ✅ Code coverage >80%
- ✅ No critical security vulnerabilities
- ✅ TypeScript strict mode enabled
- ✅ ESLint and Prettier configured

### Configuration
- ✅ Environment variables documented
- ✅ Secrets stored securely (not in code)
- ✅ Database migrations ready
- ✅ CORS configured correctly
- ✅ Rate limiting enabled

### Performance
- ✅ Database indexed
- ✅ Redis caching implemented
- ✅ Load testing completed
- ✅ Query optimization done

### Security
- ✅ HTTPS enabled
- ✅ Security headers configured (helmet)
- ✅ Input validation on all endpoints
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection enabled

---

## Environment Variables

### Required Variables

```env
# Server
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=postgresql://user:password@host:5432/vidya

# Redis
REDIS_URL=redis://default:password@host:6379

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=https://vidya.app

# App
APP_URL=https://vidya.app

# Email (optional, for production)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM=noreply@vidya.app

# Research APIs (optional)
IEEE_API_KEY=your-ieee-api-key
SPRINGER_API_KEY=your-springer-api-key
SERP_API_KEY=your-serpapi-key

# Admin
ADMIN_EMAILS=admin@vidya.app,you@example.com
```

### Generating Secrets

```bash
# Generate JWT secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Deployment Platforms

### Option 1: Railway (Recommended)

**Pros**: Easy setup, PostgreSQL included, automatic deployments
**Pricing**: ~$10-20/month (hobby), scales to ~$50-100/month

**Steps**:

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Create Project**:
   ```bash
   railway init
   railway add
   # Select PostgreSQL and Redis
   ```

3. **Configure**:
   ```bash
   # Set environment variables
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=your-secret
   # ... set all other variables
   ```

4. **Deploy**:
   ```bash
   railway up
   ```

5. **Run Migrations**:
   ```bash
   railway run npx prisma migrate deploy
   railway run npx prisma db seed
   ```

6. **Custom Domain**:
   - Add domain in Railway dashboard
   - Update DNS records
   - SSL automatically provisioned

### Option 2: Render

**Pros**: Free tier available, automatic SSL, easy deploys
**Pricing**: Free (hobby), $7/month (starter), $25/month (standard)

**Steps**:

1. **Create Web Service**:
   - Connect GitHub repository
   - Select Node.js environment
   - Build command: `npm install && npx prisma generate && npm run build`
   - Start command: `npm start`

2. **Add PostgreSQL**:
   - Create PostgreSQL database
   - Link to web service

3. **Add Redis**:
   - Use external provider (Upstash)
   - Add REDIS_URL to environment

4. **Environment Variables**:
   - Add all variables in Render dashboard

5. **Deploy**:
   - Automatic on git push to main branch

### Option 3: AWS (Advanced)

**Pros**: Enterprise-grade, full control, scalable
**Pricing**: ~$50-200/month (varies with usage)

**Architecture**:
```
CloudFront (CDN)
    ↓
ALB (Load Balancer)
    ↓
ECS (Container Service)
    ├── Backend containers (2-4 instances)
    ↓
RDS PostgreSQL (Multi-AZ)
ElastiCache Redis (Cluster)
S3 (Static assets)
```

**Deployment**:
1. Dockerize application
2. Push to ECR (Elastic Container Registry)
3. Create ECS service
4. Configure ALB
5. Set up auto-scaling
6. Configure CloudWatch monitoring

---

## Database Migration

### From SQLite to PostgreSQL

**1. Update Schema**:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**2. Export Data** (if migrating existing data):
```bash
node scripts/export-sqlite.js > data.json
```

**3. Create PostgreSQL Database**:
```bash
# On Railway
railway add # Select PostgreSQL

# On Render
# Use Render dashboard to create database

# On AWS
aws rds create-db-instance --db-instance-identifier vidya-prod --allocated-storage 20 --db-instance-class db.t3.micro --engine postgres
```

**4. Run Migrations**:
```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

**5. Seed Data**:
```bash
npx prisma db seed
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway login --browserless
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## Monitoring Setup

### DataDog

**Installation**:
```bash
npm install dd-trace
```

**Configuration**:
```typescript
// src/server.ts (top of file)
import tracer from 'dd-trace';
tracer.init({
  service: 'vidya-api',
  env: process.env.NODE_ENV,
  logInjection: true,
});
```

**Environment Variables**:
```env
DD_API_KEY=your-datadog-api-key
DD_SITE=datadoghq.com
DD_SERVICE=vidya-api
DD_ENV=production
```

### Sentry (Error Tracking)

**Installation**:
```bash
npm install @sentry/node
```

**Configuration**:
```typescript
// src/server.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
});

// Add error handler
app.use(Sentry.Handlers.errorHandler());
```

### Custom Metrics Dashboard

```typescript
// src/middleware/metrics.ts
import { Counter, Histogram, Registry } from 'prom-client';

const register = new Registry();

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
    httpRequestTotal.labels(req.method, req.route?.path || req.path, res.statusCode).inc();
  });

  next();
};

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

---

## Backup Strategy

### Database Backups

**Automated Backups** (Railway):
- Automatic daily backups
- 7-day retention (free tier)
- 30-day retention (pro tier)
- Manual backups on demand

**Manual Backup Script**:
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/backups"

# Create backup
pg_dump $DATABASE_URL | gzip > "$BACKUP_DIR/vidya-$DATE.sql.gz"

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/vidya-$DATE.sql.gz" s3://vidya-backups/

# Keep last 30 days locally
find "$BACKUP_DIR" -name "vidya-*.sql.gz" -mtime +30 -delete

echo "Backup completed: vidya-$DATE.sql.gz"
```

**Cron Job**:
```cron
0 2 * * * /home/user/backup.sh
```

### Redis Backups

Redis data is cache only (no persistence needed), but if storing critical data:

```bash
# Enable Redis persistence
redis-cli CONFIG SET save "900 1 300 10 60 10000"

# Manual save
redis-cli BGSAVE
```

---

## Health Checks

### Liveness Probe

```typescript
// Existing /health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### Readiness Probe

```typescript
// Detailed health check
app.get('/health/ready', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    externalAPIs: await checkExternalAPIs(),
  };

  const healthy = Object.values(checks).every(check => check.status === 'ok');

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  });
});

async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

async function checkRedis() {
  try {
    await redis.ping();
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}
```

---

## Scaling Strategy

### Vertical Scaling (1-1000 users)

- Start: 1 CPU, 512MB RAM
- Grow: 2 CPU, 1GB RAM
- Cost: ~$10-20/month

### Horizontal Scaling (1000-10000 users)

- 2-4 backend instances behind load balancer
- PostgreSQL read replicas
- Redis cluster
- Cost: ~$100-200/month

### Auto-Scaling (10000+ users)

- AWS ECS with auto-scaling (CPU >70%)
- RDS Multi-AZ with read replicas
- ElastiCache Redis cluster
- CloudFront CDN
- Cost: ~$500-1000/month

---

## Rollback Strategy

### Version Tagging

```bash
# Tag before deployment
git tag -a v1.0.0 -m "Production release 1.0.0"
git push origin v1.0.0
```

### Quick Rollback

**Railway**:
```bash
railway rollback
```

**Render**:
- Use dashboard to rollback to previous deployment

**AWS ECS**:
```bash
aws ecs update-service --cluster vidya --service backend --task-definition vidya-backend:previous
```

### Database Rollback

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back migration_name
```

---

## Security Best Practices

### 1. Environment Variables
- Never commit secrets to git
- Use `.env.example` for documentation
- Rotate secrets regularly

### 2. HTTPS Only
```typescript
if (process.env.NODE_ENV === 'production' && req.protocol !== 'https') {
  return res.redirect(`https://${req.hostname}${req.url}`);
}
```

### 3. Security Headers
```typescript
import helmet from 'helmet';
app.use(helmet());
```

### 4. Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use('/api', limiter);
```

### 5. CORS Configuration
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
```

---

## Monitoring Alerts

### Set Up Alerts

**DataDog Alerts**:
- Error rate >1%
- Response time p95 >500ms
- Database connections >80%
- Memory usage >85%
- CPU usage >80%

**Notification Channels**:
- Email
- Slack
- PagerDuty (for critical alerts)

### Example Alert Configuration

```yaml
# datadog/alerts.yml
alerts:
  - name: High Error Rate
    query: sum:http_requests_total{status_code:5xx}.as_count() > 10
    message: "Error rate is above threshold. Check logs."
    tags: [critical]

  - name: Slow Response Time
    query: avg:http_request_duration_seconds.p95 > 0.5
    message: "API response time is degraded."
    tags: [warning]

  - name: Database Connection Pool
    query: avg:database_connections > 16
    message: "Database connection pool is near capacity."
    tags: [warning]
```

---

## Runbook

### Common Issues

**1. High Error Rate**
```bash
# Check logs
railway logs --tail=100

# Check database
railway run npx prisma studio

# Restart service
railway restart
```

**2. Slow Performance**
```bash
# Check Redis
redis-cli INFO stats

# Check database slow queries
# (in PostgreSQL)
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

# Clear cache if needed
redis-cli FLUSHDB
```

**3. Database Connection Errors**
```bash
# Check connection count
SELECT count(*) FROM pg_stat_activity;

# Increase connection limit (if needed)
ALTER SYSTEM SET max_connections = 100;
SELECT pg_reload_conf();
```

---

## Production Launch Checklist

- [ ] All tests passing
- [ ] Load testing completed
- [ ] Security audit done
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Database seeded with initial data
- [ ] Backups configured
- [ ] Monitoring configured
- [ ] Alerts configured
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Error tracking enabled (Sentry)
- [ ] Documentation complete
- [ ] Runbook created
- [ ] Team trained on monitoring/alerts

---

**Created By**: Claude Code Agent
**Date**: November 16, 2025
**Phase**: 3 Week 12 - Deployment & Monitoring
