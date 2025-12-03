# Vercel Deployment Guide - Wavenet Care Admin

This guide will help you deploy your Wavenet Care Admin application to Vercel without any issues.

## 📋 Pre-Deployment Checklist

- ✅ Build passes locally (`npm run build`)
- ✅ No TypeScript errors
- ✅ Environment variables configured
- ✅ MSW (Mock Service Worker) disabled for production
- ✅ API endpoints configured correctly

## 🚀 Quick Deployment Steps

### 1. Prerequisites

Make sure you have:
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- Your production API URL ready

### 2. Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js configuration

### 3. Configure Environment Variables

In Vercel's project settings, add these environment variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-api.com/api` | Your production API URL |
| `NEXT_PUBLIC_APP_NAME` | `WavenetCare` | Application name |
| `NEXT_PUBLIC_MSW_ENABLED` | `false` | **MUST be false in production** |
| `NEXT_PUBLIC_GA_ID` | (optional) | Google Analytics ID |
| `NEXT_PUBLIC_SENTRY_DSN` | (optional) | Sentry error tracking |

**⚠️ CRITICAL**: Set `NEXT_PUBLIC_MSW_ENABLED=false` to prevent mock API from running in production!

### 4. Build Settings

Vercel should auto-detect these, but verify:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 20.x (recommended)

### 5. Deploy

Click "Deploy" and wait for the build to complete.

## 🔧 Advanced Configuration

### Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed by Vercel

### Build Optimization

The following optimizations are already configured in `next.config.ts`:

- Image optimization with AVIF and WebP formats
- Compression enabled
- ESLint validation during builds
- TypeScript strict checking

### Monitoring & Analytics

Consider adding:

- **Vercel Analytics**: Built-in performance monitoring
- **Vercel Speed Insights**: Real user monitoring
- **Sentry**: Error tracking and performance monitoring

## 🐛 Troubleshooting

### Build Fails

1. **Check build logs** in Vercel dashboard
2. **Verify environment variables** are set correctly
3. **Test build locally**: `npm run build`
4. **Check Node version**: Should be 18.x or 20.x

### MSW Service Worker Issues

If you see MSW-related errors in production:

1. Verify `NEXT_PUBLIC_MSW_ENABLED=false` in Vercel env vars
2. Clear deployment cache and redeploy
3. Check browser console for any MSW initialization errors

### API Connection Issues

1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check CORS settings on your API
3. Ensure API is accessible from Vercel's deployment regions
4. Check network tab in browser DevTools

### Image Loading Issues

1. Add your image domains to `next.config.ts` under `images.remotePatterns`
2. Redeploy after configuration changes

## 📊 Post-Deployment

### Test Your Deployment

1. ✅ Homepage loads correctly
2. ✅ Login functionality works
3. ✅ API calls are successful
4. ✅ Images load properly
5. ✅ Dark mode toggle works
6. ✅ Navigation works across all pages
7. ✅ No console errors

### Enable Production Features

1. **Analytics**: Enable Vercel Analytics in project settings
2. **Speed Insights**: Enable for real user monitoring
3. **Error Tracking**: Configure Sentry if using
4. **Performance Monitoring**: Set up custom metrics

### Continuous Deployment

Every push to your main branch will trigger a new deployment automatically.

- **Main branch**: Production deployment
- **Other branches**: Preview deployments
- **Pull requests**: Preview deployments with unique URLs

## 🔒 Security Best Practices

1. ✅ Never commit `.env` files to Git
2. ✅ Use Vercel environment variables for secrets
3. ✅ Enable HTTPS (automatic with Vercel)
4. ✅ Configure security headers (already in `vercel.json`)
5. ✅ Keep dependencies updated
6. ✅ Use Content Security Policy headers

## 📱 Environment-Specific Configs

### Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_MSW_ENABLED=true
```

### Production (Vercel Dashboard)
```env
NEXT_PUBLIC_API_URL=https://your-production-api.com/api
NEXT_PUBLIC_MSW_ENABLED=false
```

## 🆘 Getting Help

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Support**: Available in dashboard

## 📝 Deployment Checklist

Before going live:

- [ ] All environment variables configured in Vercel
- [ ] Production API is running and accessible
- [ ] MSW is disabled (`NEXT_PUBLIC_MSW_ENABLED=false`)
- [ ] Build completes successfully
- [ ] No errors in browser console
- [ ] All critical features tested
- [ ] Custom domain configured (if applicable)
- [ ] Analytics enabled
- [ ] Error monitoring configured
- [ ] CORS configured on API
- [ ] Security headers verified

## 🎉 Success!

Your Wavenet Care Admin application is now live on Vercel!

**Production URL**: https://your-project.vercel.app

---

**Note**: This application is optimized for Vercel's Edge Network and will automatically benefit from:
- Global CDN distribution
- Automatic HTTPS
- Instant cache invalidation
- DDoS protection
- Automatic scaling
