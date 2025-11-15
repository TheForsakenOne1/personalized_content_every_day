# Deployment Guide

This guide covers deploying the EduHub personalized content platform to production.

## Architecture

The application consists of two separate components:
- **Frontend**: Next.js 14 application (deploy to Vercel)
- **Backend**: Express.js API (deploy to Railway/Render/Fly.io)

## Frontend Deployment (Vercel) ✅

### Prerequisites
- GitHub account
- Vercel account (free tier works)

### Steps

1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Import project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure build settings**

   Vercel should auto-configure, but verify:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build:frontend`
   - **Output Directory**: `frontend/.next`
   - **Install Command**: `npm install && cd frontend && npm install`
   - **Root Directory**: Leave empty (monorepo auto-detected)

4. **Set environment variables**

   Add these in Vercel dashboard (Settings > Environment Variables):
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
   ```

   Replace `your-backend-url.com` with your actual backend URL (see Backend Deployment below)

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Your app will be live at `your-project.vercel.app`

### Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel

## Backend Deployment (Railway/Render)

The backend is a Node.js Express app with SQLite database. For production, you should use PostgreSQL.

### Option A: Railway (Recommended)

1. **Create Railway account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create new project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure service**
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **Add PostgreSQL database**
   - Click "New" > "Database" > "PostgreSQL"
   - Railway will create a database and set DATABASE_URL automatically

5. **Set environment variables**
   ```
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=(auto-set by Railway for PostgreSQL)
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```

6. **Deploy**
   - Railway will auto-deploy on git push
   - Your API will be available at `your-app.up.railway.app`

### Option B: Render

1. **Create Render account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create new Web Service**
   - Click "New +" > "Web Service"
   - Connect your repository
   - Root Directory: `backend`

3. **Configure build settings**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: `Node`

4. **Add environment variables**
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-super-secret-jwt-key
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```

5. **Create PostgreSQL database**
   - In Render dashboard, click "New +" > "PostgreSQL"
   - Copy the Internal Database URL
   - Add to your service as DATABASE_URL

### Database Migration (PostgreSQL)

Once deployed with PostgreSQL:

```bash
# Connect to your deployment
railway run npx prisma migrate deploy
# Or for Render, use their shell

# Seed the database
railway run npx prisma db seed
```

## Environment Variables Reference

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
```

### Backend (.env)
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=https://your-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
APP_URL=https://your-frontend.vercel.app
```

## Post-Deployment Checklist

- [ ] Frontend builds successfully on Vercel
- [ ] Backend API is accessible
- [ ] Database is connected and seeded
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] API endpoints return data
- [ ] Authentication works (register/login)
- [ ] User can save/bookmark content
- [ ] Feed displays content correctly

## Testing Deployment

### Test Frontend
```bash
curl https://your-app.vercel.app
# Should return HTML
```

### Test Backend API
```bash
# Health check
curl https://your-backend.railway.app/health

# Get categories
curl https://your-backend.railway.app/api/categories

# Register user
curl -X POST https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'
```

## Troubleshooting

### "API request failed" in browser

**Issue**: Frontend can't connect to backend

**Solution**:
1. Check NEXT_PUBLIC_API_URL is set correctly in Vercel
2. Verify CORS_ORIGIN in backend matches frontend URL
3. Ensure backend is deployed and accessible

### "Database connection failed"

**Issue**: Backend can't connect to database

**Solution**:
1. Verify DATABASE_URL is set correctly
2. Check database is running
3. Run migrations: `npx prisma migrate deploy`

### "Module not found" errors

**Issue**: Missing dependencies

**Solution**:
1. Delete node_modules and package-lock.json
2. Run `npm install` in both frontend and backend
3. Redeploy

### Build fails on Vercel

**Issue**: TypeScript or build errors

**Solution**:
1. Run `npm run build` locally to catch errors
2. Check all TypeScript files compile
3. Verify all environment variables are set

## Scaling Considerations

### Frontend (Vercel)
- Vercel scales automatically
- Free tier: 100GB bandwidth/month
- Pro: Unlimited bandwidth

### Backend
- Start with 512MB RAM
- Scale up based on traffic
- Add Redis for session storage
- Use CDN for static assets

### Database
- Start with smallest PostgreSQL plan
- Monitor query performance
- Add indexes for frequently queried fields
- Consider read replicas for high traffic

## Monitoring

### Vercel Analytics
- Enable in Project Settings > Analytics
- Track page views, performance metrics

### Backend Monitoring
- Railway/Render have built-in metrics
- Add error tracking: Sentry
- Add logging: LogTail, Papertrail

## Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] CORS_ORIGIN is set to your frontend domain only
- [ ] Database connection uses SSL
- [ ] Passwords are hashed (bcrypt with salt rounds >= 10)
- [ ] Rate limiting is enabled
- [ ] API keys are in environment variables (not code)
- [ ] HTTPS is enforced (Vercel/Railway/Render do this automatically)

## Cost Estimate

### Free Tier (Hobby Projects)
- Vercel: Free
- Railway: $5/month free credit
- Render: Free tier available
- **Total**: ~$0-5/month

### Production (Small Scale)
- Vercel Pro: $20/month
- Railway: ~$10-20/month (backend + database)
- **Total**: ~$30-40/month

## Rollback

### Frontend (Vercel)
1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." > "Promote to Production"

### Backend (Railway)
1. Go to Deployments
2. Click on previous deployment
3. Click "Redeploy"

## CI/CD

Both Vercel and Railway automatically deploy on git push to main branch. No additional setup needed!

To deploy specific branches:
- Vercel: Create branch deployments in settings
- Railway: Add deployment trigger for specific branch

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

## Next Steps After Deployment

1. Set up custom domain
2. Configure email service (for password reset)
3. Add analytics
4. Set up monitoring/alerts
5. Create staging environment
6. Document API endpoints (Swagger/OpenAPI)
