"""
CONTRACT for Shivangi:
Replace only the body of get_current_user() with real Firebase ID token
verification. Keep the function name, the `Depends(get_current_user)` usage
pattern, and the returned dict shape ({"uid": ..., "email": ...}) identical -
every other router already imports and depends on this exact function.

Real version will look roughly like:
    from firebase_admin import auth as firebase_auth
    def get_current_user(authorization: str = Header(None)):
        token = authorization.replace("Bearer ", "")
        decoded = firebase_auth.verify_id_token(token)
        return {"uid": decoded["uid"], "email": decoded.get("email")}
"""

from fastapi import Header


def get_current_user(authorization: str = Header(default=None)):
    # TODO (Shivangi): replace this stub with real Firebase token verification.
    # For now every request is treated as this one demo user so Member 2 and
    # Member 3's routes can be built and tested independently.
    return {"uid": "demo-user", "email": "demo@example.com"}