# 04 · Craftsmen management

## Backend contract
| Endpoint | Body / query |
|---|---|
| `GET /admin/craftsmen` | `q?, category?, status?: verified\|pending\|suspended, page, limit` — `verified` = `isVerifiedId`, `pending` = not verified, **`suspended` actually filters `trustScore < 0.7`** (backend naming quirk; label the tab "Low trust") |
| `PUT /admin/craftsmen/:id/suspend` | `{ reason }` |
| `PUT /admin/craftsmen/:id/unsuspend` | — |
| `PUT /admin/craftsmen/:id/ban` | — (blocks the user account) |
| `POST /admin/craftsmen/:id/verify/item` | see verification guide |
| `PUT /admin/subscriptions/subscribers/:id/free-tasks` | `{ freeTasksRemaining: 0..100 }` |

Metrics shown per craftsman come from real activity: `trustScore` (0–1, stored after profile/public reads),
`responseTimeMinutes` (median), rating (customer reviews only), completed tasks.

## Flow
1. Table with URL-synced filters; row → profile drawer (verification flags, billing status, active tasks,
   reviews, reports).
2. Suspend/ban: confirmation modal with reason; mutation → invalidate `['admin','craftsmen']`.
3. Free tasks editor (number input 0–100) → mutation → invalidate the craftsman.

## Test checklist
- [ ] Suspended craftsman can't accept work; unsuspend restores.
- [ ] Setting free tasks to 0 → app shows the billing sheet on next accept.
