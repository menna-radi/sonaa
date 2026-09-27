# Mobile integration guides (Flutter)

One Flutter app serves both roles. A user may hold a **customer** and a **craftsman** profile; the app's *mode*
is presentation state — the server authorizes every action (role, task membership, account state).

## Read first — foundations

| # | Guide | Covers |
|---|---|---|
| 00 | [Architecture & state management](00-foundations/01-architecture-and-state.md) | Layers, Cubit rules, DI, account epochs |
| 01 | [Networking, auth & errors](00-foundations/02-networking-auth-errors.md) | Dio, tokens, refresh, acting role, error mapping |
| 02 | [Caching & offline](00-foundations/03-caching-and-offline.md) | What to cache, TTLs, invalidation, never-cache list |
| 03 | [Realtime, push & refresh](00-foundations/04-realtime-push-refresh.md) | Socket events, event bus, coordinator, lifecycle |
| — | [**Realtime audit & per-feature flow check**](realtime/README.md) | Root causes of "nothing updates until I reopen", fixes (backend + mobile), [feature matrix](realtime/feature-matrix.md), [two-phone test plan](realtime/test-plan.md) |
| 04 | [Loading, empty & error UX](00-foundations/05-loading-empty-error-ux.md) | Shimmers, retry, optimistic UI, snackbars |
| 05 | [i18n, formatting & RTL](00-foundations/06-i18n-formatting.md) | ar/en/he keys, dates, currency, RTL |
| 06 | [Uploads & media](00-foundations/07-uploads-media.md) | Upload flow, private vs public, previews |

## Shared features (both roles)

| Guide | Summary |
|---|---|
| [Auth & onboarding](shared/auth-onboarding.md) | Phone + OTP registration/login, profile completion, walkthrough |
| [Role switching](shared/role-switching.md) | Customer ⇄ craftsman mode, token swap, state reset |
| [Chat](shared/chat.md) | Inbox per mode, task rooms vs direct rooms, optimistic send, receipts |
| [Notifications](shared/notifications.md) | List, deep links, read/delete, push token, badges |
| [Profile, settings & account](shared/profile-settings-account.md) | Profile edit, language/theme, blocked users, data export, deletion |
| [Safety & support](shared/safety-support.md) | Emergency SOS, discreet reports, help center, app feedback |

## Customer

| # | Guide | Summary |
|---|---|---|
| 01 | [Home](customer/01-home.md) | Offers carousel, categories, recommended craftsmen, location header |
| 02 | [Search & browse](customer/02-search-browse.md) | Unified search, category pages, filters |
| 03 | [Map](customer/03-map.md) | Nearby craftsmen, live locations, draggable card |
| 04 | [Craftsman profile & direct booking](customer/04-craftsman-profile-booking.md) | Public profile, metrics, reviews, chat, direct request |
| 05 | [Create task wizard](customer/05-create-task.md) | Service → details → photos → location → budget → submit |
| 06 | [My tasks & task lifecycle](customer/06-tasks-lifecycle.md) | Offers, pre-chat, agreement, work review, cancel, dispute, rating |

## Craftsman

| # | Guide | Summary |
|---|---|---|
| 01 | [Home dashboard](craftsman/01-home.md) | Requests, today's schedule, earnings card, verification banner |
| 02 | [Verification](craftsman/02-verification.md) | 5 steps, auto-verification, rejection/revoke recovery |
| 03 | [Job requests & accepting](craftsman/03-job-requests.md) | Open pool, direct requests, accept, decline, offers |
| 04 | [Active job lifecycle](craftsman/04-active-job.md) | Pre-chat, agreement, work proof, rating, cancel |
| 05 | [Map](craftsman/05-map.md) | Task markers, address geocoding, draggable card |
| 06 | [Billing: free tasks, subscription, commission](craftsman/06-billing.md) | Eligibility, Bit receipts, commission lock |
| 07 | [Earnings, wallet & payouts](craftsman/07-earnings-wallet.md) | Today's value, history, payout accounts |
| 08 | [Profile, metrics, portfolio & availability](craftsman/08-profile-metrics.md) | Trust score, response time, portfolio, location |

## Conventions used in every guide

- `sl<T>()` = GetIt service locator; `ApiEndpoints.x` = constants in `lib/core/network/api_endpoints.dart`.
- Paths are relative to `/api/v1`. `?mobile=true` returns the flattened mobile shape.
- "Acting role" = header `x-acting-role: CUSTOMER|CRAFTSMAN` (or `?role=`); see networking guide.
