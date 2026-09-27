# Craftsman · Map

## 1. Goal
Show available jobs as markers (price bubbles) around the craftsman, with a nearby-tasks sheet and a draggable
job card.

## 2. Data
`GET /tasks?status=PENDING&mobile=true` → project to `MapJobData` (`lat/lng` from `locationLat|lat|latitude`).
Distance computed locally from GPS (`Geolocator.distanceBetween`).

## 3. Tasks without coordinates
Older tasks (or tasks created from a typed address) may have no `lat/lng`. The cubit geocodes the task's
**own address** (`LocationService.getCoordinatesFromAddress`), caches `address → LatLng?` for the session,
generation-guards the result, and marks the task `approximateLocation: true`. Unknown addresses remain list-only
("N tasks have no map location"). Never invent a default city pin.

## 4. Flow
1. `initLocation()` (post-frame, once) → permission → GPS → load jobs.
2. Build markers (bitmap cache key includes selection, theme, price, urgency).
3. Tap marker/sheet item → `selectTask(id)` → `DraggableMapCard(showHandle: false)` wrapping `MapJobDetailsBar`:
   drag anywhere, X animates away, position kept.
4. Card "View details" → request detail → accept/offer (job-requests guide).
5. Filters (category, urgent, distance) are local over the loaded list.

## 5. State
`CraftsmanMapCubit` (singleton): `userLocation`, `tasks`, `selectedTaskId`, `filters`, `isLoading`,
`locationError`, `loadError`; `_generation`/`_sessionEpoch` guards; accept removes the pin via the event bus.

## 6. Test checklist
- [ ] Every sheet task with an address appears on the map.
- [ ] Accepting a job removes its pin.
- [ ] Card drags/dismisses like the customer map.
