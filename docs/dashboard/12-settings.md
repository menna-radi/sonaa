# 12 · Platform settings

## Backend contract
| Endpoint | Body | Notes |
|---|---|---|
| `GET /admin/settings` | — | key/value app settings |
| `PUT /admin/settings` | key/value map, e.g. `{ FREE_TASKS_COUNT: 3, COMMISSION_RATE: 0.08 }` plus validated fields `{ maintenanceMode?, commissionPercentage? 0–100, payoutDelayHours? ≥0 }` | `FREE_TASKS_COUNT` must be an integer 0–100 (400 `INVALID_FREE_TASKS_COUNT`) |
| `GET/PUT /admin/settings/auto-verification` | `{ enabled }` | default ON (verify on completed steps) |

## Rules
- `FREE_TASKS_COUNT` applies to craftsmen's allowance (new and existing via `getFreeTasksAllowance`).
- Changing `COMMISSION_RATE` affects future commission entries only.
- Every change is audit-logged with before/after.

## Flow
Settings page grouped by area (billing, verification, maintenance). Each group saves separately with a
confirmation that states the impact ("Applies to all craftsmen immediately"). Invalidate `['admin','settings']`
and billing queries.

## Test checklist
- [ ] Set free tasks to 5 → a new craftsman sees 5 free tasks.
- [ ] Invalid value (e.g. 1000) → field error, nothing saved.
