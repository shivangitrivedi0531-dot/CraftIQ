from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.schemas.profile import ProfileResponse, ProfileUpdateRequest
from app.services import profile_service

router = APIRouter()


@router.get(
    "/profile",
    response_model=ProfileResponse,
    status_code=status.HTTP_200_OK,
)
def get_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves the authenticated user's profile.
    FastAPI automatically dispatches sync endpoint functions to a background threadpool.
    """
    user_id = int(current_user["uid"])
    return profile_service.get_user_profile(db, user_id)


@router.put(
    "/profile",
    response_model=ProfileResponse,
    status_code=status.HTTP_200_OK,
)
def update_profile(
    payload: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Updates the display_name of the authenticated user.
    FastAPI automatically dispatches sync endpoint functions to a background threadpool.
    """
    user_id = int(current_user["uid"])
    return profile_service.update_user_profile(db, user_id, payload)
