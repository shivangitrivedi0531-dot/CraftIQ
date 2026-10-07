from typing import Any, Dict
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from google.auth.exceptions import GoogleAuthError
from requests.exceptions import RequestException
from fastapi import HTTPException, status

from app import config


class TimeoutRequestsRequest(google_requests.Request):
    """
    Custom Google Auth HTTP Request transport wrapper that enforces a bounded network timeout.
    """

    def __init__(self, timeout: float = 10.0, session=None):
        super().__init__(session=session)
        self.timeout = timeout

    def __call__(self, url, method="GET", body=None, headers=None, timeout=None, **kwargs):
        if timeout is None:
            timeout = self.timeout
        return super().__call__(url, method=method, body=body, headers=headers, timeout=timeout, **kwargs)


def verify_google_token(token: str) -> Dict[str, Any]:
    """
    Verifies a Google OAuth ID token using Google's public certificates.
    Enforces signature, expiry, issuer, audience, nonempty sub, and verified email.
    Uses a bounded network timeout for public key fetches.

    Returns the verified token payload dictionary.
    Raises HTTPException for invalid tokens (401), network failures (503), or configuration errors (500).
    """
    client_id = config.get_google_client_id()
    if not client_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth configuration error: GOOGLE_CLIENT_ID is not set in environment variables.",
        )

    if not token or not isinstance(token, str) or not token.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing Google ID token",
        )

    clean_token = token.strip()

    try:
        request_transport = TimeoutRequestsRequest(timeout=10.0)
        # verify_oauth2_token verifies signature, exp, iss ('accounts.google.com' or 'https://accounts.google.com'), and audience
        payload = id_token.verify_oauth2_token(
            clean_token,
            request_transport,
            audience=client_id,
        )
    except (ValueError, GoogleAuthError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Google token",
        )
    except (RequestException, OSError):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google authentication service is currently unavailable",
        )

    # Validate sub (nonempty string)
    sub = payload.get("sub")
    if not sub or not isinstance(sub, str) or not sub.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google token payload missing valid subject (sub) claim",
        )

    # Validate email (nonempty string)
    email = payload.get("email")
    if not email or not isinstance(email, str) or not email.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google token payload missing valid email claim",
        )

    # Validate email_verified
    email_verified = payload.get("email_verified")
    if email_verified is not True and email_verified != "true":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google account email is not verified",
        )

    # Validate issuer explicitly
    iss = payload.get("iss", "")
    if iss not in ("accounts.google.com", "https://accounts.google.com"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token issuer",
        )

    return payload


def exchange_code_and_verify(code: str) -> Dict[str, Any]:
    """
    Exchanges a Google OAuth 2.0 authorization code for an ID token server-side.
    Validates GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET server configuration.
    Uses 'postmessage' redirect URI for popup code flow.
    Verifies the returned ID token payload.
    """
    import requests

    client_id = config.get_google_client_id()
    client_secret = config.get_google_client_secret()

    if not client_id or not client_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth configuration error: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set in environment variables.",
        )

    if not code or not isinstance(code, str) or not code.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing Google authorization code",
        )

    token_url = "https://oauth2.googleapis.com/token"
    token_payload = {
        "code": code.strip(),
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": "postmessage",
        "grant_type": "authorization_code",
    }

    try:
        response = requests.post(token_url, data=token_payload, timeout=10.0)
    except (RequestException, OSError):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google authentication service is currently unavailable",
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to exchange authorization code with Google",
        )

    try:
        token_data = response.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid response format from Google token endpoint",
        )

    received_id_token = token_data.get("id_token")
    if not received_id_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google token response did not contain an ID token",
        )

    return verify_google_token(received_id_token)

