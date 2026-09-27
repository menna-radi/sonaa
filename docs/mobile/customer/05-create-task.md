# Customer · Create task wizard

## 1. Steps
1. Service (category) → 2. Title & description → 3. Photos → 4. Location → 5. Budget & distribution → Review/submit.

## 2. Backend contract — `POST /tasks` (CUSTOMER role)

| Field | Rule |
|---|---|
| `serviceType` | category key: `ELECTRICIAN, PLUMBER, AC_TECH, PAINTER, MOVER, CARPENTER, CLEANING, MAINTENANCE` (uppercased) |
| `title` | 10–100 chars (`titleAr`, `titleHe` optional, same rule) |
| `description` | required |
| `budgetAmount` | ≥ 0 (required > 0 for `SPECIFIC`) |
| `budgetType` | `SPECIFIC` (alias `FIXED`) or `OPEN` (craftsmen send offers) |
| `distributionType` | `BROADCAST` (all eligible) or `DIRECT` (+ `craftsmanProfileId`) |
| `locationCity`, `locationArea` | address text |
| `locationLat`, `locationLng` | **required in practice** — tasks without coordinates never appear on craftsmen's maps |
| `imageUrls[]` | uploaded public URLs |
| `subCategoryId` | optional |

Response (`mobile=true`): the task in mobile shape (`id`, `displayId` `SN-<n>`, `status: PENDING`, …).
Errors: 400 validation (`details[]`), direct-request eligibility codes (see profile guide).

## 3. Rules
- Customer can't target themselves (dual accounts).
- Direct request is visible only to the target; declining (`REJECTED`) lets the customer broadcast it
  (`POST /tasks/:id/broadcast`).

## 4. Flow
1. Each step validates before "Next"; `validateAll()` re-runs on submit and jumps to the failing step
   (`stepForError`).
2. Photos upload immediately on pick (public) with progress; submit is disabled while uploading.
3. Location: pin on map (reverse geocode for the label) **or** typed address.
   - Typed address clears the old pin.
   - On submit, if there is no pin, the app geocodes the typed address; if not found →
     `task_wizard.error_location_pin` → location step. **Never** submits without coordinates.
4. Submit once (in-flight guard; duplicate taps ignored) → optimistic insert into "My tasks" → hydrate with
   `GET /tasks/:id` → success screen → publish `TaskInvalidation(created)`.

## 5. State
`AddTaskWizardCubit` (screen): `currentStep`, `selectedService`, `title`, `description`, `photos`,
`address`, `lat`, `lng`, `budget`, `budgetType`, `distribution`, `isUploading`, `isSubmitting`;
terminal states `TaskCreated`, `TaskCreationError(errorKey)`. Location generation token discards stale geocodes.

## 6. Caching
Draft kept in memory only (optionally persisted draft in the future); categories from cache.

## 7. Test checklist
- [ ] Typed address only → geocoded → task has lat/lng → visible on craftsman map.
- [ ] Unknown address → asked to pin.
- [ ] Double tap submit → one task.
- [ ] Direct request to unavailable craftsman → clear message, draft kept.
