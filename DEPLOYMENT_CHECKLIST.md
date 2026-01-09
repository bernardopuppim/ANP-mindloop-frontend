# MindLoop Frontend Deployment Checklist

## Current Status: ⚠️ ACTION REQUIRED

The frontend is deployed and working, but needs one critical environment variable to be set in production.

---

## ✅ What's Already Working

1. Frontend deployed to: https://mindloop-frontend.vercel.app
2. Backend deployed to: https://mindloop-backend.vercel.app
3. All API endpoints functional
4. HITL workflow operational
5. UI components rendering correctly

---

## ⚠️ Critical Action Required

### Set Production Environment Variable

**Problem:**
The frontend is currently configured to use `http://localhost:8000` as the default backend URL. This needs to be changed to the production backend URL.

**Solution:**

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select project: `mindloop-frontend`

2. **Navigate to Settings:**
   - Click "Settings" tab
   - Click "Environment Variables" in the left sidebar

3. **Add Environment Variable:**
   ```
   Key:   NEXT_PUBLIC_API_URL
   Value: https://mindloop-backend.vercel.app
   ```

4. **Important Settings:**
   - ✅ Enable for: Production
   - ✅ Enable for: Preview (optional)
   - ✅ Enable for: Development (optional)

5. **Redeploy:**
   - Go back to "Deployments" tab
   - Click "..." menu on latest deployment
   - Click "Redeploy"
   - Wait for redeployment to complete

### Why This Is Critical

Without this environment variable:
- Frontend will try to connect to `localhost:8000`
- API calls will fail in the browser
- Users will see errors like "Failed to fetch" or "Network error"
- Classification functionality will not work

---

## 🧪 Verification Steps

After setting the environment variable and redeploying:

### 1. Check Environment Variable in Browser

1. Visit: https://mindloop-frontend.vercel.app
2. Open Browser Console (F12)
3. Type: `console.log(process.env.NEXT_PUBLIC_API_URL)`
4. Should show: `https://mindloop-backend.vercel.app`

Note: In Next.js, client-side environment variables won't be directly visible. Instead, check the Network tab for actual API calls.

### 2. Test Classification

1. Visit: https://mindloop-frontend.vercel.app
2. Enter test event: "Manutenção preventiva realizada"
3. Click "Classificar Evento"
4. Open Network tab (F12 → Network)
5. Look for request to: `https://mindloop-backend.vercel.app/predict`
6. Should return: `200 OK` status
7. Should show: HITL modal or classification result

### 3. Check Network Requests

In Browser DevTools → Network tab:
- ✅ Request URL should be: `https://mindloop-backend.vercel.app/predict`
- ✅ NOT: `http://localhost:8000/predict`
- ✅ Status: 200 OK
- ✅ Response: Valid JSON with classification data

---

## 📝 Current Environment Configuration

### Local Development (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

This is correct for local development when running backend locally.

### Production (Vercel Dashboard)

**Status:** ⚠️ NOT YET CONFIGURED

**Required Setting:**
```bash
NEXT_PUBLIC_API_URL=https://mindloop-backend.vercel.app
```

---

## 🔍 How to Verify Production Is Working

### Method 1: Direct API Test (Current Status)

```bash
# This works (backend is healthy)
curl https://mindloop-backend.vercel.app/health

# This works (classification endpoint)
curl -X POST https://mindloop-backend.vercel.app/predict \
  -H "Content-Type: application/json" \
  -d '{"descricao_evento":"Teste"}'
```

### Method 2: Frontend Integration Test (After Fix)

1. Visit https://mindloop-frontend.vercel.app
2. Open Browser Console (F12)
3. Go to Network tab
4. Enter event and click classify
5. Check request goes to correct URL
6. Verify 200 OK response

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" or CORS errors

**Symptoms:**
- Network errors in browser console
- CORS policy errors
- "TypeError: Failed to fetch"

**Solutions:**
1. ✅ Verify `NEXT_PUBLIC_API_URL` is set in Vercel
2. ✅ Verify backend URL is correct (with https://)
3. ✅ Check backend is responding: `curl https://mindloop-backend.vercel.app/health`
4. ✅ Redeploy frontend after setting env var

### Issue: "Cannot read property of undefined"

**Symptoms:**
- JavaScript errors about undefined properties
- UI doesn't render properly

**Solutions:**
1. ✅ Check browser console for specific errors
2. ✅ Verify API response format matches expected structure
3. ✅ Check Network tab for actual response data

### Issue: Slow response times

**Symptoms:**
- Classification takes > 3 seconds
- Timeout errors

**Solutions:**
1. ✅ Check backend logs in Vercel
2. ✅ Verify serverless function isn't cold starting
3. ✅ Consider adding loading states
4. ✅ Monitor Vercel metrics

---

## 📊 Test Results Summary

### Automated Tests: ✅ 5/5 PASSED

1. ✅ Frontend Availability
2. ✅ Backend Health
3. ✅ CORS Configuration
4. ✅ Predict Endpoint
5. ✅ Full Integration

### Manual Tests Required: ⏳ PENDING

After setting environment variable:
- ⏳ Browser classification test
- ⏳ HITL modal test
- ⏳ Multiple event types test
- ⏳ Error handling test
- ⏳ Performance test

---

## 🎯 Success Criteria

The deployment is complete when:

1. ✅ Frontend loads at https://mindloop-frontend.vercel.app
2. ⏳ Environment variable `NEXT_PUBLIC_API_URL` is set
3. ⏳ Network requests go to production backend
4. ⏳ Classification returns results successfully
5. ⏳ HITL modal appears when needed
6. ⏳ No CORS errors in browser console
7. ⏳ Response times are < 3 seconds

---

## 📞 Quick Reference

### URLs
- Frontend: https://mindloop-frontend.vercel.app
- Backend: https://mindloop-backend.vercel.app
- Backend Docs: https://mindloop-backend.vercel.app/docs
- Backend Health: https://mindloop-backend.vercel.app/health

### Environment Variable
```
NEXT_PUBLIC_API_URL=https://mindloop-backend.vercel.app
```

### Test Events
```
"Manutenção preventiva realizada"
"Vazamento de óleo no mar"
"Acidente fatal com trabalhador"
"Derramamento de produto químico"
```

---

## 🔄 Deployment Commands

If you need to redeploy manually:

```bash
# Login to Vercel CLI (if not already)
npx vercel login

# Deploy to production
npx vercel --prod

# Set environment variable via CLI (alternative)
npx vercel env add NEXT_PUBLIC_API_URL production
# Enter value: https://mindloop-backend.vercel.app
```

---

**Last Updated:** January 6, 2026
**Status:** Awaiting environment variable configuration
**Priority:** HIGH - Required for production functionality
