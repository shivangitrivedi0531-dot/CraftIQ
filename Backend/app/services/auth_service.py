from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.auth import SignupRequest


def create_user(db: Session, payload: SignupRequest) -> User:
    """
    Creates a new user account with Argon2 password hashing.
    Throws HTTP 409 if the email is already registered.
    """
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    hashed_password = hash_password(payload.password)
    new_user = User(
        display_name=payload.display_name,
        email=payload.email,
        password_hash=hashed_password,
    )

    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    return new_user


def authenticate_user(db: Session, email: str, password: str) -> User:
    """
    Authenticates user credentials.
    Returns the same HTTP 401 error message for unknown emails, incorrect passwords,
    and accounts without a password (e.g. Google-only accounts).
    """
    normalized_email = email.strip().lower() if isinstance(email, str) else ""
    user = db.query(User).filter(User.email == normalized_email).first()

    # Reject if user doesn't exist, password_hash is missing (Google-only), or password verify fails
    if not user or not user.password_hash or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return user


def _process_google_user_payload(db: Session, payload: dict) -> User:
    google_sub = str(payload["sub"]).strip()
    raw_email = str(payload["email"]).strip()
    normalized_email = raw_email.lower()

    # 1. Find existing Google user by google_sub
    existing_google_user = db.query(User).filter(User.google_sub == google_sub).first()
    if existing_google_user:
        # Preserve existing user's saved display name
        return existing_google_user

    # 2. Check if account with same email exists (different or missing google_sub)
    existing_email_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_email_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists. Please sign in using your existing method.",
        )

    # 3. Create new account for first-time Google user
    google_name = payload.get("name")
    if google_name and isinstance(google_name, str) and google_name.strip():
        display_name = google_name.strip()[:100]
    else:
        display_name = normalized_email.split("@")[0]

    if not (1 <= len(display_name) <= 100):
        display_name = "Google User"

    new_user = User(
        display_name=display_name,
        email=normalized_email,
        password_hash=None,
        google_sub=google_sub,
    )

    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email or Google ID already exists.",
        )

    return new_user


def authenticate_google_user(db: Session, id_token: str) -> User:
    """
    Authenticates or registers a user via Google OAuth ID token.
    """
    from app.services.google_auth_service import verify_google_token

    payload = verify_google_token(id_token)
    return _process_google_user_payload(db, payload)


def authenticate_google_code_user(db: Session, code: str) -> User:
    """
    Exchanges an authorization code server-side and authenticates or registers the user.
    """
    from app.services.google_auth_service import exchange_code_and_verify

    payload = exchange_code_and_verify(code)
    return _process_google_user_payload(db, payload)

