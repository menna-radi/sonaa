# 07 · Spec — Settings, audit, categories, broadcasts, notifications, chat, analytics, login, shell

Backend facts: [00](00-backend-deep-dive.md). Standard: [02](02-overview-standard.md). Gaps: S-01…S-11, X-07…X-09.

## 1. Settings (`features/settings`) — "Team & Platform" (tickets F070–F073)

Remove everything fictional: `INITIAL_ROLES`, `TeamRole`, the 20-permission matrix, `RolesTab`, `RoleMembersDrawer`, the fake Security toggles, the Notification-routing tab,
and the fake `PlatformConfigTab` rows. Tabs (`Segmented`, remembered in `sessionStorage 'settings_tab'`):

| Tab | Content | Backend |
|---|---|---|
| **Team** (`settings_tab_team`) | list of admin accounts + invite | `GET/POST /admin/team` (**opt**, B07). If 404 → `EmptyState` "Admin management is not available on this server" and nothing else. |
| **Platform** (`settings_tab_platform`) | the *real* parameters | `GET/PUT /admin/settings`, `/admin/settings/auto-verification` |
| **Audit log** (`settings_tab_audit`) | real audit trail | `GET /admin/audit-logs` |
| **Security** (`settings_tab_security`) | change **my** password | `POST /auth/change-password` |
| **Appearance** (`settings_tab_appearance`) | theme (system/light/dark) + language | local (`ThemeContext`, `LanguageContext`) |

### 1.1 Team tab (opt B07)
Domain `AdminMember { id; name; email; title: string; status: 'ACTIVE'|'SUSPENDED'|'BLOCKED'; createdAt: string; isSelf: boolean }`.
Table: Member (avatar initials), Title, Status pill (`userAccount` domain), Joined, Actions (Suspend / Reactivate — not for self, not for the last active admin; `confirmWithReason`).
**Invite admin** `FormModal` (`newAdminSchema`: firstName, lastName, email, title). `POST /admin/team {firstName,lastName,email,title}` → response `{ id, email, temporaryPassword? }`; if `temporaryPassword` is returned show it **once** in a `Modal` with a copy button and the warning "Share securely. It is not shown again." **Never hard-code or generate a password in the browser.** The old `ApiAuthRepository.getAdmins/createAdmin` are deleted and replaced by `TeamRepository` (`list`, `invite`, `setStatus`).

### 1.2 Platform tab
Cards (each own Save, `validate()` before submit):
* **Craftsman verification** — `Switch` "Auto-verify craftsmen when all 5 steps are complete" ↔ `/admin/settings/auto-verification`. Helper explains: ON = approved on submit; OFF = waits in the queue.
* **Billing parameters** — read-only summary of free tasks + commission rate with a button **Edit in Billing** (`navigate('billing')` with tab settings). No duplicate editing here.
* **Maintenance / SLA / payout schedule / escrow / currency / region** — **removed** (no backend). Show currency as a read-only line "Currency: ILS (₪)".

### 1.3 Audit log tab (ticket F071)
`useAuditLogs({page, limit:20, actor?, action?, targetType?, from?, to?, q?})` → `GET /admin/audit-logs` (params beyond `page/limit` are ignored by today's backend; the UI filters the loaded page client-side for `q`/`action`/`actor` and shows `AlertBanner tone="info"` "Server-side filters need an updated backend" **only when** B08 is not detected — detect by checking whether the response includes the field `ipAddress` on any item or a `filters` key).
Row: Time (`formatDateTime`), Admin (`actor.firstName lastName` + email), Action (human label via `audit_action_<ACTION>` keys, fallback to the raw code in monospace), Target (`targetType` + short id), expandable **Details** that renders `before → after` as a two-column key/value diff (`AuditDiff` component; JSON values stringified, long values truncated with a "Copy JSON" button). IP column only if present. Export current page to CSV (`toCsv`).
Action label keys to add (en/ar/he): `VERIFICATION_DECISION`, `DISPUTE_RESOLVED`, `TASK_FROZEN`, `TASK_UNFROZEN`, `TASK_DISPATCH_BACKUP`, `CRAFTSMAN_SUSPENDED`, `CRAFTSMAN_UNSUSPENDED`, `CRAFTSMAN_BANNED`, `VERIFICATION_ITEM_UPDATED`, `REPORT_MODERATED`, `SETTINGS_CHANGED`, `AUTO_VERIFICATION_SETTING_CHANGED`, `SUBSCRIPTION_REQUEST_APPROVED`, `SUBSCRIPTION_REQUEST_REJECTED`, `COMMISSION_PAYMENT_APPROVED`, `COMMISSION_PAYMENT_REJECTED`, `SUBSCRIBER_CANCELLED`, `SUBSCRIBER_EXTENDED`, `FREE_TASKS_UPDATED`, `BILLING_MODEL_SWITCHED`.

### 1.4 Security tab
Form (`changePasswordSchema` in `ops.ts`: `oldPassword` required; `newPassword` ≥ 8 with a letter and a digit; `confirm` equals) → `POST /auth/change-password { oldPassword, newPassword, currentRefreshToken }` (token from `storageService.getRefreshToken()`). Success toast + clear fields. Error 400 shows the server message via `errorMessage`.

## 2. Service management (`features/service_management`, ticket F074)
* Categories: add **Hebrew name** (`nameHe`) to create/update forms (`categorySchema`); backend ignores unknown today → send anyway (PUT `/categories/:id` accepts `nameHe`; create ignores until B21). Show `taskVolume`. Soft-delete wording: "Hide" (backend only sets `isActive=false`).
* Subcategories: list with image, active toggle, move, delete (hide). Rename/edit image only after B21 (**opt**: button hidden on 404).
* Fields builder: `fieldSchema`; `options` textarea (one per line) required for `select`; show required toggle; delete confirm. Key format `^[a-z][a-zA-Z0-9_]{1,39}$`.
* Standard checklist; `useServiceManagement` already uses use-cases — migrate its server state to TanStack Query keys `queryKeys.categories.all`.

## 3. Broadcast (`features/broadcast`, ticket F075)
* Form via `FormModal`-style card + `broadcastSchema`: Title, Body (counter 500), Audience (`ALL|CUSTOMERS|CRAFTSMEN` — fix the repository to use these exact values both ways; the UI labels stay singular), City (**only enabled for CRAFTSMEN**, backend bug G-17 for customers), Image URL (optional), Deep link (optional), Schedule (datetime-local, must be in the future).
* Live preview card (`BroadcastPreview`) shows notification title/body.
* Recipients estimate: use `GET /admin/users?role=…&limit=1` → `total` (CUSTOMER / CRAFTSMAN / none for ALL = sum) — label "About N recipients". If the call fails, hide the estimate.
* History table: Title, Audience, City, Status (`broadcast` domain: SENT/SCHEDULED/CANCELLED), Sent/Scheduled date (`formatDateTime`), Recipients (`reach`). **Remove the Open-rate column** (not tracked). Actions: Delete (confirm; for SCHEDULED the confirm says "will not be sent"). Pagination client-side (unpaginated endpoint) page size 10.
* `CampaignRecord` loses `openRate`; `sendDate` becomes raw ISO `sentAt|scheduledAt` (formatting in the UI).

## 4. Notifications (`features/notifications`, ticket F076)
This is the **admin's own inbox** (`GET /notifications`), not a broadcast list.
* Remove the fallback that shows broadcast logs; remove `toggleRead` fake item; `markRead`/`markAllRead` errors must surface (toast) and roll back.
* Remove the local "alert category subscriptions" card (no backend). Keep category *filter chips* derived from the notification `type` (`EMERGENCY→emergency`, `VERIFICATION→verification`, `PAYMENT→payments`, `DISPUTE_UPDATED→reports`, `COMMISSION_LOCKED/UNLOCKED→payments`, else `system`).
* Items link to the relevant page by `entityType`/`type`: `subscription|commission→billing`, `task→tasks`, `verification→verification`.
* TanStack Query `refetchInterval:60000`; unread count shared with the sidebar via the same key.

## 5. Chat (`features/chat`, ticket F077)
* Message composer gets a **visibility** control (admin only) — `Segmented`/`Select`: `PUBLIC` (default), `CUSTOMER_PRIVATE`, `CRAFTSMAN_PRIVATE`, `ADMIN_INTERNAL` ("Internal note"). Sent as `visibility` in `POST /chatrooms/:id/messages`. Non-public messages get a tinted bubble + lock icon + label `chat_visibility_*`.
* On mount read `sessionStorage 'chat_open_room'`, select that room, then remove the key (used by Billing → Chat).
* Keep sockets; replace any `setInterval` data polling with the socket or `refetchInterval`.
* Standard checklist (the page is 349 lines + 6 components; keep `MessageList` ≤ 300 by extracting `MessageBubble`).

## 6. Analytics (`features/analytics`, ticket F078)
* `useAnalytics(timeframe)` → TanStack Query (key `queryKeys.analytics(tf)`); `Segmented` 7D/30D/90D is passed as `timeframe` (backend ignores today; show the control only when B18 is deployed — detect by response field `timeframe` echo).
* Render only real blocks: user/craftsmen/task/conversion cards from `value` (not the `change` strings, which are not changes), cohorts chart, zones table (hide when B18 not deployed because zones are hard-coded), KPI bars **except** `eta_accuracy` and `refund_rate` (constants). A constant `ANALYTICS_FABRICATED_IDS = ['eta_accuracy','refund_rate']` filters them out until B18 removes them server-side.

## 7. Login (`features/auth`, ticket F079)
`loginSchema` validation on submit; field errors; button loading; map `UnauthorizedError` → `login_error_invalid` ("Wrong email or password"), `ForbiddenError` → `login_error_forbidden`, network → `err_network`; reject sign-in when `user.role !== 'ADMIN'` with `login_error_not_admin` and clear the token. `LoginBrandPanel` (15 hex): tokens only. Keep persistent dark brand panel.

## 8. Shell, navigation, counts (ticket F078/F080)
* Sidebar sections: **Operations** (Overview, Live activity) · **Manage** (Craftsmen, Tasks & Disputes, Verification, Reports, Users, Chat) · **Money** (Billing, Payouts & Revenue) · **Growth** (Offers & Banners, Campaigns, Broadcast) · **System** (Service management, Analytics, Notifications, Settings). Sidebar.tsx (826 lines) is split: `SidebarNav.tsx` (data-driven from `NAV_SECTIONS` in `layouts/navConfig.ts`), `SidebarFooter.tsx` (user, theme, language), `Sidebar.tsx` (shell ≤ 150 lines).
* Badges: verification (queue count), reports (pending), tasks (open disputes), billing (pending receipts + pending commission receipts), payouts (pending withdrawals), notifications (unread).
* `useSidebarCounts` calls `GET /admin/counts` when available (**opt B10**) else falls back to **cheap** count queries (`limit=1` and `total`/`queueCount`) — never `overview-stats`. Interval 60 s, foreground only.
* Mobile bottom tabs: Overview, Tasks, Billing (badge), Chat, More.
* Header search: unchanged behaviour (sets `searchQuery`) but placeholder is page-aware (`search_ph_<page>`).

## 9. Cross-cutting cleanups (ticket F090+)
1. Replace remaining `setInterval` data loops (`useChat`, `useLiveActivity`, `useMetrics`, `useTasks`, `usePayments`) — only clocks may keep timers.
2. Delete dead files after migration: `useMetrics.ts` (unused), `MockLiveActivityRepository` timers, `INITIAL_*` fixtures that are not used by Mock repos.
3. `ErrorBoundary` strings translated.
4. `docs/README.md` updated (ticket F094).
