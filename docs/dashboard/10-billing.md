# 10 · Subscriptions, free tasks & commission

## Business rules (see mobile billing guide)
Free tasks (`FREE_TASKS_COUNT`, default 3, max 100) → then SUBSCRIPTION (Bit receipt approved by admin) or
COMMISSION (`COMMISSION_RATE`, default 8%; unpaid commission locks new work). Free slots are reserved at
assignment and refunded on cancel. Accepts covered by an active subscription don't use free tasks (kept for later).

## Backend contract
| Area | Endpoint | Body |
|---|---|---|
| Plans | `GET/POST /admin/subscriptions/plans`, `PUT/DELETE /admin/subscriptions/plans/:id` | plan: `{ key, nameEn, nameAr, durationMonths, price, currency, featuresEn[], featuresAr[], isPopular, isActive }` |
| Requests (Bit receipts) | `GET /admin/subscriptions/requests` | pending/approved/rejected |
| | `POST /admin/subscriptions/requests/:id/approve` | activates plan, sets billing model, notifies |
| | `POST /admin/subscriptions/requests/:id/reject` | `{ reason }` |
| Subscribers | `GET /admin/subscriptions/subscribers` | incl. billing fields |
| | `POST /admin/subscriptions/subscribers/:id/extend` | `{ days (default 30) }` (sets model when null) |
| | `POST /admin/subscriptions/subscribers/:id/cancel` | |
| Free tasks | `GET /admin/subscriptions/free-tasks` | current `FREE_TASKS_COUNT` |
| | `PUT /admin/subscriptions/subscribers/:id/free-tasks` | `{ freeTasksRemaining }` |
| Bit settings | `GET/PUT /admin/subscriptions/bit-settings` | key/value `{ BIT_PHONE_NUMBER, BIT_RECIPIENT_NAME, BIT_INSTRUCTIONS_EN, BIT_INSTRUCTIONS_AR }` (only `BIT_*` keys are saved) — shown to craftsmen on the subscription screen |
| Commission | `GET /admin/commission-payments` | receipts |
| | `POST /admin/commission-payments/:id/approve` | settles the receipt's debt → `{ unlocked }` |
| | `POST /admin/commission-payments/:id/reject` | `{ reason }` |

## Flow
1. Requests queue (30s refetch): receipt image, plan, amount, craftsman → Approve / Reject (reason).
2. Subscribers table: status, expiry, days remaining; extend/cancel with confirmation.
3. Commission payments queue: approve unlocks the craftsman; duplicate approval → 409.
4. All mutations invalidate `['admin','billing']` family.

## Test checklist
- [ ] Approve receipt → app shows ACTIVE and accept works.
- [ ] Reject with reason → app shows the reason and allows a new request.
- [ ] Commission approval unlocks only the receipt's debt.
