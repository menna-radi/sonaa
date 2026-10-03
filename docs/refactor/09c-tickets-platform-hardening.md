# 09c · Frontend tickets — Phase 5 Platform & shell · Phase 6 Hardening

Same conventions as 09a/09b. Spec: [07](07-spec-platform.md). Utilities available to every ticket in this file:
`node scripts/refactor/hardcoded-strings.mjs [dir]` (probable English literals), `node scripts/refactor/unused-files.mjs` (unreferenced files), `node scripts/ui-audit.mjs <dir>`.

---
## Phase 5 — Settings, platform pages and shell

### T-F070 · Admin team (repository + Team tab)
- repo: frontend
- tier: mid
- depends: T-F003, T-F006
- needs: T-B07
- spec: 07-spec-platform.md
- files: src/domain/entities/AdminMember.ts; src/domain/repositories/TeamRepository.ts; src/data/repositories/ApiTeamRepository.ts; src/data/repositories/MockTeamRepository.ts; src/core/di/DependencyProvider.tsx; src/presentation/features/settings/hooks/useTeam.ts; src/presentation/features/settings/components/TeamTab.tsx; src/presentation/features/settings/components/InviteAdminModal.tsx; src/presentation/features/settings/components/TemporaryPasswordModal.tsx; src/presentation/features/settings/settings.css; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/settings/components/TeamTab.tsx,src/presentation/features/settings/components/InviteAdminModal.tsx,src/presentation/features/settings/components/TemporaryPasswordModal.tsx,src/presentation/features/settings/hooks
- gate: frontend

Implement 07 §1.1. `TeamRepository { list(): Result<AdminMember[] | null>; invite(input): Result<{ id: string; email: string; temporaryPassword?: string }>; setStatus(id, status: 'ACTIVE'|'SUSPENDED', reason?): Result<boolean> }`; Api uses `API_ENDPOINTS.admin.team` (GET/POST), `teamMember(id)+'/status'` (PUT) and treats **404 as `null` = unsupported** (`optional()`); map user rows with `isSelf = id === currentUser.id` (read the current user from `useAuth()` in the hook, not in the repository). `TeamTab`: if `list` is `null` show `EmptyState` (`team_unavailable`); else table with Suspend/Reactivate actions (hidden for self; `confirmWithReason`) and an **Invite admin** button → `InviteAdminModal` (`FormModal` + `validate(newAdminSchema)`). If the invite response has `temporaryPassword` open `TemporaryPasswordModal` (monospace password, Copy button using `navigator.clipboard`, warning `team_temp_password_warning`, closes only via the "I saved it" button). Never generate or hard-code a password in the browser.

### T-F071 · Audit log tab (real data)
- repo: frontend
- tier: mid
- depends: T-F003, T-F006
- needs: T-B08
- spec: 07-spec-platform.md
- files: src/domain/entities/AuditLog.ts; src/domain/repositories/AuditRepository.ts; src/data/repositories/ApiAuditRepository.ts; src/data/repositories/MockAuditRepository.ts; src/core/di/DependencyProvider.tsx; src/presentation/features/settings/hooks/useAuditLogs.ts; src/presentation/features/settings/components/AuditLogsTab.tsx; src/presentation/features/settings/components/AuditDiff.tsx; src/presentation/features/settings/settings.css; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/settings/components/AuditLogsTab.tsx,src/presentation/features/settings/components/AuditDiff.tsx,src/presentation/features/settings/hooks
- gate: frontend

Implement 07 §1.3: `AuditLog { id; action; targetType?: string; targetId?: string; before: unknown; after: unknown; createdAt: string; actorName: string; actorEmail?: string; ipAddress?: string }`; `AuditRepository.getLogs(q:{page,limit,actor?,action?,targetType?,from?,to?,q?}) → Result<{ items; total; filters?: { actions: string[]; targetTypes: string[] }; serverFiltering: boolean }>` (`serverFiltering = 'filters' in response`). Delete the 7 hard-coded rows and the fake refresh timer. `AuditLogsTab`: toolbar (`SearchInput`, action `Select` from `filters.actions` or the loaded page, date range inputs), `DataTable` with server pagination and expandable details (`AuditDiff` shows before/after key/value rows; stringify objects; copy-JSON button), info banner when `!serverFiltering` and any filter is active (`audit_filters_client_only`), CSV export of the current page via `toCsv`. Action label: `t('audit_action_' + action)` when that key exists (use `t(key) !== key`), else the raw code. Add the 20 `audit_action_*` keys listed in 07 §1.3 (en/ar/he).

### T-F072 · Settings shell: Platform, Security, Appearance — remove the fictional tabs
- repo: frontend
- tier: mid
- depends: T-F070, T-F071, T-F036, T-F001
- spec: 07-spec-platform.md
- files: src/presentation/features/settings/pages/SettingsPage.tsx; src/presentation/features/settings/components/PlatformTab.tsx; src/presentation/features/settings/components/SecurityTab.tsx; src/presentation/features/settings/components/AppearanceTab.tsx; src/presentation/features/settings/components/RolesTab.tsx; src/presentation/features/settings/components/RoleMembersDrawer.tsx; src/presentation/features/settings/components/NewAdminModal.tsx; src/presentation/features/settings/components/NotificationsTab.tsx; src/presentation/features/settings/components/PlatformConfigTab.tsx; src/presentation/features/settings/types.ts; src/data/repositories/ApiAuthRepository.ts; src/domain/repositories/AuthRepository.ts; src/data/repositories/MockAuthRepository.ts; src/presentation/features/settings/settings.css; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/settings
- gate: frontend

1. `SettingsPage` (≤ 150 lines): `PageHeader` + `Segmented` tabs `team | platform | audit | security | appearance` (07 §1; remembered in `sessionStorage 'settings_tab'`) rendering `TeamTab`, `PlatformTab`, `AuditLogsTab`, `SecurityTab`, `AppearanceTab`. Remove `INITIAL_ROLES`, local roles state, the Roles/Notifications/PlatformConfig tabs and everything that depended on them. **Delete** `RolesTab.tsx`, `RoleMembersDrawer.tsx`, `NewAdminModal.tsx`, `NotificationsTab.tsx`, `PlatformConfigTab.tsx` and `types.ts` (after `grep` shows no importers).
2. `PlatformTab` per 07 §1.2: auto-verification `Switch` card (query `queryKeys.settings.autoVerification` through `billingRepository.getPlatformSettings()`/`updatePlatformSettings({autoVerifyCraftsmen})` — reuse the billing repository), a read-only billing parameters summary with **Edit in Billing** button (`sessionStorage 'billing_tab'='settings'; navigate('billing')`), and the read-only line "Currency: ILS (₪)".
3. `SecurityTab`: change-password form (`changePasswordSchema`) calling a new `AuthRepository.changePassword(oldPassword, newPassword)` → `POST /auth/change-password` with `currentRefreshToken`; field errors; success toast; clears fields. Remove the old fake security toggles.
4. `AppearanceTab`: keep theme + language controls but strip inline styles/ternary translations; strings via `t()`.
5. `ApiAuthRepository`: delete `getAdmins`/`createAdmin` (and from the interface + mock). Nothing may call `/admin/roles/users` any more.

### T-F073 · Service management (categories, subcategories, fields)
- repo: frontend
- tier: mid
- depends: T-F003, T-F006, T-F001
- needs: T-B21
- spec: 07-spec-platform.md
- files: src/presentation/features/service_management/pages/ServiceManagementPage.tsx; src/presentation/features/service_management/components/CategoriesSection.tsx; src/presentation/features/service_management/components/SubcategoriesSection.tsx; src/presentation/features/service_management/components/FieldsBuilder.tsx; src/presentation/features/service_management/components/ServiceKpis.tsx; src/presentation/features/service_management/components/CategoryFormModal.tsx; src/presentation/features/service_management/components/FieldFormModal.tsx; src/presentation/features/service_management/hooks/useServiceManagement.ts; src/presentation/features/service_management/service_management.css; src/domain/entities/Category.ts; src/domain/repositories/CategoryRepository.ts; src/data/repositories/ApiCategoryRepository.ts; src/data/repositories/MockCategoryRepository.ts; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/service_management
- gate: frontend

Apply 07 §2. Category entity gains `nameHe?`, `taskVolume`, `isActive`; creating/editing uses `CategoryFormModal` (`validate(categorySchema)`, key editable only on create); fields use `FieldFormModal` (`fieldSchema`, options textarea). Subcategory rename/image edit buttons rendered only after a successful probe (`PUT /admin/categories/subcategories/:id` is optional: show the buttons, and on 404 toast `err_not_found` and hide them for the session — keep a module-level flag). Server state via TanStack Query (`queryKeys.categories.all`); keep the existing use-cases if they are used by DI, otherwise call the repository directly from the hook. Words: "Delete" → "Hide" (`categories_hide`). Layout: `PageHeader` + KPI strip + `ui-split` (categories list | detail with subcategories and fields tabs). Each file ≤ 300 lines.

### T-F074 · Broadcast
- repo: frontend
- tier: mid
- depends: T-F003, T-F006, T-F001
- needs: T-B19
- spec: 07-spec-platform.md
- files: src/presentation/features/broadcast/pages/BroadcastPage.tsx; src/presentation/features/broadcast/components/BroadcastComposer.tsx; src/presentation/features/broadcast/components/BroadcastHistoryTable.tsx; src/presentation/features/broadcast/components/BroadcastKpis.tsx; src/presentation/features/broadcast/components/BroadcastPreview.tsx; src/presentation/features/broadcast/hooks/useBroadcast.ts; src/presentation/features/broadcast/broadcast.css; src/domain/repositories/BroadcastRepository.ts; src/data/repositories/ApiBroadcastRepository.ts; src/data/repositories/MockBroadcastRepository.ts; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/broadcast
- gate: frontend

Apply 07 §3. Repository contract: `Audience = 'ALL'|'CUSTOMERS'|'CRAFTSMEN'` end to end (delete the singular/plural mapping tables); `CampaignRecord { id; title; body; audience; targetCity?; imageUrl?; deepLink?; status: 'SENT'|'SCHEDULED'|'CANCELLED'; at: string (ISO sentAt or scheduledAt); recipients: number }` (no `openRate`, no formatted dates). Composer: `validate(broadcastSchema)`, city disabled unless audience = CRAFTSMEN, schedule must be future, recipients estimate via `apiClient.get(API_ENDPOINTS.admin.users, { role, limit: 1 })` → `total` (hide on failure). History: `DataTable` (client pagination 10), status pill (`broadcast` domain), delete with `confirm` (message differs for SCHEDULED). `useBroadcast` → TanStack Query (`queryKeys.broadcasts.list`); no timers. Layout `ui-split`: composer card | preview+history.

### T-F075 · Notifications (admin inbox) — real behaviour only
- repo: frontend
- tier: mid
- depends: T-F003, T-F004
- spec: 07-spec-platform.md
- files: src/presentation/features/notifications/pages/NotificationsPage.tsx; src/presentation/features/notifications/hooks/useNotifications.ts; src/presentation/features/notifications/notifications.css; src/domain/entities/Notification.ts; src/domain/repositories/NotificationRepository.ts; src/data/repositories/ApiNotificationRepository.ts; src/data/repositories/MockNotificationRepository.ts; src/presentation/hooks/useSidebarCounts.ts; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/notifications
- gate: frontend

Apply 07 §4. `NotificationItem { id; type: string; title; body: string; isRead: boolean; createdAt: string; referenceId?: string; entityType?: string; category: 'emergency'|'verification'|'payments'|'reports'|'system' }` with category derived in the mapper; repository: `getNotifications()` (only `GET /notifications`, no broadcast fallback), `markRead(id)`, `markAllRead()`, errors **propagate**. Hook: TanStack Query (`['notifications']`, `refetchInterval 60000`), optimistic mark-read with rollback on error + toast. Remove category subscriptions and `AlertCategory`. Clicking an item marks it read and navigates by `entityType`/`type` (07 §4). Delete-all/delete-one only if the repository already exposes them (do not invent). `useSidebarCounts.notifications` uses the same query data (share the query key; do not refetch separately).

### T-F076 · Chat — message visibility, deep link from Billing
- repo: frontend
- tier: mid
- depends: T-F003, T-F005
- spec: 07-spec-platform.md
- files: src/presentation/features/chat/pages/ChatPage.tsx; src/presentation/features/chat/hooks/useChat.ts; src/presentation/features/chat/components/Composer.tsx; src/presentation/features/chat/components/MessageList.tsx; src/presentation/features/chat/components/MessageBubble.tsx; src/presentation/features/chat/components/ConversationList.tsx; src/presentation/features/chat/components/ThreadHeader.tsx; src/presentation/features/chat/components/NewMessageModal.tsx; src/presentation/features/chat/components/QuickTemplates.tsx; src/presentation/features/chat/chat.css; src/domain/entities/Chat.ts; src/domain/repositories/ChatRepository.ts; src/data/repositories/ApiChatRepository.ts; src/data/repositories/MockChatRepository.ts; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/chat
- gate: frontend

Apply 07 §5: `ChatMessage.visibility?: 'PUBLIC'|'CUSTOMER_PRIVATE'|'CRAFTSMAN_PRIVATE'|'ADMIN_INTERNAL'` (read from the API, default PUBLIC); `ChatRepository.sendMessage(roomId, content, imageUrl?, visibility?)` sends `visibility`; `Composer` shows a compact `Select` (labels `chat_visibility_public|customer_private|craftsman_private|internal`) and a helper line explaining who sees the message; non-public bubbles get class `chat-bubble--private`, a lock icon and a caption. Read `sessionStorage 'chat_open_room'` once on mount (select the room, remove the key). Split `MessageList` (402 lines) → extract `MessageBubble`. Replace any `setInterval` in `useChat` by socket events or TanStack Query `refetchInterval` (foreground only); keep socket.io usage. Clean inline styles/hex/literals.

### T-F077 · Analytics — real timeframe, no fabricated KPIs
- repo: frontend
- tier: mid
- depends: T-F003, T-F005
- needs: T-B18
- spec: 07-spec-platform.md
- files: src/presentation/features/analytics/pages/AnalyticsPage.tsx; src/presentation/features/analytics/hooks/useAnalytics.ts; src/presentation/features/analytics/components/AnalyticsKpis.tsx; src/presentation/features/analytics/components/ZonesCard.tsx; src/presentation/features/analytics/components/PlatformHealthCard.tsx; src/presentation/features/analytics/analytics.css; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/analytics
- gate: frontend

Apply 07 §6. `useAnalytics(timeframe)` → TanStack Query (key `queryKeys.analytics(tf)`), typed response (`interface AnalyticsResponse` — no `any`). Show the 7D/30D/90D `Segmented` only if `response.timeframe` is present. Cards: user growth, active craftsmen, marketplace activity, conversion (use `value`/`rawVal`, never the `change` strings), cohorts chart (`GroupedBarChart`), zones table (hidden unless `response.timeframe` is present — i.e. backend B18 — because the legacy zones are hard-coded), KPI bars excluding `ANALYTICS_FABRICATED_IDS = ['eta_accuracy','refund_rate']` (constant exported from the hook file). Split the 279-line page into the three components. Strings via `t()`.

### T-F078 · Login page validation and error copy
- repo: frontend
- tier: low
- depends: T-F001, T-F002
- spec: 07-spec-platform.md
- files: src/presentation/features/auth/pages/LoginPage.tsx; src/presentation/features/auth/components/LoginBrandPanel.tsx; src/presentation/features/auth/auth.css; src/presentation/context/AuthContext.tsx; src/domain/use_cases/auth/LoginUseCase.ts; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/auth
- gate: frontend

Apply 07 §7. `validate(loginSchema, …)` before calling the use case; show field errors; map `UnauthorizedError`→`login_error_invalid`, `ForbiddenError`→`login_error_forbidden`, `NetworkError`→`err_network`; after a successful login if `user.role !== 'ADMIN'` clear the token (`storageService.clearToken()`), do not set the user, show `login_error_not_admin`. Move all inline styles and the 15 hex colours in `LoginBrandPanel` into `auth.css` using tokens (keep the persistent dark brand panel look by using `--n-950/--n-900/--n-0` tokens). Keep the existing layout and behaviour.

### T-F079 · Sidebar split, navigation config, cheap counts
- repo: frontend
- tier: mid
- depends: T-F054, T-F068, T-F030, T-F075
- needs: T-B10
- spec: 07-spec-platform.md
- files: src/presentation/layouts/navConfig.ts; src/presentation/layouts/Sidebar.tsx; src/presentation/layouts/SidebarNav.tsx; src/presentation/layouts/SidebarFooter.tsx; src/presentation/layouts/MobileBottomTabs.tsx; src/presentation/layouts/Header.tsx; src/presentation/layouts/layouts.css; src/presentation/hooks/useSidebarCounts.ts; src/domain/repositories/CountsRepository.ts; src/data/repositories/ApiCountsRepository.ts; src/data/repositories/MockCountsRepository.ts; src/core/di/DependencyProvider.tsx; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/layouts
- gate: frontend

Apply 07 §8. `navConfig.ts` exports `NAV_SECTIONS: { titleKey: string; items: { pageKey: PageKey; labelKey: string; icon: LucideIcon; badgeKey?: keyof SidebarCounts; live?: boolean }[] }[]` with the five sections of 07 §8. `Sidebar.tsx` ≤ 150 lines composes `SidebarNav` (maps `NAV_SECTIONS`, active state incl. Campaigns aliases, rail mode on tablet with `title` tooltips) and `SidebarFooter` (user, theme, language). `SidebarCounts = { verification; reports; disputes; billing; payments; notifications }`. `CountsRepository.getCounts() → Result<AdminCounts | null>` (`GET /admin/counts`, 404 → `null`); `useSidebarCounts` uses it when available, else the cheap fallbacks (`limit:1` totals) — **no `overview-stats`**, no heavy lists; `refetchInterval 60000`, foreground only. Mobile bottom tabs: Overview, Tasks, Billing, Chat, More with real badges (no hard-coded numbers). `Header.tsx`: move 39 inline styles to `layouts.css`, page-aware search placeholder `search_ph_<page>` (add keys for each page, fallback `search_ph_default`). Remove inline styles/hex from `Sidebar*`/`MobileBottomTabs`.

---
## Phase 6 — Hardening

### T-F090 · i18n sweep (hard-coded strings)
- repo: frontend
- tier: low
- depends: T-F079, T-F077, T-F076, T-F075, T-F074, T-F073, T-F072, T-F069, T-F067, T-F065, T-F063, T-F056, T-F040
- files: src/presentation; src/presentation/context/LanguageContext.tsx
- gate: frontend

Run `node scripts/refactor/hardcoded-strings.mjs src/presentation --limit 400`. For each reported literal that is **user-visible UI text** (ignore false positives such as type names, CSS values, `Promise`), replace it with `t('key')` and add the key to `LanguageContext.tsx` with real en/ar/he text (glossary in README). Components that cannot call hooks (plain functions) receive `t` as a parameter. Work through as many files as you can, most offenders first; **re-run the script at the end and list the remaining count in your final message**. Do not edit Mock repositories, tests, or `AndroidPhoneBannerPreview.tsx`. This ticket does not clean styles (no style audit runs for it).

### T-F091 · Style debt mop-up (hex, inline, `<style>`, `!important` in feature files)
- repo: frontend
- tier: low
- depends: T-F090
- files: src/presentation
- audit: src/presentation/layouts,src/presentation/features,src/presentation/components
- gate: frontend

Run `node scripts/ui-audit.mjs src/presentation` and `node scripts/refactor/gate.mjs --dirs src/presentation/features,src/presentation/layouts,src/presentation/components --max-inline 8`. Fix every reported problem outside files already marked exempt: move inline styles into the feature's `.css` (create it if missing, import it from the page), replace hex/rgb colours by tokens (`--surface-*`, `--text-*`, `--border`, `--success/--danger/--warning/--info`, `--chart-*`, `--n-*`; for overlays use `--backdrop`), delete `<style>` tags by moving their rules to CSS files. In `global.css` only replace **hex colours** by tokens and delete rules that are provably dead (selectors that no `className` references — `grep` each before deleting); do **not** try to remove `!important` from `global.css`. Visual behaviour must not change.

### T-F092 · Modal and Drawer accessibility (focus trap, restore focus, aria)
- repo: frontend
- tier: mid
- depends: T-F006
- files: src/presentation/components/ui/Modal.tsx; src/presentation/components/ui/Drawer.tsx; src/presentation/components/ui/ConfirmDialog.tsx; src/presentation/components/ui/Dropdown.tsx; src/presentation/components/ui/useFocusTrap.ts; src/presentation/components/ui/ui.css
- audit: src/presentation/components/ui
- gate: frontend

Create `useFocusTrap(ref, active)`: on activate remember `document.activeElement`, move focus to the first focusable element (or the container with `tabIndex=-1`), trap `Tab`/`Shift+Tab` inside, restore focus on deactivate. Apply to `Modal` and `Drawer` (`role="dialog" aria-modal="true" aria-labelledby` pointing at the title id generated with `useId`), lock body scroll while open (restore previous overflow), close on Escape (already) and backdrop click. `Dropdown`: arrow-key navigation between items, Escape closes and returns focus to the trigger, `aria-haspopup="menu"`, `aria-expanded`. `ConfirmDialog`: the reason textarea gets `aria-invalid` and `aria-describedby` for its error. Translate the hard-coded "Close dialog" label (`btn_close`). No visual change.

### T-F093 · Remove dead code and finish timers cleanup
- repo: frontend
- tier: low
- depends: T-F091
- files: src
- audit: src/presentation
- gate: frontend

1. Run `node scripts/refactor/unused-files.mjs`. Review each reported `.ts/.tsx` file; delete it when `grep -rn "<basename without extension>" src` shows no real importer (ignore css false positives: `ui.css`, `tokens.css`, `variables.css`, `global.css` are imported through other css/ts entry points — do not delete them; `variables.css` may be deleted only if nothing `@import`s it).
2. `grep -rn "setInterval" src --include=*.ts --include=*.tsx`: every remaining occurrence must be a pure clock/animation in a component **or** inside a `Mock*Repository`. Convert any data-fetching loop left behind to TanStack Query.
3. `grep -rn "window.confirm\|window.alert\|alert(" src` must return nothing.
4. `grep -rn "\bany\b" src/presentation --include=*.tsx -l`: fix the first 10 files by introducing proper types (do not touch generated or mock code).

### T-F094 · Update the integration guides to the new contract
- repo: frontend
- tier: low
- depends: T-F090
- files: docs/README.md; docs/refactor/README.md
- gate: docs

Update `docs/README.md` with a short "Dashboard refactor v2" section linking to `refactor/README.md` and summarising, per area (billing, offers, tasks/disputes, reports, settings, platform), the endpoints used, validation rules and optional-endpoint behaviour as actually implemented (read the code under `src/presentation/features/*`). In `docs/refactor/README.md` fill the status table at the bottom with the tickets that are DONE according to `.refactor-state.json` (read it; do not edit it).

### T-F095 · Final verification report
- repo: frontend
- tier: low
- depends: T-F094, T-F093, T-F092
- files: docs/refactor/REPORT.md
- gate: docs

Run, and paste the (trimmed) outputs into `docs/refactor/REPORT.md` under headings: `npm run build`, `npm run lint`, `node scripts/ui-audit.mjs src/presentation` (totals table), `node scripts/refactor/hardcoded-strings.mjs src/presentation --limit 20`, `node scripts/refactor/unused-files.mjs`, `grep -rn "setInterval" src`, `grep -rn "toLocaleDateString\|toLocaleString" src/presentation` (list the remaining ones), `wc -l` of the 10 largest `.tsx` files. Add a short "Known gaps" list (anything that remains from 01-frontend-gap-analysis.md) and a table of ticket statuses from `.refactor-state.json`. **Do not fix anything in this ticket**; only report.
