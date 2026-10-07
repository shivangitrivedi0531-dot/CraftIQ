from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.profile import ProfileUpdateRequest


def get_user_profile(db: Session, user_id: int) -> User:
    """
    Retrieves the profile of the user matching user_id.
    Raises HTTP 404 if the user is not found.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


def update_user_profile(db: Session, user_id: int, payload: ProfileUpdateRequest) -> User:
    """
    Updates display_name for the authenticated user matching user_id.
    Commits changes to the database and returns the updated record.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.display_name = payload.display_name
    db.commit()
    db.refresh(user)

    return user
