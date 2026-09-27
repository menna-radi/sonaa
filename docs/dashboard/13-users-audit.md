# 13 · Users & audit logs

## Backend contract
| Endpoint | Query |
|---|---|
| `GET /admin/users` | search users (name, phone, email) — used by pickers (broadcast targeting, chat, reports) |
| `GET /admin/audit-logs` | `page, limit` — `{ actorId, action, targetType, targetId, before, after, createdAt }` |

Common actions: `CRAFTSMAN_BANNED`, `VERIFICATION_ITEM_UPDATED`, `VERIFICATION_AUTO_APPROVED`,
`AUTO_VERIFICATION_SETTING_CHANGED`, `SUBSCRIPTION_*`, `COMMISSION_*`, settings changes.

## Flow
- User search: debounced 400ms, min 2 chars, `keepPreviousData`.
- Audit log table: newest first, filter by action/target, expandable JSON diff (before/after).
- Read-only; `staleTime 60s`.

## Test checklist
- [ ] Every admin mutation in other guides appears here with the right actor.
