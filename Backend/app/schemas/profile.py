from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_validator


class ProfileResponse(BaseModel):
    id: int
    display_name: str
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProfileUpdateRequest(BaseModel):
    display_name: str

    # Forbid any extra fields (e.g. email, id, password_hash) to prevent unauthorized updates
    model_config = ConfigDict(extra="forbid")

    @field_validator("display_name")
    @classmethod
    def validate_display_name(cls, v: str) -> str:
        if not isinstance(v, str):
            raise ValueError("Display name must be a string")
        trimmed = v.strip()
        if not (1 <= len(trimmed) <= 100):
            raise ValueError("Display name must be between 1 and 100 characters")
        return trimmed
