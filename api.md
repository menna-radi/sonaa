# 📘 Sonaa Backend API — Complete Endpoint Documentation

> **Base URL:** `http://localhost:3000/api/v1`
> **Auth Header:** `Authorization: Bearer <access_token>`
> **Content-Type:** `application/json` (unless noted otherwise)
> **Language Header:** `Accept-Language: ar | en` (optional, defaults to `ar`)

---

## Table of Contents

| # | Module | Endpoints |
|---|--------|-----------|
| 1 | [Health Check](#1-health-check) | 1 |
| 2 | [Authentication](#2-authentication) | 16 |
| 3 | [Onboarding](#3-onboarding) | 2 |
| 4 | [Tasks](#4-tasks) | 6 |
| 5 | [Craftsmen](#5-craftsmen) | 5 |
| 6 | [Search](#6-search) | 1 |
| 7 | [Profile](#7-profile) | 3 |
| 8 | [Chat](#8-chat) | 3 |
| 9 | [Notifications](#9-notifications) | 3 |
| 10 | [Uploads](#10-uploads) | 2 |
| 11 | [Safety & Emergency](#11-safety--emergency) | 4 |
| 12 | [Settings](#12-settings) | 2 |
| 13 | [Payout Accounts](#13-payout-accounts) | 3 |
| 14 | [Earnings](#14-earnings) | 2 |
| 15 | [Subscriptions](#15-subscriptions) | 4 |
| 16 | [Verification (KYC)](#16-verification-kyc) | 6 |
| 17 | [Offers](#17-offers) | 1 |
| 18 | [Admin Dashboard](#18-admin-dashboard) | 17 |

---

## Global Error Response Format

All error responses follow this shape:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

| HTTP Code | Meaning |
|-----------|---------|
| `400` | Bad Request / Validation Error |
| `401` | Unauthorized (missing or invalid token) |
| `403` | Forbidden (insufficient role) |
| `404` | Not Found |
| `409` | Conflict (duplicate resource) |
| `429` | Too Many Requests (rate limited) |
| `500` | Internal Server Error |

### Validation Error (400)

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": [
    {
      "field": "fieldName",
      "message": "Error description"
    }
  ]
}
```

---

## Enum Reference

| Enum | Values |
|------|--------|
| `UserRole` | `CUSTOMER`, `CRAFTSMAN`, `ADMIN` |
| `TaskStatus` | `PENDING`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `DISPUTED` |
| `DisputeReason` | `SERVICE_QUALITY`, `OVERCHARGING`, `NO_SHOW`, `SAFETY_CONCERN`, `OTHER` |
| `DisputeStatus` | `PENDING`, `RESOLVED` |
| `PayoutAccountType` | `BANK_ACCOUNT`, `STC_PAY`, `URPAY` |
| `SubscriptionPlan` | `FREE`, `PRO` |
| `BillingCycle` | `MONTHLY`, `YEARLY` |
| `VerificationAction` | `APPROVED`, `REJECTED`, `FLAGGED` |
| `ReportCategory` | `INAPPROPRIATE_CONDUCT`, `VEHICLE_SAFETY`, `VERBAL_ABUSE`, `THEFT`, `PROPERTY_DAMAGE`, `OTHER` |
| `AdCampaignStatus` | `ACTIVE`, `PAUSED`, `ENDED` |
| `BroadcastAudience` | `ALL`, `CUSTOMERS`, `CRAFTSMEN` |

---

## 1. Health Check

### `GET /api/v1/health`

> **Auth:** None | **Rate Limit:** None (excluded from global rate limiter)

**Description:** Returns system health status for API, database, and Redis.

**Request Body:** None

**Response `200 OK`:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-06T09:00:00.000Z",
  "uptime": 3600.5,
  "checks": {
    "api": "ok",
    "database": "ok",
    "redis": "ok"
  }
}
```

**Response `503 Service Unavailable`:**
```json
{
  "status": "degraded",
  "timestamp": "2026-07-06T09:00:00.000Z",
  "uptime": 3600.5,
  "checks": {
    "api": "ok",
    "database": "error",
    "redis": "ok"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | `string` | `"ok"` or `"degraded"` |
| `timestamp` | `string (ISO 8601)` | Server time |
| `uptime` | `number` | Process uptime in seconds |
| `checks.api` | `string` | Always `"ok"` |
| `checks.database` | `string` | `"ok"` or `"error"` |
| `checks.redis` | `string` | `"ok"` or `"error"` |

---

## 2. Authentication

### 2.1 `POST /api/v1/auth/register/phone`

> **Auth:** None | **Rate Limit:** OTP Limiter

**Description:** Sends a 6-digit OTP to the phone number for registration. Phone must NOT be already registered.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phoneNumber` | `string` | ✅ Yes | E.164 format (e.g. `+9665XXXXXXXX`) |
| `countryCode` | `string` | ❌ No | Country ISO code |

```json
{
  "phoneNumber": "+966501234567",
  "countryCode": "SA"
}
```

**Response `200 OK`:**
```json
{
  "status": "OTP_SENT",
  "phoneNumber": "+966501234567",
  "expiresIn": 300,
  "message": "OTP sent successfully"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | `string` | Always `"OTP_SENT"` |
| `phoneNumber` | `string` | The phone number OTP was sent to |
| `expiresIn` | `number` | OTP validity in seconds (300 = 5 min) |
| `message` | `string` | Confirmation message |

---

### 2.2 `POST /api/v1/auth/register/verify-otp`

> **Auth:** None | **Rate Limit:** Auth Limiter

**Description:** Verifies the 6-digit OTP. On success, returns a short-lived registration token used to complete the profile.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phoneNumber` | `string` | ✅ Yes | E.164 format |
| `code` | `string` | ✅ Yes | 6-digit OTP code |

```json
{
  "phoneNumber": "+966501234567",
  "code": "482917"
}
```

**Response `200 OK`:**
```json
{
  "registrationToken": "eyJhbGciOiJIUzI1NiIs...",
  "phoneNumber": "+966501234567",
  "isProfileComplete": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `registrationToken` | `string (JWT)` | Short-lived token for profile completion |
| `phoneNumber` | `string` | Verified phone number |
| `isProfileComplete` | `boolean` | Always `false` at this stage |

---

### 2.3 `POST /api/v1/auth/register/complete`

> **Auth:** `Bearer <registrationToken>` | **Rate Limit:** Global

**Description:** Completes registration by creating the user, profile, and preferences. Returns access and refresh tokens.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | `string` | ✅ Yes | 3–30 chars, alphanumeric + underscore only |
| `firstName` | `string` | ✅ Yes | First name |
| `lastName` | `string` | ✅ Yes | Last name |
| `email` | `string` | ✅ Yes | Valid email address |
| `password` | `string` | ✅ Yes | Min 8 chars, must contain a letter & a number |
| `role` | `string` | ✅ Yes | `"CUSTOMER"` or `"CRAFTSMAN"` |
| `agreeToTerms` | `boolean` | ✅ Yes | Must be `true` |
| `title` | `string` | ⚠️ Conditional | **Required** if `role` = `"CRAFTSMAN"` |
| `locationCity` | `string` | ⚠️ Conditional | **Required** if `role` = `"CRAFTSMAN"` |
| `yearsExperience` | `number (integer)` | ⚠️ Conditional | **Required** if `role` = `"CRAFTSMAN"`, ≥ 0 |

```json
{
  "username": "ahmed_craft",
  "firstName": "Ahmed",
  "lastName": "Al-Farsi",
  "email": "ahmed@example.com",
  "password": "SecurePass1",
  "role": "CRAFTSMAN",
  "agreeToTerms": true,
  "title": "Electrician",
  "locationCity": "Riyadh",
  "yearsExperience": 5
}
```

**Response `201 Created`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Account created. A confirmation email has been sent.",
  "user": {
    "id": "clx...",
    "firstName": "Ahmed",
    "lastName": "Al-Farsi",
    "name": "Ahmed Al-Farsi",
    "username": "ahmed_craft",
    "email": "ahmed@example.com",
    "emailVerified": false,
    "phone": "+966501234567",
    "phoneNumber": "+966501234567",
    "role": "CUSTOMER",
    "isProfileCompleted": true
  }
}
```

---

### 2.4 `GET /api/v1/auth/confirm-email?token=<token>`

> **Auth:** None

**Description:** Renders an HTML confirmation page with a "Confirm Verification" button.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | `string` | ✅ Yes | Email confirmation token from the email link |

**Response `200 OK`:** Returns `text/html` page.

---

### 2.5 `POST /api/v1/auth/confirm-email`

> **Auth:** None

**Description:** Verifies the email confirmation token and sets `emailVerified = true`.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | `string` | ✅ Yes | Confirmation token (from email link or query string) |

```json
{
  "token": "a3f8b2c1d4e5..."
}
```

**Response `200 OK`:**
```json
{
  "status": "VERIFIED",
  "message": "Email verified successfully",
  "email": "ahmed@example.com",
  "emailVerified": true
}
```

---

### 2.6 `POST /api/v1/auth/login`

> **Auth:** None | **Rate Limit:** Auth Limiter

**Description:** Flexible login using email, phone number, or username with password.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `identifier` | `string` | ✅ Yes | Email, phone number, or username |
| `password` | `string` | ✅ Yes | Account password |

```json
{
  "identifier": "ahmed_craft",
  "password": "SecurePass1"
}
```

**Response `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "clx...",
    "firstName": "Ahmed",
    "lastName": "Al-Farsi",
    "name": "Ahmed Al-Farsi",
    "username": "ahmed_craft",
    "email": "ahmed@example.com",
    "emailVerified": true,
    "phone": "+966501234567",
    "phoneNumber": "+966501234567",
    "role": "CUSTOMER",
    "isProfileCompleted": true
  }
}
```

> [!NOTE]
> The `token` field is an alias for `accessToken` and contains the same value.

---

### 2.7 `POST /api/v1/auth/login/email`

> **Auth:** None | **Rate Limit:** Auth Limiter

**Description:** Login explicitly with email and password. Requires verified email.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | ✅ Yes | Verified email address |
| `password` | `string` | ✅ Yes | Account password |

```json
{
  "email": "ahmed@example.com",
  "password": "SecurePass1"
}
```

**Response `200 OK`:** Same as [2.6 Login](#26-post-apiv1authlogin).

---

### 2.8 `POST /api/v1/auth/login/phone`

> **Auth:** None | **Rate Limit:** OTP Limiter

**Description:** Sends OTP for phone-based login. Phone must be already registered.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phoneNumber` | `string` | ✅ Yes | E.164 format |
| `countryCode` | `string` | ❌ No | Country ISO code |

```json
{
  "phoneNumber": "+966501234567"
}
```

**Response `200 OK`:**
```json
{
  "status": "OTP_SENT",
  "phoneNumber": "+966501234567",
  "expiresIn": 300,
  "message": "OTP sent successfully"
}
```

---

### 2.9 `POST /api/v1/auth/login/verify-otp`

> **Auth:** None | **Rate Limit:** Auth Limiter

**Description:** Verifies phone OTP and performs direct login, returning access and refresh tokens.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phoneNumber` | `string` | ✅ Yes | E.164 format |
| `code` | `string` | ✅ Yes | 6-digit OTP |

```json
{
  "phoneNumber": "+966501234567",
  "code": "482917"
}
```

**Response `200 OK`:** Same shape as [2.6 Login](#26-post-apiv1authlogin).

---

### 2.10 `POST /api/v1/auth/google`

> **Auth:** None | **Rate Limit:** Auth Limiter

**Description:** Authenticates or registers via Google Sign-In. Creates a new account if no matching user found.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `idToken` | `string` | ✅ Yes | Google ID token from client SDK |

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response `200 OK`:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "clx...",
    "phoneNumber": null,
    "username": "g_1234567890_0001",
    "firstName": "Ahmed",
    "lastName": "Al-Farsi",
    "email": "ahmed@gmail.com",
    "role": "CUSTOMER"
  }
}
```

---

### 2.11 `POST /api/v1/auth/password/reset-request`

> **Auth:** None | **Rate Limit:** Auth Limiter
> Alias: `POST /api/v1/auth/forgot-password`

**Description:** Initiates password reset. Sends email link (if email identifier) or OTP (if phone identifier). Response is generic to avoid user enumeration.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `identifier` | `string` | ✅ Yes | Email or phone number |

```json
{
  "identifier": "ahmed@example.com"
}
```

**Response `200 OK`:**
```json
{
  "message": "If the account exists, a verification code or reset link has been sent."
}
```

---

### 2.12 `POST /api/v1/auth/verify-reset-otp`

> **Auth:** None | **Rate Limit:** Auth Limiter

**Description:** Verifies the password reset OTP (phone flow) and returns a single-use reset token.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phoneNumber` | `string` | ✅ Yes | E.164 format |
| `code` | `string` | ✅ Yes | 6-digit OTP |

```json
{
  "phoneNumber": "+966501234567",
  "code": "482917"
}
```

**Response `200 OK`:**
```json
{
  "token": "a3f8b2c1d4e5f6a7b8c9..."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `token` | `string` | Single-use password reset token (valid 15 min) |

---

### 2.13 `POST /api/v1/auth/reset-password`

> **Auth:** None | **Rate Limit:** Auth Limiter

**Description:** Resets the password using a single-use token. Invalidates all refresh tokens.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | `string` | ✅ Yes | Reset token (from email link or OTP verification) |
| `newPassword` | `string` | ✅ Yes | Min 8 chars, must contain a letter & a number |

```json
{
  "token": "a3f8b2c1d4e5...",
  "newPassword": "NewSecure1"
}
```

**Response `200 OK`:**
```json
{
  "message": "Password has been reset successfully"
}
```

---

### 2.14 `POST /api/v1/auth/token/refresh`

> **Auth:** None
> Alias: `POST /api/v1/auth/refresh`

**Description:** Rotates refresh token. Old token is revoked and new access + refresh tokens are issued.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refreshToken` | `string` | ✅ Yes | Current valid refresh token |

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

| Field | Type | Description |
|-------|------|-------------|
| `token` | `string` | Alias for `accessToken` |
| `accessToken` | `string` | New JWT access token |
| `refreshToken` | `string` | New JWT refresh token |
| `expiresIn` | `number` | Access token lifetime in seconds |

---

### 2.15 `POST /api/v1/auth/logout`

> **Auth:** None (requires `refreshToken` in body)

**Description:** Revokes the provided refresh token (logs out current device).

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refreshToken` | `string` | ✅ Yes | The refresh token to revoke |

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response `200 OK`:**
```json
{
  "message": "Logged out successfully"
}
```

---

### 2.16 `POST /api/v1/auth/logout-all`

> **Auth:** ✅ Bearer Token

**Description:** Revokes all refresh tokens for the user (logs out all devices).

**Request Body:** None

**Response `200 OK`:**
```json
{
  "message": "Logged out from all devices successfully"
}
```

---

### 2.17 `POST /api/v1/auth/switch-role`

> **Auth:** ✅ Bearer Token

**Description:** Switches the user's active role between `CUSTOMER` and `CRAFTSMAN`. Creates missing profile if needed. Returns new tokens with updated role.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | `string` | ✅ Yes | `"CUSTOMER"` or `"CRAFTSMAN"` |

```json
{
  "role": "CRAFTSMAN"
}
```

**Response `200 OK`:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "clx...",
    "phoneNumber": "+966501234567",
    "username": "ahmed_craft",
    "firstName": "Ahmed",
    "lastName": "Al-Farsi",
    "email": "ahmed@example.com",
    "role": "CRAFTSMAN"
  }
}
```

---

## 3. Onboarding

### 3.1 `GET /api/v1/onboarding/status`

> **Auth:** ✅ Bearer Token

**Description:** Returns the onboarding completion status for the current user.

**Request Body:** None

**Response `200 OK`:**
```json
{
  "onboardingCompleted": false
}
```

---

### 3.2 `PUT /api/v1/onboarding/complete`

> **Auth:** ✅ Bearer Token

**Description:** Marks onboarding as completed for the current user.

**Request Body:** None

**Response `200 OK`:**
```json
{
  "onboardingCompleted": true
}
```

---

## 4. Tasks

### 4.1 `GET /api/v1/tasks/categories`

> **Auth:** None (public)

**Description:** Lists all service categories, sorted by popularity. Response is cached for 5 minutes.

**Request Body:** None

**Response `200 OK`:**
```json
[
  {
    "id": "1",
    "code": "ELECTRICIAN",
    "name": "Electrician",
    "displayName": "Electrician",
    "displayNameAr": "كهربائي",
    "nameAr": "كهربائي",
    "nameEn": "Electrician",
    "iconUrl": "/uploads/categories/electrician.png"
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Category ID |
| `code` | `string` | Category code (used in `serviceType`) |
| `name` | `string` | English name |
| `displayName` | `string` | Display name (EN) |
| `displayNameAr` | `string` | Display name (AR) |
| `nameAr` | `string` | Arabic name |
| `nameEn` | `string` | English name |
| `iconUrl` | `string` | Category icon path |

> **Headers:** `X-Cache: HIT` or `X-Cache: MISS`

---

### 4.2 `POST /api/v1/tasks`

> **Auth:** ✅ Bearer Token | **Role:** `CUSTOMER`

**Description:** Creates a new task (job posting) as a customer.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `serviceType` | `string` | ✅ Yes | Category code (e.g. `"ELECTRICIAN"`) |
| `title` | `string` | ✅ Yes | 10–100 characters |
| `description` | `string` | ✅ Yes | Task description |
| `budgetAmount` | `number` | ✅ Yes | Minimum 50 SAR |
| `locationCity` | `string` | ✅ Yes | City name |
| `locationLat` | `number` | ❌ No | Latitude |
| `locationLng` | `number` | ❌ No | Longitude |
| `imageUrls` | `string[]` | ❌ No | Array of uploaded image URLs (default `[]`) |

```json
{
  "serviceType": "ELECTRICIAN",
  "title": "Fix kitchen wiring and outlets",
  "description": "Need an electrician to fix broken outlets in the kitchen area",
  "budgetAmount": 200,
  "locationCity": "Riyadh",
  "locationLat": 24.7136,
  "locationLng": 46.6753,
  "imageUrls": ["/api/v1/uploads/img1.jpg"]
}
```

**Response `201 Created`:**
```json
{
  "taskId": "clx...",
  "displayId": "SON-00001",
  "status": "PENDING"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `taskId` | `string (UUID)` | Task ID |
| `displayId` | `string` | Human-readable task ID |
| `status` | `string (TaskStatus)` | Always `"PENDING"` on creation |

---

### 4.3 `GET /api/v1/tasks`

> **Auth:** ✅ Bearer Token

**Description:** Lists tasks for the authenticated user (customer's own tasks or craftsman's available/assigned tasks).

**Query Parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `status` | `string (TaskStatus)` | ❌ No | — | Filter by status |
| `page` | `number` | ❌ No | `1` | Page number (≥ 1) |
| `limit` | `number` | ❌ No | `10` | Items per page (1–100) |
| `mobile` | `boolean` | ❌ No | `false` | Return mobile-optimized format |

**Response `200 OK`:**
```json
{
  "totalResults": 25,
  "currentPage": 1,
  "totalPages": 3,
  "results": [
    {
      "id": "clx...",
      "displayId": "SON-00001",
      "serviceType": "ELECTRICIAN",
      "title": "Fix kitchen wiring",
      "description": "...",
      "budgetAmount": 200,
      "locationCity": "Riyadh",
      "status": "PENDING",
      "createdAt": "2026-07-06T09:00:00.000Z",
      "updatedAt": "2026-07-06T09:00:00.000Z"
    }
  ]
}
```

---

### 4.4 `GET /api/v1/tasks/:id`

> **Auth:** ✅ Bearer Token

**Description:** Gets detailed info for a single task.

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ Yes | Task ID |

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `mobile` | `boolean` | ❌ No | Return mobile-optimized format |

**Response `200 OK`:** Returns the full task object with related data.

---

### 4.5 `PUT /api/v1/tasks/:id/status`

> **Auth:** ✅ Bearer Token

**Description:** Updates task status following the state machine transitions.

**Path Parameters:**

| Param | Type | Required |
|-------|------|----------|
| `id` | `string` | ✅ Yes |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string (TaskStatus)` | ✅ Yes | New status value |

```json
{
  "status": "ACCEPTED"
}
```

**Response `200 OK`:**
```json
{
  "taskId": "clx...",
  "displayId": "SON-00001",
  "status": "ACCEPTED"
}
```

> [!IMPORTANT]
> **State Machine Transitions:**
> `PENDING` → `ACCEPTED` → `IN_PROGRESS` → `COMPLETED`
> Any state → `CANCELLED` (by customer)
> Any active state → `DISPUTED`

---

### 4.6 `POST /api/v1/tasks/:id/feedback`

> **Auth:** ✅ Bearer Token | **Role:** `CUSTOMER`

**Description:** Submits feedback/rating for a completed task.

**Path Parameters:**

| Param | Type | Required |
|-------|------|----------|
| `id` | `string` | ✅ Yes |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rating` | `number (integer)` | ✅ Yes | 1–5 star rating |
| `comment` | `string` | ❌ No | Review comment |

```json
{
  "rating": 5,
  "comment": "Excellent work! Very professional."
}
```

**Response `201 Created`:**
```json
{
  "feedbackId": "clx...",
  "rating": 5,
  "comment": "Excellent work! Very professional."
}
```

---

### 4.7 `POST /api/v1/tasks/:id/dispute`

> **Auth:** ✅ Bearer Token

**Description:** Files a dispute against a task.

**Path Parameters:**

| Param | Type | Required |
|-------|------|----------|
| `id` | `string` | ✅ Yes |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | `string (DisputeReason)` | ✅ Yes | One of: `SERVICE_QUALITY`, `OVERCHARGING`, `NO_SHOW`, `SAFETY_CONCERN`, `OTHER` |
| `description` | `string` | ✅ Yes | Detailed description |

```json
{
  "reason": "SERVICE_QUALITY",
  "description": "The work was not completed properly"
}
```

**Response `201 Created`:**
```json
{
  "disputeId": "clx...",
  "status": "PENDING",
  "reason": "SERVICE_QUALITY"
}
```

---

## 5. Craftsmen

### 5.1 `GET /api/v1/craftsmen`

> **Auth:** ✅ Bearer Token

**Description:** Browse and search craftsmen with filters, sorting, and pagination.

**Query Parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `category` | `string` | ❌ No | — | Filter by service category |
| `sort` | `string` | ❌ No | `"TOP_RATED"` | Sort: `TOP_RATED`, `NEAREST`, `NEWEST` |
| `availableOnly` | `boolean` | ❌ No | `false` | Show only available craftsmen |
| `lat` | `number` | ⚠️ Conditional | — | **Required** if `sort=NEAREST` (-90 to 90) |
| `lng` | `number` | ⚠️ Conditional | — | **Required** if `sort=NEAREST` (-180 to 180) |
| `q` | `string` | ❌ No | — | Free text search |
| `locationCity` | `string` | ❌ No | — | Filter by city |
| `page` | `number` | ❌ No | `1` | Page number |
| `limit` | `number` | ❌ No | `10` | Items per page (1–100) |
| `mobile` | `boolean` | ❌ No | — | Mobile format |

**Response `200 OK`:**
```json
{
  "totalResults": 15,
  "currentPage": 1,
  "totalPages": 2,
  "results": [
    {
      "id": "clx...",
      "firstName": "Ahmed",
      "lastName": "Al-Farsi",
      "title": "Electrician",
      "locationCity": "Riyadh",
      "isAvailable": true,
      "rating": 4.8,
      "totalReviews": 35,
      "yearsExperience": 5
    }
  ]
}
```

---

### 5.2 `GET /api/v1/craftsmen/recommended`

> **Auth:** ✅ Bearer Token

**Description:** Gets AI/algorithm-recommended craftsmen based on user context.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `lat` | `number` | ❌ No | User latitude |
| `lng` | `number` | ❌ No | User longitude |
| `mobile` | `boolean` | ❌ No | Mobile format |

**Response `200 OK`:** Returns an array of craftsmen objects.

---

### 5.3 `GET /api/v1/craftsmen/:id/portfolio`

> **Auth:** None (public)

**Description:** Returns portfolio images for a craftsman.

**Path Parameters:**

| Param | Type | Required |
|-------|------|----------|
| `id` | `string` | ✅ Yes |

**Query Parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `page` | `number` | ❌ No | `1` | Page number |
| `limit` | `number` | ❌ No | `20` | Items per page (1–100) |

**Response `200 OK`:** Paginated portfolio image list.

---

### 5.4 `POST /api/v1/craftsmen/portfolio`

> **Auth:** ✅ Bearer Token | **Role:** `CRAFTSMAN`

**Description:** Adds an image to the craftsman's portfolio.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `imageUrl` | `string` | ✅ Yes | URL of the uploaded image |
| `caption` | `string` | ❌ No | Image caption |

```json
{
  "imageUrl": "/api/v1/uploads/portfolio_img.jpg",
  "caption": "Kitchen rewiring project"
}
```

**Response `201 Created`:** Returns the created portfolio image record.

---

### 5.5 `DELETE /api/v1/craftsmen/portfolio/:imageId`

> **Auth:** ✅ Bearer Token | **Role:** `CRAFTSMAN`

**Description:** Deletes a portfolio image.

**Path Parameters:**

| Param | Type | Required |
|-------|------|----------|
| `imageId` | `string` | ✅ Yes |

**Response `200 OK`:** Returns deletion confirmation.

---

## 6. Search

### 6.1 `GET /api/v1/search`

> **Auth:** ✅ Bearer Token

**Description:** Unified search across craftsmen, tasks, or both. Search queries are logged.

**Query Parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `q` | `string` | ❌ No | `""` | Search keyword |
| `type` | `string` | ❌ No | `"craftsmen"` | `"craftsmen"`, `"tasks"`, or `"all"` |
| `page` | `number` | ❌ No | `1` | Page number |
| `limit` | `number` | ❌ No | `10` | Items per page (1–100) |

**Response `200 OK` (type = `craftsmen` or `tasks`):**
```json
{
  "totalResults": 15,
  "currentPage": 1,
  "totalPages": 2,
  "results": [ "..." ]
}
```

**Response `200 OK` (type = `all`):**
```json
{
  "craftsmen": [ "..." ],
  "tasks": [ "..." ]
}
```

---

## 7. Profile

### 7.1 `GET /api/v1/profile`

> **Auth:** ✅ Bearer Token

**Description:** Gets the authenticated user's profile based on role.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | `string` | ❌ No | Override role: `"CUSTOMER"` or `"CRAFTSMAN"`. Defaults to token role |

**Response `200 OK` (Customer):**
```json
{
  "id": "clx...",
  "userId": "clx...",
  "firstName": "Ahmed",
  "lastName": "Al-Farsi",
  "avatarUrl": null,
  "emergencyContacts": [],
  "createdAt": "2026-07-06T09:00:00.000Z",
  "updatedAt": "2026-07-06T09:00:00.000Z"
}
```

**Response `200 OK` (Craftsman):**
```json
{
  "id": "clx...",
  "userId": "clx...",
  "firstName": "Ahmed",
  "lastName": "Al-Farsi",
  "avatarUrl": null,
  "title": "Electrician",
  "locationCity": "Riyadh",
  "latitude": 24.7136,
  "longitude": 46.6753,
  "isAvailable": true,
  "isVerifiedId": false,
  "rating": 4.8,
  "totalReviews": 35,
  "yearsExperience": 5,
  "skills": [
    { "id": "clx...", "name": "Wiring", "category": "ELECTRICIAN" }
  ],
  "createdAt": "2026-07-06T09:00:00.000Z",
  "updatedAt": "2026-07-06T09:00:00.000Z"
}
```

---

### 7.2 `PUT /api/v1/profile`

> **Auth:** ✅ Bearer Token

**Description:** Updates profile fields. Different fields apply based on role.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | `string` | ❌ No | Override role |

**Request Body (Customer — all fields optional):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | `string` | ❌ No | Min 1 char |
| `lastName` | `string` | ❌ No | Min 1 char |
| `avatarUrl` | `string \| null` | ❌ No | Avatar image URL (nullable) |
| `emergencyContacts` | `string[]` | ❌ No | Array of emergency contact numbers |

**Request Body (Craftsman — all fields optional):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | `string` | ❌ No | Min 1 char |
| `lastName` | `string` | ❌ No | Min 1 char |
| `avatarUrl` | `string \| null` | ❌ No | Avatar image URL (nullable) |
| `title` | `string` | ❌ No | Professional title |
| `locationCity` | `string` | ❌ No | City |
| `locationLat` | `number` | ❌ No | Latitude |
| `locationLng` | `number` | ❌ No | Longitude |

```json
{
  "firstName": "Ahmed",
  "title": "Senior Electrician",
  "locationCity": "Jeddah"
}
```

**Response `200 OK`:** Returns the updated profile object.

> [!WARNING]
> Profile modifications are **locked** during verification review for craftsmen.

---

### 7.3 `PUT /api/v1/profile/availability`

> **Auth:** ✅ Bearer Token | **Role:** `CRAFTSMAN`

**Description:** Toggles craftsman availability status.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `isAvailable` | `boolean` | ✅ Yes | `true` or `false` |

```json
{
  "isAvailable": true
}
```

**Response `200 OK`:** Returns updated craftsman profile with skills.

---

## 8. Chat

### 8.1 `GET /api/v1/chatrooms`

> **Auth:** ✅ Bearer Token

**Description:** Lists all chat rooms for the current user.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | `string` | ❌ No | Override role |
| `mobile` | `boolean` | ❌ No | Mobile format |

**Response `200 OK`:**
```json
[
  {
    "id": "clx...",
    "taskId": "clx...",
    "lastMessage": "When can you come?",
    "lastMessageAt": "2026-07-06T09:00:00.000Z",
    "unreadCount": 2,
    "participants": [ "..." ]
  }
]
```

---

### 8.2 `GET /api/v1/chatrooms/:id/messages`

> **Auth:** ✅ Bearer Token

**Description:** Gets messages in a chat room with cursor-based pagination.

**Path Parameters:**

| Param | Type | Required |
|-------|------|----------|
| `id` | `string` | ✅ Yes |

**Query Parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `before` | `string` | ❌ No | — | Cursor: message ID to paginate before |
| `limit` | `number` | ❌ No | `20` | Number of messages to return |
| `role` | `string` | ❌ No | — | Override role |
| `mobile` | `boolean` | ❌ No | — | Mobile format |

**Response `200 OK`:** Array of message objects.

---

### 8.3 `POST /api/v1/chatrooms/:id/messages`

> **Auth:** ✅ Bearer Token

**Description:** Sends a message in a chat room.

**Path Parameters:**

| Param | Type | Required |
|-------|------|----------|
| `id` | `string` | ✅ Yes |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | `string` | ✅ Yes | Message text (min 1 char) |
| `imageUrl` | `string \| null` | ❌ No | Attached image URL |

```json
{
  "content": "When can you come to fix the issue?",
  "imageUrl": null
}
```

**Response `201 Created`:** Returns the created message object.

---

## 9. Notifications

### 9.1 `GET /api/v1/notifications`

> **Auth:** ✅ Bearer Token

**Description:** Lists paginated notifications for the user.

**Query Parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `unreadOnly` | `boolean` | ❌ No | `false` | Filter unread only |
| `page` | `number` | ❌ No | `1` | Page number |
| `limit` | `number` | ❌ No | `10` | Items per page (1–100) |
| `mobile` | `boolean` | ❌ No | — | Mobile format |

**Response `200 OK`:**
```json
{
  "results": [
    {
      "id": "clx...",
      "userId": "clx...",
      "type": "TASK_ACCEPTED",
      "title": "Task Accepted",
      "body": "Your task has been accepted by Ahmed",
      "isRead": false,
      "createdAt": "2026-07-06T09:00:00.000Z"
    }
  ],
  "unreadCount": 5,
  "totalResults": 25,
  "currentPage": 1,
  "totalPages": 3
}
```

---

### 9.2 `PUT /api/v1/notifications/:id/read`

> **Auth:** ✅ Bearer Token

**Description:** Marks a single notification as read.

**Path Parameters:**

| Param | Type | Required |
|-------|------|----------|
| `id` | `string` | ✅ Yes |

**Request Body:** None

**Response `200 OK`:** Returns the updated notification object with `isRead: true`.

---

### 9.3 `PUT /api/v1/notifications/read-all`

> **Auth:** ✅ Bearer Token

**Description:** Marks all unread notifications as read for the user.

**Request Body:** None

**Response `200 OK`:**
```json
{
  "updatedCount": 5
}
```

---

## 10. Uploads

### 10.1 `POST /api/v1/uploads`

> **Auth:** ✅ Bearer Token | **Content-Type:** `multipart/form-data`

**Description:** Uploads a single image file. Accepted formats: JPG, JPEG, PNG, WebP. Max size: 5MB.

**Form Data:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | `File` | ✅ Yes | Image file (jpg, jpeg, png, webp) |

**Response `200 OK`:**
```json
{
  "fileUrl": "/api/v1/uploads/abc123_1720252800000.jpg"
}
```

---

### 10.2 `GET /api/v1/uploads/:filename`

> **Auth:** ✅ Bearer Token

**Description:** Serves an uploaded file. Authorization is checked per-file.

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `filename` | `string` | ✅ Yes | Filename pattern: `[a-zA-Z0-9_-]+.(jpg|jpeg|png|webp)` |

**Response `200 OK`:** Binary file stream with `Cache-Control: private, no-store`.

---

## 11. Safety & Emergency

### 11.1 `POST /api/v1/safety/emergency`

> **Auth:** ✅ Bearer Token

**Description:** Triggers an emergency SOS alert.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `taskId` | `string (UUID)` | ❌ No | Related task ID |
| `latitude` | `number` | ✅ Yes | Current latitude (-90 to 90) |
| `longitude` | `number` | ✅ Yes | Current longitude (-180 to 180) |

```json
{
  "taskId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "latitude": 24.7136,
  "longitude": 46.6753
}
```

**Response `201 Created`:** Returns the emergency record.

---

### 11.2 `PUT /api/v1/safety/emergency/:id/location`

> **Auth:** ✅ Bearer Token

**Description:** Updates the location of an active emergency.

**Path Parameters:**

| Param | Type | Required |
|-------|------|----------|
| `id` | `string` | ✅ Yes |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `latitude` | `number` | ✅ Yes | Updated latitude (-90 to 90) |
| `longitude` | `number` | ✅ Yes | Updated longitude (-180 to 180) |

```json
{
  "latitude": 24.7140,
  "longitude": 46.6760
}
```

**Response `200 OK`:** Returns the updated emergency record.

---

### 11.3 `PUT /api/v1/safety/emergency/:id/resolve`

> **Auth:** ✅ Bearer Token

**Description:** Resolves an active emergency.

**Path Parameters:**

| Param | Type | Required |
|-------|------|----------|
| `id` | `string` | ✅ Yes |

**Request Body:** None

**Response `200 OK`:** Returns the resolved emergency record.

---

### 11.4 `POST /api/v1/safety/discreet-report`

> **Auth:** ✅ Bearer Token

**Description:** Submits a discreet safety report against another user.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `taskId` | `string (UUID)` | ✅ Yes | Related task ID |
| `reportedUserId` | `string (UUID)` | ✅ Yes | User being reported |
| `category` | `string (ReportCategory)` | ✅ Yes | `INAPPROPRIATE_CONDUCT`, `VEHICLE_SAFETY`, `VERBAL_ABUSE`, `THEFT`, `PROPERTY_DAMAGE`, `OTHER` |
| `description` | `string` | ❌ No | Detailed description |
| `attachmentUrl` | `string` | ❌ No | Evidence attachment URL |

```json
{
  "taskId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "reportedUserId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "category": "VERBAL_ABUSE",
  "description": "The worker was verbally abusive during the job",
  "attachmentUrl": "/api/v1/uploads/evidence.jpg"
}
```

**Response `201 Created`:** Returns the report record.

---

## 12. Settings

### 12.1 `GET /api/v1/settings`

> **Auth:** ✅ Bearer Token

**Description:** Returns user preferences / app settings.

**Request Body:** None

**Response `200 OK`:**
```json
{
  "language": "ar",
  "theme": "system",
  "notificationsEnabled": true,
  "chatNotifications": true,
  "taskNotifications": true,
  "marketingNotifications": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `language` | `string` | `"ar"` or `"en"` |
| `theme` | `string` | `"light"`, `"dark"`, or `"system"` |
| `notificationsEnabled` | `boolean` | Master notification toggle |
| `chatNotifications` | `boolean` | Chat notification toggle |
| `taskNotifications` | `boolean` | Task notification toggle |
| `marketingNotifications` | `boolean` | Marketing notification toggle |

---

### 12.2 `PUT /api/v1/settings`

> **Auth:** ✅ Bearer Token

**Description:** Updates user preferences (all fields optional — partial update).

**Request Body (all fields optional):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `language` | `string` | ❌ No | `"ar"` or `"en"` |
| `theme` | `string` | ❌ No | `"light"`, `"dark"`, or `"system"` |
| `notificationsEnabled` | `boolean` | ❌ No | Master notification toggle |
| `chatNotifications` | `boolean` | ❌ No | Chat notification toggle |
| `taskNotifications` | `boolean` | ❌ No | Task notification toggle |
| `marketingNotifications` | `boolean` | ❌ No | Marketing notification toggle |

```json
{
  "language": "en",
  "theme": "dark"
}
```

**Response `200 OK`:** Returns the full updated preferences object.

---

## 13. Payout Accounts

> **All routes:** Auth ✅ Bearer Token | Role: `CRAFTSMAN`

### 13.1 `GET /api/v1/craftsman/payout-accounts`

**Description:** Lists all payout accounts for the authenticated craftsman.

**Request Body:** None

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "clx...",
      "type": "BANK_ACCOUNT",
      "bankName": "Al Rajhi Bank",
      "accountHolderName": "Ahmed Al-Farsi",
      "accountNumber": "1234567890",
      "iban": "SA0380000000608010167519",
      "mobileNumber": null,
      "isDefault": true,
      "createdAt": "2026-07-06T09:00:00.000Z"
    }
  ]
}
```

---

### 13.2 `POST /api/v1/craftsman/payout-accounts`

**Description:** Adds a new payout account.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `string (PayoutAccountType)` | ✅ Yes | `"BANK_ACCOUNT"`, `"STC_PAY"`, or `"URPAY"` |
| `accountHolderName` | `string` | ✅ Yes | Account holder's full name |
| `bankName` | `string` | ⚠️ Conditional | **Required** if `type = "BANK_ACCOUNT"` |
| `accountNumber` | `string` | ⚠️ Conditional | **Required** if `type = "BANK_ACCOUNT"` |
| `iban` | `string` | ⚠️ Conditional | **Required** if `type = "BANK_ACCOUNT"`. Format: `SA` + 22 digits |
| `mobileNumber` | `string` | ⚠️ Conditional | **Required** if `type = "STC_PAY"` or `"URPAY"`. E.164 format |

**Example (Bank Account):**
```json
{
  "type": "BANK_ACCOUNT",
  "accountHolderName": "Ahmed Al-Farsi",
  "bankName": "Al Rajhi Bank",
  "accountNumber": "1234567890",
  "iban": "SA0380000000608010167519"
}
```

**Example (STC Pay):**
```json
{
  "type": "STC_PAY",
  "accountHolderName": "Ahmed Al-Farsi",
  "mobileNumber": "+966501234567"
}
```

**Response `201 Created`:** Returns the created payout account record.

---

### 13.3 `DELETE /api/v1/craftsman/payout-accounts/:id`

**Description:** Deletes a payout account.

**Path Parameters:**

| Param | Type | Required |
|-------|------|----------|
| `id` | `string` | ✅ Yes |

**Response `200 OK`:** Deletion confirmation.

---

## 14. Earnings

> **All routes:** Auth ✅ Bearer Token | Role: `CRAFTSMAN`

### 14.1 `GET /api/v1/craftsman/earnings`

**Description:** Gets earnings summary and transaction history.

**Request Body:** None

**Response `200 OK`:**
```json
{
  "availableBalance": 1500.00,
  "totalEarnings": 5000.00,
  "pendingWithdrawals": 500.00,
  "transactions": [
    {
      "id": "clx...",
      "type": "EARNING",
      "amount": 200.00,
      "status": "COMPLETED",
      "createdAt": "2026-07-06T09:00:00.000Z"
    }
  ]
}
```

---

### 14.2 `POST /api/v1/craftsman/withdraw`

**Description:** Requests a withdrawal from available balance.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | `number` | ✅ Yes | Amount (min 50.00 SAR), must be positive |
| `payoutAccountId` | `string (UUID)` | ✅ Yes | Target payout account ID |

```json
{
  "amount": 500.00,
  "payoutAccountId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response `201 Created`:** Returns the withdrawal transaction record.

---

## 15. Subscriptions

> **All routes:** Auth ✅ Bearer Token | Role: `CUSTOMER`

### 15.1 `GET /api/v1/subscriptions/plans`

**Description:** Lists available subscription plans with pricing.

**Request Body:** None

**Response `200 OK`:** Array of plan objects with pricing details.

---

### 15.2 `POST /api/v1/subscriptions`

**Description:** Creates a new subscription (upgrade to PRO).

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `plan` | `string (SubscriptionPlan)` | ✅ Yes | Must be `"PRO"` |
| `billingCycle` | `string (BillingCycle)` | ✅ Yes | `"MONTHLY"` or `"YEARLY"` |

```json
{
  "plan": "PRO",
  "billingCycle": "MONTHLY"
}
```

**Response `201 Created`:** Returns the subscription record.

---

### 15.3 `GET /api/v1/subscriptions/current`

**Description:** Gets the user's current active subscription.

**Request Body:** None

**Response `200 OK`:** Returns the subscription object or `null`.

---

### 15.4 `DELETE /api/v1/subscriptions/current`

**Description:** Cancels the current active subscription.

**Request Body:** None

**Response `200 OK`:** Returns the cancelled subscription record.

---

## 16. Verification (KYC)

> **All routes:** Auth ✅ Bearer Token | Role: `CRAFTSMAN`
> Base path: `/api/v1/craftsman/verify`

Multi-step verification flow for craftsman identity validation.

### 16.1 `POST /api/v1/craftsman/verify/personal-info`

**Description:** Step 1 — Submit personal information.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | `string` | ✅ Yes | First name |
| `lastName` | `string` | ✅ Yes | Last name |
| `dateOfBirth` | `string (Date)` | ✅ Yes | ISO date format (e.g. `"1990-01-15"`) |
| `gender` | `string` | ✅ Yes | `"MALE"`, `"FEMALE"`, or `"OTHER"` |
| `nationality` | `string` | ✅ Yes | Nationality |
| `residentialAddress` | `string` | ✅ Yes | Full residential address |
| `emergencyContactPhone` | `string` | ✅ Yes | E.164 format (e.g. `"+966501234567"`) |

```json
{
  "firstName": "Ahmed",
  "lastName": "Al-Farsi",
  "dateOfBirth": "1990-05-15",
  "gender": "MALE",
  "nationality": "Saudi",
  "residentialAddress": "123 King Fahd Road, Riyadh",
  "emergencyContactPhone": "+966509876543"
}
```

**Response `200 OK`:** Returns verification progress record.

---

### 16.2 `POST /api/v1/craftsman/verify/upload-id`

**Description:** Step 2 — Upload government ID images.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `idFrontImage` | `string` | ✅ Yes | URL of front ID image |
| `idBackImage` | `string` | ✅ Yes | URL of back ID image |

```json
{
  "idFrontImage": "/api/v1/uploads/id_front.jpg",
  "idBackImage": "/api/v1/uploads/id_back.jpg"
}
```

**Response `200 OK`:** Returns updated verification progress.

---

### 16.3 `POST /api/v1/craftsman/verify/selfie`

**Description:** Step 3 — Upload selfie for face matching.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `selfieImageUrl` | `string` | ✅ Yes | URL of selfie image |

```json
{
  "selfieImageUrl": "/api/v1/uploads/selfie.jpg"
}
```

**Response `200 OK`:** Returns updated verification progress.

---

### 16.4 `POST /api/v1/craftsman/verify/skills`

**Description:** Step 4 — Submit skills and experience.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `primaryCategory` | `string` | ✅ Yes | Primary service category |
| `skillIds` | `string[] (UUID[])` | ✅ Yes | Array of skill UUIDs |
| `yearsExperience` | `number (integer)` | ✅ Yes | 1–50 years |

```json
{
  "primaryCategory": "ELECTRICIAN",
  "skillIds": ["uuid-1", "uuid-2", "uuid-3"],
  "yearsExperience": 5
}
```

**Response `200 OK`:** Returns updated verification progress.

---

### 16.5 `POST /api/v1/craftsman/verify/certifications`

**Description:** Step 5 — Submit certifications and insurance.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `certImageUrl` | `string` | ✅ Yes | Certificate image URL |
| `certAuthority` | `string` | ✅ Yes | Issuing authority name |
| `insuranceLimit` | `number` | ✅ Yes | Insurance coverage limit (positive number) |

```json
{
  "certImageUrl": "/api/v1/uploads/cert.jpg",
  "certAuthority": "Saudi Council of Engineers",
  "insuranceLimit": 50000
}
```

**Response `200 OK`:** Returns updated verification progress.

---

### 16.6 `POST /api/v1/craftsman/verify/submit`

**Description:** Step 6 — Final submission for admin review. All previous steps must be completed.

**Request Body:** None

**Response `200 OK`:** Returns the submitted verification request.

---

## 17. Offers

### 17.1 `GET /api/v1/offers`

> **Auth:** ✅ Bearer Token

**Description:** Returns active promotional offers/banners. Auto-seeds default offers if database is empty.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `mobile` | `boolean` | ❌ No | Mobile format |

**Response `200 OK`:**
```json
[
  {
    "id": "clx...",
    "title": "AC service at 99 SAR",
    "subtitle": "Beat the heat with certified technicians",
    "buttonText": "Book AC Tech",
    "imageUrl": "/uploads/offers/ac_service.png",
    "bannerType": "PROMO",
    "isActive": true,
    "createdAt": "2026-07-06T09:00:00.000Z"
  }
]
```

---

## 18. Admin Dashboard

> **All routes:** Auth ✅ Bearer Token | Role: `ADMIN`
> Base path: `/api/v1/admin`

---

### 18.1 `GET /api/v1/admin/overview-stats`

**Description:** Dashboard overview statistics.

**Response `200 OK`:** Returns aggregated stats object.

---

### 18.2 `GET /api/v1/admin/verification/queue`

**Description:** Lists pending verification requests.

**Query Parameters:**

| Param | Type | Required | Default |
|-------|------|----------|---------|
| `page` | `string` | ❌ No | `1` |
| `limit` | `string` | ❌ No | `20` |

**Response `200 OK`:** Paginated list of verification requests.

---

### 18.3 `POST /api/v1/admin/verification/moderate`

**Description:** Approves, rejects, or flags a verification request.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `requestId` | `string (UUID)` | ✅ Yes | Verification request ID |
| `decision` | `string (VerificationAction)` | ✅ Yes | `"APPROVED"`, `"REJECTED"`, or `"FLAGGED"` |
| `moderatorNotes` | `string` | ✅ Yes | Review notes (min 1 char) |

```json
{
  "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "decision": "APPROVED",
  "moderatorNotes": "All documents verified successfully"
}
```

**Response `200 OK`:** Returns the moderated verification request.

---

### 18.4 `GET /api/v1/admin/craftsmen`

**Description:** Lists all craftsmen with filters.

**Query Parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `q` | `string` | ❌ No | — | Search query |
| `category` | `string` | ❌ No | — | Filter by category |
| `status` | `string` | ❌ No | — | Filter by status |
| `page` | `string` | ❌ No | `1` | Page |
| `limit` | `string` | ❌ No | `20` | Limit |

**Response `200 OK`:** Paginated craftsmen list.

---

### 18.5 `GET /api/v1/admin/tasks`

**Description:** Lists all tasks with filters.

**Query Parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `q` | `string` | ❌ No | — | Search query |
| `status` | `string` | ❌ No | — | Filter by task status |
| `page` | `string` | ❌ No | `1` | Page |
| `limit` | `string` | ❌ No | `20` | Limit |

**Response `200 OK`:** Paginated tasks list.

---

### 18.6 `GET /api/v1/admin/disputes`

**Description:** Lists all disputes.

**Query Parameters:**

| Param | Type | Required | Default |
|-------|------|----------|---------|
| `page` | `string` | ❌ No | `1` |
| `limit` | `string` | ❌ No | `20` |

**Response `200 OK`:** Paginated disputes list.

---

### 18.7 `POST /api/v1/admin/disputes/:id/resolve`

**Description:** Resolves a dispute.

**Path Parameters:**

| Param | Type | Required |
|-------|------|----------|
| `id` | `string` | ✅ Yes |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resolution` | `string` | ✅ Yes | Resolution details (min 1 char) |

```json
{
  "resolution": "Refund issued to customer. Craftsman warned."
}
```

**Response `200 OK`:** Returns the resolved dispute record.

---

### 18.8 `GET /api/v1/admin/payments`

**Description:** Lists payment transactions.

**Query Parameters:**

| Param | Type | Required | Default |
|-------|------|----------|---------|
| `page` | `string` | ❌ No | `1` |
| `limit` | `string` | ❌ No | `20` |

**Response `200 OK`:** Paginated payments list.

---

### 18.9 `GET /api/v1/admin/live-activity`

**Description:** Returns real-time activity feed for the admin dashboard.

**Response `200 OK`:** Live activity data object.

---

### 18.10 `GET /api/v1/admin/ads`

**Description:** Lists all ad campaigns.

**Response `200 OK`:** Array of ad campaign objects.

---

### 18.11 `POST /api/v1/admin/ads`

**Description:** Creates a new ad campaign.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ✅ Yes | Campaign name (min 3 chars) |
| `budget` | `number` | ✅ Yes | Budget amount (positive number) |

```json
{
  "name": "Summer AC Campaign",
  "budget": 10000
}
```

**Response `201 Created`:** Returns the created campaign.

---

### 18.12 `PUT /api/v1/admin/ads/:id/status`

**Description:** Updates an ad campaign's status.

**Path Parameters:**

| Param | Type | Required |
|-------|------|----------|
| `id` | `string` | ✅ Yes |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string` | ✅ Yes | `"ACTIVE"`, `"PAUSED"`, or `"ENDED"` |

```json
{
  "status": "PAUSED"
}
```

**Response `200 OK`:** Returns the updated campaign.

---

### 18.13 `POST /api/v1/admin/notifications/broadcast`

**Description:** Sends a broadcast notification to a targeted audience.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | ✅ Yes | Broadcast title (min 5 chars) |
| `body` | `string` | ✅ Yes | Broadcast body (min 10 chars) |
| `audience` | `string` | ✅ Yes | `"ALL"`, `"CUSTOMERS"`, or `"CRAFTSMEN"` |

```json
{
  "title": "Platform Maintenance",
  "body": "The platform will be undergoing scheduled maintenance tonight from 2 AM to 4 AM.",
  "audience": "ALL"
}
```

**Response `201 Created`:** Returns the broadcast record.

---

### 18.14 `GET /api/v1/admin/notifications/broadcasts`

**Description:** Lists all broadcast notifications sent.

**Response `200 OK`:** Array of broadcast records.

---

### 18.15 `GET /api/v1/admin/categories`

**Description:** Lists all dynamic service categories.

**Response `200 OK`:** Array of category objects.

---

### 18.16 `POST /api/v1/admin/categories`

**Description:** Creates a new service category.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `key` | `string` | ✅ Yes | Unique key (min 3 chars, auto-uppercased) |
| `nameEn` | `string` | ✅ Yes | English name (min 3 chars) |
| `nameAr` | `string` | ✅ Yes | Arabic name (min 3 chars) |

```json
{
  "key": "WELDING",
  "nameEn": "Welding",
  "nameAr": "لحام"
}
```

**Response `201 Created`:** Returns the created category.

---

### 18.17 `DELETE /api/v1/admin/categories/:id`

**Description:** Deletes a service category.

**Path Parameters:**

| Param | Type | Required |
|-------|------|----------|
| `id` | `string` | ✅ Yes |

**Response `200 OK`:** Deletion confirmation.

---

### 18.18 `GET /api/v1/admin/categories/:id/subcategories`

**Description:** Lists sub-categories under a category.

**Path Parameters:**

| Param | Type | Required |
|-------|------|----------|
| `id` | `string` | ✅ Yes |

**Query Parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `page` | `string` | ❌ No | `1` | Page |
| `limit` | `string` | ❌ No | `50` | Limit |
| `isActive` | `string` | ❌ No | — | Filter: `"true"` or `"false"` |

**Response `200 OK`:** Paginated sub-category list.

---

### 18.19 `POST /api/v1/admin/categories/:id/subcategories`

> **Content-Type:** `multipart/form-data` or `application/json`

**Description:** Creates a sub-category. Supports file upload or imageUrl in body.

**Path Parameters:**

| Param | Type | Required |
|-------|------|----------|
| `id` | `string` | ✅ Yes |

**Request Body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nameEn` | `string` | ✅ Yes | English name (min 2 chars) |
| `nameAr` | `string` | ✅ Yes | Arabic name (min 2 chars) |
| `imageUrl` | `string` | ❌ No | Image URL (must start with `/api/v1/uploads/` or `http(s)://`) |

**Or Form Data:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nameEn` | `string` | ✅ Yes | English name |
| `nameAr` | `string` | ✅ Yes | Arabic name |
| `image` | `File` | ❌ No | Image file (alternative to imageUrl) |

```json
{
  "nameEn": "Residential Wiring",
  "nameAr": "أسلاك منزلية",
  "imageUrl": "/api/v1/uploads/subcategory_img.jpg"
}
```

**Response `201 Created`:** Returns the created sub-category.

---

### 18.20 `DELETE /api/v1/admin/categories/subcategories/:subId`

**Description:** Deletes a sub-category.

**Path Parameters:**

| Param | Type | Required |
|-------|------|----------|
| `subId` | `string` | ✅ Yes |

**Response `200 OK`:** Deletion confirmation.

---

### 18.21 `GET /api/v1/admin/audit-logs`

**Description:** Lists audit log entries.

**Query Parameters:**

| Param | Type | Required | Default |
|-------|------|----------|---------|
| `page` | `string` | ❌ No | `1` |
| `limit` | `string` | ❌ No | `20` |

**Response `200 OK`:** Paginated audit log list.

---

## Authentication Summary

| Auth Type | Header | Usage |
|-----------|--------|-------|
| **Access Token** | `Authorization: Bearer <accessToken>` | All protected endpoints |
| **Registration Token** | `Authorization: Bearer <registrationToken>` | Only `POST /auth/register/complete` |
| **None** | — | Public endpoints (health, categories, confirm-email, login, etc.) |

## Rate Limiting

| Limiter | Scope | Description |
|---------|-------|-------------|
| **Global API** | All routes (except health) | PostgreSQL-backed rate limiter |
| **Auth Limiter** | Login/verify endpoints | Stricter limits for auth flows |
| **OTP Limiter** | OTP send endpoints | 1 per 60s, 3 per 15min, 10 per 24h |

---

> **Total Endpoints: 60+** | Generated from source code analysis
