# Customer · Map

## 1. Goal
Show nearby available craftsmen (and the customer's own task pins) on a map with a draggable nearby-sheet and a
floating preview card.

## 2. Backend contract

| Need | Endpoint / event |
|---|---|
| Craftsmen near a point | `GET /craftsmen?mobile=true&lat=&lng=&sort=NEAREST&availableOnly=true` |
| Filter by service | `category=<KEY>` |
| Live positions | socket `map:subscribe {lat,lng}` → `craftsman:location {craftsmanId, lat, lng}`; `map:unsubscribe` on leave |
| Own tasks | `GET /tasks?statusGroup=ACTIVE&mobile=true` (pins only for tasks with `lat/lng`) |

Craftsman position = profile location (`PUT /craftsman/location`), else the location saved on the craftsman's
account (`PUT /profile/location`) — returned as `lat/lng`. Craftsmen with neither stay list-only. When no
craftsman is within ~50 km of the user, the camera frames the craftsmen only (not user + craftsmen).

## 3. Flow
1. `initLocation()` once per screen entry (post-frame): permission → GPS → fallback last known; show a banner if
   denied (never a fake city pin).
2. Load craftsmen near the camera target; debounce camera-idle reloads (600ms, only if moved > 1 km).
3. Subscribe socket updates for the visible area; update markers in place.
4. Tap marker → select craftsman → **draggable card** (`DraggableMapCard`): drag anywhere (clamped), X animates
   out; position kept across selections.
5. Card actions: view profile, chat, book (direct request).

## 4. State
`CustomerMapCubit` (singleton): `userLocation`, `craftsmen`, `tasks`, `filters`, `selectedCraftsmanId`,
`selectedTaskId`, `isLoading`, `locationError`. Marker bitmaps cached by a key that includes selection/theme.

## 5. Caching
Marker descriptors in memory; data never cached.

## 6. Test checklist
- [ ] Deny location → banner + list still works.
- [ ] Craftsman moves → marker moves without reload.
- [ ] Card drags and dismisses with animation; reselect keeps position.
