# 11 · Payments & withdrawals

## Backend contract
| Endpoint | Body / query |
|---|---|
| `GET /admin/payments` | `page, limit` — transactions |
| `GET /admin/payments/summary` | totals for KPI cards |
| `GET /admin/payments/plans` | alias of subscription plans |
| `GET /admin/payments/withdrawal-requests` | `page, limit, status?` |
| `PUT /admin/payments/withdrawal-requests/:id/status` | `{ status: approved\|rejected }` |
| `POST /admin/payments/failed-transactions/:id/retry` | — |

Note: in-app withdrawals are deprecated (payments happen via Bit outside the app); keep the pages for history
and legacy requests.

## Flow
Payments page: KPI cards (summary) + paginated transactions (filters by type/date) + withdrawal queue with
approve/reject confirmation. Invalidate `['admin','payments']` after mutations.

## Test checklist
- [ ] Summary totals equal the sum of listed transactions for the same range.
