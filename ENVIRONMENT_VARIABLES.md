# MapMoments Environment Variables Guide

This document provides a comprehensive list of all environment variables needed for deploying MapMoments to production.

## Table of Contents
- [Backend (Render/Railway/Fly)](#backend-renderrailwayfly)
- [Frontend (Vercel)](#frontend-vercel)
- [Quick Setup Guide](#quick-setup-guide)
- [Security Best Practices](#security-best-practices)

---

## Backend (Render/Railway/Fly)

The backend requires the following environment variables to be configured in your deployment platform:

### Required Variables

| Variable | Description | Example Value | Notes |
|----------|-------------|---------------|-------|
| `MONGO_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority` | **Required**. Get from MongoDB Atlas or your MongoDB provider |
| `DB_NAME` | Database name | `mapmoments_db` | **Required**. Can be any valid MongoDB database name |
| `JWT_SECRET` | Secret key for JWT token generation | `gkzi_o4HQNZnSwrg9P...` | **Required**. Generate using: `python3 -c "import secrets; print(secrets.token_urlsafe(64))"` |
| `FRONTEND_ORIGINS` | Comma-separated list of allowed CORS origins | `https://mapmoments.vercel.app,https://mapmoments-*.vercel.app` | **Required**. Include all your Vercel deployment URLs |
| `COOKIE_SECURE` | Enable secure cookies (HTTPS only) | `true` | **Required** for production. Set to `false` only for local development |

### Optional Variables

| Variable | Description | Default Value | Notes |
|----------|-------------|---------------|-------|
| `PORT` | Port for the server to listen on | `8000` | Most platforms set this automatically (Render, Railway, etc.) |

### How to Configure on Different Platforms

#### Render
1. Go to your service dashboard
2. Navigate to "Environment" tab
3. Add each variable with "Add Environment Variable"
4. Click "Save Changes" - service will automatically redeploy

#### Railway
1. Go to your project
2. Click on your service
3. Navigate to "Variables" tab
4. Add each variable
5. Deploy will trigger automatically

#### Fly.io
Use `fly secrets set` command:
```bash
fly secrets set MONGO_URL="mongodb+srv://..."
fly secrets set JWT_SECRET="your-secret-here"
fly secrets set FRONTEND_ORIGINS="https://..."
fly secrets set COOKIE_SECURE="true"
fly secrets set DB_NAME="mapmoments_db"
```

---

## Frontend (Vercel)

The frontend requires the following environment variables to be configured in Vercel:

### Required Variables

| Variable | Description | Example Value | Notes |
|----------|-------------|---------------|-------|
| `REACT_APP_BACKEND_URL` | Backend API URL | `https://mapmoments-backend.onrender.com` | **Required**. Your deployed backend URL |
| `REACT_APP_MAPBOX_TOKEN` | Mapbox API token | `pk.eyJ1IjoidzI...` | **Required**. Get from https://account.mapbox.com/ |

### Optional Variables

| Variable | Description | Default Value | Notes |
|----------|-------------|---------------|-------|
| `REACT_APP_WS_URL` | WebSocket URL (future use) | N/A | Only needed if WebSocket features are implemented |

### How to Configure in Vercel

1. Go to your Vercel project dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add each variable:
   - **Key**: Variable name (e.g., `REACT_APP_BACKEND_URL`)
   - **Value**: Variable value
   - **Environments**: Select "Production", "Preview", and "Development" as needed
4. Click "Save"
5. Redeploy your application to apply changes

**Important**: React environment variables are baked into the build at build-time. You must redeploy after changing them.

---

## Quick Setup Guide

### Step 1: Generate JWT Secret

Run this command to generate a secure JWT secret:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

Copy the output and save it securely. You'll need it for the backend configuration.

### Step 2: Get MongoDB Connection String

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a cluster (or use existing)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

### Step 3: Get Vercel Deployment URLs

After deploying to Vercel, you'll get URLs like:
- Production: `https://mapmoments.vercel.app`
- Preview deployments: `https://mapmoments-<hash>.vercel.app`

You can use a wildcard pattern or list specific URLs:
```
https://mapmoments.vercel.app,https://mapmoments-*.vercel.app
```

### Step 4: Configure Backend (Render Example)

1. Deploy backend to Render
2. Set these environment variables in Render:
   ```
   MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
   DB_NAME=mapmoments_db
   JWT_SECRET=<your-generated-secret>
   FRONTEND_ORIGINS=https://mapmoments.vercel.app,https://mapmoments-*.vercel.app
   COOKIE_SECURE=true
   ```
3. Note your backend URL (e.g., `https://mapmoments-backend.onrender.com`)

### Step 5: Configure Frontend (Vercel)

1. Deploy frontend to Vercel
2. Set these environment variables in Vercel:
   ```
   REACT_APP_BACKEND_URL=https://mapmoments-backend.onrender.com
   REACT_APP_MAPBOX_TOKEN=pk.eyJ1IjoidzI0MDEwIiwiYSI6ImNtZ3JkdWNlNDA1ajAyanB2NzFwd2Z1dXUifQ.zbrJVrV-s1O2zHKKckI-Hw
   ```
3. Redeploy to apply changes

---

## Security Best Practices

### 1. JWT Secret
- **Never** commit JWT secrets to source control
- Generate a strong, random secret (64+ characters)
- Use different secrets for development, staging, and production
- Rotate secrets periodically (every 90 days recommended)

### 2. MongoDB Connection
- Use strong passwords for database users
- Enable IP whitelisting in MongoDB Atlas
- Use separate databases for production and development
- Enable TLS/SSL for connections

### 3. CORS Configuration
- Only whitelist your actual frontend domains
- Use specific URLs instead of wildcards when possible
- For preview deployments, use Vercel's deployment URL pattern: `https://your-app-*.vercel.app`

### 4. Cookie Security
- Always set `COOKIE_SECURE=true` in production (requires HTTPS)
- The backend uses `httponly`, `secure`, and `samesite` flags for cookie security
- Only set `COOKIE_SECURE=false` for local development on HTTP

### 5. Environment Variables
- Never commit `.env` files to Git (already in `.gitignore`)
- Use `.env.example` files as templates
- Store production secrets in your deployment platform's secure environment variable storage
- Limit access to production environment variables to essential team members only

### 6. API Tokens
- Keep Mapbox tokens secure (they can be restricted by URL in Mapbox dashboard)
- Monitor token usage in Mapbox dashboard
- Consider using different tokens for development and production

---

## Troubleshooting

### CORS Errors
**Problem**: Frontend shows "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solutions**:
1. Verify `FRONTEND_ORIGINS` includes your exact frontend URL
2. Check for trailing slashes (should not have them)
3. Ensure backend has redeployed after changing `FRONTEND_ORIGINS`
4. Verify frontend is using HTTPS in production

### Authentication Not Working
**Problem**: Login returns 401 or tokens don't work

**Solutions**:
1. Verify `JWT_SECRET` is set and not empty
2. Check JWT_SECRET is the same across all backend instances
3. Verify `COOKIE_SECURE` matches your deployment (true for HTTPS, false for HTTP)
4. Check browser console for cookie errors

### Backend Can't Connect to MongoDB
**Problem**: Backend fails to start with MongoDB connection errors

**Solutions**:
1. Verify `MONGO_URL` is correct and includes password
2. Check MongoDB Atlas IP whitelist includes your deployment platform
3. Verify database user has correct permissions
4. Test connection string locally first

### Environment Variables Not Applied
**Problem**: Changes to environment variables don't take effect

**Solutions**:
1. **Backend**: Redeploy the service after changing variables
2. **Frontend**: Trigger a new build in Vercel (React bakes env vars at build time)
3. Clear browser cache and cookies
4. Check deployment logs for errors

---

## Local Development Setup

For local development, create these files (don't commit them):

### Backend: `backend/.env`
```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=mapmoments_dev
JWT_SECRET=dev-secret-change-in-production
FRONTEND_ORIGINS=http://localhost:3000
COOKIE_SECURE=false
PORT=8000
```

### Frontend: `frontend/.env.local`
```bash
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_MAPBOX_TOKEN=pk.eyJ1IjoidzI0MDEwIiwiYSI6ImNtZ3JkdWNlNDA1ajAyanB2NzFwd2Z1dXUifQ.zbrJVrV-s1O2zHKKckI-Hw
```

---

## Summary Checklist

Before deploying to production, ensure:

- [ ] JWT secret is generated and configured (64+ character random string)
- [ ] MongoDB connection string is set with strong password
- [ ] FRONTEND_ORIGINS includes all Vercel deployment URLs
- [ ] COOKIE_SECURE is set to `true` for production
- [ ] Backend URL is configured in frontend environment variables
- [ ] Mapbox token is configured and working
- [ ] All secrets are stored securely in deployment platform (not in code)
- [ ] Backend health check endpoint (`/health`) returns 200 OK
- [ ] Frontend can successfully call backend APIs
- [ ] Authentication (login/register) works end-to-end
- [ ] CORS headers are present in API responses

---

## Contact & Support

For issues or questions:
- Check deployment logs in your platform dashboard
- Review this documentation
- Test endpoints using curl or Postman
- Verify all environment variables are set correctly
