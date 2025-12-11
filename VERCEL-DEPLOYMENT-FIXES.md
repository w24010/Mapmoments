# Vercel Deployment Fixes

## Issues Fixed

### 1. Frontend API URL Configuration
- **Problem**: Frontend was using process.env.REACT_APP_BACKEND_URL without fallback, causing errors if env var is missing
- **Fix**: Added fallback to http://localhost:8000 in all frontend pages:
  - rontend/src/pages/Auth.jsx
  - rontend/src/pages/MapView.jsx
  - rontend/src/pages/Profile.jsx
  - rontend/src/pages/Discover.jsx
  - rontend/src/pages/Search.jsx

### 2. Backend CORS Configuration
- **Problem**: CORS wasn't allowing Vercel preview URLs (e.g., https://mapmoments-abc123.vercel.app)
- **Fix**: Updated CORS middleware to use llow_origin_regex pattern for Vercel preview URLs

### 3. Backend Environment Variables
- **Problem**: Missing MONGO_URL would cause unclear errors
- **Fix**: Added explicit error message when MONGO_URL is missing

## Deployment Steps

### Frontend (Vercel)

1. **Set Environment Variables in Vercel:**
   - Go to your Vercel project settings
   - Add environment variable:
     - REACT_APP_BACKEND_URL = Your backend URL (e.g., https://your-backend.railway.app or https://your-backend.render.com)
     - REACT_APP_MAPBOX_TOKEN = Your Mapbox token (if using Mapbox)

2. **Deploy:**
   - Push to your repository
   - Vercel will auto-deploy
   - Make sure the build command is: 
pm run build
   - Output directory: uild

### Backend (NOT on Vercel - Use Render, Railway, or Fly.io)

**Important**: FastAPI cannot run as a long-running service on Vercel. Deploy backend separately.

#### Option 1: Render.com
1. Create new Web Service
2. Connect your repository
3. Set root directory to ackend
4. Build command: pip install -r requirements.txt
5. Start command: uvicorn server:app --host 0.0.0.0 --port \
6. Set environment variables:
   - MONGO_URL (required)
   - DB_NAME (optional, defaults to mapmoments_db)
   - JWT_SECRET (required - use a strong secret)
   - FRONTEND_ORIGINS = Your Vercel frontend URL(s), comma-separated
   - COOKIE_SECURE = 	rue (for HTTPS)

#### Option 2: Railway
1. Create new project
2. Add MongoDB service
3. Add Python service from GitHub
4. Set root directory to ackend
5. Set environment variables (same as Render)

#### Option 3: Fly.io
1. Install flyctl
2. Run ly launch in backend directory
3. Set environment variables (same as Render)

## Environment Variables Summary

### Frontend (Vercel)
- REACT_APP_BACKEND_URL - Your backend API URL
- REACT_APP_MAPBOX_TOKEN - Mapbox API token (if using)

### Backend (Render/Railway/Fly.io)
- MONGO_URL - MongoDB connection string (required)
- DB_NAME - Database name (optional, default: mapmoments_db)
- JWT_SECRET - Secret key for JWT tokens (required)
- FRONTEND_ORIGINS - Comma-separated list of allowed frontend URLs
- COOKIE_SECURE - Set to 	rue for production HTTPS

## Common Issues

### CORS Errors
- Make sure FRONTEND_ORIGINS includes your exact Vercel URL
- The backend now automatically allows all *.vercel.app preview URLs
- Ensure COOKIE_SECURE=true when using HTTPS

### API Connection Errors
- Verify REACT_APP_BACKEND_URL is set correctly in Vercel
- Check that backend is running and accessible
- Test backend health endpoint: https://your-backend.com/health

### Build Errors
- Make sure 
pm install --legacy-peer-deps runs successfully
- Check Node.js version (should be 24.x based on package.json)

## Testing

1. Test backend health: curl https://your-backend.com/health
2. Test frontend: Visit your Vercel URL
3. Check browser console for any CORS or API errors
4. Verify authentication flow works

## Next Steps

After deployment:
1. Update FRONTEND_ORIGINS in backend with your production Vercel URL
2. Set COOKIE_SECURE=true in backend
3. Use strong JWT_SECRET in production
4. Monitor logs for any errors
