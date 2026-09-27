# 02 · Caching & offline

## 1. Principle

> **Cache to show something fast, never to decide something.**
> Anything that affects money, task state, availability or permissions is always re-fetched before acting.

Pattern: **cache-then-refresh (stale-while-revalidate)** — paint the cached copy immediately, fetch in the
background, replace on success, keep the cached copy (and show a soft banner) on failure.

## 2. Cache matrix

| Data | Cache? | Storage | TTL / invalidation | Notes |
|---|---|---|---|---|
| Categories (`GET /tasks/categories`) | ✅ | `JsonCacheService` | 24h, or on app start refresh | Server also caches; dashboard edits appear on next refresh |
| Subscription plans / Bit settings | ✅ | `JsonCacheService` | 6h | Always refetch before submitting a receipt |
| Offers (home banners) | ✅ | `JsonCacheService` | 15 min | Respect `startDate/endDate`; never show expired cached banners |
| FAQs | ✅ | `JsonCacheService` | 24h | |
| Session user (name, flags) | ✅ | `AuthLocalDataSource` | Until logout; **update on profile edit** | Home greeting reads it |
| Settings (language, theme) | ✅ | Preferences | Source of truth locally, synced to `PUT /settings` | |
| Chat inbox + recent messages | ✅ (display only) | Preferences (`chat_conversations_<role>`) | Replaced by every successful list load; **merge by message id**, never replace history | See chat guide |
| Home schedule / today's earnings | ⚠️ last-known only | Preferences (date-stamped) | Discard when `date != today` | Shown greyed while refreshing |
| Tasks (lists, detail) | ❌ | memory only | Always network | State changes by the other party at any time |
| Task pool (open jobs), map jobs | ❌ | memory only | Always network | Eligibility is server-side |
| Verification status | ❌ | memory | Always network | |
| Billing status (free tasks, plan, lock) | ❌ | memory | Always network before accept | |
| Notifications | ❌ (list) | memory | Network; badge count may be cached | |
| Tokens | ✅ | Preferences (secure storage recommended) | Refresh on 401 | |
| Images | ✅ | `CachedNetworkImage` disk cache | HTTP cache headers | Private uploads need the auth header |
| Geocoding results | ✅ | in-memory map `address → LatLng?` | App session | Craftsman map; avoids repeated lookups |

## 3. Keys & versioning

- Prefix keys by role and account: `chat_conversations_customer`, `earnings_<userId>_<yyyy-mm-dd>`.
- Add a schema version to JSON caches (`{"v":2,"data":…}`); on mismatch → drop the cache (never crash).
- Wrap every cache read in `try/catch`; a corrupt cache is ignored, not fatal.

## 4. Invalidation triggers

| Trigger | Action |
|---|---|
| Logout / account switch | Clear all per-account keys, reset singleton cubits |
| Role switch | Clear role-scoped surfaces (inbox of the other role stays but is not shown) |
| Successful command (accept, cancel, send) | Publish `TaskInvalidation` on `TaskEventBus`; listeners refetch |
| Socket `task:status` | Bridge → `TaskEventBus` → refetch affected task/list |
| App resumed | Coalesced refresh of visible surfaces |
| Day change (midnight) | Drop date-stamped caches (earnings, schedule) |

## 5. Offline behaviour

- Detect with `ConnectivityService.hasInternet()` before commands; show an offline banner, disable
  commands (send, accept, submit) rather than queueing them silently.
- **Chat is the only surface with an outbox**: optimistic message stays with status `failed` + retry.
- Forms (task wizard) keep their draft in memory while offline; submission requires connectivity.
- On reconnect: socket resubscribes automatically; run one coalesced refresh.

## 6. Anti-patterns (seen and fixed in this codebase)

- ❌ Merging a list endpoint's preview (last message only) *over* a loaded thread → wiped history.
  ✅ Union by id.
- ❌ Showing a cached "verified" flag while accepting uses the live flag → contradictory UI.
  ✅ Verification/billing are never cached.
- ❌ Hiding a stale item only in memory → it reappears after restart.
  ✅ Fix the server contract (list only what can be opened) and persist removals.
