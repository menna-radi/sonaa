# 01 · Dashboard gap analysis (what is missing, fake, broken, or out of date)

Audited on branch `dash-dev` (`dad2813`) against [00 · backend deep-dive](00-backend-deep-dive.md).
Measured with `node scripts/ui-audit.mjs src/presentation` at audit time:
**1,443 inline `style={{}}`, 248 disallowed hex colours, 222 `!important` (219 in `global.css`), 2 `<style>` tags.**
The Overview page is the visual reference (see [02](02-overview-standard.md)); everything else must be brought up to it.

Legend — 🔴 wrong/fake/broken · 🟠 missing vs backend · 🟡 style/standard debt.

## A. Cross-cutting

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| X-01 | 🔴 | **Fake data shipped in the API repository.** When the backend returns no safety reports, `ApiSafetyReportRepository.getSafetyReports()` returns 2+ hard-coded reports (names, phone numbers, "escrow FROZEN", Unsplash images). | `src/data/repositories/ApiSafetyReportRepository.ts:13-90` |
| X-02 | 🔴 | **Escrow does not exist** in this product (platform never holds job money) yet the UI models `escrowStatus`, "Escrow payout placed on hold", "Auto-Release Escrow". | `SafetyReport.escrowStatus`, `PlatformConfigTab` |
| X-03 | 🔴 | **No form validation anywhere.** `zod` is not a dependency; forms rely on `required` attributes or nothing. Backend Zod rules (names ≥3, key ≥3, budget >0, URL shape…) are not mirrored. | `package.json`; `FormFields.tsx` has an `error` prop that nobody feeds |
| X-04 | 🔴 | Undefined design tokens are used as if they existed (`--primary`, `--on-surface-subtle`, `--on-surface`, `--text-sm`, `--font-xs`, `--r-lg`…), so values silently fall back to browser defaults (broken colours in dark mode). | `PaymentsPage.tsx`, `AuditLogsTab.tsx`, `BroadcastHistoryTable.tsx`, `Skeleton.tsx` (`--r-lg`) |
| X-05 | 🟠 | Server state is hand-rolled with `useState/useEffect/setInterval` in 5 hooks (`useTasks`, `usePayments`, `useMetrics`, `useChat`, `useLiveActivity`) instead of TanStack Query; errors are swallowed (`console.error`) so the UI shows an empty state instead of an error. | `usePayments.ts`, `useTasks.ts` |
| X-06 | 🟠 | **List endpoints that are paginated on the backend are fetched once without params**, so only the first 20 rows are ever shown (craftsmen, tasks, withdrawals, failed transactions, reports, disputes, audit logs). Filters/search are done client-side on those 20 rows. | `ApiCraftsmanRepository.getCraftsmen`, `ApiTaskRepository.getTasks` |
| X-07 | 🔴 | Many strings are hard-coded English (`"System Failure"`, `"Sync Telemetry Nodes"`, `"Last 30 days"`, `"Payments & Subscriptions"`, table headers) and the `isRtl ? 'ar' : 'en'` ternary pattern is used in Settings (Hebrew never translated). | `DashboardPage.tsx`, `SettingsPage.tsx` |
| X-08 | 🟡 | Sidebar has **11 entries under "Insights"**, six of them ad pages; Billing/Commission/Disputes/Users have no entry. | `Sidebar.tsx:100-240` |
| X-09 | 🟠 | Sidebar badge counts call four heavy endpoints every 60 s (`overview-stats`, `reports`, notifications, subscription requests). | `useSidebarCounts.ts` |
| X-10 | 🔴 | `ApiPaymentRepository` and `ApiBroadcastRepository` format dates with `toLocaleDateString()` in the repository and store the string in the domain object, so language/timezone cannot be applied by the UI. | `ApiPaymentRepository.ts` (timeAgo), `ApiBroadcastRepository.ts` (sendDate) |
| X-11 | 🟡 | Mock repositories exist for 14 domains and must keep working (`ENV.USE_MOCK`). Any new repository needs a mock twin. | `DependencyProvider.tsx` |

## B. Billing — subscriptions, commission, free tasks (the main "updated backend" gap)

| ID | Sev | Finding |
|---|---|---|
| B-01 | 🟠 | **No UI at all for commission:** commission payments queue (`/commission-payments`), approve/reject, ledger, locked craftsmen, DUE totals, commission rate. Only subscription receipts are handled (`BitSubscriptionManager`). |
| B-02 | 🟠 | **No UI for free tasks:** neither the platform default (`FREE_TASKS_COUNT`) nor a per-craftsman grant (`PUT /subscriptions/subscribers/:id/free-tasks`). `Subscriber` type lacks `freeTasksRemaining`, `billingModel`, `commissionLocked`. |
| B-03 | 🟠 | **No UI for the commission rate** (`COMMISSION_RATE`). `PlatformConfigTab` shows a fake "Platform Commission Rate 20.4 %" held in React state only — nothing is saved. |
| B-04 | 🔴 | `BitSubscriptionManager.tsx` (645 lines) mixes three concerns (receipt queue, plans CRUD, subscribers) with raw `useQuery`, `any`, English literals, `window`-style flows and **no validation** on the plan form or Bit settings. |
| B-05 | 🔴 | `getSubscriptionPlans()` expects `subscribersCount` and `priceMonthly` (not returned) so every plan shows 0 subscribers. `PaymentSummary.pendingPayouts/pendingCraftsmenCount/*ChangePct` are never returned → KPI cards show `₪0` / hidden deltas. `mrr` is `0` because of backend G-07. |
| B-06 | 🔴 | `PaymentsPage` uses undefined tokens, a bare spinner for loading, `any` rows, and a CSV export that does not escape commas/quotes. The 30D/90D/YTD `Segmented` is dead (the backend has no range parameter). |
| B-07 | 🟠 | Approve/Reject do not surface backend error codes (`COMMISSION_DEBT_UNSETTLED`, `REQUEST_ALREADY_APPROVED`, 409 "already reviewed") with an actionable message. |
| B-08 | 🟠 | Receipt images (`paymentProofUrl`) are opened without the shared lightbox / authenticated loader; the request's `chatRoomId` is returned but there is no "Open chat" shortcut. |
| B-09 | 🟠 | Sidebar "Payments" badge counts only pending *subscription* receipts, not commission receipts or withdrawals. |

## C. Offers, banners & ads

| ID | Sev | Finding |
|---|---|---|
| O-01 | 🔴 | **`PromotionsPage` (743 lines) is fabricated.** "Craftsman Promotions", packages Basic/Featured/Premium (₪199/499/…), "Sponsored Listings 342 active", per-craftsman views/clicks — none exist in the backend. Only the small "offer banners" section is real. |
| O-02 | 🟠 | Offers have `targetType/targetId` (CRAFTSMAN/CATEGORY/TASK/SERVICE/URL) and bilingual fields in the data model, but `createPromotion` sends neither, and there is no edit (`PATCH /promotions/:id` exists) in the UI. |
| O-03 | 🔴 | `ApiAdRepository` maps `ENDED` to `Paused`; `updateAd` payload is `...data` with UI strings (`'Active'`), `getPromotions` invents titles (`'Special Offer'`, `'Exclusive discount on Sonaa'`). |
| O-04 | 🔴 | Ad analytics shows budgets/spend/conversion funnels the backend does not track (`spent` is always 0, `clicks` is never incremented). `AdAnalyticsPage` has 70 inline styles. |
| O-05 | 🟡 | Six nav entries/pages for one backend entity (`ads`, `campaigns`, `scheduled`, `expired`, `promotions`, `ad_analytics`, plus `create_ad`). |
| O-06 | 🟠 | No validation mirroring `createAdCampaignSchema` / `createOfferSchema` (name ≥3, budget >0, URL must be http(s) with a dotted host, `endDate > startDate`). |

## D. People & operations

| ID | Sev | Finding |
|---|---|---|
| P-01 | 🔴 | **Task status mapping collapses 14 backend statuses into 5** (`in_progress/emergency/disputed/frozen/completed`). `WORK_SUBMITTED`, `RATING_PENDING`, `CLOSED`, `CHAT_OPEN`, … render as "in progress"; `CANCELLED` renders as "frozen"; `COMPLETED` never occurs. Field `amountSAR` holds ILS. `eta` is the invented string `'Scheduled'/'Pending'`. |
| P-02 | 🔴 | **Disputes have no UI.** `DisputeRepository` is registered but no page uses it; admins cannot resolve disputes from the dashboard. Resolution `split_split` maps to a backend value that really means "pay craftsman". |
| P-03 | 🔴 | Craftsman `status` is derived from `user.status` but the **"Suspended" tab/count come from `trustScore < 0.7`** on the backend → inconsistent. The backend also leaks `passwordHash` in this list (G-01). |
| P-04 | 🟠 | Craftsman rows/detail ignore billing state (free tasks left, billing model, commission lock, subscription expiry) and have no deep-link to Billing. `earnings30Days` is always `0`. |
| P-05 | 🔴 | Reports: `severity` is guessed from category; `chatLogs/evidenceImages/auditTrail` fields are never provided by the backend (only the fabricated fallback has them). `moderate` always ends `RESOLVED`. |
| P-06 | 🟠 | There is no Users page; the admin cannot suspend a customer. |
| P-07 | 🟠 | Verification moderation notes are free text with no minimum and no reason requirement for reject/flag (backend default `"Processed by admin"`). |
| P-08 | 🔴 | Live Activity renders backend-fabricated zones/amounts (G-09); `subscribeToFeed` is a no-op; `OperationalMap.tsx` has 53 hex colours and a `<style>` tag. |
| P-09 | 🟠 | Tasks page: no pagination, no server filter/search, no task detail endpoint, `setInterval` polling, no distribution/budget type, no offers count, no work-proof/cancel-reason view, no billing flag (free task / commission due). |

## E. Platform & settings

| ID | Sev | Finding |
|---|---|---|
| S-01 | 🔴 | **Roles & Permissions is a fiction**: `INITIAL_ROLES` (4 roles, 20 permission toggles, member counts 2/4/12) is hard-coded; the backend has a single `ADMIN` role and **no RBAC**. Toggling does nothing. |
| S-02 | 🔴 | **Admin list/create call a non-existent endpoint** (`/admin/roles/users`) and the create flow sends password `Password123!`. |
| S-03 | 🔴 | **Platform Configuration tab is fake** (commission 20.4 %, min withdrawal, payout schedule, escrow release, SLAs) and local-only. The real parameters are `COMMISSION_RATE`, `FREE_TASKS_COUNT`, `AUTO_VERIFY_CRAFTSMEN`, `BIT_*`. |
| S-04 | 🔴 | **Audit Logs tab renders 7 hard-coded rows** with fake IPs; the real `/admin/audit-logs` is never called. |
| S-05 | 🔴 | Security and Notification-routing tabs are local toggles with no backend. |
| S-06 | 🟠 | Service management lacks Hebrew names (`nameHe`), subcategory rename, field edit/reorder, usage counts. |
| S-07 | 🟠 | Broadcast: audience mapping must match `ALL|CUSTOMERS|CRAFTSMEN`; city filter is only valid for craftsmen (backend G-17); `openRate` is shown as `—` (not tracked) but still has a column; no cancel for `SCHEDULED`. |
| S-08 | 🟠 | Chat: admin cannot choose message visibility (`PUBLIC / CUSTOMER_PRIVATE / CRAFTSMAN_PRIVATE / ADMIN_INTERNAL`); no link from a subscription receipt to its chat. |
| S-09 | 🔴 | Notifications page: `toggleRead` swallows failures and returns a fake "Notification / Marked read" item; "category subscriptions" are local-only toggles; fallback shows broadcast logs as if they were notifications. |
| S-10 | 🔴 | Analytics page renders the backend's fabricated KPIs (`eta_accuracy 95`, `refund_rate 0`) and ignores timeframe. |
| S-11 | 🟡 | Login has no client validation (email format / password length) and no per-code error copy. |

## F. Overview itself (the reference page — still not clean)

| ID | Sev | Finding |
|---|---|---|
| V-01 | 🟡 | 15 inline styles in `DashboardPage.tsx` OverviewPage, 16 in `RevenueChart`, 11 in `ModeratorReview`, 9 in `TopCategories`; layout done with inline `display:grid`. |
| V-02 | 🔴 | English literals: `"System Failure"`, `"Sync Telemetry Nodes"`, `"Last 30 days"`, `"tasks"`, `"GMV / Take Rate / Avg Order / Disputes"`, `"No revenue data yet"`, `"Live platform revenue · Compared to prior week"`. |
| V-03 | 🔴 | The "Last 7 days" button is a dead control. GMV is shown as `x.xxM ILS` (breaks for < 10 k). `RevenueChart` fetches its own data with `useEffect` (second request, no cache) instead of receiving it. |
| V-04 | 🟠 | No billing signal on the home page: pending receipts, DUE commission, locked craftsmen, pending withdrawals are invisible. |
| V-05 | 🔴 | `PendingReports` shows **disputes** labelled "Service Dispute", linking to the *Reports* page (safety reports), not to disputes. Time label is the constant "Recent". |

## Priority summary
1. **Stop the harm:** X-01 fake reports, S-01…S-05 fake settings, O-01 fake promotions, G-01 password-hash leak.
2. **Make the new backend usable:** Billing (B-01…B-09), Disputes (P-02), full task statuses (P-01), Offers (O-02).
3. **Make it consistent:** pagination/React Query (X-05/X-06), validation (X-03), tokens (X-04), i18n (X-07), Overview as standard (V-*).
