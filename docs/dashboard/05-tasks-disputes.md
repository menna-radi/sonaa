# 05 · Tasks & disputes

## Task statuses
`PENDING → PRE_CHAT_PENDING → CHAT_OPEN → AGREEMENT_PENDING → IN_PROGRESS → WORK_SUBMITTED → RATING_PENDING → CLOSED`;
side states `CANCELLED` (with `cancelReason/cancelNote`), `REJECTED`, `DISPUTED`, `FROZEN`.

## Backend contract
| Endpoint | Body / query | Effect |
|---|---|---|
| `GET /admin/tasks` | `q?, status?, page, limit` | list with customer, craftsman, price, dates |
| `POST /admin/tasks/:id/freeze` | — | status → FROZEN (`preFreezeStatus` stored), participants notified |
| `POST /admin/tasks/:id/unfreeze` | — | restores `preFreezeStatus` |
| `POST /admin/tasks/:id/dispatch-backup` | — | assigns an urgent backup craftsman (sets `startedAt`), notifies them |
| `GET /admin/disputes` | `page, limit` | disputes with task + reason |
| `POST /admin/disputes/:id/resolve` | `{ resolution }` | closes dispute; releases reserved free task when applicable |

Admins see all chat visibilities (incl. internal notes) through chat endpoints with the admin token.

## Flow
1. Tasks table (filters: status, search by title/displayId `SN-…`); detail drawer with timeline
   (`createdAt/acceptedAt/startedAt/completedAt`), agreement, work-proof photos, chat link.
2. Freeze/unfreeze/dispatch with confirmation → invalidate `['admin','tasks']`.
3. Disputes queue (30s refetch) → resolve with written resolution → invalidate disputes + task.

## Test checklist
- [ ] Freeze → app shows frozen state; unfreeze returns to the previous status.
- [ ] Resolve dispute → task leaves DISPUTED; both parties notified.
