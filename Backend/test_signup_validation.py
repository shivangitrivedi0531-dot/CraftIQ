import tempfile
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.models.user import User
from app.core.security import pwd_hash
from main import app

print("--- Running CraftIQ Signup Validation Tests ---")

# Use temporary SQLite database to keep tests isolated
with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
    tmp_path = tmp.name

try:
    engine = create_engine(f"sqlite:///{tmp_path}", connect_args={"check_same_thread": False})
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # Initialize tables
    Base.metadata.create_all(bind=engine)

    # Override get_db dependency for testing
    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)

    # Test 1: Successful signup
    raw_password = "SecurePassword123!"
    payload = {
        "display_name": "  CraftIQ Artist  ",
        "email": "Artist.CraftIQ@Example.COM",
        "password": raw_password,
    }
    response = client.post("/auth/signup", json=payload)
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    data = response.json()

    assert data["id"] is not None
    assert data["display_name"] == "CraftIQ Artist", f"Display name trimming failed: {data['display_name']}"
    assert data["email"] == "artist.craftiq@example.com", f"Email normalization failed: {data['email']}"
    assert "created_at" in data
    print(f"[PASS] 1. Successful signup (HTTP 201, ID={data['id']}, email='{data['email']}')")

    # Test 5: Response contains no password or password_hash fields
    assert "password" not in data, "Security error: Response leaked password!"
    assert "password_hash" not in data, "Security error: Response leaked password_hash!"
    print("[PASS] 2. Security check: Response contains no password or password_hash")

    # Test 2: Stored hash differs from password and verifies correctly
    db_session = TestingSession()
    db_user = db_session.query(User).filter(User.id == data["id"]).first()
    assert db_user is not None
    assert db_user.password_hash != raw_password, "Password stored in plain text!"
    assert pwd_hash.verify(raw_password, db_user.password_hash), "Argon2 password verification failed!"
    print(f"[PASS] 3. Password hashing check (Argon2 hash verified: {db_user.password_hash[:30]}...)")
    db_session.close()

    # Test 3: Duplicate email (including case differences) returns HTTP 409 Conflict
    dup_payload = {
        "display_name": "Another Artist",
        "email": "ARTIST.CRAFTIQ@EXAMPLE.COM",  # Same email with uppercase
        "password": "AnotherPassword456!",
    }
    dup_response = client.post("/auth/signup", json=dup_payload)
    assert dup_response.status_code == 409, f"Expected 409, got {dup_response.status_code}"
    assert dup_response.json()["detail"] == "Email is already registered"
    print("[PASS] 4. Duplicate email check (HTTP 409 returned for case-insensitive duplicate)")

    # Test 4: Invalid email returns HTTP 422
    bad_email_resp = client.post(
        "/auth/signup",
        json={"display_name": "Artist", "email": "invalid-email-format", "password": "Password123!"},
    )
    assert bad_email_resp.status_code == 422, f"Expected 422 for bad email, got {bad_email_resp.status_code}"
    print("[PASS] 5. Validation check: Invalid email format returned HTTP 422")

    # Test 4b: Blank display name returns HTTP 422
    blank_name_resp = client.post(
        "/auth/signup",
        json={"display_name": "   ", "email": "valid@example.com", "password": "Password123!"},
    )
    assert blank_name_resp.status_code == 422, f"Expected 422 for blank name, got {blank_name_resp.status_code}"
    print("[PASS] 6. Validation check: Blank display_name returned HTTP 422")

    # Test 4c: Short password (< 8 chars) returns HTTP 422
    short_pw_resp = client.post(
        "/auth/signup",
        json={"display_name": "Artist", "email": "valid@example.com", "password": "short"},
    )
    assert short_pw_resp.status_code == 422, f"Expected 422 for short password, got {short_pw_resp.status_code}"
    print("[PASS] 7. Validation check: Short password (< 8 chars) returned HTTP 422")

    engine.dispose()
    app.dependency_overrides.clear()
finally:
    if os.path.exists(tmp_path):
        os.remove(tmp_path)

print("--- ALL SIGNUP VALIDATION TESTS PASSED SUCCESSFULLY ---")
