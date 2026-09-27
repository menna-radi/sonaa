# Realtime test plan

## A. Automated (run on every backend/mobile change touching tasks, chat or notifications)

| Check | Command | Expect |
|---|---|---|
| Backend realtime journey | `node scripts/e2e/realtime.mjs http://localhost:3100` (in `Arox-backend`, local E2E stack up, rate-limit keys cleared; see `scripts/e2e/README.md`) | 44/44. `task:new` < 1 s, accept → customer < 1 s, `notification:new` for task, accept, broadcast and scheduled broadcast; suspension is enforced live |
| Backend full journey | `node scripts/e2e/journey1.mjs http://localhost:3100` | 71/71 |
| Backend unit/integration | Jest in the container (see README) | 336/336 |
| Mobile realtime unit tests | `flutter test test/realtime_refresh_test.dart` | live-listener targeting and debounce, map adds new task, `notification:new` routing, `account:status` |
| Mobile full suite | `flutter analyze && flutter test` | no issues; 258/258 |

## B. Manual: two phones (the scenario that failed)

Setup:
- **Phone A** is the customer. **Phone B** is the craftsman.
- The craftsman must be verified, have **Available for jobs = ON**, have a skill in the task's category, be
  within their working radius of the task location, and have free tasks or a subscription. Otherwise they
  are not eligible and see nothing, by design (see gap G6).
- Keep both apps **open in the foreground** unless a step says otherwise. Never pull to refresh. The
  point is that nothing needs a refresh.

| # | Phone A (customer) | Phone B (craftsman): expected **without touching** | ✓ |
|---|---|---|---|
| 1 | Post a broadcast task | Within ~1 s: the requests list shows it, the home counters update, a map pin appears (map open), the notification bell badge increases, and a push banner shows (depending on the device's foreground banner setting) | ☐ |
| 2 | — | B opens the request, taps **Accept** | ☐ |
| 3 | Task details open on A | A's status changes to *pre-chat pending* live, and A's bell badge increases | ☐ |
| 4 | Fill pre-chat and accept | B's **active job** screen (left open) moves to the next step and its buttons change | ☐ |
| 5 | — | B proposes an agreement. A's task details show the agreement card live | ☐ |
| 6 | Confirm the agreement | B's stepper moves to *in progress* live | ☐ |
| 7 | Send a chat message | B's chat thread / inbox / nav badge update live | ☐ |
| 8 | — | B submits work proof. A's details show *review work* live | ☐ |
| 9 | Close and rate | B's active job asks B to rate the customer; home earnings/schedule update | ☐ |
| 10 | Post an **open-price** task | B sends an offer. A's **offers section** (left open) shows the offer live | ☐ |
| 11 | Two craftsmen (B and C) see the same broadcast task. B accepts | C's pool drops the task live. If C had it open, C sees "no longer available" | ☐ |
| 12 | Cancel an accepted task | B's list and detail show *cancelled* live | ☐ |
| 13 | Dashboard: admin approves B's subscription receipt / verification | B's billing screen / verification banner update live, with a new notification | ☐ |
| 14 | Dashboard: send a broadcast to craftsmen | B's notification list shows it live | ☐ |
| 15 | Dashboard: schedule a broadcast 2 min ahead | Arrives within ~1 min after the time | ☐ |
| 16 | Dashboard: suspend B | B is signed out immediately, with the "account suspended" message. Unsuspending lets B log in again at once | ☐ |
| 17 | File a dispute on an in-progress task | The other phone shows *disputed* live | ☐ |

### Connection-resilience cases (Phone B)
| # | Do | Expect | ✓ |
|---|---|---|---|
| R1 | Airplane mode 2 min, customer posts a task meanwhile, airplane mode off | Within seconds of reconnecting, the task appears (reconnect resync) | ☐ |
| R2 | Background the app 5 min, customer acts meanwhile, reopen | Screens show the new state right after resume | ☐ |
| R3 | Leave B idle in the foreground > 1 h (token expiry), then toggle Wi-Fi off/on, customer posts | Socket reconnects with a refreshed token, and the task still appears live | ☐ |
| R4 | Log out, log in as another craftsman, customer posts | Live updates still work (listeners re-attached for the new account) | ☐ |
| R5 | Kill the app, customer posts | Push arrives. Tapping it opens the request | ☐ |

### Debug aids
- Mobile debug console: `[SocketService] Connected to …` / `Connection error: …` lines show socket health.
- Backend: `docker logs arox_e2e_api` shows `[FCM] Sent push notification. Success: n` per push.
- If step 1 fails, first check the craftsman's eligibility (verified, available, skill, radius, billing):
  `GET /tasks?status=PENDING` as the craftsman must list the task. If it doesn't, the task isn't theirs
  to see, and that isn't a realtime problem.
