# 01 · Networking, auth & errors

## 1. HTTP client

- Base URL: `ApiConstants.baseUrl` (`--dart-define=API_BASE_URL=…`, default `https://api.arox.digital/api/v1`).
- One Dio instance from `DioFactory`, interceptors in this order:
  1. `AuthInterceptor` (QueuedInterceptor) — `Authorization: Bearer <access>`, `Accept-Language: <ar|en|he>`,
     refresh-on-401 with a separate Dio, retry the original request once.
  2. Logging (debug only).
- Timeouts: connect 15s, receive 30s (uploads use their own longer timeout).

## 2. Tokens & session

| Item | Where | Notes |
|---|---|---|
| Access token | `PreferencesService` (`StorageKeys.token`) | JWT; carries `role` = last acting mode. |
| Refresh token | `StorageKeys.refreshToken` | `POST /auth/refresh {refreshToken}` → new pair. |
| Session user | `AuthLocalDataSource` (`UserModel`) | Name, role, profile flags; update it when the user edits their name. |

Refresh flow (automatic):
1. Request fails with **401** → interceptor locks the queue.
2. `POST /auth/refresh` with the stored refresh token.
3. Success → save both tokens, reconnect socket with the new token, replay queued requests.
4. Failure → clear tokens, `AuthGuard` triggers logout → login screen. Never loop.

## 3. Acting role (dual-profile users)

Some endpoints serve both roles (`GET /tasks`, `GET /chatrooms`, `GET /profile`, `POST /chatrooms`).
The server resolves the role in this order: `?role=` → body `role` → header `x-acting-role` → JWT role.

- Customer data sources send `Options(headers: {'x-acting-role': 'CUSTOMER'})`; craftsman ones `CRAFTSMAN`.
- `GET /profile?role=CUSTOMER|CRAFTSMAN` selects which profile to return.
- Role-gated routes (`authorize("CRAFTSMAN")`) use the **JWT role**, so entering craftsman mode must call
  `POST /auth/switch-role` (see [role switching](../shared/role-switching.md)).

## 4. Error format & mapping

Backend error body:

```json
{ "error": "CRAFTSMAN_NOT_VERIFIED", "message": "Human readable", "details": [ { "field": "...", "message": "..." } ] }
```

`mapDioError(DioException) → NetworkError { type, statusCode, errorCode, message }`
(`lib/core/network/dio_error_handler.dart`).

| HTTP | `NetworkErrorType` | UX |
|---|---|---|
| no response | `connection` / `timeout` | "Check your connection" + retry |
| 400 `VALIDATION_ERROR` | `badRequest` | Show field `details[]` next to inputs |
| 401 | `unauthorized` | Handled by interceptor; if it escapes → session expired |
| 403 | `forbidden` | Branch on `errorCode` (see table) |
| 404 | `notFound` | "No longer available" + pop/refresh list |
| 409 | `conflict` | State changed on the server → refresh the entity, explain |
| 429 | `rateLimited` | "Too many attempts, wait a moment" (OTP: 60s cooldown) |
| 5xx | `server` | Generic error + retry; never show raw message |

Business error codes the app must branch on:

| `errorCode` | Where | App behaviour |
|---|---|---|
| `CRAFTSMAN_NOT_VERIFIED` | accept/offer | Verification-required sheet → verification dashboard |
| `BILLING_MODEL_REQUIRED` | accept/offer | "Choose subscription or commission" sheet; keep the task listed |
| `SUBSCRIPTION_REQUIRED` | accept/offer | Renew plan screen |
| `COMMISSION_LOCKED` | accept/offer | Pay commission (Bit receipt) screen |
| `CRAFTSMAN_LOAD_LIMIT_EXCEEDED` | accept | "Finish an active task first (max 3)" |
| `CRAFTSMAN_UNAVAILABLE` / `CRAFTSMAN_BILLING_INELIGIBLE` | customer direct request | "This craftsman can't take requests now" |
| `OFFER_REQUIRED` | accept open-price task | Show "send offer" instead of accept |
| `FEEDBACK_ALREADY_EXISTS` (409) | rating | Mark as rated |
| `INVALID_TASK_STATUS` / `INVALID_STATUS_TRANSITION` | task actions | Refresh task; action no longer valid |
| `VERIFICATION_REVIEW_REQUIRED` | admin only | — |
| `PHONE_ALREADY_REGISTERED` / `PHONE_NOT_REGISTERED` | auth | Switch to login / register |
| `OTP_COOLDOWN` / `OTP_RATE_LIMIT_HOURLY` | auth | Countdown / try later |

Translate by code first (`task_errors.<code>`), fall back to a generic key. **Never show backend English
messages directly** in Arabic/Hebrew UI.

## 5. Rate limits (server)

| Limiter | Limit | Key |
|---|---|---|
| API (all) | 300 req/min | IP (limiter runs before auth) |
| Auth | 30 req/min | IP |
| OTP | 10 req/min + 1 per 60s per phone + 2/hour | phone |

Design implications: coalesce refreshes (see realtime guide), never poll faster than 30s, debounce search (400ms).

## 6. Response shapes

- Add `?mobile=true` to task, notification, offer, craftsman and chat list endpoints to get the flattened shape
  (`formatTaskForMobile`, etc.). Parsing must still tolerate the raw shape (older servers).
- Some endpoints wrap in `{ success, data }` (commission, subscriptions); unwrap `data` when present.
- Dates are ISO-8601 UTC; convert with `toLocal()` before display.

## 7. Checklist

- [ ] Every role-scoped call passes `x-acting-role`.
- [ ] Every command maps `errorCode` to a specific UX, not a generic snackbar.
- [ ] 409 → refetch entity; 404 → remove from list.
- [ ] No request loops on 401/403.
