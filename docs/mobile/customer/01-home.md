# Customer · Home

## 1. Goal
First screen after login (and for guests): greeting + location, offers carousel, service categories, recommended
craftsmen, active tasks shortcut, role toggle.

## 2. Backend contract

| Block | Endpoint | Auth | Notes |
|---|---|---|---|
| Offers carousel | `GET /offers?mobile=true` | optional | `[{ id, badge, title, image, bannerType: PROMO\|EMERGENCY_SOS, placement: TOP\|FEATURED, subtitle, buttonText, targetType, targetId, targetUrl }]`; only active & in window |
| Categories | `GET /tasks/categories` | none | `[{ id, key, nameEn, nameAr, nameHe, name (localized), iconUrl, taskCount, subCategories[] }]` (server-cached) |
| Recommended | `GET /craftsmen/recommended?lat=&lng=` | optional | ranked (quality 60% + proximity 40% + availability + trust) |
| Greeting | session user (`AuthLocalDataSource.firstName`) | — | update on profile rename |
| Location header | device GPS → `PUT /profile/location { latitude, longitude, address }` | yes | persisted `StorageKeys.selectedLocation` |
| Active tasks strip | `GET /tasks?statusGroup=ACTIVE&mobile=true` (+ `x-acting-role: CUSTOMER`) | yes | |

## 3. Offer tap rules
| `targetType` | Action |
|---|---|
| `CRAFTSMAN` + `targetId` | craftsman profile |
| `CATEGORY` (+ `targetId`) | category page (else all categories) |
| `TASK` / `SERVICE` | add-task wizard (auth required) |
| `URL` + `targetUrl` (http/https) | open in external browser; link button in the preview |
| `NONE` | preview only |

`EMERGENCY_SOS` banners use the SOS styling.

## 4. Flow
1. Restore saved location label (no hardcoded default) → paint cached offers/categories.
2. Parallel: GPS sync, offers, categories, recommended (with GPS if permitted), active tasks (if authenticated).
3. Each block renders independently (one failing block shows its own retry; never blanks the page).
4. Pull-to-refresh reloads all blocks.

## 5. State
`CustomerHomeCubit` (singleton): `userName`, `selectedLocation`, `offers`, `categories`, `recommended`,
`activeTasks`, `activeRole`, per-block loading/error. `updateUserName()` for live renames.

## 6. Caching
Offers 15 min, categories 24h (`JsonCacheService`), recommended/tasks never.

## 7. UX
Shimmers per block; guest mode hides task blocks and shows "log in" CTAs; carousel auto-scroll pauses on touch.

## 8. Test checklist
- [ ] Guest sees offers + categories; tapping task CTA asks to log in.
- [ ] Offer with link opens browser; offer without link has no link button.
- [ ] Category added in dashboard appears after refresh.
- [ ] Rename in profile → greeting updates immediately.
