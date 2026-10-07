from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.database import get_db
from app.schemas.auth import GoogleCodeLoginRequest, GoogleLoginRequest, LoginRequest, SignupRequest, TokenResponse, UserResponse
from app.services import auth_service

router = APIRouter()


@router.post(
    "/auth/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    """
    Registers a new user account with Argon2 password hashing.
    FastAPI automatically executes sync endpoint functions in a threadpool.
    """
    return auth_service.create_user(db, payload)


@router.post(
    "/auth/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates user credentials and issues a signed 30-minute PyJWT access token.
    FastAPI automatically executes sync endpoint functions in a threadpool.
    """
    user = auth_service.authenticate_user(db, payload.email, payload.password)
    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token, token_type="bearer", expires_in=1800)


@router.post(
    "/auth/google",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
)
def google_auth(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates or registers a user via Google OAuth ID token.
    Issues a signed 30-minute PyJWT access token upon success.
    FastAPI automatically executes sync endpoint functions in a threadpool.
    """
    user = auth_service.authenticate_google_user(db, payload.id_token)
    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token, token_type="bearer", expires_in=1800)


@router.post(
    "/auth/google/code",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
)
def google_code_auth(payload: GoogleCodeLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates or registers a user via Google OAuth authorization code.
    Exchanges code server-side and issues a signed 30-minute PyJWT access token.
    FastAPI automatically executes sync endpoint functions in a threadpool.
    """
    user = auth_service.authenticate_google_code_user(db, payload.code)
    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token, token_type="bearer", expires_in=1800)


