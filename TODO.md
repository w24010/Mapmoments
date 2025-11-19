# Setup and Run Frontend and Backend

## Backend Setup
- [x] Install Python dependencies from backend/requirements.txt
- [x] Run the FastAPI server with uvicorn

## Frontend Setup
- [x] Install Node.js dependencies from frontend/package.json (using yarn)
- [x] Run the React development server

## Testing
- [x] Verify backend is running on port 8000
- [x] Verify frontend is running on port 3000
- [x] Test API connectivity (CORS preflight passes with 200 OK)
- [x] Test backend API docs endpoint (200 OK)
- [x] Test user registration (user exists error)
- [x] Test login endpoint (successful after fix)
- [x] Test protected endpoint without auth (401 Not authenticated)
- [x] Test protected endpoint with invalid token (401 Invalid token)
- [x] Test frontend serving (200 OK with HTML content)
- [x] Test successful user registration (200 OK with token)
- [x] Test CORS on login preflight (200 OK)
- [x] Test authenticated endpoints: /api/discover/trending (200 OK)
- [x] Test authenticated endpoints: /api/pins (200 OK)
- [x] Test authenticated endpoints: /api/events (200 OK, empty array)
- [x] Test authenticated endpoints: /api/auth/me (200 OK with user data)
- [x] Test pin creation (successful)
- [x] Test pin retrieval (successful)
- [x] Test pin liking (successful)
- [x] Test pin commenting (successful)
- [x] Test event creation (successful with location_name)
- [x] Test event attendance (successful)
- [x] Test users endpoint (404 - not implemented)
- [x] Test user profile update (405 - not implemented)
- [x] Test edge cases: empty title (accepted), invalid latitude (accepted), invalid privacy (accepted)
- [x] Test error scenarios: wrong password (401 Invalid credentials), invalid email (422 validation error), duplicate user (400 User already exists), invalid pin ID (404 Pin not found)
- [x] Test events listing (successful with created event)
