# Cloudflare Deployment Guide

## Option 1: Cloudflare Pages (Frontend Only)

### Step 1: Prepare Frontend

1. Update `frontend/.env.production`:
```env
REACT_APP_BACKEND_URL=https://your-backend-api.com
```

2. Build the frontend:
```bash
cd frontend
yarn build
```

### Step 2: Deploy to Cloudflare Pages

**Via Dashboard:**
1. Go to Cloudflare Dashboard → Pages
2. Click "Create a project"
3. Connect your Git repository
4. Configure build settings:
   - Build command: `cd frontend && yarn build`
   - Build output directory: `frontend/build`
   - Root directory: `/`
5. Add environment variable:
   - `REACT_APP_BACKEND_URL`: Your backend URL
6. Click "Save and Deploy"

**Via CLI:**
```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages publish frontend/build --project-name=skapeta-apartments
```

---

## Option 2: Full Stack with Cloudflare Workers

### Prerequisites

⚠️ **Note:** FastAPI (Python) cannot run on Cloudflare Workers. You need to:
1. Rewrite backend in TypeScript/JavaScript (Hono.js)
2. OR deploy backend elsewhere (Railway, Render, etc.)

### Recommended: Hybrid Approach

**Frontend:** Cloudflare Pages  
**Backend:** Railway.app / Render.com  
**Database:** MongoDB Atlas

---

## Step-by-Step: Hybrid Deployment

### 1. Deploy MongoDB (Atlas)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/skapeta_db
   ```

### 2. Deploy Backend (Railway.app)

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and deploy:
```bash
cd backend
railway login
railway init
railway up
```

3. Add environment variables in Railway dashboard:
   - `MONGO_URL`: Your Atlas connection string
   - `DB_NAME`: `skapeta_db`
   - `SECRET_KEY`: Generate strong key
   - `OWNER_WHATSAPP`: Your WhatsApp number

4. Get your backend URL: `https://your-app.railway.app`

### 3. Deploy Frontend (Cloudflare Pages)

1. Update `frontend/.env.production`:
```env
REACT_APP_BACKEND_URL=https://your-app.railway.app
```

2. Build:
```bash
cd frontend
yarn build
```

3. Deploy:
```bash
wrangler pages publish build --project-name=skapeta
```

---

## Alternative: Cloudflare + DigitalOcean

### Backend on DigitalOcean App Platform

1. Connect your Git repository
2. Select "Backend" → Python
3. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Run Command: `uvicorn server:app --host 0.0.0.0 --port 8080`
4. Add environment variables
5. Deploy

### Frontend on Cloudflare Pages

Follow steps from Option 1

---

## Custom Domain Setup

### For Cloudflare Pages

1. Go to Pages → Your Project → Custom domains
2. Add your domain: `www.skapeta.com`
3. Cloudflare will auto-configure DNS
4. SSL certificate is automatic

### For Backend (Railway/DigitalOcean)

1. Add custom domain in platform dashboard
2. Update DNS records:
   ```
   Type: CNAME
   Name: api
   Target: your-app.railway.app
   ```
3. Update `REACT_APP_BACKEND_URL` to `https://api.skapeta.com`

---

## CORS Configuration

Update `backend/server.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.skapeta.com",
        "https://skapeta.com",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Performance Optimization

### Cloudflare Pages

1. **Enable Cloudflare CDN**
   - Auto-enabled for Pages

2. **Minify Assets**
   - Already done by Create React App

3. **Browser Caching**
   - Configured in `frontend/nginx.conf`

### Backend

1. **Add caching:**
```python
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
```

2. **Enable compression:**
```python
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

---

## Monitoring & Analytics

### Cloudflare Analytics
- Built-in for Pages
- View traffic, bandwidth, requests

### Backend Monitoring
- Use Railway/DigitalOcean built-in metrics
- Add Sentry for error tracking

---

## Cost Estimation

**Free Tier:**
- Cloudflare Pages: Unlimited requests
- MongoDB Atlas: 512MB free
- Railway: $5 credit/month

**Paid (Small Business):**
- Cloudflare Pages: $0 (unlimited)
- MongoDB Atlas: ~$10/month
- Railway/Render: ~$7-20/month
- **Total: ~$17-30/month**

---

## Troubleshooting

### CORS Errors
1. Check `allow_origins` in `server.py`
2. Verify `REACT_APP_BACKEND_URL` is correct
3. Ensure backend is accessible

### Build Failures
1. Check Node.js version (18+)
2. Clear cache: `rm -rf node_modules && yarn install`
3. Check environment variables

### Database Connection
1. Verify MongoDB Atlas IP whitelist
2. Check connection string
3. Ensure database user has permissions

---

## Need Help?

Refer to:
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Railway Docs](https://docs.railway.app/)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
