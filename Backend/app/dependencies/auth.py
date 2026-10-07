import jwt
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database import get_db
from app.models.user import User


def get_current_user(
    authorization: str = Header(default=None),
    db: Session = Depends(get_db),
) -> dict:
    """
    Validates PyJWT Bearer tokens from the Authorization header and retrieves user details.
    Preserves the exact return shape {"uid": ..., "email": ...} required by dependent routers.
    FastAPI automatically executes sync dependency functions in a background threadpool.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.replace("Bearer ", "").strip()

    try:
        payload = decode_access_token(token)
        sub = payload.get("sub")
        exp = payload.get("exp")
        iat = payload.get("iat")

        if not sub or exp is None or iat is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token claims",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = int(sub)
    except (jwt.PyJWTError, ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {"uid": str(user.id), "email": user.email}