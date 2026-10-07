import tempfile
import os
import time
from datetime import datetime, timedelta, timezone
import jwt
from fastapi import APIRouter, Depends, status
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app import config
from app.database import Base, get_db
from app.models.user import User
from app.dependencies.auth import get_current_user
from app.core.security import create_access_token
from main import app

# Set test JWT secret key for testing environment
config.JWT_SECRET_KEY = "test_jwt_secret_key_craftiq_2026_super_secure"

print("--- Running CraftIQ Comprehensive Authentication Flow Tests ---")

# Create a test endpoint using get_current_user dependency
test_router = APIRouter()


@test_router.get("/test-protected")
def test_protected_route(current_user: dict = Depends(get_current_user)):
    return {"status": "success", "user": current_user}


app.include_router(test_router)

# Use temporary SQLite database for testing
with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
    tmp_path = tmp.name

try:
    engine = create_engine(f"sqlite:///{tmp_path}", connect_args={"check_same_thread": False})
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)

    # 1. Test Signup Regression
    signup_payload = {
        "display_name": "Shivangi Trivedi",
        "email": "Shivangi.Auth@Example.COM",
        "password": "MySecretPassword123!",
    }
    signup_resp = client.post("/auth/signup", json=signup_payload)
    assert signup_resp.status_code == 201, f"Signup failed: {signup_resp.text}"
    user_data = signup_resp.json()
    assert user_data["email"] == "shivangi.auth@example.com"
    print("[PASS] 1. Signup regression: HTTP 201 Created")

    # 2. Test Valid Login
    login_payload = {
        "email": "SHIVANGI.AUTH@EXAMPLE.COM",  # Test case-insensitive email normalization
        "password": "MySecretPassword123!",
    }
    login_resp = client.post("/auth/login", json=login_payload)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token_data = login_resp.json()

    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert token_data["expires_in"] == 1800
    access_token = token_data["access_token"]
    print("[PASS] 2. Valid login: HTTP 200 returned with valid access token & 1800s expiry")

    # 3. Test Wrong Credentials (Same 401 error message)
    # 3a. Unknown email
    bad_email_resp = client.post(
        "/auth/login",
        json={"email": "nonexistent@example.com", "password": "MySecretPassword123!"},
    )
    assert bad_email_resp.status_code == 401
    assert bad_email_resp.json()["detail"] == "Invalid email or password"

    # 3b. Wrong password
    bad_pw_resp = client.post(
        "/auth/login",
        json={"email": "shivangi.auth@example.com", "password": "WrongPassword123!"},
    )
    assert bad_pw_resp.status_code == 401
    assert bad_pw_resp.json()["detail"] == "Invalid email or password"
    print("[PASS] 3. Wrong credentials: Same HTTP 401 ('Invalid email or password') for unknown email and wrong password")

    # 4. Test Google-only Account Password Rejection
    db = TestingSession()
    google_user = User(
        display_name="Google User",
        email="google.only@example.com",
        password_hash=None,  # Google account has no password
        google_sub="google-sub-unique-id-12345",
    )
    db.add(google_user)
    db.commit()
    db.close()

    google_login_resp = client.post(
        "/auth/login",
        json={"email": "google.only@example.com", "password": "AnyPasswordAttempt123!"},
    )
    assert google_login_resp.status_code == 401
    assert google_login_resp.json()["detail"] == "Invalid email or password"
    print("[PASS] 4. Google-only account login rejection: HTTP 401 returned for account without password")

    # 5. Test Valid Auth Dependency Verification
    headers = {"Authorization": f"Bearer {access_token}"}
    prot_resp = client.get("/test-protected", headers=headers)
    assert prot_resp.status_code == 200, f"Protected route failed: {prot_resp.text}"
    auth_user = prot_resp.json()["user"]
    assert auth_user["uid"] == str(user_data["id"])
    assert auth_user["email"] == "shivangi.auth@example.com"
    print(f"[PASS] 5. Shared auth dependency: Verified user ID={auth_user['uid']} and email='{auth_user['email']}'")

    # 6. Test Missing / Tampered / Expired Tokens
    # 6a. Missing header
    no_auth_resp = client.get("/test-protected")
    assert no_auth_resp.status_code == 401
    assert no_auth_resp.headers.get("www-authenticate") == "Bearer"

    # 6b. Tampered token
    tampered_headers = {"Authorization": f"Bearer {access_token}invalid"}
    tampered_resp = client.get("/test-protected", headers=tampered_headers)
    assert tampered_resp.status_code == 401
    assert tampered_resp.headers.get("www-authenticate") == "Bearer"

    # 6c. Expired token (using negative delta)
    expired_token = create_access_token(data={"sub": str(user_data["id"])}, expires_delta_seconds=-10)
    expired_headers = {"Authorization": f"Bearer {expired_token}"}
    expired_resp = client.get("/test-protected", headers=expired_headers)
    assert expired_resp.status_code == 401
    assert expired_resp.headers.get("www-authenticate") == "Bearer"
    print("[PASS] 6. Invalid/Missing/Expired tokens: HTTP 401 with WWW-Authenticate: Bearer header")

    # 7. Test Deleted User Rejection
    db = TestingSession()
    db.query(User).filter(User.id == user_data["id"]).delete()
    db.commit()
    db.close()

    deleted_user_resp = client.get("/test-protected", headers=headers)
    assert deleted_user_resp.status_code == 401
    assert deleted_user_resp.headers.get("www-authenticate") == "Bearer"
    print("[PASS] 7. Deleted user rejection: HTTP 401 returned when user no longer exists in DB")

    engine.dispose()
    app.dependency_overrides.clear()
finally:
    if os.path.exists(tmp_path):
        os.remove(tmp_path)

print("--- ALL AUTHENTICATION FLOW TESTS PASSED SUCCESSFULLY ---")
