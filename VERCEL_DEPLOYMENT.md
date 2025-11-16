# Vercel Deployment Configuration

## Important: Set Root Directory in Vercel

For this monorepo to deploy correctly, you MUST set the root directory in Vercel:

### Steps:

1. Go to Vercel Dashboard → Your Project
2. Click **Settings**
3. Go to **General** section
4. Find **Root Directory**
5. Set it to: `frontend`
6. Click **Save**

This tells Vercel to treat the `frontend` folder as the root, allowing it to auto-detect Next.js and use standard build commands.

## What This Does

- Vercel will run from the `frontend` directory
- Auto-detects Next.js framework
- Uses standard commands:
  - Install: `npm install` or `yarn install`
  - Build: `npm run build` or `yarn build`
  - Dev: `npm run dev` or `yarn dev`

## Alternative: Manual Commands

If you can't set the root directory, the `vercel.json` has been simplified to minimal config. You'll need to:

1. Keep `vercel.json` minimal (current state)
2. Set these in Vercel Dashboard → Settings → Git:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js

## Environment Variables

Don't forget to set in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

## Branch Configuration

Make sure Vercel is deploying from the correct branch:

**Settings → Git → Production Branch**: `claude/main-01DqTFYgfKBYyNA8CLbUsVj6`

## Files Created

- `vercel.json` - Minimal Vercel configuration
- `.vercelignore` - Excludes backend and unnecessary files from deployment

## Deployment Checklist

- [ ] Root Directory set to `frontend` in Vercel
- [ ] Production Branch set to `claude/main-01DqTFYgfKBYyNA8CLbUsVj6`
- [ ] Environment variable `NEXT_PUBLIC_API_URL` set
- [ ] Build cache cleared (Settings → General → Clear Build Cache)
- [ ] Redeploy triggered

After setting these, your deployment should succeed!
