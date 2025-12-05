# MapMoments Deployment Guide

For a comprehensive list of all environment variables and detailed setup instructions, see [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md).

## Quick Start

### Frontend (Vercel)

1. Push repository to GitHub (or Git provider supported by Vercel).
2. On Vercel, create a new project and import this repo.
3. Set the Project Root to `frontend` (or leave root and Vercel will auto-detect).
4. Build Command: `npm run build` (or `yarn build`).
5. Output Directory: `build`.
6. Add environment variables in Vercel (see [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)):
   - `REACT_APP_BACKEND_URL` = Your deployed backend URL
   - `REACT_APP_MAPBOX_TOKEN` = Your Mapbox token

Notes:
- CRA reads env vars that start with `REACT_APP_` at build time. Make sure the frontend reads `process.env.REACT_APP_BACKEND_URL`.
- The included `vercel.json` makes the frontend deploy as a static build and serves `index.html` for client-side routing.
- After changing environment variables, you must trigger a new build for changes to take effect.


### Backend (Render, Railway, Fly, Cloud Run)

1. Choose a host that supports Python/ASGI long-running services.
2. Provide the following environment variables (see [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for details):
   - `MONGO_URL` (required) - MongoDB connection string
   - `DB_NAME` (optional; default `mapmoments_db`)
   - `JWT_SECRET` (required) - Generate using: `python3 -c "import secrets; print(secrets.token_urlsafe(64))"`
   - `FRONTEND_ORIGINS` (required) - Comma-separated list of allowed origins (e.g., `https://mapmoments.vercel.app`)
   - `COOKIE_SECURE` (required) - Set to `true` in production over HTTPS
3. Start command:
   - `uvicorn backend.server:app --host 0.0.0.0 --port $PORT`
4. Use `backend/requirements.txt` to install dependencies.

Notes:
- The backend has CORS middleware configured to read `FRONTEND_ORIGINS` from environment variables.
- Cookie-based authentication requires `COOKIE_SECURE=true` in production with HTTPS.
- Health check endpoint available at `/health` for monitoring.
- For media storage in production, GridFS is used. Consider moving to S3 for better performance.

## Deployment Checklist

Before deploying to production:

- [ ] Generate a secure JWT secret (64+ character random string)
- [ ] Configure MongoDB connection string
- [ ] Set all required environment variables in both platforms
- [ ] Update `FRONTEND_ORIGINS` to include all Vercel deployment URLs
- [ ] Set `COOKIE_SECURE=true` for production backend
- [ ] Test health check endpoint (`/health`) returns 200 OK
- [ ] Verify CORS configuration by testing API calls from frontend
- [ ] Test authentication (login/register) end-to-end

## Troubleshooting

### CORS Issues
- Ensure `FRONTEND_ORIGINS` includes your exact Vercel URLs (without trailing slashes)
- Verify backend has redeployed after changing environment variables
- Check that both frontend and backend are using HTTPS in production

### Authentication Issues
- Verify `JWT_SECRET` is set and the same across all backend instances
- Check that `COOKIE_SECURE` matches your deployment protocol (true for HTTPS)
- Clear browser cookies and try again

### Environment Variables Not Applied
- **Backend**: Redeploy after changing variables
- **Frontend**: Trigger a new build in Vercel (React bakes env vars at build time)

For detailed troubleshooting and security best practices, see [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md).

## Additional Resources

- Health check endpoint: `/health`
- API documentation: Available at `/docs` when backend is running
- For container deployments, see `backend/Dockerfile`


