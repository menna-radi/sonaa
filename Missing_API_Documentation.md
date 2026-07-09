# Missing API Documentation

This document outlines all missing endpoints, mismatches, or inconsistencies in the Sonaa Backend API that prevent the Sonaa Admin Dashboard frontend from operating at full capability.

---

## 1. Authentication & Session Validation

### Missing `/auth/me` Endpoint
* **Frontend Feature:** Session Validation (auto-login on startup / page refresh)
* **Missing Endpoint:** `GET /api/v1/auth/me`
* **Suggested HTTP Method:** `GET`
* **Required Request Body:** None (Bearer Access Token in `Authorization` header)
* **Expected Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "id": "clx...",
      "firstName": "Ahmed",
      "lastName": "Al-Farsi",
      "name": "Ahmed Al-Farsi",
      "username": "ahmed_craft",
      "email": "ahmed@example.com",
      "phone": "+966501234567",
      "role": "ADMIN"
    }
  }
  ```
* **Reason Why it is Required:** On application load, the frontend needs to fetch and validate the user's role and details based on the stored bearer token to ensure they are authenticated and authorized to access the Admin Dashboard.

---

## 2. Tasks Management

### Missing Freeze Task Endpoint
* **Frontend Feature:** Freeze Task
* **Missing Endpoint:** `POST /api/v1/admin/tasks/:id/freeze`
* **Suggested HTTP Method:** `POST`
* **Required Request Body:** None
* **Expected Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "id": "clx...",
      "task_status": "frozen"
    }
  }
  ```
* **Reason Why it is Required:** Allows admins to suspend or freeze a job post/task when a dispute or violation is reported.

### Missing Unfreeze Task Endpoint
* **Frontend Feature:** Unfreeze Task
* **Missing Endpoint:** `POST /api/v1/admin/tasks/:id/unfreeze`
* **Suggested HTTP Method:** `POST`
* **Required Request Body:** None
* **Expected Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "id": "clx...",
      "task_status": "in_progress"
    }
  }
  ```
* **Reason Why it is Required:** Allows admins to resume/unfreeze a task once the dispute is resolved.

---

## 3. Craftsmen Management

### Missing Suspend Craftsman Endpoint
* **Frontend Feature:** Suspend Craftsman
* **Missing Endpoint:** `PUT /api/v1/admin/craftsmen/:id/suspend`
* **Suggested HTTP Method:** `PUT`
* **Required Request Body:** None
* **Expected Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "id": "clx...",
      "status": "suspended"
    }
  }
  ```
* **Reason Why it is Required:** Allows admins to temporarily suspend a craftsman from the system due to poor performance or policy violation.

### Missing Ban Craftsman Endpoint
* **Frontend Feature:** Ban Craftsman
* **Missing Endpoint:** `PUT /api/v1/admin/craftsmen/:id/ban`
* **Suggested HTTP Method:** `PUT`
* **Required Request Body:** None
* **Expected Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "id": "clx...",
      "status": "suspended"
    }
  }
  ```
* **Reason Why it is Required:** Allows admins to permanently ban a craftsman from the system.

### Missing Individual Verification Item Approval Endpoint
* **Frontend Feature:** Toggle verification status of individual checks (National ID, Selfie Match, Trade License, Bank IBAN, Background Check, Insurance)
* **Missing Endpoint:** `POST /api/v1/admin/craftsmen/:id/verify/item`
* **Suggested HTTP Method:** `POST`
* **Required Request Body:**
  ```json
  {
    "itemKey": "nationalId | selfieMatch | tradeLicense | bankIban | backgroundCheck | insurance",
    "approved": true
  }
  ```
* **Expected Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "id": "clx...",
      "verifications": {
        "nationalId": true,
        "selfieMatch": true,
        "tradeLicense": true,
        "bankIban": true,
        "backgroundCheck": true,
        "insurance": true
      }
    }
  }
  ```
* **Reason Why it is Required:** The Craftsmen page UI allows checking off individual checks to track KYC progress before doing a full moderate review.

---

## 4. Reports & Dispute Resolution

### Missing General User Reports Listing Endpoint
* **Frontend Feature:** General Safety & Conduct Reports Feed
* **Missing Endpoint:** `GET /api/v1/admin/reports`
* **Suggested HTTP Method:** `GET`
* **Required Request Body:** None
* **Expected Response Body:** Paginated list of discreet safety reports submitted via `/api/v1/safety/discreet-report`.
* **Reason Why it is Required:** Connects the admin dashboard's Reports page to view and moderate reports of verbal abuse, property damage, safety violations, etc.

---

## 5. Payments & Financial Metrics

### Missing Payments Summary Endpoint
* **Frontend Feature:** Payments KPI Summary Cards (GMV, Net Revenue, Take Rate, MRR)
* **Missing Endpoint:** `GET /api/v1/admin/payments/summary`
* **Suggested HTTP Method:** `GET`
* **Required Request Body:** None
* **Expected Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "gmvMtd": 4120000,
      "netRevenue": 842000,
      "takeRate": 20.4,
      "mrr": 132615
    }
  }
  ```
* **Reason Why it is Required:** Needed to show total commission, gross volume, and subscription revenue on the Admin Payments Page.

### Missing failed transactions retry Endpoint
* **Frontend Feature:** Retry Payouts / Failed Transactions
* **Missing Endpoint:** `POST /api/v1/admin/payments/failed-transactions/:id/retry`
* **Suggested HTTP Method:** `POST`
* **Required Request Body:** None
* **Expected Response Body:**
  ```json
  {
    "success": true,
    "data": true
  }
  ```
* **Reason Why it is Required:** Needed to trigger a retry for failed bank transfer/payouts in the failed transactions queue.

### Missing Withdrawal Requests Listing & Moderation
* **Frontend Feature:** Moderate Craftsman Withdrawal Requests
* **Missing Endpoints:** 
  - `GET /api/v1/admin/payments/withdrawal-requests`
  - `PUT /api/v1/admin/payments/withdrawal-requests/:id/status`
* **Suggested HTTP Method:** `GET` and `PUT`
* **Required Request Body (Moderation):**
  ```json
  {
    "status": "approved | rejected"
  }
  ```
* **Expected Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "id": "w1",
      "status": "approved"
    }
  }
  ```
* **Reason Why it is Required:** Connects the withdrawal approvals list on the Payments page to enable admins to manage craftsman earnings payouts.

---

## 7. Service Management (Categories & Custom Fields)

### Missing Category & Subcategory Visibility Toggles
* **Frontend Feature:** Toggle Category / Subcategory Active Visibility Status
* **Missing Endpoints:**
  - `PUT /api/v1/admin/categories/:id/visibility`
  - `PUT /api/v1/admin/categories/subcategories/:subId/visibility`
* **Suggested HTTP Method:** `PUT`
* **Required Request Body:**
  ```json
  {
    "visible": true
  }
  ```
* **Reason Why it is Required:** The dashboard allows hiding/showing service categories dynamically based on market availability.

### Missing Custom Form Fields Endpoints
* **Frontend Feature:** Dynamic form builder for Category onboarding
* **Missing Endpoints:**
  - `GET /api/v1/admin/categories/:id/fields`
  - `POST /api/v1/admin/categories/:id/fields`
  - `POST /api/v1/admin/fields/:id/toggle-required`
  - `DELETE /api/v1/admin/fields/:id`
* **Reason Why it is Required:** Serves the category dynamic input requirements (e.g. asking for specific specifications when building dynamic forms for customer tasks).

---

## 8. Global Admin Settings

### Missing Global Dashboard Settings
* **Frontend Feature:** System-wide app settings (Platform maintenance toggle, commission percentage, payout delays)
* **Missing Endpoints:**
  - `GET /api/v1/admin/settings`
  - `PUT /api/v1/admin/settings`
* **Reason Why it is Required:** Admin-level settings page needs endpoints to toggle system parameters. Currently only user-level local preference settings are available.

---

## 9. Missing Response Fields in Existing Endpoints

### Craftsmen List (`GET /api/v1/admin/craftsmen`)
The backend returns a list of craftsman objects, but they lack the following fields expected by the Craftsmen page:
* `verifications`: Object tracking individual KYC statuses (`nationalId`, `selfieMatch`, `tradeLicense`, `bankIban`, `backgroundCheck`, `insurance`).
* `jobsCount`: The number of tasks completed by the craftsman.
* `responseTime`: The average time it takes for the craftsman to respond.
* `earnings`: Total earnings of the craftsman in SAR.
* `rating`: Average rating (0 to 5).
* **Workaround:** Frontend mapper currently defaults these fields to `false`, `0`, or empty strings.

### Category List (`GET /api/v1/admin/categories`)
The backend returns category objects, but they lack:
* `subcategoriesCount`: Number of active subcategories.
* `visibility_status`: Status indicator (`Active` \| `Hidden` \| `Archived`).
* `is_visible`: Boolean flag indicating if the category is published.
* **Workaround:** Frontend mapper defaults these to `0`, `Active`, and `true` respectively.

---

### Admin Roles & Users (`GET /api/v1/admin/roles/users` & `POST /api/v1/admin/roles/users`)
* **Frontend Feature:** List all admin accounts assigned to a role, and add new admin user accounts.
* **Missing Endpoints:**
  - `GET /api/v1/admin/roles/users` (to fetch all admins / users with roles)
  - `POST /api/v1/admin/roles/users` (to create a new admin account with name, email, password, role)
* **Workaround:** Frontend defaults to local mock lists in Mock mode, and returns "Feature not supported" error in API mode.

---

## 10. Admin Notifications Feed

### Missing Notifications Listing Endpoint
* **Frontend Feature:** Header Notification bell list & notifications tab dropdown
* **Missing Endpoint:** `GET /api/v1/admin/notifications`
* **Suggested HTTP Method:** `GET`
* **Required Request Body:** None (Bearer token in authorization headers)
* **Expected Response Body:** Paginated array of notification alerts (Emergency, Failed payments, safety reports, KYC verification events).
* **Reason Why it is Required:** Feeds the dynamic notifications list in the header popover to display real-time active system alerts to the logged-in administrator.

### Missing Toggle Read / Read Status Endpoint
* **Frontend Feature:** Click notification to mark as read
* **Missing Endpoint:** `PUT /api/v1/admin/notifications/:id/read`
* **Suggested HTTP Method:** `PUT`
* **Required Request Body:** None
* **Expected Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "id": "1",
      "unread": false
    }
  }
  ```
* **Reason Why it is Required:** Sets an individual notification as read on the backend database once the admin clicks on it or resolves it.

### Missing Mark All Read Endpoint
* **Frontend Feature:** Clear all unread notifications
* **Missing Endpoint:** `POST /api/v1/admin/notifications/mark-all-read`
* **Suggested HTTP Method:** `POST`
* **Required Request Body:** None
* **Expected Response Body:**
  ```json
  {
    "success": true,
    "data": true
  }
  ```
* **Reason Why it is Required:** Allows clearing the badge count in the header by marking all active alerts as read in a single action.

### Missing Delete Notification Endpoint
* **Frontend Feature:** Delete system notification from feed
* **Missing Endpoint:** `DELETE /api/v1/admin/notifications/:id`
* **Suggested HTTP Method:** `DELETE`
* **Required Request Body:** None
* **Expected Response Body:**
  ```json
  {
    "success": true,
    "data": true
  }
  ```
* **Reason Why it is Required:** Allows admins to permanently remove outdated notification events from their list.


