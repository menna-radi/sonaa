# Customer · Search & browse

## 1. Backend contract

| Endpoint | Query | Notes |
|---|---|---|
| `GET /search` (auth) | `q`, `type: craftsmen\|tasks\|all` (default craftsmen), `page`, `limit` | Unified search; logs queries for recommendations |
| `GET /craftsmen` (optional auth) | `category`, `sort: TOP_RATED\|NEAREST\|NEWEST`, `availableOnly`, `lat`, `lng`, `q`, `locationCity`, `page`, `limit`, `mobile` | Only **ID-verified, active** craftsmen (any current mode); `NEAREST` needs lat/lng (400 otherwise); `mobile=true` hides unavailable ones |
| `GET /tasks/categories` | — | category list for filters |

Result item (mobile): `{ id, userId, name, category (i18n key), categoryRaw, rating, reviewsCount, distance, distanceKm, image, avatarUrl, verified, isAvailable, responseTimeMinutes (nullable), trustScore (nullable) }`.

## 2. Flow
1. Search field debounced **400ms**; min 2 characters; cancel the previous request (`CancelToken`).
2. Show recent searches (local, max 10) when empty.
3. Filters sheet: category, rating, distance, available now → map to query params → reset to page 1.
4. Infinite scroll (limit 20).
5. Tap → craftsman profile.

## 3. State
`CustomerSearchCubit` (screen): `query`, `filters`, `results`, `page`, `hasMore`, `isLoading`, `isLoadingMore`, `errorKey`.
Generation guard so a slow old query never replaces a newer one.

## 4. Caching
Recent search strings only (local). Results never cached.

## 5. Test checklist
- [ ] Typing fast sends one request per pause; results match the last query.
- [ ] NEAREST without location permission → falls back to TOP_RATED with a hint.
- [ ] Empty results → friendly empty state with "post a task instead".
