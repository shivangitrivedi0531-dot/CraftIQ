import tempfile
import os
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from requests.exceptions import RequestException

from app import config
from app.database import Base, get_db
from app.models.user import User
from main import app

# Set test JWT secret key and Google Client ID for testing environment
config.JWT_SECRET_KEY = "test_jwt_secret_key_google_auth_2026_super_secure"
config.GOOGLE_CLIENT_ID = "test-google-client-id.apps.googleusercontent.com"

print("================================================================================")
print("--- CraftIQ Google Authentication Backend Test Suite ---")
print("NOTE: These unit tests mock Google ID token verification")
print("(google.oauth2.id_token.verify_oauth2_token) to run isolated, offline tests.")
print("For real Google login testing in production/staging, configure a valid")
print("GOOGLE_CLIENT_ID and send real ID tokens issued by Google.")
print("================================================================================")

# Use temporary SQLite database for test isolation
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

    # --------------------------------------------------------------------------
    # 1. First-time Google user signup & login
    # --------------------------------------------------------------------------
    mock_payload_new = {
        "sub": "google-sub-10001",
        "email": "New.GoogleUser@Example.COM",
        "email_verified": True,
        "name": "New Google User",
        "iss": "https://accounts.google.com",
    }

    with patch("app.services.google_auth_service.id_token.verify_oauth2_token", return_value=mock_payload_new):
        resp = client.post("/auth/google", json={"id_token": "valid_mock_token_1"})
        assert resp.status_code == 200, f"Google auth failed: {resp.text}"
        token_data = resp.json()
        assert "access_token" in token_data
        assert token_data["token_type"] == "bearer"
        assert token_data["expires_in"] == 1800
        google_user_token = token_data["access_token"]
        print("[PASS] 1. New Google user registration & login (HTTP 200, JWT issued)")

    # Verify DB record for new user
    db = TestingSession()
    user_in_db = db.query(User).filter(User.google_sub == "google-sub-10001").first()
    assert user_in_db is not None
    assert user_in_db.email == "new.googleuser@example.com"
    assert user_in_db.display_name == "New Google User"
    assert user_in_db.password_hash is None
    new_user_id = user_in_db.id
    db.close()
    print("[PASS] 2. Verified DB state: email normalized, display_name set, password_hash=None")

    # --------------------------------------------------------------------------
    # 2. Returning Google user preserves saved display name
    # --------------------------------------------------------------------------
    # Update user's display_name in DB
    db = TestingSession()
    user_to_update = db.query(User).filter(User.id == new_user_id).first()
    user_to_update.display_name = "Custom Saved Name"
    db.commit()
    db.close()

    with patch("app.services.google_auth_service.id_token.verify_oauth2_token", return_value=mock_payload_new):
        resp_returning = client.post("/auth/google", json={"id_token": "valid_mock_token_1"})
        assert resp_returning.status_code == 200
        print("[PASS] 3. Returning Google user login (HTTP 200)")

    # Check display name preservation
    db = TestingSession()
    returning_db_user = db.query(User).filter(User.id == new_user_id).first()
    assert returning_db_user.display_name == "Custom Saved Name", "Display name was overwritten!"
    db.close()
    print("[PASS] 4. Preserved existing user's saved display name on returning login")

    # --------------------------------------------------------------------------
    # 3. Access GET /profile with issued CraftIQ token
    # --------------------------------------------------------------------------
    profile_resp = client.get("/profile", headers={"Authorization": f"Bearer {google_user_token}"})
    assert profile_resp.status_code == 200, f"Profile request failed: {profile_resp.text}"
    profile_data = profile_resp.json()
    assert profile_data["id"] == new_user_id
    assert profile_data["email"] == "new.googleuser@example.com"
    assert profile_data["display_name"] == "Custom Saved Name"
    assert "password_hash" not in profile_data
    assert "google_sub" not in profile_data
    print("[PASS] 5. GET /profile accessed successfully using Google-issued CraftIQ token")

    # --------------------------------------------------------------------------
    # 4. Email conflict with existing password user (HTTP 409)
    # --------------------------------------------------------------------------
    # Create standard password user in DB
    db = TestingSession()
    existing_pw_user = User(
        display_name="Password User",
        email="pw.user@example.com",
        password_hash="argon2_hashed_password_sample",
        google_sub=None,
    )
    db.add(existing_pw_user)
    db.commit()
    db.close()

    mock_conflict_payload = {
        "sub": "google-sub-conflict-999",
        "email": "PW.USER@EXAMPLE.COM",  # Case-insensitive conflict
        "email_verified": True,
        "name": "Google User Conflict",
        "iss": "https://accounts.google.com",
    }

    with patch("app.services.google_auth_service.id_token.verify_oauth2_token", return_value=mock_conflict_payload):
        resp_conflict = client.post("/auth/google", json={"id_token": "token_conflict"})
        assert resp_conflict.status_code == 409, f"Expected 409, got {resp_conflict.status_code}"
        assert "already exists" in resp_conflict.json()["detail"].lower()
        print("[PASS] 6. Email conflict check: HTTP 409 returned when email exists with different auth method")

    # --------------------------------------------------------------------------
    # 5. Invalid / Expired / Wrong-Audience Google tokens (HTTP 401)
    # --------------------------------------------------------------------------
    # 5a. Expired / Invalid signature token
    with patch("app.services.google_auth_service.id_token.verify_oauth2_token", side_effect=ValueError("Token expired")):
        resp_expired = client.post("/auth/google", json={"id_token": "expired_token"})
        assert resp_expired.status_code == 401
        assert resp_expired.json()["detail"] == "Invalid or expired Google token"
        print("[PASS] 7a. Expired/Invalid token: HTTP 401 Unauthorized")

    # 5b. Wrong audience / invalid token
    with patch("app.services.google_auth_service.id_token.verify_oauth2_token", side_effect=ValueError("Wrong audience")):
        resp_audience = client.post("/auth/google", json={"id_token": "wrong_audience_token"})
        assert resp_audience.status_code == 401
        assert resp_audience.json()["detail"] == "Invalid or expired Google token"
        print("[PASS] 7b. Wrong audience token: HTTP 401 Unauthorized")

    # 5c. Invalid issuer in payload
    mock_bad_iss = {
        "sub": "google-sub-bad-iss",
        "email": "bad.iss@example.com",
        "email_verified": True,
        "iss": "https://malicious-issuer.com",
    }
    with patch("app.services.google_auth_service.id_token.verify_oauth2_token", return_value=mock_bad_iss):
        resp_bad_iss = client.post("/auth/google", json={"id_token": "bad_iss_token"})
        assert resp_bad_iss.status_code == 401
        assert resp_bad_iss.json()["detail"] == "Invalid Google token issuer"
        print("[PASS] 7c. Invalid issuer: HTTP 401 Unauthorized")

    # 5d. Missing sub in payload
    mock_no_sub = {
        "email": "no.sub@example.com",
        "email_verified": True,
        "iss": "https://accounts.google.com",
    }
    with patch("app.services.google_auth_service.id_token.verify_oauth2_token", return_value=mock_no_sub):
        resp_no_sub = client.post("/auth/google", json={"id_token": "no_sub_token"})
        assert resp_no_sub.status_code == 401
        assert "subject" in resp_no_sub.json()["detail"].lower()
        print("[PASS] 7d. Missing sub claim: HTTP 401 Unauthorized")

    # --------------------------------------------------------------------------
    # 6. Unverified email (HTTP 401)
    # --------------------------------------------------------------------------
    mock_unverified = {
        "sub": "google-sub-unverified",
        "email": "unverified@example.com",
        "email_verified": False,
        "iss": "https://accounts.google.com",
    }
    with patch("app.services.google_auth_service.id_token.verify_oauth2_token", return_value=mock_unverified):
        resp_unverified = client.post("/auth/google", json={"id_token": "unverified_token"})
        assert resp_unverified.status_code == 401
        assert resp_unverified.json()["detail"] == "Google account email is not verified"
        print("[PASS] 8. Unverified email: HTTP 401 Unauthorized")

    # --------------------------------------------------------------------------
    # 7. Verification network failure (HTTP 503)
    # --------------------------------------------------------------------------
    with patch(
        "app.services.google_auth_service.id_token.verify_oauth2_token",
        side_effect=RequestException("Network timeout fetching certs"),
    ):
        resp_net = client.post("/auth/google", json={"id_token": "net_error_token"})
        assert resp_net.status_code == 503
        assert resp_net.json()["detail"] == "Google authentication service is currently unavailable"
        print("[PASS] 9. Verification network failure: HTTP 503 Service Unavailable")

    # --------------------------------------------------------------------------
    # 8. Missing server configuration (HTTP 500)
    # --------------------------------------------------------------------------
    saved_client_id = config.GOOGLE_CLIENT_ID
    saved_env_client_id = os.environ.get("GOOGLE_CLIENT_ID")
    try:
        config.GOOGLE_CLIENT_ID = ""
        os.environ["GOOGLE_CLIENT_ID"] = ""
        resp_no_cfg = client.post("/auth/google", json={"id_token": "any_token"})
        assert resp_no_cfg.status_code == 500
        assert "not set" in resp_no_cfg.json()["detail"] or "not configured" in resp_no_cfg.json()["detail"]
        print("[PASS] 10. Missing server configuration: HTTP 500 Configuration Error")
    finally:
        config.GOOGLE_CLIENT_ID = saved_client_id
        if saved_env_client_id is not None:
            os.environ["GOOGLE_CLIENT_ID"] = saved_env_client_id
        else:
            os.environ.pop("GOOGLE_CLIENT_ID", None)

    # --------------------------------------------------------------------------
    # 9. Empty token body validation (HTTP 422)
    # --------------------------------------------------------------------------
    resp_empty_token = client.post("/auth/google", json={"id_token": "   "})
    assert resp_empty_token.status_code == 422
    print("[PASS] 11. Empty id_token validation: HTTP 422 Unprocessable Entity")

    # --------------------------------------------------------------------------
    # 10. Code exchange endpoint (POST /auth/google/code)
    # --------------------------------------------------------------------------
    config.GOOGLE_CLIENT_SECRET = "test_google_client_secret_2026"

    mock_code_payload = {
        "sub": "google-sub-code-20002",
        "email": "Code.User@Example.COM",
        "email_verified": True,
        "name": "Code Google User",
        "iss": "https://accounts.google.com",
    }

    with patch(
        "app.services.google_auth_service.exchange_code_and_verify",
        return_value=mock_code_payload,
    ):
        code_resp = client.post("/auth/google/code", json={"code": "4/0AeaYSH_test_code"})
        assert code_resp.status_code == 200, f"Code auth failed: {code_resp.text}"
        code_token_data = code_resp.json()
        assert "access_token" in code_token_data
        assert code_token_data["token_type"] == "bearer"
        print("[PASS] 12. Server-side code exchange endpoint (/auth/google/code): HTTP 200, JWT issued")


    engine.dispose()
    app.dependency_overrides.clear()
finally:
    if os.path.exists(tmp_path):
        os.remove(tmp_path)

print("================================================================================")
print("--- ALL GOOGLE AUTHENTICATION TESTS PASSED SUCCESSFULLY ---")
print("================================================================================")
