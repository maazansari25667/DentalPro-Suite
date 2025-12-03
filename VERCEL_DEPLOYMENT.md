# 🚀 Vercel Deployment Guide - Wavenet Care Admin Dashboard

## 📋 Pre-Deployment Checklist

✅ **Build Status**: Production build completed successfully  
✅ **TypeScript**: All type checks passed  
✅ **ESLint**: No blocking errors (only warnings)  
✅ **Dependencies**: All packages installed (697 packages)  
✅ **Environment**: Configuration files ready  

---

## 🎯 Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Navigate to the frontend directory**:
```bash
cd wavenet-care-admin
```

3. **Login to Vercel**:
```bash
vercel login
```

4. **Deploy**:
```bash
# For preview deployment
vercel

# For production deployment
vercel --prod
```

5. **Follow the prompts**:
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N` (first time)
   - What's your project's name? `wavenet-care-admin`
   - In which directory is your code located? `./`
   - Want to override settings? `N`

6. **Configure Environment Variables** (after deployment):
```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter your production API URL when prompted
# Example: https://your-backend-api.com/api

vercel env add NEXT_PUBLIC_APP_NAME production
# Enter: WavenetCare
```

7. **Redeploy with environment variables**:
```bash
vercel --prod
```

---

### Option 2: Deploy via Vercel Dashboard (Web UI)

1. **Push your code to GitHub**:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

2. **Go to [Vercel Dashboard](https://vercel.com/new)**

3. **Import Project**:
   - Click "Add New Project"
   - Select your GitHub repository
   - Click "Import"

4. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `wavenet-care-admin`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

5. **Add Environment Variables**:
   Click "Environment Variables" and add:
   
   | Name | Value | Environment |
   |------|-------|-------------|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend-api.com/api` | Production, Preview |
   | `NEXT_PUBLIC_APP_NAME` | `WavenetCare` | Production, Preview |
   | `NEXT_PUBLIC_MSW_ENABLED` | `false` | Production |

6. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

---

## 🔧 Environment Variables Configuration

### Required Variables

```bash
# Production API URL (REQUIRED)
# Replace with your actual backend API URL
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api

# Application Name
NEXT_PUBLIC_APP_NAME=WavenetCare

# Disable mock data in production
NEXT_PUBLIC_MSW_ENABLED=false
```

### Optional Variables

```bash
# Google Analytics (if using)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry Error Tracking (if using)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 📂 Project Structure for Deployment

```
wavenet-care-admin/
├── .next/                    # Build output (auto-generated)
├── public/                   # Static assets
├── src/                      # Source code
├── .env.example              # Environment template ✅
├── .env.local                # Local environment (gitignored)
├── .vercelignore             # Vercel ignore rules ✅
├── vercel.json               # Vercel configuration ✅
├── next.config.ts            # Next.js config
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript config
```

---

## 🔒 Security Configurations

The deployment includes these security headers (configured in `vercel.json`):

- **X-Content-Type-Options**: `nosniff`
- **X-Frame-Options**: `DENY`
- **X-XSS-Protection**: `1; mode=block`

---

## 🌐 Custom Domain Setup

1. **Go to your project in Vercel Dashboard**
2. **Navigate to Settings → Domains**
3. **Add your custom domain**:
   - Enter your domain (e.g., `admin.wavenetcare.com`)
   - Follow DNS configuration instructions
   - Wait for DNS propagation (5-30 minutes)

---

## 🔄 Continuous Deployment

### Automatic Deployments

Once connected to GitHub, Vercel will automatically:

- **Deploy on every push** to the main branch (Production)
- **Create preview deployments** for pull requests
- **Run build checks** before deploying

### Manual Deployments

Redeploy from dashboard:
1. Go to your project
2. Click "Deployments"
3. Click "..." menu on latest deployment
4. Select "Redeploy"

---

## 🐛 Troubleshooting

### Build Fails

**Problem**: Build fails with TypeScript errors  
**Solution**: Run locally first:
```bash
npm run build
```
Fix any errors before deploying.

**Problem**: Environment variables not found  
**Solution**: Ensure all `NEXT_PUBLIC_*` variables are set in Vercel dashboard.

### Runtime Errors

**Problem**: API calls fail (CORS errors)  
**Solution**: 
1. Ensure backend CORS allows your Vercel domain
2. Check `NEXT_PUBLIC_API_URL` is correct
3. Verify backend API is accessible

**Problem**: Page shows 404  
**Solution**: Check `vercel.json` rewrites configuration is present.

### Performance Issues

**Problem**: Slow page loads  
**Solution**: 
1. Enable Vercel Analytics
2. Use Image Optimization component
3. Implement code splitting

---

## 📊 Monitoring & Analytics

### Vercel Analytics

Enable built-in analytics:
1. Go to project settings
2. Navigate to "Analytics"
3. Enable Vercel Analytics
4. View real-time performance metrics

### Custom Monitoring

Add your own monitoring:
```typescript
// Add to src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 🚀 Performance Optimization

### Image Optimization

Already using Next.js Image component - Vercel will optimize automatically.

### Caching

Vercel automatically caches:
- Static assets (images, CSS, JS)
- API routes (if configured)
- Page components

### Edge Functions

For better performance, consider using Edge Functions for:
- Authentication checks
- API proxying
- Geolocation-based routing

---

## 📱 Backend API Deployment

### Backend Deployment Options

Your Laravel backend can be deployed to:

1. **Traditional Hosting**:
   - DigitalOcean
   - AWS EC2
   - Linode
   - Vultr

2. **Platform as a Service**:
   - Laravel Forge + DigitalOcean
   - Heroku
   - Railway.app
   - Render.com

3. **Serverless**:
   - AWS Lambda (using Bref)
   - Vercel Serverless Functions (Node.js adapter needed)

### CORS Configuration for Laravel

Update `config/cors.php` in your backend:

```php
'allowed_origins' => [
    'https://your-project.vercel.app',
    'https://admin.wavenetcare.com', // if using custom domain
],
```

---

## 🔐 Environment Security

### Never Commit These Files:
- `.env.local`
- `.env.production.local`
- Any file with actual API keys

### Always Commit:
- `.env.example` (template only)
- `vercel.json` (configuration)
- `.vercelignore` (ignore rules)

---

## 📋 Post-Deployment Checklist

After successful deployment, verify:

- [ ] Homepage loads correctly
- [ ] Login page is accessible
- [ ] Authentication works (if API connected)
- [ ] Dashboard displays properly
- [ ] Patient management pages work
- [ ] No console errors in browser
- [ ] Images load correctly
- [ ] API calls succeed (if backend deployed)
- [ ] Mobile responsive design works
- [ ] Dark/Light theme toggle works
- [ ] All routes are accessible

---

## 🎉 Success!

Your Wavenet Care Admin Dashboard is now deployed on Vercel!

**Access your live application**:
- Vercel URL: `https://your-project.vercel.app`
- Custom Domain: `https://admin.wavenetcare.com` (if configured)

**Next Steps**:
1. Deploy your Laravel backend
2. Update `NEXT_PUBLIC_API_URL` to backend URL
3. Test full end-to-end functionality
4. Set up custom domain (optional)
5. Enable monitoring and analytics

---

## 📞 Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Vercel Discord**: https://vercel.com/discord
- **GitHub Issues**: Report bugs in your repository

---

**Deployment Date**: December 3, 2025  
**Version**: 1.0.0  
**Framework**: Next.js 15.2.3  
**Node Version**: 18+ recommended  

---

## 🔗 Quick Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Project Settings](https://vercel.com/docs/projects/overview)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)
- [Build Logs](https://vercel.com/docs/deployments/logs)

---

**Made with ❤️ by Wavenet Care Team**
