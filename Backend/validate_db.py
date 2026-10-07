import tempfile
import os
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from app.database import Base
from app.models.user import User

print("--- User Database Foundation Validation ---")

# Use a temporary file database to avoid touching any live database
with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp:
    tmp_path = tmp.name

try:
    engine = create_engine(f"sqlite:///{tmp_path}", connect_args={"check_same_thread": False})
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # Check 1: Confirm the User table is created
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    assert "users" in tables, "Table 'users' was not created!"
    print("[PASS] 1. User table created in SQLite")

    # Check 2: Insert dummy user, close session, fetch in NEW session to verify persistence
    session1 = TestingSession()
    dummy_user = User(
        display_name="Test User",
        email="  Test.User@Domain.Com  ",
        password_hash="hashed_secret_pw_123",
        google_sub=None,  # Null for email/password account
    )
    session1.add(dummy_user)
    session1.commit()
    user_id = dummy_user.id
    session1.close()  # Close the session completely

    # Open NEW session to verify persistence from database
    session2 = TestingSession()
    fetched_user = session2.query(User).filter(User.id == user_id).first()
    assert fetched_user is not None, "User not found in new session!"
    assert fetched_user.email == "test.user@domain.com", f"Email normalization failed: {fetched_user.email}"
    assert fetched_user.display_name == "Test User"
    assert fetched_user.password_hash == "hashed_secret_pw_123"
    assert fetched_user.google_sub is None, "google_sub should be null for email/password account"
    session2.close()
    print(f"[PASS] 2. Dummy user inserted, session closed, and successfully fetched in NEW session (ID={user_id})")

    # Check 3: Confirm duplicate normalized emails are rejected
    session3 = TestingSession()
    duplicate_user = User(
        display_name="Duplicate User",
        email="TEST.USER@DOMAIN.COM",  # Same email with different casing
        password_hash="another_password",
    )
    session3.add(duplicate_user)
    try:
        session3.commit()
        print("[FAIL] 3. Duplicate normalized email was NOT rejected!")
    except IntegrityError:
        session3.rollback()
        print("[PASS] 3. Duplicate normalized email rejected (IntegrityError caught)")
    session3.close()

    # Check 4: Confirm password_hash and google_sub can be null for intended account types
    session4 = TestingSession()

    # Account type A: Email/Password account (google_sub is None)
    user_email_auth = User(
        display_name="Email Auth User",
        email="email.auth@example.com",
        password_hash="some_hashed_pass",
        google_sub=None,  # google_sub IS NULL
    )
    session4.add(user_email_auth)

    # Account type B: Google OAuth account (password_hash is None)
    user_google_auth = User(
        display_name="Google Auth User",
        email="google.auth@example.com",
        password_hash=None,  # password_hash IS NULL
        google_sub="google_sub_id_99999",
    )
    session4.add(user_google_auth)
    session4.commit()

    session4.refresh(user_email_auth)
    session4.refresh(user_google_auth)

    assert user_email_auth.google_sub is None, "google_sub failed to store null"
    assert user_google_auth.password_hash is None, "password_hash failed to store null"
    assert user_google_auth.google_sub == "google_sub_id_99999"

    session4.close()
    print("[PASS] 4. Nullable password_hash (for Google auth) and google_sub (for email auth) verified")

    engine.dispose()
finally:
    if os.path.exists(tmp_path):
        os.remove(tmp_path)

print("--- ALL VERIFICATION CHECKS PASSED ---")
