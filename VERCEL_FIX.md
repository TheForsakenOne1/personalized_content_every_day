# Vercel Deployment Fix - Branch Configuration

## The Problem

Vercel is trying to deploy from a `main` branch that doesn't exist, while your code is on branch `claude/main-01DqTFYgfKBYyNA8CLbUsVj6`.

## Solution: Configure Vercel to Use the Correct Branch

### Option 1: Update Vercel Settings (Recommended)

1. Go to your Vercel project dashboard
2. Click **Settings**
3. Go to **Git** section
4. Under **Production Branch**, change it to:
   ```
   claude/main-01DqTFYgfKBYyNA8CLbUsVj6
   ```
5. Save the changes
6. Go to **Deployments** tab
7. Click **Redeploy** on the latest deployment

### Option 2: Use Vercel CLI

If you have Vercel CLI installed:

```bash
cd /home/user/personalized_content_every_day
vercel --prod
```

This will deploy the current branch directly.

### Option 3: Create a Pull Request

1. Go to GitHub repository
2. Create a Pull Request from `claude/main-01DqTFYgfKBYyNA8CLbUsVj6` to `main`
3. Merge the PR (this creates the `main` branch)
4. Vercel will auto-deploy from `main`

## Verify the Fix is on GitHub

The fix IS pushed to GitHub. You can verify by visiting:

```
https://github.com/TheForsakenOne1/personalized_content_every_day/blob/claude/main-01DqTFYgfKBYyNA8CLbUsVj6/frontend/src/lib/api.ts
```

Look for lines 18-22:
```typescript
const headers = new Headers(options.headers);
headers.set('Content-Type', 'application/json');

if (token) {
  headers.set('Authorization', `Bearer ${token}`);
}
```

✅ This is the CORRECT code (using Headers API)

## If You're Still Seeing the Old Error

The error message:
```
Property 'Authorization' does not exist on type 'HeadersInit'.
```

This means Vercel is building OLD code that uses:
```typescript
headers['Authorization'] = `Bearer ${token}`;  // ❌ OLD CODE
```

## How to Force Vercel to Use Latest Code

1. **Clear Build Cache**:
   - Vercel Dashboard → Settings → General
   - Scroll to "Build & Development Settings"
   - Click "Clear Build Cache & Redeploy"

2. **Check Deployment Logs**:
   - Go to Deployments tab
   - Click on the latest deployment
   - Check the "Source" - it should show `claude/main-01DqTFYgfKBYyNA8CLbUsVj6`
   - If it shows a different branch, that's the problem

3. **Manual Deployment**:
   - In Deployments, click the three dots (•••)
   - Click "Redeploy"
   - Make sure it's pulling from the correct branch

## Alternative: Set Default Branch in GitHub

1. Go to GitHub repository settings
2. Click "Branches"
3. Set default branch to `claude/main-01DqTFYgfKBYyNA8CLbUsVj6`
4. Vercel will follow GitHub's default branch

## Confirmation Checklist

Before redeploying, verify:

- [ ] Branch `claude/main-01DqTFYgfKBYyNA8CLbUsVj6` exists on GitHub
- [ ] Latest commit is `1304a9e` or newer
- [ ] File `frontend/src/lib/api.ts` uses `new Headers()` API
- [ ] Vercel is configured to deploy from the correct branch
- [ ] Build cache is cleared in Vercel

## Expected Build Output

When deploying the correct code, you should see:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (14/14)
```

No errors about `HeadersInit` or `Authorization` property.
