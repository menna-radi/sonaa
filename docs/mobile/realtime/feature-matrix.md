# Feature matrix — backend action → live update on the other phone

How to read a row: **who acts** → what the backend emits (after commit) → which mobile consumer reacts →
which screen changes **without leaving it**.

Legend: ✅ live (verified in code, and by `scripts/e2e/realtime.mjs` where marked **E2E**) ·
🟡 updates on next open / resume / pull-to-refresh (not live) · ❌ broken.
Status as of 2026-09-26, after the fixes in [README.md](README.md).

Event names: `ts` = socket `task:status`, `nn` = socket `notification:new`, push = FCM.

## 1. Task lifecycle (customer ⇄ craftsman)

| # | Actor → action | Backend emits | Other phone: consumer → screen | Status |
|---|---|---|---|---|
| T1 | Customer posts **broadcast** task | `ts{event:"task:new"}` + `nn NEW_BROADCAST_TASK` + push to every **eligible** craftsman (verified, available, skill = category, within working radius, billing-eligible) | Bridge → bus → **Jobs pool**, **Home**, **Map (reload)**. Notifications list + badge | ✅ **E2E** (≈150–215 ms) |
| T2 | Customer sends **direct** request | `ts{task:new}` + `nn DIRECT_TASK_REQUEST` + push to the target | Same as T1 | ✅ |
| T3 | Craftsman accepts | `ts` to customer + craftsman; `nn TASK_ACCEPTED` to customer; **pool-exit `ts` to the other offered craftsmen** | Customer: **My tasks** list, **Task details** (TaskLiveListener). Other craftsmen: pool, map drop it; open request screen shows "no longer available" | ✅ **E2E** (≈25–45 ms) |
| T4 | Craftsman declines direct | `ts` (REJECTED) + notification | Customer: list/detail show "rejected, broadcast?" | ✅ |
| T5 | Customer converts rejected → broadcast | `ts` to customer + `ts{task:new}` + `nn` to eligible craftsmen | As T1 | ✅ |
| T6 | Craftsman sends an **offer** (open price) | `nn OFFER_CREATED` (entityType `offer`, ref = task id) + push | Bridge treats offer refs as task hints → **Offers section** (live), list | ✅ |
| T7 | Customer accepts an offer | `ts` to customer, winner and losers; `nn OFFER_ACCEPTED` / "Offer not selected"; pool-exit `ts` | Winner: home/requests/active job. Losers: pool updates | ✅ (notifications moved after commit) |
| T8 | Customer rejects an offer | notification | Craftsman list/notifications | ✅ |
| T9 | Pre-chat submit / accept (either side) | `ts` + `nn PRE_CHAT_UPDATED` | Active job / Task details re-read. Chat unlocks when both accepted | ✅ |
| T10 | Agreement propose / confirm / reject | `ts` + `nn AGREEMENT_CONFIRMED` etc. | Same | ✅ |
| T11 | Craftsman submits work proof | `ts` + `nn WORK_SUBMITTED` | Customer: Task details → "review work" | ✅ |
| T12 | Customer rates / closes | `ts` + `nn RATING_PENDING` / closed | Craftsman: Active job → rate customer; Home earnings/schedule | ✅ |
| T13 | Either side cancels | `ts` (participants) + pool-exit `ts` + notification | Other side's list/detail; pool drops it | ✅ |
| T14 | Either side files a dispute | **now** `ts DISPUTED` to both + `nn DISPUTE_UPDATED` (after commit) | Both detail screens show disputed | ✅ (was ❌: no `ts`, and push before commit) |
| T15 | Admin freeze / unfreeze / dispatch backup / resolve dispute | `ts` + notifications | Both sides | ✅ |

## 2. Chat
| # | Action | Emits | Consumer | Status |
|---|---|---|---|---|
| C1 | Message sent | `chat:message` → room + both user rooms; chat-preview `nn` (no id) + push | Chat cubits: thread, inbox, nav badge | ✅ |
| C2 | Message read | `chat:message:read` | Sender bubbles → read | ✅ |
| C3 | First message in a brand-new room | Server `joinRoomForUsers` + user-room emit | Inbox shows the new room | ✅ |
| C4 | Thread open while app backgrounded | — | On resume, the chat cubits reload the open room | ✅ |

## 3. Notifications
| # | Action | Emits | Consumer | Status |
|---|---|---|---|---|
| N1 | Any `createNotification` | `nn {id,…}` + push | `refreshSilently()` → list + unread badge | ✅ **E2E** |
| N2 | Admin broadcast (immediate) | `nn {id:"broadcast:…"}` per recipient + push | List + badge | ✅ **E2E** |
| N3 | Admin broadcast (scheduled) | Scheduler (every 60 s) claims due broadcasts → same path as N2 | List + badge | ✅ **E2E** (was ❌: never sent) |
| N4 | Push tapped (background / closed) | — | `NotificationRouter` deep link | ✅ (verify on device, see test plan) |

## 4. Craftsman account state
| # | Action | Emits | Consumer | Status |
|---|---|---|---|---|
| A1 | Admin approves / rejects / flags verification | `nn VERIFICATION` (now after commit) | Verification, profile, home cubits refresh (if in use); banner updates | ✅ |
| A2 | Auto-verification on submit | Local action + `nn` (after commit) | Same device updates via its own cubit | ✅ |
| A3 | Admin revokes national ID | `nn` | As A1 | ✅ |
| A4 | Admin approves subscription receipt | `nn PAYMENT` (entity `subscription`) | Subscription cubit + home | ✅ |
| A5 | Commission locked / payment approved / rejected | `nn COMMISSION_LOCKED` / `PAYMENT` (entity `commission`) | Subscription/billing cubit + home | ✅ |
| A6 | Admin suspends / bans (or safety auto-suspend) | Status cache cleared + `account:status` + sockets dropped + `nn` | Bridge → logout → login screen with "account suspended" | ✅ **E2E** (was: up to 60 s of continued access, no live signal) |
| A7 | Earnings credited (task closed) | `ts` (CLOSED) — `EARNING`/`WITHDRAWAL` are wallet transaction types, not notifications | Earnings screen re-reads on task events; home card via home cubit | ✅ |

## 5. Maps and location
| # | Action | Emits | Consumer | Status |
|---|---|---|---|---|
| M1 | Craftsman moves / toggles availability | `craftsman:location` to the map cell | Customer map markers | ✅ (existing) |
| M2 | New task near a craftsman | T1 | Craftsman map reload (debounced 600 ms) | ✅ |
| M3 | Craftsman en route | `location:client:<taskId>` | Customer live tracking | ✅ (existing) |

## 6. Connection health (applies to every row)
| # | Situation | Behaviour now | Status |
|---|---|---|---|
| H1 | Access token (1 h) expired, socket drops and reconnects | Handshake reads the stored token. If rejected, refresh then retry | ✅ (was ❌: dead until restart) |
| H2 | Phone offline for minutes | Unlimited reconnection (1 s → 10 s backoff) | ✅ (was capped at 10 tries) |
| H3 | App backgrounded, then resumed | `ensureConnected()`, untargeted resync of task surfaces, notifications refresh | ✅ |
| H4 | Logout → login (another account) | Session listeners reset; app-level resync survives (`global`) | ✅ (was lost after first logout) |
| H5 | App killed | Push only; on open, everything loads fresh | ✅ by design |

## 7. Remaining gaps (plan)
| ID | Priority | Gap | Fix plan | Side |
|---|---|---|---|---|
| ~~G1~~ | done | Earnings screen not live | Earnings screen wrapped in `TaskLiveListener` (earnings change when a task closes). `WalletCubit` is a local-only legacy cubit with no API; remove it or back it with the earnings API | Mobile |
| ~~G2~~ | done | Suspended/banned account kept working | `SocketService.enforceAccountStatus` + mobile `account:status` → logout | Both |
| ~~G3~~ | done | Scheduled broadcasts never sent | `sendDueScheduledBroadcasts` every 60 s. **If the API is scaled to more than one instance**, the SCHEDULED→SENT claim already prevents duplicates | Backend |
| G4 | P3 | Pool is re-read on every hint (N craftsmen × 1 GET) | Fine at current scale. If the load grows, send the task summary in `task:new` and insert it locally, with the GET as fallback | Both |
| G5 | P3 | Scaling to >1 API instance breaks emits across instances | Add `@socket.io/redis-adapter` (Redis already present) | Backend |
| G6 | P2 | Craftsmen who are *not eligible* (unverified, unavailable, other skill, out of radius, no billing) get no event, **by design**, and don't see the task in the pool either | Make it visible in the UI: the home banner already explains unverified/billing. Add an "Available for jobs is OFF" hint on the requests screen | Mobile |
| G7 | P2 | `migrations: unknown` in production `/health` | Check the `_prisma_migrations` table in prod and baseline if built with `db push` | Ops |
