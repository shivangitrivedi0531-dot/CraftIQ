from datetime import datetime, timedelta, timezone
from typing import Any, Dict
import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

from app import config

# Password hasher using Argon2
pwd_hash = PasswordHash((Argon2Hasher(),))

JWT_ALGORITHM = "HS256"
DEFAULT_TOKEN_EXPIRE_SECONDS = 1800  # 30 minutes


def hash_password(password: str) -> str:
    """
    Hashes a plain text password using Argon2.
    """
    return pwd_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain text password against an Argon2 password hash.
    """
    try:
        return pwd_hash.verify(plain_password, hashed_password)
    except Exception:
        return False


def create_access_token(
    data: Dict[str, Any], expires_delta_seconds: int = DEFAULT_TOKEN_EXPIRE_SECONDS
) -> str:
    """
    Creates a signed PyJWT access token with fixed HS256 algorithm, sub, exp, and iat claims.
    """
    secret_key = config.get_jwt_secret_key()
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(seconds=expires_delta_seconds)

    to_encode = data.copy()
    to_encode.update(
        {
            "exp": expires_at,
            "iat": now,
        }
    )

    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decodes and verifies a signed PyJWT access token using the configured secret key.
    Raises PyJWT exceptions (ExpiredSignatureError, InvalidTokenError) on failure.
    """
    secret_key = config.get_jwt_secret_key()
    return jwt.decode(token, secret_key, algorithms=[JWT_ALGORITHM])
