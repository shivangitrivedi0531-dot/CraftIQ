from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app import config

# connect_args={"check_same_thread": False} is required for SQLite in multithreaded FastAPI apps
engine = create_engine(
    config.DATABASE_URL,
    connect_args={"check_same_thread": False} if config.DATABASE_URL.startswith("sqlite") else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a transactional database session per request
    and guarantees that the session is closed when the request finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
