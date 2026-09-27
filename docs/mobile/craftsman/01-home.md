# Craftsman · Home dashboard

## 1. Blocks
Availability toggle · verification banner (if unverified) · earnings card (today + sparkline) · stats
(active jobs, completion rate, rating) · new job requests · today's schedule (+ "View all" → My tasks).

## 2. Backend contract (all with `x-acting-role: CRAFTSMAN`)

| Block | Endpoint |
|---|---|
| Profile/flags | `GET /profile?role=CRAFTSMAN` → `isVerifiedId`, `isAvailable`, `rating`, `completionRate`, `activeJobsCount` (self-posted tasks excluded), metrics |
| Verification | `GET /craftsman/verify/status` → `overallStatus` (`APPROVED` only when request approved **and** `isVerifiedId`) |
| Requests | `GET /tasks?status=PENDING&mobile=true&limit=50` (open pool of the craftsman's skill categories + direct requests; pool hidden when unavailable/unverified/billing-ineligible) |
| Schedule | `GET /tasks?statusGroup=ACTIVE&role=craftsman&assigned=true&mobile=true&limit=50` — **the only source** (same as "View all") |
| Earnings | `GET /craftsman/earnings` → `todayCompletedWorkValue`, `completedWorkBusinessDate`, `completedWorkTimeZone` (Asia/Jerusalem), `weeklyEarnings`, `availableBalance`, `sparkline[]`, `earningsIncrease` |
| Availability | `PUT /profile/availability { isAvailable }` |

## 3. Rules
- `isVerified = verifyStatus.overallStatus == APPROVED || profile.isVerifiedId` (they agree after the server fix).
- A failing sub-request (e.g. earnings) degrades **that block only** (`catchError` → empty), never flips
  `isVerified` to false or hides the schedule.
- Max **3 active tasks** (`CRAFTSMAN_LOAD_LIMIT_EXCEEDED`); self-posted legacy tasks don't count.

## 4. Flow
1. Paint last-known values (availability, today's earnings stamped with today's date).
2. `Future.wait` of the requests above; build home model; dedupe schedule by id.
3. Declined requests are hidden locally (`_declinedIds`) until the next server refresh.
4. Accept from home → see job-requests guide; success → schedule refresh + snackbar with "View schedule".
5. Refresh: pull-to-refresh, resume, `task:status`, bounded poll 60s while visible.

## 5. State
`CraftsmanHomeCubit` (singleton): `isAvailable`, `todayEarnings`, `sparklinePoints`, `activeJobsCount`,
`completionRate`, `rating`, `jobRequests`, `todaySchedule`, `name`, `avatarUrl`, `isVerified`, `isLoading`,
`errorMessage`; generation + epoch guards.

## 6. UX
- Unverified banner: amber card, chips (ID / selfie / trade), full-width "Verify now" → returns and reloads.
- Schedule card: status stripe colour, status pill, price, title, category · date, location, customer + chat/open
  buttons; whole card opens the task.

## 7. Test checklist
- [ ] Home count equals "View all" count.
- [ ] Earnings API down → rest of home still correct (no false "not verified").
- [ ] Toggle availability off → requests pool empties (direct requests remain).
