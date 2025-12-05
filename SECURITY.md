# Security Summary for MapMoments

This document outlines the security measures implemented in MapMoments and provides guidance for maintaining a secure deployment.

## Overview

MapMoments implements several security best practices to protect user data and ensure secure authentication and authorization. This summary covers the key security features and recommendations.

---

## 1. JWT Secret Configuration

### Implementation
- **JWT Secret**: Used for signing and verifying JWT tokens for user authentication
- **Location**: Configured via `JWT_SECRET` environment variable in `backend/server.py`
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Token Expiration**: 168 hours (7 days) for regular users, 24 hours for guest users

### Security Requirements
✅ **Implemented**: JWT secret is read from environment variables, not hardcoded
✅ **Recommended**: Use a cryptographically secure random string (64+ characters)
✅ **Default**: Fallback value is `'your-secret-key-change-in-production'` (for development only)

### Generating Secure JWT Secrets
Use this command to generate a production-ready JWT secret:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

**Example output** (DO NOT use this example in production):
```
gkzi_o4HQNZnSwrg9P0bIOlMSao36G11iM7vkWZRi1TpNwiTTsF4vgSWSM-fdXkCKJIdViWRHT3Gzqj6h9ZsqQ
```

### Best Practices
- ✅ Use different JWT secrets for development, staging, and production
- ✅ Store secrets only in secure environment variable storage (never in code)
- ✅ Rotate JWT secrets every 90 days
- ✅ Use secrets manager services for enhanced security (AWS Secrets Manager, Azure Key Vault, etc.)
- ❌ Never commit JWT secrets to version control
- ❌ Never share secrets via email, chat, or unsecured channels

---

## 2. Password Security

### Implementation
- **Hashing Algorithm**: bcrypt with auto-generated salt
- **Password Storage**: Only hashed passwords stored in database (never plaintext)
- **Password Verification**: Uses constant-time comparison via bcrypt

### Code Implementation
```python
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
```

### Security Features
✅ **Salt**: Automatically generated per password (unique)
✅ **Work Factor**: Default bcrypt cost factor (prevents brute force)
✅ **Timing Attack Protection**: Constant-time comparison prevents timing attacks

---

## 3. CORS Configuration

### Implementation
- **Dynamic Origins**: Configurable via `FRONTEND_ORIGINS` environment variable
- **Credentials Support**: Allows cookies with `allow_credentials=True`
- **Methods**: All HTTP methods allowed (can be restricted if needed)
- **Headers**: All headers allowed (can be restricted if needed)

### Current Configuration
```python
FRONTEND_ORIGINS = os.environ.get(
    "FRONTEND_ORIGINS",
    "https://mapmoments.vercel.app,https://mapmoments-*.vercel.app,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Security Recommendations
✅ **Production**: Only whitelist specific frontend domains
✅ **Development**: Include localhost for local testing
⚠️ **Warning**: Never use `allow_origins=["*"]` with `allow_credentials=True`
✅ **Logging**: CORS origins are logged at startup for visibility

---

## 4. Cookie Security

### Implementation
- **httpOnly**: Prevents JavaScript access to cookies (XSS protection)
- **secure**: Requires HTTPS in production (configurable via `COOKIE_SECURE`)
- **samesite**: Set to "lax" (CSRF protection)
- **max_age**: Token expiration time in seconds

### Code Implementation
```python
response.set_cookie(
    "token", 
    token, 
    httponly=True,  # XSS protection
    secure=COOKIE_SECURE,  # HTTPS only in production
    samesite="lax",  # CSRF protection
    max_age=JWT_EXPIRATION_HOURS * 3600
)
```

### Configuration
- **Development** (HTTP): `COOKIE_SECURE=false`
- **Production** (HTTPS): `COOKIE_SECURE=true`

⚠️ **Critical**: Always set `COOKIE_SECURE=true` in production with HTTPS

---

## 5. MongoDB Security

### Implementation
- **Connection**: Uses MongoDB connection string from environment variable
- **Database**: Configurable database name via `DB_NAME`
- **Motor Driver**: Async MongoDB driver with connection pooling

### Security Recommendations
✅ **Use MongoDB Atlas** with built-in security features
✅ **Enable IP Whitelisting**: Restrict database access to deployment IPs
✅ **Strong Passwords**: Use complex passwords for database users
✅ **TLS/SSL**: Always use encrypted connections (enabled by default in Atlas)
✅ **Least Privilege**: Grant minimum required permissions to database users
✅ **Separate Databases**: Use different databases for dev/staging/production

### Connection String Security
❌ Never commit connection strings to version control
✅ Use environment variables for connection strings
✅ Rotate database passwords periodically
✅ Monitor database access logs

---

## 6. Authentication & Authorization

### Authentication Flow
1. User registers or logs in with email/password
2. Password is verified using bcrypt
3. JWT token is generated with user ID
4. Token is sent in both response body and httpOnly cookie
5. Subsequent requests include token in Authorization header

### Authorization Checks
- **User Verification**: Every protected endpoint uses `get_current_user` dependency
- **Token Validation**: JWT tokens are verified on each request
- **Token Expiration**: Expired tokens are rejected with 401 error
- **Resource Ownership**: Users can only access/modify their own resources

### Guest User Security
- Guest users are temporary accounts with limited features
- Guest tokens expire after 24 hours (shorter than regular users)
- Guest users can only see their own private pins

---

## 7. API Security Features

### Input Validation
✅ **Pydantic Models**: All inputs validated using Pydantic schemas
✅ **Email Validation**: Email addresses validated with email-validator library
✅ **Type Safety**: Strong typing prevents type-based vulnerabilities

### Error Handling
✅ **Generic Errors**: Authentication failures return generic "Invalid credentials"
✅ **Status Codes**: Proper HTTP status codes (401, 403, 404, etc.)
✅ **No Information Leakage**: Error messages don't reveal system internals

### Rate Limiting
⚠️ **Not Implemented**: Consider adding rate limiting for production
📝 **Recommendation**: Use middleware or API gateway for rate limiting

---

## 8. File Upload Security

### Implementation
- **Content Type Validation**: Only images and videos allowed for media uploads
- **Storage**: GridFS (MongoDB) used for file storage
- **Access Control**: Only pin owners can upload/delete media

### Security Considerations
✅ **Type Checking**: File types validated before upload
⚠️ **File Size Limits**: Consider adding file size limits
⚠️ **Virus Scanning**: Consider adding malware scanning for uploads
📝 **Recommendation**: Move to S3 with signed URLs for better scalability

---

## 9. Dependencies & Vulnerabilities

### Current Dependencies
All dependencies are specified in `backend/requirements.txt` with minimum versions.

### Security Recommendations
✅ **Regular Updates**: Update dependencies regularly for security patches
✅ **Vulnerability Scanning**: Use tools like `pip-audit` or `safety` to scan dependencies
✅ **Pin Versions**: Consider pinning exact versions for production stability

### Recommended Commands
```bash
# Scan for vulnerabilities
pip install pip-audit
pip-audit

# Or use safety
pip install safety
safety check
```

---

## 10. Environment Variables Security

### Critical Variables
| Variable | Security Level | Notes |
|----------|---------------|-------|
| `JWT_SECRET` | 🔴 Critical | Never expose, rotate regularly |
| `MONGO_URL` | 🔴 Critical | Contains database credentials |
| `FRONTEND_ORIGINS` | 🟡 Important | Incorrect config causes security issues |
| `COOKIE_SECURE` | 🟡 Important | Must be `true` in production |

### Security Best Practices
✅ **Use Platform Secrets**: Store in Render/Vercel environment variables
✅ **No Defaults for Secrets**: Require explicit configuration for production
✅ **Access Control**: Limit who can view/modify environment variables
✅ **Audit Trail**: Track changes to environment variables

---

## 11. HTTPS & Transport Security

### Requirements
✅ **Production**: Both frontend and backend must use HTTPS
✅ **Certificates**: Use platform-provided certificates (Vercel, Render auto-provision)
✅ **Cookie Security**: Secure cookies require HTTPS

### Recommendations
📝 **HSTS**: Consider enabling HTTP Strict Transport Security headers
📝 **TLS Version**: Ensure TLS 1.2+ is used (platform default)

---

## 12. Security Checklist for Deployment

Before deploying to production, verify:

### Backend Security
- [ ] JWT secret is a cryptographically secure random string (64+ characters)
- [ ] MongoDB connection string uses strong password
- [ ] `COOKIE_SECURE=true` is set
- [ ] `FRONTEND_ORIGINS` only includes legitimate frontend URLs
- [ ] MongoDB IP whitelist is configured
- [ ] Database user has minimum required permissions
- [ ] All dependencies are up to date
- [ ] Backend is deployed with HTTPS

### Frontend Security
- [ ] Backend URL uses HTTPS (not HTTP)
- [ ] No secrets are hardcoded in frontend code
- [ ] Environment variables are configured in Vercel
- [ ] Content Security Policy headers are considered

### Operational Security
- [ ] Environment variables are stored securely
- [ ] Database backups are configured
- [ ] Monitoring and alerting are set up
- [ ] Access to deployment platforms is restricted
- [ ] Team members use 2FA on all accounts
- [ ] Incident response plan is documented

---

## 13. Known Security Considerations

### Current Limitations
⚠️ **No Rate Limiting**: API endpoints are not rate-limited
⚠️ **No Request Size Limits**: Consider adding request body size limits
⚠️ **GridFS for Media**: Embeds media as base64, consider S3 for production
⚠️ **No Security Headers**: Consider adding security headers (CSP, X-Frame-Options, etc.)

### Future Enhancements
📝 Consider implementing:
- Rate limiting per user/IP
- Request body size limits
- Enhanced logging and monitoring
- Security headers (CSP, HSTS, X-Frame-Options)
- API versioning for backward compatibility
- Automated security scanning in CI/CD

---

## 14. Incident Response

### If JWT Secret is Compromised
1. Generate a new JWT secret immediately
2. Update environment variable in deployment platform
3. Redeploy backend
4. All users will need to log in again (tokens invalidated)
5. Monitor for suspicious activity

### If Database Credentials are Compromised
1. Create new database user with strong password
2. Update `MONGO_URL` environment variable
3. Delete compromised database user
4. Review database access logs
5. Consider rotating all secrets

### If Unauthorized Access Detected
1. Review access logs and identify scope
2. Revoke affected user sessions (rotate JWT secret)
3. Reset passwords for affected users
4. Review and update security measures
5. Document incident and response

---

## 15. Compliance & Privacy

### Data Handling
- User passwords are hashed (bcrypt)
- No plaintext sensitive data in logs
- User data is stored in MongoDB with access controls

### Privacy Considerations
- Users control privacy settings for pins (public/friends/private)
- Guest users have isolated data
- Friend relationships required for direct messages

### Recommendations
📝 Add privacy policy
📝 Add terms of service
📝 Implement data export functionality (GDPR)
📝 Implement account deletion functionality

---

## 16. Security Monitoring

### Recommended Practices
✅ **Monitor Authentication Failures**: Track failed login attempts
✅ **Monitor API Errors**: Track 4xx and 5xx errors
✅ **Monitor Database Performance**: Watch for unusual query patterns
✅ **Log Security Events**: Log authentication, authorization events

### Tools to Consider
- Application Performance Monitoring (APM)
- Log aggregation (Datadog, Papertrail, Loggly)
- Uptime monitoring (UptimeRobot, Pingdom)
- Security scanning (Snyk, Dependabot)

---

## Summary

MapMoments implements fundamental security best practices including:

✅ **Strong Authentication**: JWT tokens with bcrypt password hashing
✅ **Secure Configuration**: Environment-based secrets (never hardcoded)
✅ **CORS Protection**: Configurable allowed origins
✅ **Cookie Security**: httpOnly, secure, and samesite flags
✅ **Input Validation**: Pydantic models for type safety
✅ **Access Control**: Resource ownership checks

**Critical Action Items**:
1. ✅ Generate secure JWT secret before production deployment
2. ✅ Set `COOKIE_SECURE=true` in production
3. ✅ Configure proper CORS origins
4. ✅ Use strong MongoDB credentials
5. ✅ Deploy with HTTPS on both frontend and backend

For detailed environment variable setup, see [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md).
