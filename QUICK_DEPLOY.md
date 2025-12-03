# 🚀 QUICK DEPLOY GUIDE - 60 SECONDS

## Option 1: Vercel CLI (Fastest)

```bash
# Install CLI (one-time)
npm install -g vercel

# Navigate to project
cd wavenet-care-admin

# Deploy to production
vercel --prod
```

**That's it!** Follow prompts and your site will be live.

---

## Option 2: GitHub + Vercel (Recommended for CI/CD)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Production deployment"
git push origin main
```

### Step 2: Import to Vercel
1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repository
4. Click "Import"

### Step 3: Configure
- **Root Directory**: `wavenet-care-admin`
- **Framework**: Next.js (auto-detected ✓)
- **Build Command**: `npm run build` (auto ✓)
- **Output Directory**: `.next` (auto ✓)

### Step 4: Add Environment Variables
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
NEXT_PUBLIC_APP_NAME=WavenetCare
NEXT_PUBLIC_MSW_ENABLED=false
```

### Step 5: Deploy
Click **"Deploy"** button and wait ~3 minutes.

**Done! Your site is live.** 🎉

---

## 📋 Pre-Flight Check

Before deploying, confirm:
- [x] ✅ Build tested locally (`npm run build`)
- [x] ✅ No errors in build output
- [x] ✅ Environment variables documented
- [x] ✅ Git repository up to date

---

## 🔗 After Deployment

Your site will be available at:
- **Production**: `https://your-project.vercel.app`
- **Preview**: `https://your-project-git-branch.vercel.app`

### Verify Deployment
1. Visit your Vercel URL
2. Test login page
3. Check dashboard
4. Verify no console errors

---

## 🆘 Quick Troubleshooting

**Build fails?**
→ Run `npm run build` locally and fix errors

**Environment variables not working?**
→ Ensure they start with `NEXT_PUBLIC_`

**404 errors?**
→ Check `vercel.json` is in root

**CORS errors?**
→ Configure backend to allow your Vercel domain

---

## 📚 Full Documentation

For detailed instructions, see:
- **VERCEL_DEPLOYMENT.md** - Complete guide
- **DEPLOYMENT_CHECKLIST.md** - Step-by-step checklist

---

**Deploy with confidence - everything is ready! ✅**
