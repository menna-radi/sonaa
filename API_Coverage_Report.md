# API Coverage Report

This report summarizes the status of the integration between the React Frontend and the Sonaa Backend API.

---

## 1. Connected Pages & Features

| Frontend Feature / Page | Mapped Repository | Integrated API Endpoints | Status | Fallback / Behavior in API Mode |
| :--- | :--- | :--- | :--- | :--- |
| **Login / Authentication** | [ApiAuthRepository](file:///c:/Users/menna/Desktop/sonaa/src/data/repositories/ApiAuthRepository.ts) | `POST /api/v1/auth/login` | **Fully Integrated** | Store token in local storage, fallback to local storage cache since `GET /auth/me` is missing. |
| **Admin Overview Metrics** | [ApiMetricRepository](file:///c:/Users/menna/Desktop/sonaa/src/data/repositories/ApiMetricRepository.ts) | `GET /api/v1/admin/overview-stats` | **Partially Integrated** | Overview stats requested from API. Other detailed/cohort metrics return "Feature not supported". |
| **Live Activity Feed** | [ApiLiveActivityRepository](file:///c:/Users/menna/Desktop/sonaa/src/data/repositories/ApiLiveActivityRepository.ts) | `GET /api/v1/admin/live-activity` | **Fully Integrated** | Fetches live activity snapshot from backend. |
| **Tasks / Job Posts** | [ApiTaskRepository](file:///c:/Users/menna/Desktop/sonaa/src/data/repositories/ApiTaskRepository.ts) | `GET /api/v1/admin/tasks` | **Partially Integrated** | Lists tasks with backend pagination. Freeze/Unfreeze actions show "Feature not supported" message. |
| **Craftsmen List** | [ApiCraftsmanRepository](file:///c:/Users/menna/Desktop/sonaa/src/data/repositories/ApiCraftsmanRepository.ts) | `GET /api/v1/admin/craftsmen` | **Partially Integrated** | Lists craftsmen with backend pagination. Suspend/Ban actions display "Feature not supported" alert. |
| **Verification Queue** | [ApiVerificationRepository](file:///c:/Users/menna/Desktop/sonaa/src/data/repositories/ApiVerificationRepository.ts) | `GET /api/v1/admin/verification/queue`<br>`POST /api/v1/admin/verification/moderate` | **Fully Integrated** | Admin can fetch the queue of pending craftsman verifications and Approve/Reject moderation requests. |
| **Notification Broadcasts** | [ApiBroadcastRepository](file:///c:/Users/menna/Desktop/sonaa/src/data/repositories/ApiBroadcastRepository.ts) | `GET /api/v1/admin/notifications/broadcasts`<br>`POST /api/v1/admin/notifications/broadcast` | **Fully Integrated** | Admin can list past notification campaigns and dispatch new immediate or scheduled broadcasts. |
| **Ads & Campaigns** | [ApiAdRepository](file:///c:/Users/menna/Desktop/sonaa/src/data/repositories/ApiAdRepository.ts) | `GET /api/v1/admin/ads`<br>`POST /api/v1/admin/ads`<br>`PUT /api/v1/admin/ads/:id/status` | **Fully Integrated** | Admin can list ad campaigns, launch new ones with budget settings, and pause/resume active ones. |
| **Disputes / Safety Reports** | [ApiSafetyReportRepository](file:///c:/Users/menna/Desktop/sonaa/src/data/repositories/ApiSafetyReportRepository.ts) | *None (Missing backend endpoint)* | **Disabled** | Returns "Feature not supported by backend yet" error. |

---

## 2. API Endpoints Map

### Integrated Endpoints

* **`POST /api/v1/auth/login`**
  * **Payload:** `{ identifier, password }`
  * **Response:** `{ token, user }`
* **`GET /api/v1/admin/overview-stats`**
  * **Response:** `{ success, data: { activeCraftsmen, ... } }`
* **`GET /api/v1/admin/live-activity`**
  * **Response:** `{ success, data: [...] }`
* **`GET /api/v1/admin/tasks`**
  * **Response:** `{ results: [...], total, page, limit }`
* **`GET /api/v1/admin/craftsmen`**
  * **Response:** `{ results: [...], total, page, limit }`
* **`GET /api/v1/admin/verification/queue`**
  * **Response:** `{ results: [...], total, page, limit }`
* **`POST /api/v1/admin/verification/moderate`**
  * **Payload:** `{ craftsmanId, status: "APPROVED" \| "REJECTED", notes }`
* **`GET /api/v1/admin/notifications/broadcasts`**
  * **Response:** `{ results: [...] }`
* **`POST /api/v1/admin/notifications/broadcast`**
  * **Payload:** `{ title, message, audience: "ALL" \| "CUSTOMER" \| "CRAFTSMAN", scheduleTime }`
* **`GET /api/v1/admin/ads`**
  * **Response:** `[ { id, name, budget, status: "ACTIVE" \| "PAUSED", ... } ]`
* **`POST /api/v1/admin/ads`**
  * **Payload:** `{ name, budget }`
* **`PUT /api/v1/admin/ads/:id/status`**
  * **Payload:** `{ status: "ACTIVE" \| "PAUSED" }`

---

## 3. Limitations & Workarounds

1. **User Session Validation**
   * **Issue:** Missing `GET /auth/me` to validate stored token on application startup.
   * **Workaround:** Implemented local cache mechanism in [ApiAuthRepository](file:///c:/Users/menna/Desktop/sonaa/src/data/repositories/ApiAuthRepository.ts) that caches the user object in `localStorage` on successful login and serves it on page refresh, clearing it if the token is discarded or expires.
2. **Missing Craftsmen & Task Moderation Actions**
   * **Issue:** Unable to freeze tasks, suspend/ban craftsmen, or verify individual document items directly from the backend.
   * **Workaround:** Frontend displays clear, premium alerts stating "Feature not supported by the backend yet" when users trigger these actions, instead of failing silently or using client-only stub states.
3. **Safety & Conduct Reports**
   * **Issue:** No endpoint exists to view reported user conduct issues.
   * **Workaround:** The reports safety repo fallback returns a descriptive error indicating the backend lacks a safety moderation endpoint, in line with requirements.
