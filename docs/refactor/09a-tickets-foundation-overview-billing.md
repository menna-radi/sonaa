# 09a · Frontend tickets — Phase 0 foundation · Phase 1 Overview standard · Phase 2 Billing & Payments

Repo: `D:\Mohamed Ali\Arox App\Arox-front-end` (React 19 + TS + Vite, TanStack Query, axios). Track **F**.
Read first, always: [README](README.md) (rules), [02 standard](02-overview-standard.md), [03 data contract](03-data-contract.md).
Gate for every ticket (automatic): `npm run build` · `npm run lint` · `node scripts/refactor/gate.mjs --dirs <audit>` (inline styles ≤ 6 per file, no hex, no `<style>`, no `setInterval`, no `any`, i18n complete en/ar/he for every key you add or use, no undefined CSS variable).
Ticket fields: `tier` (low = Haiku-class, mid = Sonnet-class) · `depends` (must be DONE first) · `needs` (backend ticket that improves the feature; **optional** — never block on it) · `spec` (extra docs to read) · `files` (the only files you may touch; creating new files inside the listed folders is allowed) · `audit` (folders checked by the gate).

---
## Phase 0 — Foundation

### T-F001 · Install zod and create the validation module
- repo: frontend
- tier: low
- spec: 03-data-contract.md
- files: package.json; package-lock.json; src/domain/validation/index.ts; src/domain/validation/common.ts; src/domain/validation/billing.ts; src/domain/validation/offers.ts; src/domain/validation/ops.ts
- audit: src/domain/validation
- gate: frontend

1. Run `npm install zod@^3.23.8` (exactly v3).
2. Create the five files **verbatim from 03 §7** (`index.ts` = the `validate/tError/FieldErrors` helper; `common.ts`; `billing.ts`; `offers.ts`; `ops.ts`).
3. Append to `ops.ts`: `export const changePasswordSchema = z.object({ oldPassword: z.string().min(1,'val_required'), newPassword: z.string().min(8,'val_min_len|8').regex(/[A-Za-z]/,'val_letter').regex(/[0-9]/,'val_digit'), confirm: z.string() }).refine(v => v.newPassword === v.confirm, { path:['confirm'], message:'val_match' });`
4. Add i18n entries (en/ar/he) for **every** key in 03 §7 "Validation i18n keys" plus `val_letter` ("Must contain a letter"), `val_digit` ("Must contain a digit"), `val_match` ("Passwords do not match"). The `{n}` placeholder stays literally in all three languages.
5. Done when: `npm run build` passes and `validate(planSchema, {...})` type-checks.

### T-F002 · API client error fidelity, error messages, endpoint constants
- repo: frontend
- tier: mid
- depends: T-F001
- spec: 03-data-contract.md
- files: src/core/errors/AppError.ts; src/core/errors/errorMessage.ts; src/core/network/apiClient.ts; src/core/config/apiEndpoints.ts; src/presentation/context/LanguageContext.tsx
- audit: src/core
- gate: frontend

Implement 03 §2, §3 and §9 exactly:
1. `AppError`: add `backendCode?`, `status?`, `ConflictError`, `BadRequestError`.
2. `apiClient.handleError`: new status switch (400/401/403/404/409/default) filling `backendCode` and `status`; keep the existing 401 side effects and the refresh-token interceptor untouched. Add `patch<T>(url, data?)`; make `delete<T>(url, params?)` forward params.
3. Create `errorMessage.ts` (03 §3) and add all `err_*` i18n keys (en/ar/he).
4. `apiEndpoints.ts`: add the constants from 03 §9 inside `admin`; **delete** the `metrics` block's fake routes except none are used — before deleting, `grep -rn "API_ENDPOINTS.metrics" src`; if a usage exists, replace it with the matching `API_ENDPOINTS.admin.*` constant.
5. `ErrorToastMapper` keeps working; add cases for `CONFLICT_ERROR` and `BAD_REQUEST_ERROR` returning `error.message`.

### T-F003 · Query helpers, formatters, CSV util
- repo: frontend
- tier: low
- depends: T-F002
- spec: 03-data-contract.md
- files: src/core/query/unwrap.ts; src/core/query/queryKeys.ts; src/core/query/useAdminMutation.ts; src/data/mappers/pageMapper.ts; src/data/repositories/optional.ts; src/core/utils/format.ts; src/core/utils/csv.ts
- audit: src/core
- gate: frontend

Create the files from 03 §4 and §8 verbatim. In `format.ts` implement `formatDate`, `formatDateTime`, `formatDuration`, `formatPercentValue`, `formatCompact` as described (return `'—'` for null/NaN/invalid dates). `csv.ts`: `toCsv(rows)` (quote every cell, double inner quotes, join `\r\n`, prefix `\uFEFF`) and `downloadCsv(filename, csv)` (Blob + temporary `<a download>`). Also set `QueryClient` defaults in `src/App.tsx`: `staleTime: 30_000`, `refetchOnWindowFocus: false`, `retry: (n, e) => n < 1 && !(e instanceof Error && (e as {status?:number}).status && [400,401,403,404,409].includes((e as {status?:number}).status!))`.

### T-F004 · Status domains and translatable ErrorState/EmptyState
- repo: frontend
- tier: low
- depends: T-F001
- spec: 03-data-contract.md
- files: src/presentation/components/ui/status.ts; src/presentation/components/ui/EmptyState.tsx; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/components/ui
- gate: frontend

1. `status.ts`: extend `StatusDomain` and `pillVariantFor` exactly per 03 §6 (including the **replacement** task mapping). Keep exported names.
2. Add i18n keys `status_<lowercase>` (en/ar/he) for every status named in 03 §6 that does not already exist (check with grep first): pending_verification, approved, rejected, cancelled, under_investigation, dismissed, resolved, scheduled, ended, paused, sent, failed, completed, suspended, blocked, active, expired, locked, free, commission, subscription, accepted, pre_chat_pending, chat_open, agreement_pending, in_progress, work_submitted, rating_pending, closed, disputed, frozen.
3. `ErrorState`: add optional props `retryLabel?: string`; default title/message/retry text come from `useLanguage()` keys `err_generic_title` ("Something went wrong"), `err_generic` and `btn_retry` (add keys). `EmptyState` unchanged.

### T-F005 · Layout primitives and CSS variable hygiene
- repo: frontend
- tier: low
- depends: T-F004
- spec: 02-overview-standard.md
- files: src/presentation/components/ui/ui.css; src/presentation/styles/tokens.css
- audit: src/presentation/components/ui
- gate: frontend

1. Append the full CSS block of **02 §2** to `ui.css` (do not rewrite existing rules).
2. Run `grep -rhoE "var\(--[a-zA-Z0-9_-]+\)" src | sort | uniq -c | sort -rn` and compare with variables defined in `tokens.css`/`ui.css`/`global.css`. For every **undefined** variable add a compatibility alias at the end of the `:root` block in `tokens.css` mapped to the closest existing token, e.g. `--primary: var(--n-900); --on-surface: var(--text-strong); --on-surface-subtle: var(--text-muted); --text-sm: var(--fs-small); --font-xs: var(--fs-micro); --r-lg: var(--radius-lg); --r-md: var(--radius-md); --r-sm: var(--radius-sm);` (extend with whatever else the grep finds). Dark-mode needs no extra work because aliases point at tokens.
3. Do **not** edit any `.tsx` here.

### T-F006 · FormModal, KeyValueList and ProofViewer primitives
- repo: frontend
- tier: mid
- depends: T-F001, T-F004, T-F005
- spec: 02-overview-standard.md
- files: src/presentation/components/ui/FormModal.tsx; src/presentation/components/ui/KeyValueList.tsx; src/presentation/components/ui/ProofViewer.tsx; src/presentation/components/ui/index.ts; src/presentation/components/ui/ui.css
- audit: src/presentation/components/ui
- gate: frontend

1. `FormModal` props: `{ isOpen, onClose, title, onSubmit: () => void | Promise<void>, submitLabel?, cancelLabel?, pending?, size?, submitDisabled?, children }`. Wraps `Modal`; body is `<form noValidate onSubmit={e => { e.preventDefault(); onSubmit(); }}>`; footer has Cancel (outline) and Submit (primary, `loading={pending}`); Enter submits; closes on Escape (via Modal) unless `pending`. Default labels from `t('btn_cancel')`, `t('btn_save')` (add keys if missing).
2. `KeyValueList` props `{ items: { label: React.ReactNode; value: React.ReactNode }[] ; columns?: 1|2 }` rendering `<dl className="ui-kv">` with CSS (`.ui-kv`, `.ui-kv__row`, `.ui-kv dt` muted caption, `dd` strong) appended to `ui.css`.
3. `ProofViewer` props `{ src?: string | null; alt: string; size?: number }`: renders a `size`×`size` (default 48) rounded thumbnail `<button>` (aria-label = alt) using `resolveMediaUrl`, `loading="lazy"`, falls back to an `ImageOff` icon on error or empty `src`, opens `ImageLightbox` on click. Class names `ui-proof`, `ui-proof__img` in `ui.css`.
4. Export all three from `components/ui/index.ts`. Also export `ImageLightbox` from there if it is not already (it currently lives in `Modal.tsx`? check with grep and re-export).

---
## Phase 1 — Overview as the standard

### T-F010 · Overview normalisation (the reference page)
- repo: frontend
- tier: mid
- depends: T-F003, T-F004, T-F005
- spec: 02-overview-standard.md
- files: src/presentation/features/dashboard/pages/DashboardPage.tsx; src/presentation/features/dashboard/pages/OverviewPage.tsx; src/presentation/features/dashboard/components/MetricsGrid.tsx; src/presentation/features/dashboard/components/RevenueChart.tsx; src/presentation/features/dashboard/components/TopCategories.tsx; src/presentation/features/dashboard/components/CohortVelocity.tsx; src/presentation/features/dashboard/components/PendingReports.tsx; src/presentation/features/dashboard/components/PendingDisputes.tsx; src/presentation/features/dashboard/components/ModeratorReview.tsx; src/presentation/features/dashboard/hooks/useDashboard.ts; src/presentation/features/dashboard/dashboard.css; src/presentation/layouts/AppShell.tsx; src/presentation/context/LanguageContext.tsx; src/domain/repositories/MetricRepository.ts; src/data/repositories/ApiMetricRepository.ts
- audit: src/presentation/features/dashboard
- gate: frontend

Execute **02 §6 items 1, 2, 3, 5, 6, 7, 9** (item 4 range control and item 8 billing row are separate tickets):
1. Move `OverviewPage` to `pages/OverviewPage.tsx`; `DashboardPage.tsx` keeps router + `PageErrorBoundary` (translate its two strings: `page_failed_title`, `page_failed_body`, button `btn_retry`).
2. Create `dashboard.css` (imported by `OverviewPage.tsx`) for the feature-specific classes (`.ov-rail`, `.ov-rail__card`, `.ov-revenue-stats`, `.ov-category-row`, …). Replace **all** inline layout styles with these or the `ui-*` primitives. Remaining inline styles allowed only for runtime values (e.g. `width: ${pct}%`).
3. `AppShell.tsx`: replace the `<main style={{…}}>` with class `ui-shell__content` rules in `ui.css`/`dashboard.css`? → put them in `ui.css` (`.ui-shell__content { max-width: var(--content-max); margin: 0 auto; width: 100%; padding: var(--page-pad); box-sizing: border-box; }` and a mobile override `padding: var(--sp-4)` below 768px if one is not already present).
4. Replace every English literal listed in 02 §6.3 with `t()` keys (en/ar/he). `PageErrorBoundary`, the error `AlertBanner`, `RevenueChart`, `TopCategories` ("tasks" → `t('unit_tasks')`; "View all categories" → `t('view_all')`), `ModeratorReview`.
5. `RevenueChart`: remove its own `useEffect` fetch and `useDependencies`; props become `{ analytics?: RevenueAnalytics | null; summary?: PaymentSummary | null }`. `OverviewPage` obtains the payment summary through a new query in `useDashboard` (`queryKey ['dashboard','paymentSummary']`, `repositories.paymentRepository.getPaymentSummary()`; failure ⇒ `null`). GMV formatted with `formatMoney`. Delete the dead "Last 30 days" pill and the "Last 7 days" button (range comes in T-F011).
6. Rename `PendingReports` → `PendingDisputes` (file + export). Data source unchanged (`reports` from `useDashboard` — keep the field name `reports` in the hook to limit churn, but label the UI "Pending disputes": keys `sec_pending_disputes`, `empty_pending_disputes`). Row click → `sessionStorage.setItem('tasks_tab','disputes'); navigate('tasks')`. Time label: if `report.createdAt` exists (extend `PendingReport` type with optional `createdAt?: string`, mapped from `d.createdAt` in `ApiMetricRepository.getPendingReports`) show `formatRelativeTime`, else `—`. Delete the `report_*` icon switch; use one `Scale` icon, tone `warning`. Keep `PendingReports.tsx` deleted (no re-export).
7. `ModeratorReview`: classes only; "Open queue (N)" via `t('open_queue')`.
8. Move all dashboard-specific English `title`/`aria-label` strings to keys.
9. Do not change query keys other than adding the summary query. Keep `exportOverviewPdf` behaviour.

### T-F011 · Overview: range control and billing snapshot (optional backend data)
- repo: frontend
- tier: mid
- depends: T-F010
- needs: T-B09
- spec: 02-overview-standard.md; 04-spec-billing.md
- files: src/presentation/features/dashboard/pages/OverviewPage.tsx; src/presentation/features/dashboard/hooks/useDashboard.ts; src/presentation/features/dashboard/components/BillingSnapshot.tsx; src/presentation/features/dashboard/dashboard.css; src/domain/repositories/MetricRepository.ts; src/data/repositories/ApiMetricRepository.ts; src/domain/use_cases/dashboard/GetDashboardMetricsUseCase.ts; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/dashboard
- gate: frontend

1. `MetricRepository.getRevenueAnalytics(range)` and the use case accept `range: '7d'|'30d'|'90d'` (default `'30d'`); `ApiMetricRepository` requests `/admin/overview-stats?range=${range}` and maps `chartData[].date` (ISO or legacy string) and optional `analytics.deltas`, `billing` block, `pendingDisputesCount`. If the response lacks `analytics.range`/`billing` the new UI bits stay hidden.
2. `useDashboard(range)` — query key `queryKeys.dashboard.overview(range)`; `OverviewPage` keeps `range` state (default `'30d'`) in `sessionStorage 'overview_range'`. Render a `Segmented` (7D/30D/90D, keys `range_7d|30d|90d`) in `PageHeader.actions` **only when** the last response contained `analytics.range` (set by B09). KPI `delta` props use `deltas.users|tasks|revenue` when present.
3. `BillingSnapshot` component: `ui-kpi-grid ui-kpi-grid--4` of four `KpiCard`s (pending receipts, commission due `formatMoney`, locked craftsmen `tone="danger"` when > 0, pending withdrawals). Clicks: receipts/commission/locked → `sessionStorage 'billing_tab'` (`receipts`/`commission`/`subscribers`) + `navigate('billing')`; withdrawals → `navigate('payments')`. Rendered only when `billing` exists.
4. Keys: `range_7d`, `range_30d`, `range_90d`, `overview_billing_title`, `billing_kpi_pending_receipts`, `billing_kpi_commission_due`, `billing_kpi_locked`, `payments_kpi_pending_withdrawals`.
5. NOTE: `navigate('billing')` needs the page key from T-F030; use `navigate('billing' as PageKey)` is **not** allowed — if `'billing'` is not yet in `PageKey`, add `'billing'` to the union and `VALID_PAGES` in `NavigationContext.tsx` (T-F030 will reuse it).

---
## Phase 2 — Billing (subscriptions + commission + free tasks) and Payments

### T-F020 · Billing domain types and repository interface
- repo: frontend
- tier: low
- depends: T-F003
- spec: 03-data-contract.md
- files: src/domain/entities/Billing.ts; src/domain/repositories/BillingRepository.ts
- audit: src/domain
- gate: frontend

Create both files verbatim from 03 §5. No other changes.

### T-F021 · ApiBillingRepository
- repo: frontend
- tier: mid
- depends: T-F020, T-F002, T-F003
- spec: 03-data-contract.md
- files: src/data/repositories/ApiBillingRepository.ts; src/data/mappers/BillingMapper.ts
- audit: src/data
- gate: frontend

Implement `ApiBillingRepository implements BillingRepository` following the **"Mapping rules for ApiBillingRepository" table in 03 §5** line by line. Put the raw→domain mapping functions (`mapPlan`, `mapRequest`, `mapSubscriber`, `mapCommissionPayment`, `mapLedger`) in `BillingMapper.ts` with typed raw interfaces (no `any`; use `unknown` + narrow, or small `interface RawX`). Every method wraps in try/catch returning `fail(error as AppError)`. Optional endpoints use `optional()` from `optional.ts` (404 → `ok(null)`). `getRequests`/`getSubscribers`/`getCommissionPayments` use `toPage(...)`; they pass `page`, `limit`, `q`, `status`, `filter` query params **and** also filter on the client (so both legacy and paginated backends behave the same — `toPage` only filters when the payload is an array).

### T-F022 · MockBillingRepository and DI registration
- repo: frontend
- tier: low
- depends: T-F021
- files: src/data/repositories/MockBillingRepository.ts; src/core/di/DependencyProvider.tsx
- audit: src/data
- gate: frontend

1. `MockBillingRepository`: in-memory arrays (3 plans, 4 requests with mixed statuses, 6 subscribers, 3 commission payments, 5 ledger rows, Bit settings, platform settings `{3, 0.08, true}`); every method resolves after `await new Promise(r => setTimeout(r, 200))` and mutates the arrays (approve → status APPROVED, etc.). Use `toPage` semantics manually (slice).
2. `DependencyProvider.tsx`: import both repos, add `billingRepository: BillingRepository` to `Repositories`, instantiate singletons, wire `isApiMode ? api : mock`.

### T-F023 · Billing query hooks
- repo: frontend
- tier: mid
- depends: T-F022, T-F003, T-F006
- spec: 04-spec-billing.md
- files: src/presentation/features/billing/hooks/useBilling.ts
- audit: src/presentation/features/billing
- gate: frontend

Create `useBilling.ts` exporting typed hooks (all use `useDependencies().repositories.billingRepository`, `unwrap`, `queryKeys.billing.*`):
`useBillingSummary()` (tries `getSummary()`; when it returns `null` derive from `useRequests({status:'PENDING_VERIFICATION',page:1,limit:1}).total`, `useCommissionPayments({status:'PENDING',…limit:1}).total`, `useSubscribers({filter:'locked',…limit:1}).total`; return `{ pendingReceipts, pendingCommissionPayments, lockedCraftsmen, commissionDueTotal: number|null, loading }`), `usePlans()`, `useRequests(q)`, `useSubscribers(q)`, `useCommissionPayments(q)`, `useCommissionLedger(q)` (`staleTime: Infinity` when result is `null`), `useBitSettings()`, `usePlatformSettings()`; and mutations built with `useAdminMutation`: `useApproveRequest`, `useRejectRequest`, `useExtendSubscriber`, `useCancelSubscriber`, `useSetFreeTasks`, `useApproveCommission`, `useRejectCommission`, `useSavePlan` (create when no id), `useDeletePlan`, `useTogglePlanActive`, `useSaveBitSettings`, `useSavePlatformSettings`. Success keys per 04 §4; invalidate `queryKeys.billing.all` and `queryKeys.counts`. Visible-tab polling: every list hook accepts `{ enabled?: boolean }` and uses `refetchInterval: 30000, refetchIntervalInBackground: false`.

### T-F030 · Billing page shell, navigation and KPI strip
- repo: frontend
- tier: mid
- depends: T-F023, T-F005
- spec: 04-spec-billing.md
- files: src/presentation/features/billing/pages/BillingPage.tsx; src/presentation/features/billing/components/BillingKpis.tsx; src/presentation/features/billing/billing.css; src/presentation/context/NavigationContext.tsx; src/presentation/features/dashboard/pages/DashboardPage.tsx; src/presentation/layouts/Sidebar.tsx; src/presentation/layouts/MobileBottomTabs.tsx; src/presentation/hooks/useSidebarCounts.ts; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/billing
- gate: frontend

1. Add `'billing'` to `PageKey` + `VALID_PAGES` (if T-F011 did not already). `DashboardPage` renders `<BillingPage />` for it (lazy not needed).
2. `Sidebar.tsx`: add section `sec_money` with items Billing (`Receipt` icon, badge = `counts.billing`) and Payments (move the existing payments item here; relabel `nav_payments` → "Payouts & Revenue"). Do **not** restructure the rest of the sidebar (T-F079 does that). `MobileBottomTabs`: add the Billing entry in the "More" list.
3. `useSidebarCounts`: add `billing` = pending subscription receipts + pending commission receipts (use `billingRepository.getRequests({status:'PENDING_VERIFICATION',page:1,limit:1})` and `getCommissionPayments({status:'PENDING',…})` totals); `payments` becomes pending **withdrawals** count (`paymentRepository.getWithdrawalRequests` pending count if available — leave the existing implementation if the PaymentRepository is not yet refactored, and note it).
4. `BillingPage`: `PageHeader` (title/subtitle/meta/Refresh), `BillingKpis` (04 §2.2), `Segmented` tabs (04 §2.3) persisted in `sessionStorage 'billing_tab'`, and a switch rendering placeholder `EmptyState`s for tabs whose components are built in later tickets (`ReceiptsTab` etc. imported lazily from files that do not exist yet are **not** allowed — render `<EmptyState title={t('coming_soon')} />` per tab for now).
5. Add keys `nav_billing`, `sec_money`, `billing_title`, `billing_subtitle`, `billing_tab_*`, `billing_kpi_*`, `coming_soon`, `updated`, `btn_refresh`.

### T-F031 · Receipts tab (subscription requests)
- repo: frontend
- tier: mid
- depends: T-F030, T-F006
- spec: 04-spec-billing.md
- files: src/presentation/features/billing/components/ReceiptsTab.tsx; src/presentation/features/billing/components/ReceiptRow.tsx; src/presentation/features/billing/pages/BillingPage.tsx; src/presentation/features/billing/billing.css; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/billing
- gate: frontend

Implement the **Receipts tab** exactly as 04 §2.3 "Receipts tab". Details: status filter `Segmented` with counts (pending count from the KPI query), search debounced 300 ms, `DataTable` with server pagination (`limit 20`), `mobile` renderer = `ReceiptRow`. Approve → `confirm`; Reject → `confirmWithReason({requireReason:true})` and re-validate with `validate(rejectReasonSchema, {reason})` (show toast `val_min_len` message if invalid); on `COMMISSION_DEBT_UNSETTLED` show `AlertBanner tone="warning"` above the table with a button "Open commission" (sets `sessionStorage 'billing_tab'='commission'` and `billing_search` = craftsman name, then switches tab). "Chat" button as specified. Wire into `BillingPage`. Keys per 04 §4.

### T-F032 · Commission tab — receipts queue and details drawer
- repo: frontend
- tier: mid
- depends: T-F031
- spec: 04-spec-billing.md
- files: src/presentation/features/billing/components/CommissionTab.tsx; src/presentation/features/billing/components/CommissionPaymentsTable.tsx; src/presentation/features/billing/components/CommissionPaymentDrawer.tsx; src/presentation/features/billing/pages/BillingPage.tsx; src/presentation/features/billing/billing.css; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/billing
- gate: frontend

Implement 04 §2.3 "Commission tab" **payments part** (inner `Segmented` Receipts | Ledger; the Ledger segment is rendered only when `useCommissionLedger` returned non-null — the ledger table itself is T-F033, render `null` placeholder for now). Approve toast depends on `result.unlocked`. Reject requires reason. Drawer uses `Drawer`, `KeyValueList`, `ProofViewer` large (size 160). Handle 409 → `err_conflict` + refetch. Honour `sessionStorage 'billing_search'` as initial search.

### T-F033 · Commission ledger table
- repo: frontend
- tier: low
- depends: T-F032
- needs: T-B05
- spec: 04-spec-billing.md
- files: src/presentation/features/billing/components/LedgerTable.tsx; src/presentation/features/billing/components/CommissionTab.tsx; src/presentation/features/billing/components/CommissionPaymentDrawer.tsx; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/billing
- gate: frontend

Build `LedgerTable` (04 §2.3 ledger part) and plug it into the Ledger segment; in the drawer list the receipt's linked ledger entries when `getCommissionPayments` provides `ledgerEntries` (extend `CommissionPayment` with optional `ledgerEntries?: { id: string; taskDisplayId?: string; amount: number }[]` and map it in `BillingMapper` when present). Show totals (`due`, `paid`) above the table when the response provides `totals`.

### T-F034 · Subscribers tab with extend / free-tasks / cancel
- repo: frontend
- tier: mid
- depends: T-F031
- spec: 04-spec-billing.md
- files: src/presentation/features/billing/components/SubscribersTab.tsx; src/presentation/features/billing/components/SubscriberActions.tsx; src/presentation/features/billing/components/ExtendModal.tsx; src/presentation/features/billing/components/FreeTasksModal.tsx; src/presentation/features/billing/pages/BillingPage.tsx; src/presentation/features/billing/billing.css; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/billing
- gate: frontend

Implement 04 §2.3 "Subscribers tab". `ExtendModal`/`FreeTasksModal` use `FormModal` + `validate(extendDaysSchema|freeTasksSchema, …)`; field errors via `tError`; show server `details` through `fieldErrorsFrom`. Preset chips for days. The "total free tasks" caption uses `usePlatformSettings().data?.freeTasksCount`. Dropdown actions respect disabled states (cancel only when ACTIVE). Mobile card renderer shows pills + actions button.

### T-F035 · Plans tab
- repo: frontend
- tier: mid
- depends: T-F031
- spec: 04-spec-billing.md
- files: src/presentation/features/billing/components/PlansTab.tsx; src/presentation/features/billing/components/PlanCard.tsx; src/presentation/features/billing/components/PlanFormModal.tsx; src/presentation/features/billing/pages/BillingPage.tsx; src/presentation/features/billing/billing.css; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/billing
- gate: frontend

Implement 04 §2.3 "Plans tab": grid, create/edit modal with `planSchema` (convert textarea lines ↔ arrays; key uppercase, disabled when editing), live preview, activate/deactivate (`useTogglePlanActive`), delete with confirm (explain deactivate alternative; map failures to `err_plan_in_use`). Price shown with `formatMoney`; per-month hint `formatMoney(price / durationMonths)`.

### T-F036 · Billing settings tab (Bit details, free tasks, commission rate)
- repo: frontend
- tier: mid
- depends: T-F031
- spec: 04-spec-billing.md; 03-data-contract.md
- files: src/presentation/features/billing/components/BillingSettingsTab.tsx; src/presentation/features/billing/components/BitSettingsCard.tsx; src/presentation/features/billing/components/RatesCard.tsx; src/presentation/features/billing/components/BitPreview.tsx; src/presentation/features/billing/pages/BillingPage.tsx; src/presentation/features/billing/billing.css; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/billing
- gate: frontend

Implement 04 §2.3 "Settings tab": three cards with dirty tracking (compare to the loaded values), validation (`bitSettingsSchema`, `platformSettingsSchema` + `percentToFraction`), disabled Save when pristine/invalid/pending, live commission example, `BitPreview`. Errors from `errorMessage`. Never submit when the percent is outside 0.1–50.

### T-F038 · PaymentRepository refactor (payouts only)
- repo: frontend
- tier: mid
- depends: T-F036
- spec: 04-spec-billing.md
- files: src/domain/entities/Payment.ts; src/domain/repositories/PaymentRepository.ts; src/data/repositories/ApiPaymentRepository.ts; src/data/repositories/MockPaymentRepository.ts; src/presentation/hooks/useSidebarCounts.ts
- audit: src/data
- gate: frontend

Apply 04 §3 "Domain changes": new `WithdrawalRequest`, `WithdrawalQuery = { status: 'PENDING'|'COMPLETED'|'FAILED'|'ALL'; page: number; limit: number }`, `PaymentRepository` with only `getPaymentSummary()`, `getWithdrawals(q): Promise<Result<Page<WithdrawalRequest>>>`, `approveWithdrawal(id)`, `rejectWithdrawal(id)`, `retryWithdrawal(id)`; `PaymentSummary` keeps its fields (all optional deltas `number | null`, plus `pendingPayouts`, `pendingCraftsmenCount`, `mrr` mapped from the response with `?? 0`/`null`; **no invented `0` for deltas — use `null`**). Remove every subscription/Bit/plan/subscriber method and the `Subscriber`, `SubscriptionRequestItem`, `SubscriptionPlan`, `FailedTransaction` types **after** `grep -rn` shows no remaining users (BitSubscriptionManager still uses them until T-F040 — so in this ticket, **keep a deprecated re-export** `export type { … }` of the old subscription types in `PaymentRepository.ts` and keep the old methods on the Api/Mock classes marked `/** @deprecated removed in T-F040 */`). Map withdrawals: `method = payoutAccount.bankName ?? payoutAccount.type ?? ''`, add `mobileNumber` when type is a wallet; keep dates raw. `useSidebarCounts.payments` = pending withdrawals `total` via `getWithdrawals({status:'PENDING',page:1,limit:1})`.

### T-F039 · Payments page rewrite (payouts & revenue)
- repo: frontend
- tier: mid
- depends: T-F038, T-F010
- spec: 04-spec-billing.md
- files: src/presentation/features/payments/pages/PaymentsPage.tsx; src/presentation/features/payments/hooks/usePayments.ts; src/presentation/features/payments/components/PaymentsKpis.tsx; src/presentation/features/payments/components/PayoutsTable.tsx; src/presentation/features/payments/payments.css; src/presentation/context/LanguageContext.tsx; src/presentation/features/dashboard/components/RevenueChart.tsx
- audit: src/presentation/features/payments
- gate: frontend

Rewrite per 04 §3 using the canonical skeleton of 02 §3: `usePayments` = TanStack Query (`queryKeys.payments.*`): `usePaymentSummary()`, `useWithdrawals(q)`; mutations `useApproveWithdrawal`, `useRejectWithdrawal`, `useRetryWithdrawal` (invalidate `payments.all`, `counts`). Page: header (Export CSV via `toCsv/downloadCsv` for the current tab), KPI grid (4), Card with `RevenueChart` (give it `summary`), withdrawals Card with `Segmented` Pending/Completed/Failed + `DataTable` (server pagination) + mobile rows; confirmations per spec; delete the `Segmented` 7D/30D/YTD control. No inline styles, no undefined tokens, no `any`.

### T-F040 · Delete the legacy subscription manager and dead payment code
- repo: frontend
- tier: low
- depends: T-F039, T-F035, T-F034, T-F031
- files: src/presentation/features/payments/components/BitSubscriptionManager.tsx; src/domain/repositories/PaymentRepository.ts; src/data/repositories/ApiPaymentRepository.ts; src/data/repositories/MockPaymentRepository.ts; src/domain/entities/Payment.ts
- audit: src/presentation/features/payments
- gate: frontend

1. `grep -rn "BitSubscriptionManager" src` → must have no importer (PaymentsPage no longer imports it). Delete the file.
2. Remove the deprecated re-exports and `@deprecated` methods added in T-F038, plus now-unused types (`SubscriptionPlan`, `Subscriber`, `SubscriptionRequestItem`, `FailedTransaction`) **only if** `grep -rn` finds no usage; run `npm run build` to confirm.
3. Delete `PaymentsPage`-related unused i18n usage? No — leave translations.
