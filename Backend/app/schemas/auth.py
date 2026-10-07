from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class SignupRequest(BaseModel):
    display_name: str
    email: EmailStr
    password: str

    @field_validator("display_name")
    @classmethod
    def validate_display_name(cls, v: str) -> str:
        if not isinstance(v, str):
            raise ValueError("Display name must be a string")
        trimmed = v.strip()
        if not (1 <= len(trimmed) <= 100):
            raise ValueError("Display name must be between 1 and 100 characters")
        return trimmed

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not isinstance(v, str):
            raise ValueError("Password must be a string")
        # Do NOT trim passwords - validate raw length 8-128
        if not (8 <= len(v) <= 128):
            raise ValueError("Password must be between 8 and 128 characters")
        return v


class UserResponse(BaseModel):
    id: int
    display_name: str
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 1800


class GoogleLoginRequest(BaseModel):
    id_token: str

    @field_validator("id_token")
    @classmethod
    def validate_id_token(cls, v: str) -> str:
        if not isinstance(v, str) or not v.strip():
            raise ValueError("id_token must be a non-empty string")
        return v.strip()


class GoogleCodeLoginRequest(BaseModel):
    code: str

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        if not isinstance(v, str) or not v.strip():
            raise ValueError("code must be a non-empty string")
        return v.strip()

