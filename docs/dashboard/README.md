# Admin dashboard integration guides (React)

Stack: React + TypeScript, **TanStack Query** (server state), axios `apiClient` (auth + refresh), socket.io-client
(live activity), clean layers `domain/ → data/repositories/Api*Repository.ts → presentation/features/*`.
All admin routes live under `/api/v1/admin/*` and require an **ADMIN** JWT (`authenticate + authorize("ADMIN")`).

## Read first
| Guide | Covers |
|---|---|
| [00 · Foundations](00-foundations.md) | Layers, React Query conventions (keys, staleTime, mutations, invalidation), polling budget, errors, auth, realtime, tables/forms UX |

## UI refactor ("Monochrome Ops" design)
| Guide | Covers |
|---|---|
| [UI refactor plan](ui-refactor/README.md) | Audit, design tokens (light/dark), component library, responsive rules (mobile/tablet/desktop), per-page specs for the 5 mockups + all other pages, ticketed execution plan for a low-cost model |

## Features
| # | Guide | Backend area |
|---|---|---|
| 01 | [Auth & session](01-auth.md) | `/auth/login`, refresh, logout |
| 02 | [Overview, analytics & live activity](02-overview-analytics-live.md) | `overview-stats`, `analytics`, `metrics/cohort`, `live-activity`, sockets |
| 03 | [Verification queue](03-verification.md) | `verification/queue`, `moderate`, auto-verification, item toggles |
| 04 | [Craftsmen management](04-craftsmen.md) | `craftsmen`, suspend/unsuspend/ban, verification items |
| 05 | [Tasks & disputes](05-tasks-disputes.md) | `tasks`, freeze/unfreeze, dispatch-backup, `disputes` |
| 06 | [Safety reports & SOS](06-safety-reports.md) | `reports`, moderate, emergencies |
| 07 | [Offers, banners & ad campaigns](07-offers-ads.md) | `promotions`, `ads` |
| 08 | [Broadcast notifications](08-broadcasts.md) | `notifications/broadcast(s)` |
| 09 | [Categories, sub-categories & fields](09-categories.md) | `categories`, `subcategories`, `fields` |
| 10 | [Subscriptions, free tasks & commission](10-billing.md) | plans, requests, subscribers, free tasks, Bit settings, commission payments |
| 11 | [Payments & withdrawals](11-payments.md) | `payments`, summary, withdrawals, failed transactions |
| 12 | [Platform settings](12-settings.md) | `settings` (FREE_TASKS_COUNT, COMMISSION_RATE, …), auto-verification |
| 13 | [Users & audit logs](13-users-audit.md) | `users`, `audit-logs` |
