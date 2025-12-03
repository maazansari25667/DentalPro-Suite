# Environment Variables - Quick Reference

## 🔴 REQUIRED for Vercel Deployment

Copy these EXACT values to Vercel Dashboard → Project Settings → Environment Variables

### Production Environment Variables

| Variable | Value | Critical? | Notes |
|----------|-------|-----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-api.com/api` | ⚠️ YES | Replace with your actual API URL |
| `NEXT_PUBLIC_MSW_ENABLED` | `false` | ⚠️ YES | MUST be false in production |
| `NEXT_PUBLIC_APP_NAME` | `WavenetCare` | Optional | Application display name |

## ⚠️ CRITICAL WARNINGS

### 1. MSW Must Be Disabled
```
NEXT_PUBLIC_MSW_ENABLED=false
```
**Why?** Mock Service Worker should NEVER run in production. It will intercept all API calls and return fake data instead of connecting to your real backend.

### 2. API URL Must Be Correct
```
NEXT_PUBLIC_API_URL=https://your-production-api.com/api
```
**Replace `your-production-api.com` with your actual backend URL!**

### 3. All Variables Must Start with `NEXT_PUBLIC_`
Next.js only exposes environment variables to the browser if they start with `NEXT_PUBLIC_`. Variables without this prefix won't work in client-side code.

## 📝 How to Set in Vercel

### Via Dashboard:
1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add each variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-api.com/api`
   - **Environment**: Production (and Preview if needed)
4. Click "Save"
5. Redeploy your application

### Via Vercel CLI:
```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter value when prompted

vercel env add NEXT_PUBLIC_MSW_ENABLED production
# Enter: false
```

## 🧪 Development vs Production

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

## ✅ Verification

After setting environment variables, verify in browser console:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
// Should show: https://your-api.com/api

console.log(process.env.NEXT_PUBLIC_MSW_ENABLED)
// Should show: false
```

## 🚨 Common Mistakes

❌ **WRONG**: Setting `NEXT_PUBLIC_MSW_ENABLED=true` in production  
✅ **CORRECT**: Always set to `false` in production

❌ **WRONG**: Using `localhost` API URL in production  
✅ **CORRECT**: Use your deployed backend URL

❌ **WRONG**: Forgetting `NEXT_PUBLIC_` prefix  
✅ **CORRECT**: All variables must start with `NEXT_PUBLIC_`

## 📞 API Requirements

Your production API must:
1. ✅ Be accessible from the internet (not localhost)
2. ✅ Support HTTPS
3. ✅ Have CORS configured to allow your Vercel domain
4. ✅ Return proper JSON responses
5. ✅ Match the endpoints your frontend expects

## 🔧 Troubleshooting

### "API calls not working"
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify API is accessible from Vercel
- Check CORS settings on your API

### "Still seeing mock data"
- Verify `NEXT_PUBLIC_MSW_ENABLED=false`
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)

### "Environment variables not updating"
- Redeploy after changing variables
- Wait 1-2 minutes for propagation

## 📚 More Info

See `VERCEL_DEPLOYMENT_GUIDE.md` for complete deployment instructions.
