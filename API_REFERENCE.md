# API Reference

This document provides details about the API endpoints available in AuthFoundry.

## Authentication Endpoints

All authentication endpoints are prefixed with `/api/auth`.

### POST `/api/auth/signup`

Creates a new user account.

**Request Body:**
```json
{
  "name": "string (optional)",
  "email": "string",
  "password": "string (min 8 characters)"
}
```

**Response (201 Created):**
```json
{
  "message": "Account created successfully. Please check your email for a verification code.",
  "userId": "string"
}
```

**Errors:**
- `400 Bad Request`: Missing required fields or invalid data.
- `409 Conflict`: Email already in use.
- `429 Too Many Requests`: Rate limit exceeded (5 requests per minute).

---

### POST `/api/auth/verify`

Verifies a user's email address using a 6-digit code.

**Request Body:**
```json
{
  "email": "string",
  "code": "string (6-digit numeric code)"
}
```

**Response (200 OK):**
```json
{
  "message": "Email verified successfully. You can now log in.",
  "verified": true
}
```

**Errors:**
- `400 Bad Request`: Invalid or expired code.
- `429 Too Many Requests`: Rate limit exceeded (10 requests per minute).

---

### POST `/api/auth/login`

Logs in a user.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "message": "Logged in successfully"
}
```

**Errors:**
- `401 Unauthorized`: Invalid email or password.
- `429 Too Many Requests`: Rate limit exceeded (10 requests per minute).

---

### POST `/api/auth/forgot-password`

Sends a password reset link to the user's email.

**Request Body:**
```json
{
  "email": "string"
}
```

**Response (200 OK):**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Errors:**
- `429 Too Many Requests`: Rate limit exceeded (3 requests per minute).

---

### POST `/api/auth/reset-password`

Resets the user's password using a reset token.

**Request Body:**
```json
{
  "token": "string",
  "email": "string",
  "password": "string (min 8 characters)"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successfully. You can now log in with your new password."
}
```

**Errors:**
- `400 Bad Request`: Invalid token or password too short.
- `429 Too Many Requests`: Rate limit exceeded (5 requests per minute).

---

### GET `/api/auth/[...nextauth]`

Standard NextAuth.js endpoints for handling OAuth callbacks, CSRF tokens, and session management.

---

## User Endpoints

### GET `/api/user/profile`

Returns the current user's profile information. Requires authentication.

**Response (200 OK):**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "image": "string",
    "role": "string",
    "isVerified": "boolean",
    "isActive": "boolean",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)",
    "accounts": [
      { "provider": "string" }
    ]
  }
}
```

---

### PUT `/api/user/profile`

Updates the current user's profile. Requires authentication.

**Request Body:**
```json
{
  "name": "string (optional)",
  "image": "string (optional, URL)"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "image": "string",
    "role": "string",
    "isVerified": "boolean"
  }
}
```

---

## Admin Endpoints

All admin endpoints require the user to have the `admin` role.

### GET `/api/admin/users`

Returns a paginated list of all users.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Users per page (default: 20, max: 100)
- `search`: Search by name or email
- `role`: Filter by role (`admin`, `user`)
- `status`: Filter by status (`active`, `inactive`, `verified`, `unverified`)
- `sortBy`: Field to sort by (`createdAt`, `updatedAt`, `email`, `name`, `role`)
- `sortOrder`: `asc` or `desc` (default: `desc`)

**Response (200 OK):**
```json
{
  "users": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

### GET `/api/admin/users/[id]`

Returns details for a specific user.

---

### PUT `/api/admin/users/[id]`

Updates a specific user's details.

**Request Body:**
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "role": "string (optional, 'user' or 'admin')",
  "isActive": "boolean (optional)",
  "password": "string (optional, min 8 characters)"
}
```

---

### DELETE `/api/admin/users/[id]`

Deletes a specific user. Cannot delete your own account.

---

### POST `/api/admin/users/[id]/verify`

Manually verifies a user's email address.

**Response (200 OK):**
```json
{
  "user": { ... },
  "message": "User verified successfully"
}
```

---

### POST `/api/admin/impersonate`

Creates an impersonation session for a target user.

**Request Body:**
```json
{
  "userId": "string"
}
```

**Response (200 OK):**
```json
{
  "message": "Impersonation session created",
  "user": { ... },
  "impersonationToken": "string (base64 encoded)"
}
```
