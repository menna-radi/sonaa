# Realtime audit — "nothing updates until I leave the screen"

**Problem reported (2026-09-26):** in the craftsman app, actions made by the other side don't appear until
the screen is reopened or the app is restarted. A task posted by a customer doesn't appear for the craftsman
while the app is open, and in-app notifications don't arrive live.

This folder records the audit of the whole realtime chain (backend → socket/push → mobile → UI) and what
was fixed. It also holds the per-feature flow check and the test plan.

| File | Content |
|---|---|
| [README.md](README.md) (this) | Root causes, fixes, event catalog, how to verify |
| [feature-matrix.md](feature-matrix.md) | Every feature: backend action → events → mobile consumer → screen. Status and remaining gaps |
| [test-plan.md](test-plan.md) | Two-phone manual checklist + automated checks |

---

## 1. How realtime works (after the fix)

```
Backend action (commit)
  ├─ createNotification()  → DB row
  │     ├─ socket  notification:new  → user room        (NEW: live list/badge + task hint)
  │     └─ FCM push                                      (background / closed app)
  └─ SocketService.emitTaskStatus() → task:status        (participants; NEW: offered craftsmen on create / pool exit)

Mobile
  SocketService (one connection, auth token read per handshake)
    ├─ task:status        → TaskRealtimeBridge → TaskEventBus (remoteHint)
    ├─ notification:new   → TaskRealtimeBridge → notifications refresh + TaskEventBus (task refs)
    │                                          → verification / billing cubits (by entityType)
    └─ chat:message(:read)→ chat cubits
  TaskEventBus consumers (re-read from API, never trust the wire):
    CraftsmanHome · CraftsmanJobs (pool) · CraftsmanMap (NEW: reload) · CustomerTasks
    TaskLiveListener (NEW) on every open task screen + craftsman "My tasks"
  Resync: socket reconnect + app resume → untargeted invalidation + notifications refresh
```

## 2. Root causes found

| # | Where | Cause | Effect |
|---|---|---|---|
| R1 | Backend `task.service.createTask` | No socket event on task creation. Craftsmen got only an FCM push | New tasks never appeared live in the craftsman pool/map/home; depended on FCM delivery in the foreground |
| R2 | Backend `shared/services/notification.service` | `createNotification` sent **push only**, and the `notification:new` socket event was never emitted for normal notifications | In-app notification list and unread badge never updated live |
| R3 | Mobile | No listener for `notification:new` anywhere (the realtime doc said there was) | Same as R2, even for the 2 admin paths that did emit |
| R4 | Mobile `ActiveJobDetailScreen` | `StatelessWidget` rendering the snapshot map passed at navigation, never re-read | Craftsman's active job (stepper and action buttons) froze. Customer confirm/cancel/rate was invisible until reopen |
| R5 | Mobile `JobRequestDetailScreen`, customer `TaskDetailsScreen` | Loaded once in `initState`; no subscription to task events | Same freeze on the request and customer task screens |
| R6 | Mobile craftsman "My tasks" | One-shot `FutureBuilder`, no events | Current/history tabs stale |
| R7 | Mobile `CraftsmanMapCubit` | Remote hints only **removed** pins, never reloaded | New tasks never appeared on the craftsman map |
| R8 | Mobile `SocketService` | Handshake token fixed at connect time. Access token lives 1 h. Reconnect after expiry is rejected by the auth middleware, Socket.IO doesn't retry middleware rejections, and `reconnectionAttempts: 10` was a hard cap | After a network drop or backgrounding more than 1 h, the socket stayed **dead** until an HTTP 401 happened to refresh the token or the app restarted |
| R9 | Mobile | No app-level resume handling (only the chat cubits and the craftsman home screen) | After returning from background, missed events were not re-read and the socket was not revived |
| R10 | Mobile `SocketService.resetForNewAccount` | Cleared the app-level reconnect-resync callback registered once at startup | After logout → login, reconnects no longer triggered a resync |
| R11 | Backend pool | When a broadcast task was taken or cancelled, other offered craftsmen got nothing | Stale task stayed in their pool until refresh (accept then failed with 409) |
| R12 | Backend admin broadcast | Bulk `createMany` + push only | Admin announcements didn't appear live in the list |
| R13 | Backend `fileDispute` | No `task:status`; notifications sent **inside** the transaction | The other side didn't see "disputed" live, and a rolled-back dispute could still push |
| R14 | Backend: verification decision, auto-approve, commission reject, offer accept | `createNotification(…, tx)` without deferral pushed/emitted **before commit** | The phone could refetch before the change was visible (stale screen), and a rollback could leave a phantom push |
| R15 | Backend auth | Account status cached 60 s in Redis (HTTP + socket), never cleared on suspend/ban/unsuspend | A suspended user kept working up to a minute, and a reactivated one stayed locked out up to a minute. Open apps were never told |
| R16 | Backend | Scheduled admin broadcasts were stored as `SCHEDULED` and **never sent** (no scheduler) | Scheduled announcements silently lost |

## 3. What was fixed

### Backend (`Arox-backend`)
| Change | File |
|---|---|
| `createNotification` emits `notification:new` (`{id, type, title, body, referenceId, entityType, isRead, createdAt}`) to the user room at dispatch time (after commit for deferred notifications), then the FCM push | `src/shared/services/notification.service.ts` |
| Task create / reject→broadcast: every craftsman offered the task (DIRECT target or eligible BROADCAST pool) receives `task:status {taskId, status:"PENDING", event:"task:new"}` after commit | `src/modules/task/task.service.ts` |
| Pool exit (`ACCEPTED`/`PRE_CHAT_PENDING`/`CANCELLED`, and offer accepted): the other offered craftsmen (recipients of `NEW_BROADCAST_TASK`/`DIRECT_TASK_REQUEST`) get `task:status`, so their lists drop it | `TaskService.notifyPoolRemoval` |
| Removed 2 hand-rolled duplicate `notification:new` emits (emergency backup, suspension) | `src/modules/admin/admin.service.ts` |
| Admin broadcast emits `notification:new` per recipient | `AdminService.sendBroadcast…` |
| `emitTaskStatus` payload type gains optional `event: "task:new"` | `src/shared/services/socket.service.ts` |
| Dispute: `task:status DISPUTED` to both sides, notifications after commit | `TaskService.fileDispute` |
| Notifications inside transactions deferred until after commit (verification decision, auto-approve, commission reject, offer accept) | `admin.service.ts`, `verification.service.ts`, `commission.service.ts`, `task.service.ts` |
| `SocketService.enforceAccountStatus`: clears the status cache; on suspend/ban emits `account:status` and drops the user's sockets. Wired into admin suspend/unsuspend/ban, report moderation, and safety auto-suspend | `socket.service.ts`, `admin.service.ts`, `safety.service.ts` |
| Scheduled broadcasts delivered every minute (claimed SCHEDULED → SENT, so there are no duplicates), through the same path as immediate ones | `AdminService.sendDueScheduledBroadcasts`, `src/shared/services/scheduledBroadcast.service.ts`, `src/server.ts` |

### Mobile (`Arox-mobile-app`)
| Change | File |
|---|---|
| Handshake `auth` is a function that reads the **freshest stored token** on every (re)connect. No reconnection cap. On a rejected handshake it refreshes the token (`AuthInterceptor.refreshNow`, throttled 20 s) and retries. Adds `ensureConnected()` | `lib/core/services/socket_service.dart`, `lib/core/network/auth_interceptor.dart`, `lib/core/di/dependency_injection.dart` |
| Global reconnect callbacks that survive account boundaries (`onReconnect(global: true)`) | `socket_service.dart`, `lib/app/app_initializer.dart` |
| `TaskRealtimeBridge` listens to `notification:new`: refreshes the notifications list and badge (`refreshSilently`), emits a task hint for `entityType == task`, and refreshes the verification/profile/home cubits (`verification`) or subscription/home cubits (`subscription`/`commission`) when they are in use | `lib/core/services/task_realtime_bridge.dart`, `app_initializer.dart` |
| App resume: revive the socket, run an untargeted resync, refresh notifications | `app_initializer.dart` (`AppLifecycleListener`) |
| `TaskLiveListener` widget re-reads a task on any remote change for that task (or on resync) | `lib/core/widgets/task_live_listener.dart` |
| Active job, job request and customer task details are live, and so is craftsman "My tasks" (silent refresh, no spinner flash) | `active_job_detail_screen.dart`, `job_request_detail_screen.dart`, `task_details_screen.dart`, `craftsman_my_tasks_screen.dart` |
| Craftsman map reloads (debounced 600 ms) on remote hints, so new tasks get pins | `craftsman_map_cubit.dart` |
| `CustomerNotificationsCubit.refreshSilently()` (coalesced, no loading flash) | `customer_notifications_cubit.dart` |
| Customer **offers section** is live (new offers appear). `offer`/`dispute` notifications count as task hints | `task_offers_section.dart`, `task_realtime_bridge.dart` |
| Craftsman **earnings** screen re-reads on task events (a closed task credits earnings) | `craftsman_earnings_screen.dart` |
| `account:status` → logout + login screen + "account suspended" message | `task_realtime_bridge.dart`, `app_initializer.dart` |

## 4. Event catalog (server → client)

| Event | Emitted when | To | Payload | Mobile consumer |
|---|---|---|---|---|
| `task:status` | Every task transition (status, pre-chat, agreement, work proof, rating, dispute, admin freeze/unfreeze/dispatch) | Participants (customer, craftsman, actor) | `{taskId, status, updatedAt, actorRole}` | Bridge → bus |
| `task:status` + `event:"task:new"` | Task created / converted to broadcast | Offered craftsmen | `{taskId, status:"PENDING", event}` | Bridge → bus → pool, home, map |
| `task:status` (pool exit) | Broadcast task accepted/cancelled/offer accepted | Other offered craftsmen | `{taskId, status}` | Bridge → bus → pool, map drop it |
| `notification:new` | Every `createNotification` plus admin broadcasts | The recipient | `{id, type, title, body, referenceId, entityType, isRead, createdAt}` | Bridge → notifications, task hint, verification/billing |
| `notification:new` (chat preview, no `id`) | New chat message | Room participants | `{type, title, body, …}` | Ignored by the bridge (chat cubits use `chat:message`) |
| `chat:message` | Message sent | `chat_<room>` + both user rooms | Message | Chat cubits |
| `chat:message:read` | Read receipt | `chat_<room>` | `{messageId, roomId}` | Chat cubits |
| `account:status` | Admin suspends/bans, or safety auto-suspends | The user | `{status}` (then sockets dropped) | Bridge → logout |
| `craftsman:location` | Craftsman location update | Map cell room | Location | Customer map |
| `location:client:<taskId>` | Craftsman en route | Tracking room | Coordinates | Live tracking |

## 5. How to verify

- **Backend, automated:** `node scripts/e2e/realtime.mjs http://localhost:3100` (local E2E stack; see
  `scripts/e2e/README.md`). It opens a customer and a craftsman socket and asserts all of the following:
  - The craftsman gets `task:new` within **~150 ms** of the customer posting.
  - The craftsman gets `notification:new` (`NEW_BROADCAST_TASK`).
  - The customer gets `task:status` within **~25 ms** of the accept.
  - The customer gets `notification:new` (`TASK_ACCEPTED`).

  It also checks that an admin broadcast arrives live, a scheduled broadcast is delivered when due, and
  that suspension sends `account:status`, drops the socket and blocks the API immediately (unsuspend
  restores it).

  Last run: 44/44. The backend Jest suite is 336/336, journey1 71/71, journey2 21/21.
- **Mobile, automated:** `flutter test test/realtime_refresh_test.dart`, which covers the live listener
  targeting and debounce, the map adding a new task on a hint, `notification:new` routing, and
  `account:status`. Full suite 258/258.
- **Manual (two phones):** [test-plan.md](test-plan.md).

## 6. Deployment notes
- Deploy the backend (the Docker image runs `prisma migrate deploy` first; no new migration in this change).
- Production `/health` currently reports `push: enabled` and `migrations: unknown`. `unknown` means the
  `_prisma_migrations` table can't be read. Check whether production was built with `db push`, and if so
  baseline it (open decision from the migration-history item).
- Single API instance today. If the API is ever scaled to more than one container, add the Socket.IO
  Redis adapter (`@socket.io/redis-adapter`); otherwise emits only reach sockets on the same instance.
