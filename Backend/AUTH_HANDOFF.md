# CraftIQ Authentication & Profile Backend Handoff Documentation

This document describes the CraftIQ Authentication and Profile architecture, API specifications, dependency injection usage, frontend integration patterns, and test execution details for backend and frontend teammates.

---

## 1. Backend Setup and Startup Commands

### Prerequisites
* Python 3.10+
* Virtual environment (`.venv`)

### Setup Commands (Windows / PowerShell)

```powershell
# Navigate to the Backend directory
cd D:\clgproject\CraftIQ\Backend

# Create a virtual environment if not already created
python -m venv .venv

# Activate the virtual environment
.\.venv\Scripts\Activate.ps1

# Install required dependencies
pip install -r requirements.txt
```

### Server Startup Command

```powershell
# Start FastAPI backend server with hot reloading
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The server will start at `http://localhost:8000` (API docs available at `http://localhost:8000/docs`).

---

## 2. Environment Variables Configuration

Create a `.env` file in the `Backend/` directory (`Backend/.env`). `app/config.py` explicitly loads this file using absolute path resolution (`BACKEND_DIR / ".env"`).

> [!IMPORTANT]
> **Use placeholders only in documentation and example files. Never commit actual secret keys.**

```env
# Mandatory for signing & verifying CraftIQ JWT tokens
JWT_SECRET_KEY=your_jwt_secret_key_here

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Database URL (Optional: Defaults to local SQLite craftiq.db inside Backend/)
DATABASE_URL=sqlite:///d:/clgproject/CraftIQ/Backend/craftiq.db

# Optional Integrations
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_PROJECT_ID=your_firebase_project_id_here
FIREBASE_CREDENTIALS_PATH=
```

---

## 3. Auth and Profile Endpoints Reference

### 3.1 `POST /auth/signup`
Registers a new user account with Argon2 password hashing.

* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "display_name": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "securepassword123"
  }
  ```
* **Response (HTTP 201 Created)**:
  ```json
  {
    "id": 1,
    "display_name": "Jane Doe",
    "email": "jane.doe@example.com",
    "created_at": "2026-10-07T14:00:00Z"
  }
  ```
* **Error Responses**:
  - `HTTP 409 Conflict`: Email already registered.
  - `HTTP 422 Unprocessable Entity`: Validation failure (e.g. password < 8 chars, blank display_name).

---

### 3.2 `POST /auth/login`
Authenticates email and password credentials and issues a signed 30-minute CraftIQ access token.

* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "email": "jane.doe@example.com",
    "password": "securepassword123"
  }
  ```
* **Response (HTTP 200 OK)**:
  ```json
  {
    "access_token": "<jwt_access_token>",
    "token_type": "bearer",
    "expires_in": 1800
  }
  ```
* **Error Responses**:
  - `HTTP 401 Unauthorized`: `"Invalid email or password"`.

---

### 3.3 `POST /auth/google` (ID Token Authentication)
Authenticates or registers a user via Google OAuth ID token (GIS rendered button popup flow).

* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "id_token": "<google_id_token_string>"
  }
  ```
* **Response (HTTP 200 OK)**:
  ```json
  {
    "access_token": "<jwt_access_token>",
    "token_type": "bearer",
    "expires_in": 1800
  }
  ```
* **Error Responses**:
  - `HTTP 401 Unauthorized`: Expired, invalid, or wrong audience ID token.
  - `HTTP 409 Conflict`: Email exists with local password account.
  - `HTTP 500 Internal Server Error`: `GOOGLE_CLIENT_ID` not configured on backend.

---

### 3.4 `POST /auth/google/code` (Authorization Code Exchange)
Exchanges a server-side OAuth authorization code for tokens, resolves/registers the user, and issues a CraftIQ access token.

* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "code": "<google_oauth_authorization_code>"
  }
  ```
* **Response (HTTP 200 OK)**:
  ```json
  {
    "access_token": "<jwt_access_token>",
    "token_type": "bearer",
    "expires_in": 1800
  }
  ```
* **Error Responses**:
  - `HTTP 401 Unauthorized`: Code exchange failed or invalid token returned by Google.
  - `HTTP 500 Internal Server Error`: `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` not set in environment.

---

### 3.5 `GET /profile`
Retrieves the authenticated user's profile details.

* **Headers**: `Authorization: Bearer <jwt_access_token>`
* **Response (HTTP 200 OK)**:
  ```json
  {
    "id": 1,
    "display_name": "Jane Doe",
    "email": "jane.doe@example.com",
    "created_at": "2026-10-07T14:00:00Z"
  }
  ```
* **Error Responses**:
  - `HTTP 401 Unauthorized`: Missing, invalid, or expired Bearer token.

---

### 3.6 `PUT /profile`
Updates the display name of the authenticated user.

* **Headers**:
  - `Authorization: Bearer <jwt_access_token>`
  - `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "display_name": "Jane Smith"
  }
  ```
* **Response (HTTP 200 OK)**:
  ```json
  {
    "id": 1,
    "display_name": "Jane Smith",
    "email": "jane.doe@example.com",
    "created_at": "2026-10-07T14:00:00Z"
  }
  ```
* **Error Responses**:
  - `HTTP 422 Unprocessable Entity`: Extra fields present (e.g. attempting to modify `email` or `password_hash`) or invalid display name format.

---

## 4. How Teammates Use `get_current_user` Dependency

Backend teammates building protected routes should import `get_current_user` from `app.dependencies.auth`.

### Import & Router Usage Example

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies.auth import get_current_user

router = APIRouter()

@router.get("/my-protected-endpoint")
def my_protected_endpoint(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Extract user ID and email
    user_id = int(current_user["uid"])
    email = current_user["email"]
    
    return {"message": f"Hello User {user_id} ({email})"}
```

### Return Shape of `get_current_user`

`get_current_user` validates the JWT token, verifies the user exists in the database, and returns a dictionary:

```python
{
    "uid": "1",                    # String representation of user ID
    "email": "jane.doe@example.com" # Authenticated user email
}
```

---

## 5. How Frontend Requests Send the CraftIQ Bearer Token

The React frontend stores the received `access_token` in `sessionStorage` under the key `craftiq_token`.

### Centralized API Client (`src/services/api.js`)

All protected API calls send the `Authorization` header with `Bearer <token>`:

```javascript
import { apiRequest } from './api';

// Fetch user profile
export async function getProfile(token) {
  return apiRequest('/profile', {
    method: 'GET',
    token: token // Adds "Authorization: Bearer ${token}" header automatically
  });
}

// Update profile display name
export async function updateProfile(displayName, token) {
  return apiRequest('/profile', {
    method: 'PUT',
    body: { display_name: displayName },
    token: token
  });
}
```

---

## 6. Test Commands and Known Limitations

### Executing Backend Test Suites

Run test scripts using the virtual environment interpreter:

```powershell
# Navigate to Backend directory
cd D:\clgproject\CraftIQ\Backend

# Run Google OAuth Authentication Test Suite (12 tests)
.\.venv\Scripts\python.exe test_google_auth.py

# Run Primary Auth Flow Test Suite (7 tests)
.\.venv\Scripts\python.exe test_auth_flow.py

# Run Profile Endpoints Test Suite (8 tests)
.\.venv\Scripts\python.exe test_profile_flow.py

# Run Signup Validation Test Suite (7 tests)
.\.venv\Scripts\python.exe test_signup_validation.py
```

### Known Limitations & Architecture Notes

1. **Google Client Secret Requirement**: Server-side authorization code exchange (`POST /auth/google/code`) requires a valid `GOOGLE_CLIENT_SECRET` in `Backend/.env`. Without this key, code exchange requests return `HTTP 500`.
2. **Token Lifetime**: Access tokens are hardcoded to expire after 1800 seconds (30 minutes). There is currently no refresh token mechanism.
3. **Database Engine**: Defaults to SQLite (`craftiq.db`). SQLite supports low concurrency; ensure database locks are accounted for if executing high-parallel write workloads.
4. **Argon2id Password Security**: Password hashing uses `argon2-cffi`. Passwords are raw validated (8–128 characters) and stored securely in `User.password_hash`. Google-authenticated accounts have `password_hash = None` and cannot log in via password auth.
