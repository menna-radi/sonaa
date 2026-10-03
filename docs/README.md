# Arox integration handbook

Per-feature integration guides, written from the **real backend** (`Arox-backend`, 193 routes) and the current
clients. Every guide follows the same template so a developer can build or review a feature end to end.

| Folder | Audience | Contents |
|---|---|---|
| [`mobile/`](mobile/README.md) | Flutter team (customer + craftsman apps, one codebase) | Foundations (architecture, networking, caching, state, realtime, UX states, i18n, uploads) + one guide per feature |
| [`dashboard/`](dashboard/README.md) | Admin dashboard team (React + TanStack Query) | Foundations + one guide per admin feature |

## Guide template (every feature file)

1. **Goal & actors** — what the feature does and who uses it.
2. **Screens / entry points** — where the user reaches it.
3. **Backend contract** — endpoints, auth/role, request/response fields, error codes.
4. **Domain rules & state machine** — business rules enforced by the server.
5. **Step-by-step integration flow** — the exact order of calls and UI transitions.
6. **State management** — state shape, events/intents, who owns the state.
7. **Caching strategy** — what may be cached, TTL, invalidation, what must never be cached.
8. **Loading / empty / error UX** — first load, refresh, pagination, retry, offline.
9. **Realtime & refresh** — sockets, push, lifecycle, polling fallbacks.
10. **Edge cases** — races, permissions, stale data, account switches.
11. **Test checklist** — manual + automated checks before release.

## Sources of truth

- Backend routes: `Arox-backend/src/modules/*/*.routes.ts` (mounted in `src/app.ts`).
- Validators (request shapes): `*.validators.ts` (Zod).
- Mobile response shapes: `Arox-backend/src/shared/utils/mobileFormat.ts` (`?mobile=true`).
- End-to-end API journeys that exercise these flows: `Arox-backend/scripts/e2e/` (journey1: 71 steps, journey2: 20 steps).
- Cross-cutting fixes/decisions log: `MOBILE_BACKEND_INTEGRATION_GUIDE.md`.

> When the backend changes, update the matching guide in the same PR. A guide that disagrees with the code is a bug.

## Dashboard refactor v2

The admin dashboard underwent a comprehensive refactor aligned directly with the production backend contracts and the Overview standard. Full specifications, tickets, and migration guides are documented in [`refactor/README.md`](refactor/README.md).

### Domain integration summary

#### 1. Billing & Payments (`src/presentation/features/billing/`)
- **Endpoints used:**
  - `GET /admin/billing/receipts` — Paginated receipts list with status filtering (`PENDING`, `APPROVED`, `REJECTED`).
  - `POST /admin/billing/receipts/:id/review` — Review submission with `action` (`APPROVED` | `REJECTED`), optional `reason`, and optional `manualCreditDays`.
  - `GET /admin/billing/subscribers` — Craftsman subscription status list with search and filter.
  - `POST /admin/billing/subscribers/:id/cancel` — Terminate subscription with mandatory reason.
  - `GET /admin/billing/plans`, `POST /admin/billing/plans`, `PUT /admin/billing/plans/:id`, `DELETE /admin/billing/plans/:id` — Plan tier management.
  - `GET /admin/billing/rates`, `PUT /admin/billing/rates/:category` — Commission rate configuration per category.
  - `GET /admin/payouts`, `POST /admin/payouts/:id/approve`, `POST /admin/payouts/:id/reject` — Craftsman withdrawal requests.
- **Validation rules:**
  - Plan pricing >= 0 ILS (₪), duration >= 1 day, free tasks count >= 0.
  - Commission rate 0%–100%, flat fee >= 0 ILS.
  - Rejection actions require a non-empty reason string. Cancellation reason requires >= 5 characters.
- **Optional endpoint fallback:**
  - If billing endpoints return 404/501 (e.g., in partial deployments), UI tabs display graceful capability-unavailable notices rather than unhandled errors.

#### 2. Offers & Campaigns (`src/presentation/features/offers/`)
- **Endpoints used:**
  - `GET /admin/offers` — List banners/offers with type and status filtering.
  - `POST /admin/offers` — Create new home banner/campaign.
  - `PUT /admin/offers/:id` — Update offer details and targeting.
  - `DELETE /admin/offers/:id` — Delete offer.
  - `PATCH /admin/offers/:id/toggle` — Instant toggle active status.
- **Target options & validation:**
  - Target types: `url`, `craftsman`, `category`, `task`, `service`.
  - Target values: Valid URL for `url` type; numeric/string identifier for entities (`craftsman`, `category`, etc.).
  - Date ranges: `startDate <= endDate`. Image URL or upload required.

#### 3. Tasks & Disputes (`src/presentation/features/tasks/`)
- **Endpoints used:**
  - `GET /admin/tasks` — Search and filter across 14 real task lifecycle states (`PENDING`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED_BY_CUSTOMER`, `CANCELLED_BY_CRAFTSMAN`, `EXPIRED`, `DISPUTED`, `RESOLVED`, etc.).
  - `GET /admin/tasks/:id` — Detailed task metadata, parties, timeline, and dispute data.
  - `PATCH /admin/tasks/:id/status` — Administrative status override with audit reason.
  - `POST /admin/tasks/:id/dispute/resolve` — Dispute resolution endpoint.
- **Validation rules:**
  - Dispute resolution requires split percentages (`refundPercentage` + `releasePercentage` = 100%) and resolution notes (min 5 chars).
  - Status overrides require an explicit administrative explanation.

#### 4. Reports & Safety SOS (`src/presentation/features/reports/`)
- **Endpoints used:**
  - `GET /admin/safety-reports` — Paginated list of user reports against craftsmen or customers.
  - `POST /admin/safety-reports/:id/action` — Moderation action (`RESOLVE`, `DISMISS`, `SUSPEND_USER`, `BAN_USER`).
  - `GET /admin/safety-reports/sos` — Active emergency SOS distress alerts.
  - `POST /admin/safety-reports/sos/:id/acknowledge` — Emergency acknowledgment by admin.
- **Validation rules:**
  - Disciplinary actions (`SUSPEND_USER`, `BAN_USER`) require a non-empty audit rationale.

#### 5. Settings & Team (`src/presentation/features/settings/`)
- **Endpoints used:**
  - `GET /admin/settings`, `PUT /admin/settings` — System parameters (e.g. craftsman auto-verification, maintenance mode).
  - `GET /admin/team`, `POST /admin/team`, `PUT /admin/team/:id/role`, `DELETE /admin/team/:id` — Admin team management (optional B07 endpoint).
  - `GET /admin/audit-logs` — Administrative audit trail with actor, action, timestamp, and IP detection (B08).
  - `POST /auth/change-password` — Admin credential updates.
- **Optional endpoint fallback:**
  - `/admin/team` checks availability on mount; if returning 404, the tab is hidden or gracefully informs the user.

#### 6. Platform & Shell (`src/presentation/components/`, `src/presentation/features/`)
- **Endpoints used:**
  - `GET /admin/counts` — Cheap badge count summary (pending receipts, open disputes, unread reports, unacknowledged SOS; optional B10).
  - `GET /admin/broadcasts`, `POST /admin/broadcasts` — Push notification broadcasts to audience segments.
  - `GET /notifications`, `PATCH /notifications/:id/read`, `POST /notifications/read-all` — Real admin inbox notifications.
  - WebSockets / Realtime — Socket-driven customer/craftsman/admin chat with message visibility scopes (`PUBLIC`, `CUSTOMER_PRIVATE`, `CRAFTSMAN_PRIVATE`, `ADMIN_INTERNAL`).
- **Validation & Shell rules:**
  - Login form validated with Zod, enforcing email syntax and minimum password length; verifies admin roles (`ADMIN`, `SUPER_ADMIN`).
  - Sidebar dynamically groups features into Core, People & Ops, Financial, and System sections with live badge count indicators.

