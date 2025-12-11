# Environment Variables for Deployment

## VERCEL (Frontend) Environment Variables

### Required Variables:

1. **REACT_APP_BACKEND_URL**
   - **Description**: The URL of your backend API
   - **Example**: https://mapmoments-backend.onrender.com
   - **Required**: Yes
   - **Where to set**: Vercel Project Settings > Environment Variables
   - **Note**: This is the base URL (without /api). The frontend will append /api automatically.

### Optional Variables:

2. **REACT_APP_MAPBOX_TOKEN**
   - **Description**: Mapbox API token for map functionality
   - **Example**: pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImN...
   - **Required**: No (only if using Mapbox maps)
   - **Where to set**: Vercel Project Settings > Environment Variables
   - **Note**: Get your token from https://account.mapbox.com/

---

## RENDER (Backend) Environment Variables

### Required Variables:

1. **MONGO_URL**
   - **Description**: MongoDB connection string
   - **Example**: mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   - **Required**: Yes
   - **Where to set**: Render Dashboard > Your Service > Environment
   - **Note**: Get this from MongoDB Atlas or your MongoDB provider

2. **JWT_SECRET**
   - **Description**: Secret key for JWT token encryption
   - **Example**: your-super-secret-key-change-this-in-production-12345
   - **Required**: Yes
   - **Where to set**: Render Dashboard > Your Service > Environment
   - **Note**: Use a strong, random string. Generate with: openssl rand -hex 32

3. **FRONTEND_ORIGINS**
   - **Description**: Comma-separated list of allowed frontend URLs for CORS
   - **Example**: https://mapmoments.vercel.app,https://mapmoments-git-main-yourname.vercel.app
   - **Required**: Yes
   - **Where to set**: Render Dashboard > Your Service > Environment
   - **Note**: Include your production URL and any preview URLs you want to allow. The backend also automatically allows all *.vercel.app subdomains.

4. **COOKIE_SECURE**
   - **Description**: Enable secure cookies for HTTPS
   - **Example**: 	rue
   - **Required**: Yes (for production)
   - **Where to set**: Render Dashboard > Your Service > Environment
   - **Note**: Set to 	rue when using HTTPS (production), alse for local development

### Optional Variables:

5. **DB_NAME**
   - **Description**: MongoDB database name
   - **Example**: mapmoments_db
   - **Required**: No (defaults to mapmoments_db)
   - **Where to set**: Render Dashboard > Your Service > Environment
   - **Note**: Only set if you want a different database name

---

## Complete Example Configuration

### Vercel Environment Variables:
`
REACT_APP_BACKEND_URL=https://mapmoments-backend.onrender.com
REACT_APP_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImN...
`

### Render Environment Variables:
`
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-1234567890abcdef
FRONTEND_ORIGINS=https://mapmoments.vercel.app,https://mapmoments-git-main-yourname.vercel.app
COOKIE_SECURE=true
DB_NAME=mapmoments_db
`

---

## How to Set Environment Variables

### On Vercel:
1. Go to your project dashboard
2. Click on **Settings**
3. Click on **Environment Variables**
4. Add each variable with its value
5. Select environment (Production, Preview, Development)
6. Click **Save**
7. Redeploy your application

### On Render:
1. Go to your service dashboard
2. Click on **Environment** in the left sidebar
3. Click **Add Environment Variable**
4. Enter the key and value
5. Click **Save Changes**
6. The service will automatically redeploy

---

## Security Notes

1. **Never commit environment variables to Git**
   - They should only be set in your hosting platform
   - Use .env files locally (and add them to .gitignore)

2. **JWT_SECRET**: 
   - Must be a strong, random string
   - Never share or expose this value
   - Generate a new one for production

3. **MONGO_URL**:
   - Contains database credentials
   - Keep it secure
   - Use MongoDB Atlas IP whitelist for extra security

4. **COOKIE_SECURE**:
   - Always set to 	rue in production (HTTPS)
   - Set to alse only for local development (HTTP)

---

## Testing Your Configuration

### Test Backend:
`ash
curl https://your-backend.onrender.com/health
`
Should return: {"status":"ok","message":"Backend is running"}

### Test Frontend:
1. Visit your Vercel URL
2. Open browser console (F12)
3. Check for any CORS or API errors
4. Try logging in/registering

### Common Issues:
- **CORS Error**: Check FRONTEND_ORIGINS includes your exact Vercel URL
- **API Connection Failed**: Verify REACT_APP_BACKEND_URL is correct
- **Authentication Fails**: Check JWT_SECRET is set and consistent
