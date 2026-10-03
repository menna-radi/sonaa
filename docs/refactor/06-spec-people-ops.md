# 06 · Spec — Craftsmen, Tasks & Disputes, Verification, Reports/SOS, Users, Live activity

Backend facts: [00](00-backend-deep-dive.md). Standard: [02](02-overview-standard.md). Gaps: P-01…P-09, X-01, X-02.

## 1. Craftsmen (`features/craftsmen`)

**Data** — `useCraftsmen(query)` (TanStack Query, key `queryKeys.craftsmen.list`) with server params `q`, `status`, `page`, `limit=20`.
Tabs → `status` param: `all` (omit), `verified`, `pending`, `suspended`. **Until backend ticket B12**, `suspended` is wrong on the server (trust score);
so the repository computes the "Suspended/Banned" tab **client-side from `user.status`** on the fetched page and shows a one-line `AlertBanner tone="info"`
only if the server counts disagree (`counts.suspended` ≠ rows). After B12 the server filter is trusted. Tab counts come from `response.counts`.

**Domain** — extend `Craftsman` (`domain/entities/Craftsman.ts`):
```ts
accountStatus: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';        // user.status
billing: { freeTasksRemaining: number; billingModel: 'SUBSCRIPTION'|'COMMISSION'|null; commissionLocked: boolean;
           subscriptionStatus: 'ACTIVE'|'CANCELLED'|'EXPIRED'; subscriptionExpiryDate?: string; commissionDue?: number } | null;
```
Mapper reads `c.freeTasksRemaining`, `c.billingModel`, `c.commissionLocked`, `c.subscriptionStatus`, `c.subscriptionExpiryDate` (all exist on the profile row). `status` display: `BLOCKED→'banned'`, `SUSPENDED→'suspended'`, else online/offline. Add `'banned'` to the status union and to `pillVariantFor('craftsman')` (`danger`). Remove `earnings30Days/earningsChangePct/earningsSparkline` (always 0) unless B12 returns them.

**List** — `DataTable` columns: Craftsman (avatar, name, trade, `VerifiedMark`), Rating/Trust (`ScoreChip`), Jobs, **Billing** (model pill + `Free {n}` pill + `Locked` pill), Status pill, Joined. Server pagination, mobile card, row click → detail `Drawer` (≥ md) / full sheet (mobile).
**Detail panel** sections: Profile summary · Verification checklist (6 toggles with confirm) · **Billing** (free tasks, model, subscription expiry, lock; buttons *Grant free tasks* → opens the same `FreeTasksModal` from Billing, *Extend subscription* → `ExtendModal`, *Open in Billing* → `sessionStorage 'billing_tab'='subscribers'; billing search = name; navigate('billing')`) · Account actions.
**Account actions** (each through `confirmWithReason` / `confirm`): Suspend (reason required ≥3 → `PUT …/suspend {reason}`), Unsuspend, Ban (danger, type-to-confirm: the user must type `BAN`; `PUT …/ban`). After success invalidate `craftsmen.all`.
Search box in the header (`NavigationContext.searchQuery`) and `sessionStorage 'craftsmen_search'` pre-fill the search input.

## 2. Tasks & Disputes (`features/tasks`)

### 2.1 Task domain (ticket F062) — replace `domain/entities/Task.ts`
```ts
export type TaskStatus = 'PENDING'|'ACCEPTED'|'PRE_CHAT_PENDING'|'CHAT_OPEN'|'AGREEMENT_PENDING'|'IN_PROGRESS'|'WORK_SUBMITTED'
  |'RATING_PENDING'|'CLOSED'|'COMPLETED'|'CANCELLED'|'REJECTED'|'DISPUTED'|'FROZEN';
export interface Task {
  id: string; displayId: string; title: string; status: TaskStatus; isEmergency: boolean;
  customerName: string; craftsmanName: string | null; category: string; address: string;
  amount: number;                 // budgetAmount, ILS
  budgetType: 'SPECIFIC'|'OPEN'; distributionType: 'DIRECT'|'BROADCAST';
  createdAt: string; acceptedAt?: string; startedAt?: string; completedAt?: string;
  freeTaskReserved?: boolean | null; cancelReason?: string | null; hasDispute: boolean; offersCount?: number;
}
```
Mapper: `isEmergency = emergencyRequest?.status==='ACTIVE' || serviceType==='EMERGENCY'`. Never collapse statuses. Remove `eta`, `amountSAR`, `zone`.
**Filters** (`Segmented`, server `status` param, groups): `all` · `live` (`ACCEPTED,PRE_CHAT_PENDING,CHAT_OPEN,AGREEMENT_PENDING,IN_PROGRESS,WORK_SUBMITTED` — fetch with several requests or client-filter the page until B13 adds `statuses=`) · `emergency` · `disputed` (`DISPUTED`) · `done` (`RATING_PENDING,CLOSED`) · `cancelled` (`CANCELLED,REJECTED`) · `frozen`. KPIs from real counts (derive from a `limit=1` count query per group, or `GET /admin/counts` when available).
**Table** columns: Job (`displayId` + title), Customer, Craftsman, Category, Amount (`formatMoney`), Status pill (`task` domain, label `status_<x>`), Created (relative), row tone `alert` for emergency/disputed.
**Detail drawer**: summary, parties, timeline (created/accepted/started/completed), work-proof images (when present), cancel reason, dispute card (if any) with **Resolve** button, admin actions: Freeze/Unfreeze (confirm), Dispatch backup (`DispatchBackupModal`: pick craftsman by search via `/admin/craftsmen?q=` → `POST …/dispatch-backup {craftsmanProfileId}`; only enabled for statuses `PENDING..IN_PROGRESS`).
Polling: `refetchInterval: 30000` (foreground only). Remove `setInterval`.

### 2.2 Disputes tab (new UI — P-02)
`TasksPage` gets a top-level `Segmented`: **Tasks** | **Disputes** (count of `PENDING`). `sessionStorage 'tasks_tab'` pre-selects it (used by Overview).
* `useDisputes({status, page})` → `GET /admin/disputes?page&limit`; client filter by `status` until B14.
* Table: Task (`displayId`), Customer ↔ Craftsman, Reason (`DisputeReason` → `dispute_reason_*`), Opened (relative), Status (`dispute` domain), Action **Resolve**.
* `ResolveDisputeModal`: shows description; radio **Refund customer** (`REFUND_CLIENT` — task cancelled, craftsman's free task returned) / **Pay craftsman** (`PAY_CRAFTSMAN` — task completes, billing settles). **No "split" option.** Optional notes (≤500). Confirm copy states the consequence. Send `{ resolution }` (backend today only understands `REFUND_CLIENT`; any other string = pay craftsman — send `'PAY_CRAFTSMAN'` literally so after B14 it validates). Success toast `toast_dispute_resolved`; invalidate `disputes.all`, `tasks.all`, `dashboard.all`.
* `DisputeRepository.resolveDispute` signature becomes `(id, resolution: 'REFUND_CLIENT'|'PAY_CRAFTSMAN', notes?)`.

## 3. Verification (`features/verification`)
Already restyled (mockup 5). Only these changes (ticket F064):
1. Decision actions use `moderationNotesSchema(required)`: **Reject/Flag/Request changes require notes ≥ 3 chars**; Approve optional. Inline error under the notes field.
2. Approve confirm lists what will be granted ("All verification badges will be granted") because the backend flips all five flags (G-23).
3. Map backend error codes (`VERIFICATION_NOT_REVIEWABLE`, `VERIFICATION_EVIDENCE_INCOMPLETE`) via `errorMessage`.
4. Queue uses TanStack Query with `status` filter and pagination (`page`, `limit=20`); `queueCount` drives the sidebar badge; `avgSlaRemainingHours` shown as "SLA {h}h left" only when `> 0`.
5. Standard checklist [02 §1] for inline styles/hex/i18n in all files under `features/verification`.

## 4. Reports & SOS (`features/reports`)
* **Delete the fabricated fallback** in `ApiSafetyReportRepository` (X-01) and the `escrowStatus` field/UI (X-02). Empty backend list ⇒ `EmptyState`.
* Domain `SafetyReport` (replace): `{ id; category: ReportCategory; status: 'PENDING'|'UNDER_INVESTIGATION'|'RESOLVED'|'DISMISSED'; description?: string; createdAt: string; resolvedAt?: string; moderatorNotes?: string; reporter: {id; name; phone?} | null; suspect: {id; name; phone?} | null; task?: {id; displayId: string; title: string}; resolvedBy?: string }`.
  `ReportCategory = 'INAPPROPRIATE_CONDUCT'|'VEHICLE_SAFETY'|'VERBAL_ABUSE'|'THEFT'|'PROPERTY_DAMAGE'|'OTHER'` with labels `report_cat_*`. Severity is **not** a backend field: derive only `high` for `THEFT|VERBAL_ABUSE|INAPPROPRIATE_CONDUCT|PROPERTY_DAMAGE`… **decision: drop severity** and show category instead (no invention).
* List: queue of PENDING first (server `status` filter via `Segmented` Pending / Investigating / Resolved / Dismissed / All, pagination). Detail panel: reporter & suspect cards (phone `ui-num`), task link, description, history (resolver + notes + `resolvedAt` when present).
* Actions: **Dismiss**, **Suspend suspect**, **Ban suspect** (`moderationNotes` optional for dismiss, required ≥3 for suspend/ban; `confirm` danger for ban) → `PUT /admin/reports/:id/moderate {action, notes}`. Copy notes that current backend marks the report `RESOLVED` for all actions (after B15 `DISMISSED`).
* `LinkedOrderModal` shows only fields that exist (`displayId`, `title`). Remove chat-log / evidence / audit-trail panels (no data source) — keep the component files only if they can be fed real data; otherwise delete.
* SOS: Emergencies come from `live-activity.emergencies` (see §6) — `SosBanner` shows client, craftsman, time, map link; button **Open task** → tasks page. Resolution is performed by the customer/app (`/safety/emergency/:id/resolve` is owner-or-admin): add **Mark resolved** only after B16.

## 5. Users (new page `users`, optional — ticket F066, soft-needs B22)
Page key `users`, nav `nav_users` ("Users", section *Manage*). `GET /admin/users?q&role&limit&offset` → table: Name, Role pill, Phone/Email (`ui-num`), Rating, Joined, Account status (needs B22; hidden if missing), Actions (needs B22): *Suspend / Unsuspend / Block* via `PUT /admin/users/:id/status {status, reason}` with `userStatusSchema` + `confirmWithReason`. Pagination: convert `page→offset=(page-1)*limit`. Rows of role `ADMIN` have no actions. Without B22 the page is read-only with a banner `users_readonly_note`.

## 6. Live activity (`features/live_activity`)
* Only render fields that are real: counts, SOS list, active jobs (title, status, customer, craftsman, **only if coordinates exist** the map pin), online craftsmen pins, feed events.
* **Hide** (until B17 fixes the backend): "Busy zones" card, job progress bars, `amount_sar`, suspicious-activity card when `suspicious_alerts` is empty. Add a constant `LIVE_FABRICATED_FIELDS_TRUSTED = false` in `features/live_activity/flags.ts`; when false, those blocks are not rendered. B17's frontend follow-up flips it.
* Polling through React Query `refetchInterval: 15000` (foreground only); remove `setInterval` in the page; `OperationalMap.tsx` (733 lines, 53 hex, `<style>`): move colours to tokens/classes, move the `<style>` block into `live_activity.css`, split into `MapCanvas`, `MapMarkers`, `MapLegend` (each < 300 lines).
* `SystemStatus` keeps `/health` (real) and additionally shows `migrations.status` + `push`.

## 7. Acceptance
- [ ] Tasks show all 14 statuses correctly; paging works beyond 20 rows; disputes can be resolved; no polling timers; fake reports gone.
- [ ] Craftsmen list never receives or displays account secrets; billing chips visible; suspended/banned shown correctly.
- [ ] Every page under these features passes `ui-audit --strict` and the i18n audit.
