# Profile, settings & account

## 1. Backend contract

| Endpoint | Body / notes |
|---|---|
| `GET /profile?role=CUSTOMER\|CRAFTSMAN` | profile for the role (craftsman adds metrics, see craftsman guide) |
| `PUT /profile?role=…` | customer: `{ firstName?, lastName?, email?, avatarUrl?, emergencyContacts? }`; craftsman: `{ firstName?, lastName?, email?, avatarUrl?, title?, locationCity?, locationLat?, locationLng? }` (anything else, e.g. rating, is ignored) |
| `PUT /profile/location` | `{ latitude, longitude, address? }` |
| `GET /settings`, `PUT /settings` | `{ language?: ar\|en\|he, theme?: light\|dark\|system, notificationsEnabled?, chatNotifications?, taskNotifications?, marketingNotifications? }` |
| `GET /profile/blocked`, `POST /profile/blocked` | toggle block `{ targetUserId }` |
| `POST /profile/download-data` | GDPR export request |
| `DELETE /profile` | account deletion |
| `POST /profile/feedback` | `{ message }` (10–2000 chars) — app feedback |

## 2. Rules
- **No password / change-password UI** (OTP-only login). The backend route exists but is not used.
- Changing the name must update: server, the cached session user (`AuthLocalDataSource`), and the live home
  greeting (`CustomerHomeCubit.updateUserName`) — otherwise home shows the old name until rebuild.
- Craftsman "main trade" list comes from `GET /tasks/categories` (dashboard-managed); the stored value is the
  English category name; current value is always shown even if retired. Changing the trade **does not** change
  job matching (matching uses verification skills) — product decision pending.

## 3. Flows
**Edit profile**: prefill from state → edit → avatar upload (public) → `PUT /profile` → update state + session
user + home → pop with success.
**Language**: update `AppSettingsCubit` immediately (locale + RTL) → `PUT /settings` in background → revert on failure.
**Theme**: local only + synced.
**Delete account**: confirmation sheet explaining consequences → `DELETE /profile` → logout + clear everything.

## 4. Caching
Settings local (source of truth) and synced; profile re-fetched on screen open.

## 5. Test checklist
- [ ] Rename → home greeting updates immediately.
- [ ] Language switch flips RTL and persists across restart.
- [ ] Light/dark: language card and all profile sections readable.
- [ ] No change-password entry in customer or craftsman settings.
