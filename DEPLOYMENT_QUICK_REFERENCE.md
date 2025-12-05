# MapMoments Deployment Quick Reference

## 🚀 Quick Setup (5 Minutes)

### 1. Generate JWT Secret
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```
Copy the output - you'll need it!

### 2. Backend (Render) - Required Environment Variables
```
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=mapmoments_db
JWT_SECRET=<paste-your-generated-secret>
FRONTEND_ORIGINS=https://mapmoments.vercel.app,https://mapmoments-*.vercel.app
COOKIE_SECURE=true
```

**Start Command**: `uvicorn backend.server:app --host 0.0.0.0 --port $PORT`

### 3. Frontend (Vercel) - Required Environment Variables
```
REACT_APP_BACKEND_URL=https://your-backend.onrender.com
REACT_APP_MAPBOX_TOKEN=pk.your-mapbox-token-here
```

---

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas cluster created and connection string copied
- [ ] JWT secret generated (64+ characters)
- [ ] Backend deployed to Render (or similar)
- [ ] Backend URL noted (e.g., https://mapmoments-backend.onrender.com)
- [ ] Frontend deployed to Vercel
- [ ] All environment variables set in both platforms
- [ ] Both services using HTTPS
- [ ] Health check works: `curl https://your-backend.onrender.com/health`
- [ ] CORS test: Frontend can call backend APIs
- [ ] Authentication test: Login/register works

---

## 🔍 Testing Your Deployment

### Test Backend Health
```bash
curl https://your-backend.onrender.com/health
# Expected: {"status":"ok","message":"Backend is running"}
```

### Test CORS Headers
```bash
curl -H "Origin: https://mapmoments.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-backend.onrender.com/api/auth/login -v
# Look for: Access-Control-Allow-Origin header in response
```

### Test Authentication
```bash
curl -X POST https://your-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'
# Expected: {"token":"...","user":{...}}
```

---

## 🔧 Common Issues & Quick Fixes

### CORS Error
**Symptom**: "Access-Control-Allow-Origin" error in browser console

**Fix**:
1. Check `FRONTEND_ORIGINS` includes your exact Vercel URL
2. No trailing slashes in URLs
3. Redeploy backend after changing FRONTEND_ORIGINS

### 401 Unauthorized
**Symptom**: Login returns 401 or "Invalid token"

**Fix**:
1. Verify JWT_SECRET is set and not empty
2. Check COOKIE_SECURE matches deployment (true for HTTPS)
3. Clear browser cookies and try again

### Can't Connect to MongoDB
**Symptom**: Backend fails to start with connection errors

**Fix**:
1. Verify MONGO_URL includes correct password
2. Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for all IPs)
3. Verify database user has readWrite permissions

### Environment Variables Not Working
**Symptom**: Changes don't take effect

**Fix**:
- **Backend**: Manually redeploy on Render
- **Frontend**: Trigger new build on Vercel (env vars baked at build time)

---

## 📱 Platform-Specific Instructions

### Render (Backend)
1. New Web Service → Connect GitHub repo
2. Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn backend.server:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in "Environment" tab
6. Deploy!

### Vercel (Frontend)
1. New Project → Import from GitHub
2. Framework Preset: Create React App
3. Root Directory: `frontend`
4. Build Command: `npm run build`
5. Output Directory: `build`
6. Add environment variables in Settings → Environment Variables
7. Deploy!

---

## 🔐 Security Reminders

- ✅ Use HTTPS for both frontend and backend
- ✅ Set COOKIE_SECURE=true in production
- ✅ Never commit .env files
- ✅ Use strong, random JWT secret (64+ characters)
- ✅ Rotate secrets every 90 days
- ✅ Enable MongoDB IP whitelisting
- ✅ Use strong database passwords

---

## 📚 Full Documentation

- **Detailed Setup**: See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)
- **Security Guide**: See [SECURITY.md](./SECURITY.md)
- **Deployment Guide**: See [README-deploy.md](./README-deploy.md)

---

## 🆘 Need Help?

1. Check deployment logs in your platform dashboard
2. Test health endpoint: `/health`
3. Verify all environment variables are set
4. Review CORS configuration
5. Check MongoDB connection and IP whitelist
6. Ensure both platforms use HTTPS

---

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ Backend `/health` endpoint returns 200 OK
- ✅ Frontend loads without errors
- ✅ User can register a new account
- ✅ User can log in successfully
- ✅ User can create pins on the map
- ✅ No CORS errors in browser console
- ✅ Cookies are set with secure flag (check DevTools → Application → Cookies)

---

**Next Steps**: Once deployed, test all features end-to-end and monitor logs for any errors.
