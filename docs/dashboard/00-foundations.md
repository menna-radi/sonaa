# 00 · Dashboard foundations

## 1. Layers

```
src/domain/entities/*            TypeScript types (Task, Craftsman, VerificationRequest…)
src/domain/repositories/*        interfaces (TaskRepository…)
src/data/repositories/Api*.ts    axios implementations → Result<T> { success, data | error }
src/data/repositories/Mock*.ts   offline/demo implementations (never in production builds)
src/core/di/DependencyProvider   selects Api vs Mock
src/presentation/features/<f>/hooks/use<F>.ts   React Query hooks (server state)
src/presentation/features/<f>/pages|components   UI
```

Rules: pages call hooks, hooks call repositories, repositories call `apiClient`. No `axios` in components.

## 2. React Query conventions

### Query keys (hierarchical)
```ts
export const qk = {
  overview: ['admin', 'overview'] as const,
  verificationQueue: (p: { status?: string; page: number }) => ['admin', 'verification', 'queue', p] as const,
  craftsmen: (p: Filters) => ['admin', 'craftsmen', p] as const,
  tasks: (p: Filters) => ['admin', 'tasks', p] as const,
  task: (id: string) => ['admin', 'tasks', 'detail', id] as const,
  offers: ['admin', 'promotions'] as const,
  settings: ['admin', 'settings'] as const,
  // …one entry per endpoint family
};
```

### Defaults (`QueryClient`)
```ts
new QueryClient({ defaultOptions: {
  queries: { staleTime: 30_000, gcTime: 5 * 60_000, retry: (n, e) => !isClientError(e) && n < 2,
             refetchOnWindowFocus: true, refetchIntervalInBackground: false },
  mutations: { retry: 0 },
}});
```

| Data kind | staleTime | refetchInterval |
|---|---|---|
| Reference (categories, plans, settings) | 5 min | none |
| Queues (verification, subscription requests, commission payments, reports) | 15 s | 30 s while visible |
| Operational lists (tasks, disputes) | 15 s | 30–60 s while visible |
| Live activity / SOS | socket-driven | 60 s safety net |
| Analytics/cohort | 5 min | none |

### Polling budget (important)
API limit is **300 requests/min per IP** (all admins behind one office IP share it). Replace the current
`setInterval` loops (3–10 s) with the table above, pause in background tabs (`refetchIntervalInBackground: false`),
and prefer socket-triggered invalidation.

### Mutations
```ts
useMutation({
  mutationFn: (v) => repo.moderate(v),
  onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'verification'] }); toast.success(t('saved')); },
  onError: (e) => toast.error(mapError(e)),
});
```
- Disable the action button while `isPending`; confirmation modal for destructive actions.
- Optimistic updates only for toggles (visibility, active) with rollback in `onError`.
- After a mutation, invalidate the **family** key (`['admin','verification']`), not a single page.

## 3. HTTP client & auth
- `apiClient` adds `Authorization: Bearer <access>`; on 401 refreshes once via `POST /auth/refresh`
  (`{ refreshToken }`), retries, else logs out. Tokens in `storageService` (localStorage) — keep XSS surface
  minimal (no `dangerouslySetInnerHTML` with user data).
- Base URL from `ENV.API_BASE_URL`.

## 4. Errors
Body: `{ error: CODE, message, details?: [{ field, message }] }`.
- 400 `VALIDATION_ERROR` → map `details[].field` onto form fields.
- 403 → "You don't have permission" (non-admin token) → logout if role ≠ ADMIN.
- 404 → "No longer exists" + invalidate list.
- 409 → state changed ("already decided") → refetch.
- 429 → back off (pause polling for 60 s).
- Show `message` only for admin-facing English UI; keep codes in logs.

## 5. Realtime
Socket connection with the admin token. Server pushes admin events via `broadcastToAdmin` (SOS/emergencies,
live activity) and `notification:new`. On event → `queryClient.invalidateQueries(...)` for the affected family;
never patch server state by hand from the payload.

## 6. Tables, filters, forms
- URL-synced filters (`?status=&q=&page=`) so refresh/share keeps the view; debounce search 400 ms.
- Server pagination (`page`, `limit` 20); show totals from the response.
- Skeleton rows on first load; keep previous data while fetching the next page (`placeholderData: keepPreviousData`).
- Empty state per table with the active filter spelled out.
- Forms: client validation mirrors the backend Zod rules listed in each guide.

## 7. Audit
Every admin mutation writes an audit log server-side (`writeAuditLog`). The audit page is the source of truth
for "who did what".
