# 04 · Spec — Billing center & Payments

Backend rules: [00 §3.1](00-backend-deep-dive.md). Types/repository/validation: [03](03-data-contract.md).
Standard to meet: [02](02-overview-standard.md). Gaps closed: B-01…B-09, X-03, X-05, X-06.

## 1. Information architecture

| Page key | Nav label (`nav_*`) | Purpose |
|---|---|---|
| `billing` **(new)** | `nav_billing` "Billing" / "الفوترة" / "חיוב" — section *Money*, badge = pending receipts + pending commission receipts | Everything about how craftsmen pay Arox: receipts, commission, subscribers, plans, rates |
| `payments` (kept) | `nav_payments` "Payouts & Revenue" — badge = pending withdrawals | Platform revenue + craftsman **withdrawals** (money Arox pays out) |

Add `'billing'` to `PageKey` and `VALID_PAGES` in `NavigationContext.tsx`, a `case 'billing'` in `DashboardPage`, and a
Sidebar item (icon `Receipt` from lucide-react) in a new section `sec_money` that also contains `payments`.
The mobile bottom tabs "More" sheet must list it too.

## 2. Billing page (`features/billing/…`)

```
features/billing/
  pages/BillingPage.tsx                 (shell: header + KPI strip + Segmented tabs; ≤ 150 lines)
  hooks/useBilling.ts                   (all queries + mutations, uses queryKeys.billing.*)
  components/BillingKpis.tsx
  components/ReceiptsTab.tsx            components/ReceiptRow.tsx (mobile)  components/ProofViewer.tsx
  components/CommissionTab.tsx          components/CommissionPaymentsTable.tsx  components/LedgerTable.tsx  components/CommissionPaymentDrawer.tsx
  components/SubscribersTab.tsx         components/SubscriberActions.tsx  components/ExtendModal.tsx  components/FreeTasksModal.tsx
  components/PlansTab.tsx               components/PlanCard.tsx  components/PlanFormModal.tsx
  components/BillingSettingsTab.tsx     components/BitSettingsCard.tsx  components/RatesCard.tsx  components/BitPreview.tsx
  billing.css
```

### 2.1 Header
Title `billing_title` ("Billing"), subtitle `billing_subtitle` ("Craftsman receipts, commission, subscribers and plans"), meta "Updated … ago",
action = Refresh (invalidates `queryKeys.billing.all`).

### 2.2 KPI strip — `ui-kpi-grid ui-kpi-grid--4`
| Card | Value | Source | Click |
|---|---|---|---|
| `billing_kpi_pending_receipts` | count | `summary.pendingReceipts` ?? requests(PENDING) `total` | tab Receipts |
| `billing_kpi_pending_commission` | count | `summary.pendingCommissionPayments` ?? commissionPayments(PENDING) `total` | tab Commission |
| `billing_kpi_commission_due` | `formatMoney` | `summary.commissionDueTotal`; **hidden if summary & ledger both unsupported** | tab Commission › Ledger |
| `billing_kpi_locked` | count, `tone="danger"` when > 0 | `summary.lockedCraftsmen` ?? subscribers(`locked`) `total` | tab Subscribers + filter locked |
(5th/6th optional cards: `billing_kpi_active_subscribers`, `billing_kpi_mrr` — only with real data.)
Derivation fallback queries use `limit: 1` so they are cheap; staleTime 30 s.

### 2.3 Tabs (`Segmented`, counts from the KPIs, tab remembered in `sessionStorage 'billing_tab'`)
`receipts · commission · subscribers · plans · settings`.

#### Receipts tab (subscription requests)
* Toolbar: `Segmented` status filter `PENDING_VERIFICATION` (default, with count) · `APPROVED` · `REJECTED` · `ALL`; `SearchInput` (name / phone / plan).
* `DataTable` columns: Craftsman (name + trade + phone, `ui-num`), Plan (`planTitle` · `durationMonths` mo), Amount (`formatMoney`), Submitted (`formatRelativeTime`, title attr = `formatDateTime`), Receipt (thumbnail button → `ProofViewer`), Status pill (`billing` domain), Actions.
* Row actions (only for `PENDING_VERIFICATION`): **Approve**, **Reject**, **Chat** (when `chatRoomId`: `sessionStorage.setItem('chat_open_room', id); navigate('chat')`).
* **Approve** → `confirm({ tone:'default', title: t('billing_approve_title'), body: t('billing_approve_body') + details })` where details list craftsman, plan, months, amount. Mutation `approveRequest`; invalidates `billing.all`, `counts`; toast `toast_receipt_approved`.
* **Reject** → `confirmWithReason({ requireReason:true, tone:'danger' })`; validate with `rejectReasonSchema` (≥3 chars); toast `toast_receipt_rejected`.
* Error mapping: 400 `COMMISSION_DEBT_UNSETTLED` → show `err_commission_debt` **and** offer a button "Open commission" that switches to the Commission tab filtered to that craftsman (search = name).
* Rejected rows show `rejectionReason` in a muted second line. Approved rows show nothing extra.
* Empty: `empty_receipts_pending` ("No receipts waiting for review") with a `CheckCircle` icon.
* Mobile: card per row (`ReceiptRow`) with image thumbnail left, buttons at the bottom (44 px).

`ProofViewer`: uses `ImageLightbox` + `resolveMediaUrl`. Thumbnail is a 48×48 `img` with `loading="lazy"` and an `onError` fallback icon; clicking opens the lightbox.

#### Commission tab
Inner `Segmented`: **Receipts** (CommissionPayments, default status PENDING) · **Ledger** (hidden when `getCommissionLedger` → `null`).
* Payments table columns: Craftsman, Amount, Submitted, Receipt thumb, Lock state (pill `danger` "Locked" if `commissionLocked`), Status pill (`commission` domain), Actions (Approve / Reject / Details).
* Details `Drawer` (`CommissionPaymentDrawer`): craftsman card, amount, notes, receipt image large, lock state, ledger entries linked (only if ledger supported; else sentence `commission_ledger_unavailable`).
* Approve confirm body: `commission_approve_body` = "Confirms the Bit transfer of {amount}. The linked commission is marked paid. The craftsman is unlocked only if nothing else is due." Result toast: `unlocked ? toast_commission_unlocked : toast_commission_approved`. A 409 shows `err_conflict` and refetches.
* Reject: reason required (≥3). Copy `commission_reject_body` warns "The commission stays due and the craftsman stays locked."
* Ledger table (only if supported): Task (`taskDisplayId`), Craftsman, Amount, Rate (`formatPercentValue(rate*100)`), Status (`DUE`/`PAID`), Created, Paid at. Filter `Segmented` DUE / PAID / ALL, server pagination.

#### Subscribers tab
* Toolbar: filter `Segmented` `all · active · free · commission · locked · expired` (client-side on the legacy endpoint; server-side when B04 exists), `SearchInput`.
* Columns: Craftsman (name, trade), Billing (pills: model `SUBSCRIPTION`→"Subscription", `COMMISSION`→"Commission", `null`→"No plan chosen"), Subscription (status pill + `expiryDate` formatted + days left, only when ACTIVE), Free tasks (`{remaining}` + caption "of {total}" where total = platform `freeTasksCount`), Lock (`danger` pill when locked), **Can accept tasks** (check/× icon from `isAllowedToAcceptTasks`), Actions menu (`Dropdown`): *Extend…*, *Grant free tasks…*, *Cancel subscription* (disabled unless ACTIVE), *Open craftsman* (`sessionStorage 'craftsmen_search' = name; navigate('craftsmen')`).
* `ExtendModal` (`FormModal`, `extendDaysSchema`): presets chips 30 / 90 / 180 / 365 + custom number; helper text shows resulting expiry date (computed from `max(now, expiry) + days`).
* `FreeTasksModal` (`freeTasksSchema`): number 0–100, helper "Platform default is {freeTasksCount}".
* Cancel → `confirmWithReason` (reason optional, tone danger), body explains it expires the subscription immediately.
* Empty: `empty_subscribers`.

#### Plans tab
* Header action **New plan** (opens `PlanFormModal`).
* Grid `ui-grid-auto` of `PlanCard`: name (language-aware), duration, price (`formatMoney`) + per-month hint (`price/durationMonths`), features list (language-aware), pills `Popular` / `Inactive`, counters `subscribersCount`/`pendingRequests` **only when provided**, buttons Edit · Activate/Deactivate · Delete.
* `PlanFormModal` fields (all validated by `planSchema`): Key (create only, auto-uppercased, disabled on edit), Name EN, Name AR, Duration months (select 1/3/6/12/24 or number), Price (₪), Features EN (textarea one per line), Features AR, Popular (Switch), Active (Switch). Live preview card on the right ≥ md.
* Delete → `confirm` danger; if the backend answers 409/500 show `err_plan_in_use`. Prefer **Deactivate** and say so in the confirm body.
* Do **not** call the plans endpoint to "seed" anything.

#### Settings tab
Three cards (each with its own Save, dirty-checked, disabled when pristine or invalid):
1. **Bit payment details** (`BitSettingsCard`): phone, recipient name, instructions EN, instructions AR (`bitSettingsSchema`). Right side `BitPreview` renders what the craftsman sees in the app (phone with copy icon, name, numbered instructions in the active language).
2. **Free tasks** (`RatesCard`): integer 0–100. Help: "Applies to craftsmen who register after the change; use *Grant free tasks* for existing ones." (Backend: the value is read at registration.)
3. **Commission rate**: percent input (0.1–50, step 0.1) via `fractionToPercent` / `percentToFraction`. Live example "On a ₪1,000 task the craftsman owes ₪{1000*rate}". Warning banner: "Changing the rate affects only tasks completed after saving."
Saving calls `updatePlatformSettings`; invalidates `billing.platform`, `settings.all`; toast `toast_settings_saved`.

### 2.4 Realtime
Listen to socket `notification:new` (already connected in chat) is **not** required; rely on 30 s polling of the visible tab only (`enabled: activeTab === …`).

## 3. Payments page (`features/payments/…`) — payouts & revenue only

```
PageHeader(payments_title "Payouts & Revenue")
ui-kpi-grid--4: GMV (MTD) · Net revenue (MTD) · Take rate · MRR   (+ Pending payouts if backend provides it, else hidden)
Card "Revenue"  (RevenueChart, props from dashboard query — same component as Overview)
Card "Withdrawal requests" — Segmented Pending | Completed | Failed (server filter: PENDING | COMPLETED | FAILED), DataTable + pagination
```
* Remove `BitSubscriptionManager` and all subscription logic from this page (moved to Billing).
* KPI honesty: only render a delta when the backend sends a previous period value; `takeRate` = `netRevenue / gmv` as returned. Tooltips (`title`) explain: GMV = value of completed tasks (informational — Arox does not take a cut of job payments), Net revenue = paid commission + approved subscriptions.
* Withdrawals table: Craftsman, Amount, Method (`bankName` / `type` / `mobileNumber`), Requested (relative + title), Status pill (`withdrawal` domain), Actions for PENDING: **Approve** (`confirm` body: "Confirm you transferred {amount} to {method}.") and **Reject** (`confirm`, body says the amount returns to the craftsman's balance). Failed tab shows **Retry** (confirm danger: "Retrying re-opens the request. Check that the amount was not already returned to the balance." — backend G-14).
* Pagination: server `page`/`limit=20` (`status` param on `/admin/payments/withdrawal-requests`). Failed tab uses the same endpoint with `status=FAILED` (not `/admin/payments` + client filter).
* CSV export: new util `src/core/utils/csv.ts` → `toCsv(rows: (string|number|null)[][]): string` that wraps every cell in quotes and doubles inner quotes, prefixes BOM `﻿`, and `downloadCsv(filename, csv)`; export respects the current tab/filter.
* States: skeleton table, `ErrorState`, `EmptyState` per tab.
* Domain changes: `WithdrawalRequest` becomes `{ id; craftsmanName; craftsmanProfileId?; method: string; amount: number; status: 'PENDING'|'COMPLETED'|'FAILED'; createdAt: string; referenceId?: string }`. `FailedTransaction` type is deleted (failed = withdrawal with status FAILED). `PaymentRepository` keeps only: `getPaymentSummary()`, `getWithdrawals(q)`, `approveWithdrawal(id)`, `rejectWithdrawal(id)`, `retryWithdrawal(id)`. All subscription/bit methods are **deleted** from `PaymentRepository`, `ApiPaymentRepository`, `MockPaymentRepository` (ticket F040).

## 4. i18n keys (EN text; ar/he per glossary in README)
`nav_billing`, `sec_money`, `billing_title`, `billing_subtitle`, `billing_tab_receipts|commission|subscribers|plans|settings`, `billing_kpi_*` (above), `billing_approve_title` "Approve this receipt?", `billing_approve_body`, `billing_reject_title` "Reject this receipt?", `billing_reject_reason_ph` "Tell the craftsman why (shown in the app)", `commission_approve_body`, `commission_reject_body`, `commission_ledger_unavailable`, `commission_filter_pending|approved|rejected`, `subscribers_filter_all|active|free|commission|locked|expired`, `subscribers_col_*`, `subscribers_extend_title`, `subscribers_free_title`, `subscribers_cancel_title`, `subscribers_cancel_body`, `plans_new`, `plans_edit`, `plans_delete_body`, `plans_deactivate`, `plans_activate`, `plans_popular`, `plans_inactive`, `settings_bit_title`, `settings_free_tasks_title`, `settings_commission_title`, `settings_commission_example`, `toast_receipt_approved|rejected`, `toast_commission_approved|unlocked|rejected`, `toast_plan_saved|deleted`, `toast_settings_saved`, `toast_subscriber_extended|cancelled`, `toast_free_tasks_updated`, `empty_receipts_pending`, `empty_subscribers`, `err_plan_in_use`, `payments_title`, `payments_kpi_*`, `withdrawals_tab_pending|completed|failed`, `withdrawals_approve_body`, `withdrawals_reject_body`, `withdrawals_retry_body`, `btn_export_csv`.

## 5. Acceptance (whole feature)
- [ ] An admin can: approve/reject a subscription receipt, approve/reject a commission receipt, see who is locked, grant free tasks, extend/cancel a subscription, CRUD plans, edit Bit details, edit free-task count and commission rate — each with validation and a translated error.
- [ ] No value on the page is invented; unsupported backend data is hidden.
- [ ] `ui-audit --strict` clean for `features/billing` and `features/payments`; i18n audit clean; works in en/ar/he, light/dark, 390/1024/1440.
