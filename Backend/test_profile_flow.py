import tempfile
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app import config
from app.database import Base, get_db
from app.models.user import User
from app.core.security import create_access_token
from main import app

# Set test JWT secret key for testing environment
config.JWT_SECRET_KEY = "test_jwt_secret_key_profile_2026_super_secure"

print("--- Running CraftIQ Profile Endpoints Validation Tests ---")

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

    # Setup User A and User B
    db = TestingSession()
    user_a = User(
        display_name="User Alpha",
        email="alpha@example.com",
        password_hash="hashed_pw_alpha",
    )
    user_b = User(
        display_name="User Beta",
        email="beta@example.com",
        password_hash="hashed_pw_beta",
    )
    db.add(user_a)
    db.add(user_b)
    db.commit()
    db.refresh(user_a)
    db.refresh(user_b)
    user_a_id = user_a.id
    user_b_id = user_b.id
    db.close()

    token_a = create_access_token(data={"sub": str(user_a_id)})
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Test 1: GET /profile succeeds with valid token
    get_resp = client.get("/profile", headers=headers_a)
    assert get_resp.status_code == 200, f"GET /profile failed: {get_resp.text}"
    profile_data = get_resp.json()
    assert profile_data["id"] == user_a_id
    assert profile_data["display_name"] == "User Alpha"
    assert profile_data["email"] == "alpha@example.com"
    assert "created_at" in profile_data
    print("[PASS] 1. GET /profile succeeds with valid token")

    # Security check: Profile response contains no sensitive fields
    assert "password_hash" not in profile_data, "Security error: password_hash exposed in GET /profile!"
    assert "password" not in profile_data, "Security error: password exposed in GET /profile!"
    assert "google_sub" not in profile_data, "Security error: google_sub exposed in GET /profile!"
    print("[PASS] 2. Security check: Response contains no sensitive fields (password_hash, google_sub)")

    # Test 2: PUT /profile updates display_name and returns updated profile
    new_name = "  User Alpha Updated  "
    put_resp = client.put("/profile", json={"display_name": new_name}, headers=headers_a)
    assert put_resp.status_code == 200, f"PUT /profile failed: {put_resp.text}"
    updated_data = put_resp.json()
    assert updated_data["display_name"] == "User Alpha Updated", f"Trimming failed: {updated_data['display_name']}"
    print("[PASS] 3. PUT /profile updates display_name and returns updated profile")

    # Test 3: New name persists in a new database session
    db_new_session = TestingSession()
    persisted_user = db_new_session.query(User).filter(User.id == user_a_id).first()
    assert persisted_user is not None
    assert persisted_user.display_name == "User Alpha Updated"
    db_new_session.close()
    print("[PASS] 4. New display_name persisted cleanly in a new database session")

    # Test 4: Updating User A leaves User B unchanged
    db_b_session = TestingSession()
    user_b_persisted = db_b_session.query(User).filter(User.id == user_b_id).first()
    assert user_b_persisted is not None
    assert user_b_persisted.display_name == "User Beta", "User B was modified when updating User A!"
    db_b_session.close()
    print("[PASS] 5. Isolation check: Updating User A left User B unchanged")

    # Test 5: Missing / Invalid tokens return HTTP 401
    missing_auth_resp = client.get("/profile")
    assert missing_auth_resp.status_code == 401
    invalid_auth_resp = client.put("/profile", json={"display_name": "Invalid"}, headers={"Authorization": "Bearer badtoken"})
    assert invalid_auth_resp.status_code == 401
    print("[PASS] 6. Missing/Invalid tokens returned HTTP 401 Unauthorized")

    # Test 6: Blank or oversized display_names return HTTP 422
    blank_resp = client.put("/profile", json={"display_name": "   "}, headers=headers_a)
    assert blank_resp.status_code == 422, f"Expected 422 for blank name, got {blank_resp.status_code}"

    oversized_resp = client.put("/profile", json={"display_name": "A" * 101}, headers=headers_a)
    assert oversized_resp.status_code == 422, f"Expected 422 for oversized name, got {oversized_resp.status_code}"
    print("[PASS] 7. Blank (spaces) and oversized (>100 chars) display_names returned HTTP 422")

    # Test 7: Extra fields (e.g. attempting to update email or password_hash) return HTTP 422
    extra_field_resp = client.put(
        "/profile",
        json={"display_name": "Valid Name", "email": "hacked@example.com"},
        headers=headers_a,
    )
    assert extra_field_resp.status_code == 422, f"Expected 422 for extra fields, got {extra_field_resp.status_code}"

    extra_pw_resp = client.put(
        "/profile",
        json={"display_name": "Valid Name", "password_hash": "new_hash"},
        headers=headers_a,
    )
    assert extra_pw_resp.status_code == 422, f"Expected 422 for password_hash extra field, got {extra_pw_resp.status_code}"
    print("[PASS] 8. Extra fields in PUT request body returned HTTP 422 Unprocessable Entity")

    engine.dispose()
    app.dependency_overrides.clear()
finally:
    if os.path.exists(tmp_path):
        os.remove(tmp_path)

print("--- ALL PROFILE FLOW TESTS PASSED SUCCESSFULLY ---")
