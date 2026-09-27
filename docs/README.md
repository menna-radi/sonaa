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
