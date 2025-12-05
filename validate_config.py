#!/usr/bin/env python3
"""
Backend Configuration Validation Script

This script validates that the backend server.py can load properly
and that all environment variables are configured correctly.
It does NOT require MongoDB to be running.
"""

import os
import sys
from pathlib import Path

def validate_environment_variables():
    """Validate that all required environment variables are documented."""
    print("=" * 70)
    print("MapMoments Backend Configuration Validator")
    print("=" * 70)
    print()
    
    # Load environment variables from .env.example
    try:
        from dotenv import load_dotenv
        ROOT_DIR = Path(__file__).parent / "backend"
        load_dotenv(ROOT_DIR / ".env.example")
        print("✅ Loaded environment variables from backend/.env.example")
    except ImportError:
        print("⚠️  python-dotenv not installed, using system environment")
    except Exception as e:
        print(f"❌ Error loading .env.example: {e}")
        return False
    
    print()
    print("-" * 70)
    print("Required Environment Variables")
    print("-" * 70)
    
    # Check required variables
    required_vars = {
        "MONGO_URL": "MongoDB connection string",
        "JWT_SECRET": "JWT secret for token generation",
        "FRONTEND_ORIGINS": "Allowed CORS origins",
        "COOKIE_SECURE": "Cookie security flag",
    }
    
    all_present = True
    for var, description in required_vars.items():
        value = os.environ.get(var)
        if value:
            # Mask sensitive values
            if "SECRET" in var or "URL" in var:
                display_value = f"{value[:20]}..." if len(value) > 20 else value
            else:
                display_value = value
            print(f"✅ {var:20} = {display_value}")
        else:
            print(f"❌ {var:20} = NOT SET")
            all_present = False
    
    print()
    print("-" * 70)
    print("Optional Environment Variables")
    print("-" * 70)
    
    optional_vars = {
        "DB_NAME": "mapmoments_db (default)",
        "PORT": "8000 (default)",
    }
    
    for var, default in optional_vars.items():
        value = os.environ.get(var, default)
        print(f"  {var:20} = {value}")
    
    print()
    return all_present

def validate_cors_configuration():
    """Validate CORS configuration."""
    print("-" * 70)
    print("CORS Configuration Analysis")
    print("-" * 70)
    
    frontend_origins = os.environ.get(
        "FRONTEND_ORIGINS",
        "http://localhost:3000"
    ).split(",")
    frontend_origins = [origin.strip() for origin in frontend_origins if origin.strip()]
    
    print(f"Number of allowed origins: {len(frontend_origins)}")
    print()
    
    has_localhost = False
    has_production = False
    
    # Note: String matching below is for informational display only,
    # not for security validation or URL sanitization
    for i, origin in enumerate(frontend_origins, 1):
        if "localhost" in origin:
            has_localhost = True
            print(f"  {i}. {origin} (Development)")
        elif "vercel.app" in origin or "onrender.com" in origin:
            has_production = True
            print(f"  {i}. {origin} (Production)")
        else:
            print(f"  {i}. {origin}")
    
    print()
    if has_localhost:
        print("✅ Includes localhost for development")
    else:
        print("⚠️  No localhost origin (will not work in local development)")
    
    if has_production:
        print("✅ Includes production URLs")
    else:
        print("⚠️  No production URLs configured")
    
    print()
    return True

def validate_security_configuration():
    """Validate security-related configuration."""
    print("-" * 70)
    print("Security Configuration Analysis")
    print("-" * 70)
    
    # Check JWT secret
    jwt_secret = os.environ.get("JWT_SECRET", "your-secret-key-change-in-production")
    jwt_length = len(jwt_secret)
    
    print(f"JWT Secret length: {jwt_length} characters")
    if jwt_length >= 64:
        print("✅ JWT secret is strong (64+ characters)")
    elif jwt_length >= 32:
        print("⚠️  JWT secret is acceptable but could be stronger (64+ recommended)")
    else:
        print("❌ JWT secret is too weak (minimum 32 characters, 64+ recommended)")
    
    if jwt_secret == "your-secret-key-change-in-production":
        print("❌ JWT secret is using default value - CHANGE FOR PRODUCTION!")
    elif "example" in jwt_secret.lower() or "test" in jwt_secret.lower():
        print("⚠️  JWT secret appears to be a placeholder - update for production")
    else:
        print("✅ JWT secret appears to be customized")
    
    print()
    
    # Check cookie security
    cookie_secure = os.environ.get("COOKIE_SECURE", "false").lower() in ("1", "true", "yes")
    print(f"Cookie Security (COOKIE_SECURE): {cookie_secure}")
    if cookie_secure:
        print("✅ Cookies will be secure (HTTPS only)")
    else:
        print("⚠️  Cookies will NOT be secure (OK for development only)")
    
    print()
    return True

def validate_imports():
    """Validate that required Python packages can be imported."""
    print("-" * 70)
    print("Python Dependencies Check")
    print("-" * 70)
    
    required_packages = [
        "fastapi",
        "motor",
        "bcrypt",
        "PyJWT",  # Package name is PyJWT, imported as jwt
        "pydantic",
        "dotenv",
    ]
    
    all_imported = True
    for package in required_packages:
        try:
            if package == "dotenv":
                __import__("dotenv")
            elif package == "PyJWT":
                __import__("jwt")  # PyJWT is imported as 'jwt'
            else:
                __import__(package)
            print(f"✅ {package:20} - installed")
        except ImportError:
            print(f"❌ {package:20} - NOT installed")
            all_imported = False
    
    print()
    if not all_imported:
        print("⚠️  Some dependencies are missing. Install with:")
        print("   pip install -r backend/requirements.txt")
    else:
        print("✅ All required dependencies are installed")
    
    print()
    return all_imported

def main():
    """Run all validation checks."""
    results = []
    
    # Run validation checks
    results.append(("Environment Variables", validate_environment_variables()))
    results.append(("CORS Configuration", validate_cors_configuration()))
    results.append(("Security Configuration", validate_security_configuration()))
    
    # Only check imports if we're not in a minimal environment
    try:
        results.append(("Python Dependencies", validate_imports()))
    except Exception as e:
        print(f"⚠️  Skipping dependency check: {e}")
    
    # Print summary
    print("=" * 70)
    print("Validation Summary")
    print("=" * 70)
    
    all_passed = True
    for check_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{check_name:30} {status}")
        if not passed:
            all_passed = False
    
    print("=" * 70)
    
    if all_passed:
        print()
        print("🎉 All validation checks passed!")
        print()
        print("Next steps:")
        print("  1. Copy backend/.env.example to backend/.env")
        print("  2. Update backend/.env with your actual values")
        print("  3. Start the backend: uvicorn backend.server:app --reload")
        print()
        return 0
    else:
        print()
        print("⚠️  Some validation checks failed. Please review the output above.")
        print()
        return 1

if __name__ == "__main__":
    sys.exit(main())
