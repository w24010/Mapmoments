# MapMoments

A social media platform for sharing location-based memories with friends. Users can create pins on a map, upload photos/videos, and discover nearby moments.

## 📚 Documentation

- **[Deployment Guide](./README-deploy.md)** - Step-by-step deployment instructions
- **[Environment Variables](./ENVIRONMENT_VARIABLES.md)** - Comprehensive environment variable reference
- **[Quick Reference](./DEPLOYMENT_QUICK_REFERENCE.md)** - Quick deployment cheat sheet
- **[Security Guide](./SECURITY.md)** - Security best practices and JWT setup

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
uvicorn server:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your backend URL
npm start
```

### Configuration Validation
Before deploying, validate your configuration:
```bash
python3 validate_config.py
```

## 🔐 Environment Variables

### Required for Backend
- `MONGO_URL` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (generate with: `python3 -c "import secrets; print(secrets.token_urlsafe(64))"`)
- `FRONTEND_ORIGINS` - Comma-separated list of allowed CORS origins
- `COOKIE_SECURE` - Set to `true` for production (HTTPS)

### Required for Frontend
- `REACT_APP_BACKEND_URL` - Backend API URL
- `REACT_APP_MAPBOX_TOKEN` - Mapbox API token

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for complete documentation.

## 📦 Features

- 🗺️ Interactive map with custom pins
- 📸 Photo and video uploads
- 👥 Friend system with privacy controls
- 💬 Direct messaging
- 📅 Event creation and discovery
- 🔍 Search for pins, events, and users
- 🎯 Trending and nearby content discovery

## 🔒 Security

- JWT-based authentication
- bcrypt password hashing
- CORS protection
- Secure cookie handling
- Environment-based configuration

See [SECURITY.md](./SECURITY.md) for detailed security information.

## 📄 License

This project is licensed under the MIT License.

