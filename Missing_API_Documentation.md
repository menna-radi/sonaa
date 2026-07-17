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
    "id": "clx...",
    "firstName": "Ahmed",
    "lastName": "Al-Farsi",
    "name": "Ahmed Al-Farsi",
    "username": "ahmed_craft",
    "email": "ahmed@example.com",
    "phone": "+966501234567",
    "role": "ADMIN"
  }
  ```
* **Reason Why it is Required:** On application load, the frontend needs to fetch and validate the user's role and details based on the stored bearer token to ensure they are authenticated and authorized to access the Admin Dashboard. Currently, the frontend falls back to reading the cached local storage profile.

---

## 2. Safety & Moderation

### Missing Safety Report Moderation Action
* **Frontend Feature:** Moderate Conduct / Safety Reports (Dismiss, Suspend, Ban)
* **Missing Endpoint:** `PUT /api/v1/admin/reports/:id/moderate`
* **Suggested HTTP Method:** `PUT`
* **Required Request Body:**
  ```json
  {
    "action": "dismiss | suspend | ban",
    "notes": "Optional moderation notes..."
  }
  ```
* **Expected Response Body:**
  ```json
  {
    "id": "report-uuid",
    "status": "RESOLVED",
    "actionTaken": "suspend"
  }
  ```
* **Reason Why it is Required:** The admin dashboard Reports page contains a moderation dialog to take direct action on safety reports (dismissing them, or suspending/banning the suspect). Currently, the frontend stubs this operation out.

---

## 3. Categories & Subcategories

### Missing Move Subcategory Endpoint
* **Frontend Feature:** Reassign subcategory to a different parent category
* **Missing Endpoint:** `PUT /api/v1/admin/categories/subcategories/:subId/move`
* **Suggested HTTP Method:** `PUT`
* **Required Request Body:**
  ```json
  {
    "targetCategoryId": "new-parent-category-id"
  }
  ```
* **Expected Response Body:**
  ```json
  {
    "id": "subcat-uuid",
    "categoryId": "new-parent-category-id"
  }
  ```
* **Reason Why it is Required:** The dashboard allows admins to reassign subcategories dynamically if a service restructuring is needed. Currently, the frontend returns a "Feature not supported" error.

---

## 4. Admin Management & Access Control

### Missing Admin Roles & Users Listing & Creation
* **Frontend Feature:** List all admin accounts, and create new admin users
* **Missing Endpoints:**
  - `GET /api/v1/admin/roles/users` (to fetch all admins / users with roles)
  - `POST /api/v1/admin/roles/users` (to create a new admin account with name, email, password, role)
* **Reason Why it is Required:** Connects the admin management tab on the Settings page to manage platform operator access. Currently, the dashboard defaults to static local mock lists.

---

## 5. Admin Notifications Feed

### Missing Notifications Feed & Actions
* **Frontend Feature:** Dynamic notifications list in the header popover
* **Missing Endpoints:**
  - `GET /api/v1/admin/notifications` (retrieve alerts list)
  - `PUT /api/v1/admin/notifications/:id/read` (mark notification as read)
  - `POST /api/v1/admin/notifications/mark-all-read` (clear all unread alerts)
  - `DELETE /api/v1/admin/notifications/:id` (delete notification)
* **Reason Why it is Required:** Feeds the dynamic notifications list in the header popover to display real-time active system alerts to platform operators. Currently, the frontend uses static mock values.
