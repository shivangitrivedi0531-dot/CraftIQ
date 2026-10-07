from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import validates

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    display_name = Column(String(100), nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)  # Nullable for Google-only accounts
    google_sub = Column(String(255), unique=True, index=True, nullable=True)  # Nullable unique Google ID
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    @validates("email")
    def validate_email(self, key: str, address: str) -> str:
        """
        Normalizes email to lowercase and strips whitespace upon assignment.
        """
        if address is not None:
            return address.strip().lower()
        return address
