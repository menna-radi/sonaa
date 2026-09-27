# 02 · Overview, analytics & live activity

## Backend contract
| Endpoint | Returns |
|---|---|
| `GET /admin/overview-stats` | `{ metrics: { totalUsers, activeCraftsmen, … }, … }` KPI cards |
| `GET /admin/analytics` | chart series (revenue, tasks, conversion) |
| `GET /admin/metrics/cohort` | retention cohorts |
| `GET /admin/live-activity` | recent events (online craftsmen, submissions, SOS) |
| socket admin events | emergencies / live updates → invalidate `['admin','live']` |
| `GET /health` (public) | `{ status, checks:{api,database,redis}, migrations:{status: ok\|pending, pending[]} }` — show a red system banner when `migrations.status === 'pending'` |

## Flow
1. Overview page: KPI cards (`staleTime 60s`, refetch 60s visible), charts lazy-loaded below the fold.
2. Live activity feed: initial `GET`, then socket-driven invalidation; 60s safety refetch.
3. System health widget: poll `/health` every 60s; surface pending migrations (prevents the "deployed without
   migrations" outage from going unnoticed).

## Test checklist
- [ ] SOS from the app appears in the live feed within seconds.
- [ ] Health widget turns red when a migration is pending.
