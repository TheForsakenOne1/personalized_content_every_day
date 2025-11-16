# Backend Deployment Guide

This guide will help you deploy the EduHub backend API to production.

## 🚀 Quick Start (Railway - Recommended)

Railway is the easiest and most cost-effective option for deploying this backend with PostgreSQL.

### Prerequisites
- GitHub account
- Railway account (free: https://railway.app)
- Your code pushed to GitHub

### Step-by-Step Deployment

#### 1. Sign Up for Railway
1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub

#### 2. Create New Project from GitHub
1. Click "Deploy from GitHub repo"
2. Select your repository: `personalized_content_every_day`
3. Railway will detect the monorepo structure

#### 3. Add Backend Service
1. Click "Add a service"
2. Select "GitHub Repo"
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm start`

#### 4. Add PostgreSQL Database
1. Click "New" → "Database" → "Add PostgreSQL"
2. Railway automatically sets `DATABASE_URL` environment variable
3. Database is ready to use!

#### 5. Add Redis (Optional but Recommended)
1. Click "New" → "Database" → "Add Redis"
2. Railway automatically sets `REDIS_URL` environment variable

#### 6. Configure Environment Variables
Click on your backend service → "Variables" tab:

**Required Variables:**
```env
NODE_ENV=production
PORT=4000
JWT_SECRET=<generate-using-command-below>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=https://your-frontend-url.vercel.app
APP_URL=https://your-frontend-url.vercel.app
```

**Generate Secure JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and use it as `JWT_SECRET`

**Optional Variables (for features):**
```env
# Email (for password reset)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<your-sendgrid-api-key>
EMAIL_FROM=noreply@yourdomain.com

# Content aggregation APIs
YOUTUBE_API_KEY=<your-key>
OPENAI_API_KEY=<your-key>
IEEE_API_KEY=<your-key>
SPRINGER_API_KEY=<your-key>
```

#### 7. Deploy!
1. Railway will automatically build and deploy
2. Wait for deployment to complete (2-5 minutes)
3. Your backend will be live at: `https://your-app.up.railway.app`

#### 8. Get Your Backend URL
1. Go to your backend service in Railway
2. Click on "Settings" → "Networking"
3. Copy the public URL (e.g., `https://your-app.up.railway.app`)
4. **Save this URL** - you'll need it for frontend configuration

#### 9. Update Frontend Environment Variables
In your Vercel frontend deployment:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` to: `https://your-app.up.railway.app/api`
3. Redeploy frontend

#### 10. Verify Deployment
Test your API:
```bash
# Health check
curl https://your-app.up.railway.app/health

# Get categories
curl https://your-app.up.railway.app/api/categories

# Register a test user
curl -X POST https://your-app.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "SecurePass123!"
  }'
```

---

## 🎨 Alternative: Render.com

Render offers a generous free tier perfect for testing.

### Step-by-Step (Render)

#### 1. Sign Up
1. Go to https://render.com
2. Sign up with GitHub

#### 2. Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Name: `eduhub-db`
3. Plan: Free or Starter
4. Create database
5. **Copy the Internal Database URL** (you'll need this)

#### 3. Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `eduhub-backend`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main` or your deployment branch
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm start`
   - **Plan**: Free or Starter

#### 4. Add Environment Variables
In Render dashboard, add these variables:

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=<paste-internal-database-url-from-step-2>
JWT_SECRET=<generate-with-crypto>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=https://your-frontend.vercel.app
APP_URL=https://your-frontend.vercel.app
```

#### 5. Deploy
1. Click "Create Web Service"
2. Render will build and deploy (5-10 minutes)
3. Your API will be at: `https://eduhub-backend.onrender.com`

**Note:** Free tier services sleep after 15 minutes of inactivity. First request after sleep takes ~30 seconds.

---

## 📊 Cost Comparison

| Platform | Free Tier | Paid Tier | Database | Best For |
|----------|-----------|-----------|----------|----------|
| **Railway** | $5 credit/month | $5-20/month | PostgreSQL included | Production, auto-scaling |
| **Render** | ✅ Free (sleeps) | $7/month | Free PostgreSQL | Testing, hobby projects |
| **Vercel** | ❌ No backend | N/A | N/A | Frontend only |
| **Heroku** | ❌ Deprecated | $7-25/month | PostgreSQL add-on | Legacy |

**Recommendation:**
- **Development/Testing**: Render (free tier)
- **Production**: Railway ($10-20/month for backend + database)

---

## 🔧 Configuration Files Included

Your backend now includes:

1. **`backend/railway.json`** - Railway-specific configuration
2. **`backend/render.yaml`** - Render Blueprint for one-click deploy
3. **`backend/.env.production.example`** - Production environment variables template

---

## 🧪 Testing Your Deployment

### 1. Health Check
```bash
curl https://your-backend-url/health
```
Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-16T..."
}
```

### 2. Test Registration
```bash
curl -X POST https://your-backend-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "SecurePassword123!"
  }'
```

### 3. Test Login
```bash
curl -X POST https://your-backend-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

### 4. Test Content API
```bash
curl https://your-backend-url/api/content
```

---

## 🔒 Security Checklist

Before going live, ensure:

- [ ] `JWT_SECRET` is a strong, random 32+ character string
- [ ] `CORS_ORIGIN` is set to your exact frontend URL (no wildcards in production)
- [ ] `NODE_ENV=production` is set
- [ ] Database uses SSL connection (automatic on Railway/Render)
- [ ] No sensitive data in git repository
- [ ] Rate limiting is enabled (default: 100 requests per 15 minutes)
- [ ] `SMTP_PASSWORD` and API keys are set as environment variables

---

## 📈 Monitoring & Logs

### Railway
- **Logs**: Click on your service → "Deployments" → "View Logs"
- **Metrics**: CPU, Memory, Network usage visible in dashboard
- **Alerts**: Set up in Settings → Notifications

### Render
- **Logs**: Click on your service → "Logs" tab
- **Metrics**: Available in service dashboard
- **Alerts**: Email notifications for crashes

---

## 🐛 Troubleshooting

### "Application failed to respond"
**Cause**: Server not starting or PORT not configured correctly
**Fix**:
1. Check logs for errors
2. Ensure `PORT` environment variable is set
3. Verify build completed successfully

### "Database connection failed"
**Cause**: DATABASE_URL not set or incorrect
**Fix**:
1. Verify `DATABASE_URL` in environment variables
2. Check database is running
3. Run migrations: `npx prisma migrate deploy`

### "CORS error in frontend"
**Cause**: CORS_ORIGIN mismatch
**Fix**:
1. Set `CORS_ORIGIN` to exact frontend URL: `https://your-app.vercel.app`
2. No trailing slash
3. Must include `https://`

### "Module not found" errors
**Cause**: Dependencies not installed
**Fix**:
1. Check build command includes `npm install`
2. Verify `package.json` is in backend directory
3. Redeploy with clean build

### "Prisma Client not generated"
**Cause**: Build command missing `npx prisma generate`
**Fix**:
1. Update build command to: `npm install && npx prisma generate && npm run build`
2. Redeploy

---

## 🔄 Continuous Deployment

Both Railway and Render automatically deploy when you push to your main branch!

```bash
# Make changes to backend
git add backend/
git commit -m "Update: add new feature"
git push origin main

# Railway/Render automatically:
# 1. Detects the push
# 2. Runs build command
# 3. Deploys new version
# 4. Zero-downtime deployment
```

---

## 🌐 Custom Domain (Optional)

### Railway
1. Go to your service → Settings → Networking
2. Click "Add Custom Domain"
3. Enter your domain (e.g., `api.yourdomain.com`)
4. Add DNS record as shown
5. SSL certificate auto-provisioned

### Render
1. Go to your service → Settings
2. Click "Add Custom Domain"
3. Enter domain
4. Update DNS with provided records
5. SSL auto-provisioned (Let's Encrypt)

---

## 📦 Database Backups

### Railway
- Automatic daily backups (7-day retention on free, 30-day on pro)
- Manual backup: Railway dashboard → Database → "Backup Now"

### Render
- Automatic daily backups on paid plans
- Free tier: Manual backups via pg_dump

**Manual Backup Script:**
```bash
# Set DATABASE_URL from Railway/Render dashboard
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

---

## 🎯 Next Steps After Deployment

1. **Update Frontend**: Set `NEXT_PUBLIC_API_URL` in Vercel to your backend URL
2. **Test End-to-End**: Register → Login → Browse content → Save items
3. **Set Up Monitoring**: Add error tracking (Sentry) if needed
4. **Configure Email**: Add SMTP credentials for password reset emails
5. **Add Content**: Use admin panel or content aggregation APIs
6. **Monitor Performance**: Check logs and metrics regularly

---

## 💰 Pricing Examples

### Railway (Recommended for Production)
- Starter: $5/month + usage (~$10-15 total)
- Database: Included
- Redis: Included
- **Total: ~$10-20/month** for low-medium traffic

### Render (Good for Testing)
- Free tier: $0 (with sleep)
- Starter: $7/month web service + $7/month database
- **Total: ~$14/month** for 24/7 uptime

---

## 📞 Support

- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Express Docs**: https://expressjs.com

---

## ✅ Deployment Checklist

- [ ] PostgreSQL database created
- [ ] Redis added (optional)
- [ ] All environment variables set
- [ ] JWT_SECRET generated securely
- [ ] CORS_ORIGIN matches frontend URL
- [ ] Backend deployed successfully
- [ ] Health endpoint returns 200
- [ ] Database migrations run
- [ ] Test registration works
- [ ] Test login works
- [ ] Frontend connected to backend
- [ ] End-to-end test successful

---

**Ready to deploy? Choose your platform:**
- 🚂 [Railway (Recommended)](#quick-start-railway---recommended)
- 🎨 [Render.com](#alternative-rendercom)

Good luck! 🚀
