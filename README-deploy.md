Frontend (Vercel)

1. Push repository to GitHub (or Git provider supported by Vercel).
2. On Vercel, create a new project and import this repo.
3. Set the Project Root to `frontend` (or leave root and Vercel will auto-detect).
4. Build Command: `npm run build` (or `yarn build`).
5. Output Directory: `build`.
6. Add environment variable in Vercel:
   - `REACT_APP_API_URL` = `https://api.example.com` (your backend URL)

Notes:
- CRA reads env vars that start with `REACT_APP_` at build time. If your frontend fetches the backend, make sure it reads `process.env.REACT_APP_API_URL`.
- The included `vercel.json` makes the frontend deploy as a static build and serves `index.html` for client-side routing.


Backend (recommended hosts: Render, Railway, Fly, Cloud Run)

1. Choose a host that supports Python/ASGI long-running services.
2. Provide the following env vars to your service:
   - `MONGO_URL` (required)
   - `DB_NAME` (optional; default `mapmoments_db`)
   - `JWT_SECRET` (required; strong secret)
   - `FRONTEND_ORIGINS` (comma-separated list of allowed origins, e.g. `https://your-frontend.vercel.app`)
   - `COOKIE_SECURE` (true/false; use `true` in production over HTTPS)
3. Start command (example):
   - `uvicorn backend.server:app --host 0.0.0.0 --port $PORT`
4. Use `requirements.txt` to install dependencies.

Notes & recommendations:
- We updated `backend/server.py` to read `FRONTEND_ORIGINS` and `COOKIE_SECURE` from env vars and to respect `PORT` when running directly.
- We also added a check after updating the profile photo so the API returns 404 if the user isn't found.
- For media storage in production, consider moving from GridFS to an object store (S3) and storing signed URLs in the DB to avoid large base64 payloads.

Troubleshooting:
- If the frontend cannot reach the backend, check `REACT_APP_API_URL` and CORS settings in the backend.
- For cookie-based auth, ensure `COOKIE_SECURE=true` in production and that both frontend and backend are served over HTTPS.

If you want, I can:
- Add a `Dockerfile` for the backend for container deployments.
- Add a small health-check endpoint (already present at `/health`) and docs for automated readiness checks on your host.
- Modify the frontend to read `REACT_APP_API_URL` in all axios calls (I can search and patch occurrences).

