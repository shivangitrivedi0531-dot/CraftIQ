import os
from pathlib import Path
from dotenv import load_dotenv

# Root directory of the Backend project (Backend/)
BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BACKEND_DIR / ".env"

# Explicitly load Backend/.env independent of terminal CWD
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
else:
    load_dotenv()


def get_env_var(key: str, default: str = "") -> str:
    """
    Retrieves an environment variable. If inherited value is an empty string,
    falls back to default.
    """
    val = os.getenv(key)
    if val is not None and val.strip():
        return val.strip()
    return default


GEMINI_API_KEY = get_env_var("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-flash-lite-latest"  # check aistudio.google.com for current model names before final submission

FIREBASE_PROJECT_ID = get_env_var("FIREBASE_PROJECT_ID")
FIREBASE_CREDENTIALS_PATH = get_env_var("FIREBASE_CREDENTIALS_PATH")

# Database URL - defaults to local SQLite craftiq.db in Backend directory
DEFAULT_DB_PATH = BACKEND_DIR / "craftiq.db"
DATABASE_URL = get_env_var("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH.as_posix()}")

# JWT Configuration
JWT_SECRET_KEY = get_env_var("JWT_SECRET_KEY")

# Google OAuth Configuration
GOOGLE_CLIENT_ID = get_env_var("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = get_env_var("GOOGLE_CLIENT_SECRET")


def get_jwt_secret_key() -> str:
    """
    Returns the JWT secret key from environment variables.
    Raises RuntimeError if unconfigured to prevent auth bypass.
    """
    if not JWT_SECRET_KEY:
        raise RuntimeError(
            "JWT configuration error: JWT_SECRET_KEY is not set in environment variables."
        )
    return JWT_SECRET_KEY


def get_google_client_id() -> str:
    return get_env_var("GOOGLE_CLIENT_ID") or GOOGLE_CLIENT_ID


def get_google_client_secret() -> str:
    return get_env_var("GOOGLE_CLIENT_SECRET") or GOOGLE_CLIENT_SECRET


# True when no real Gemini key is set - lets the whole backend run/demo without one
DEMO_MODE = not bool(GEMINI_API_KEY)

