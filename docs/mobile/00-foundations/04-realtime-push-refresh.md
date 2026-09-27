# 03 · Realtime, push & refresh

> Full audit, fixes, per-feature flow matrix and the two-phone test plan: [../realtime/](../realtime/README.md).
> This page is the short reference.

## 1. Channels

| Channel | Transport | Used for |
|---|---|---|
| Socket.IO | `SocketService` (single connection, auth = access token) | chat messages, read receipts, task status signals, live craftsman locations, in-app notifications |
| Push (FCM) | `PushNotificationService` | background/closed-app alerts; tap → deep link |
| Refresh coordinator | `TaskRefreshCoordinator` | coalesced re-fetch on hints, bounded polling fallback |
| Local bus | `TaskEventBus` | same-device invalidation after commands |

## 2. Socket events

Server → client:

| Event | Payload (key fields) | Consumer |
|---|---|---|
| `chat:message` | `{ id, chatRoomId, senderId, senderRole, content, imageUrl, createdAt, status }` | Customer/Craftsman chat cubits (`ChatWire.message`) |
| `chat:message:read` | `{ roomId, messageId?, readerId }` | Flip own bubbles to read |
| `task:status` | `{ taskId, status, updatedAt, actorRole, event? }` (`event:"task:new"` for offered craftsmen on create; also sent to offered craftsmen when a task leaves the pool) | `TaskRealtimeBridge` → `TaskEventBus` (signal only; refetch) |
| `notification:new` | `{ id, type, title, body, referenceId, entityType, isRead, createdAt }` (emitted by every `createNotification`; chat previews have no `id`) | `TaskRealtimeBridge` → `CustomerNotificationsCubit.refreshSilently()` + task hint (`task`/`offer`/`dispute`) + verification/billing cubits |
| `account:status` | `{ status }` (SUSPENDED/BLOCKED; sockets are dropped right after) | `TaskRealtimeBridge` → logout |
| `craftsman:location` | `{ craftsmanId, lat, lng }` | Customer map (subscribed area) |
| `location:update` | `{ taskId, lat, lng }` | Live tracking of an active task |

Client → server:

| Event | Payload | When |
|---|---|---|
| `chat:acknowledge` | `{ messageId, roomId }` | Message rendered in the open thread |
| `map:subscribe` / `map:unsubscribe` | `{ lat, lng }` | Customer map visible / hidden |
| `location:update` | `{ taskId, lat, lng }` | Craftsman en route (active task) |
| `location:track` | `{ taskId }` | Customer opens live tracking |

Rules:
1. **Payloads are signals, not truth.** For tasks, always refetch `GET /tasks/:id` — never apply status from the wire.
2. Register long-lived listeners with `onPersistent` so they survive reconnects; screen listeners use `on/off`
   in `initState/dispose` with a stable callback reference (no duplicates).
3. After reconnect: rejoin happens server-side on connect (rooms by membership); client runs one coalesced refresh.
4. Dedupe chat messages by id; reconcile optimistic messages (`msg_user_*`) with the echo by
   text + image + |Δt| < 90s.

## 3. Refresh strategy per surface

| Surface | On open | While visible | Hints |
|---|---|---|---|
| Home (both roles) | load | none | `TaskEventBus` (socket/push/reconnect/resume) |
| Task detail (customer, craftsman request, craftsman active job) | load | none | `TaskLiveListener` → re-read on events for that id + untargeted resyncs |
| Task lists (customer tasks, craftsman pool, craftsman "My tasks") | load (+ pull-to-refresh) | none | `TaskEventBus` / `TaskLiveListener(taskId: null)`, resume |
| Customer offers section | load | none | `TaskLiveListener` for the task |
| Craftsman earnings | profile load | none | `TaskLiveListener(taskId: null)` |
| Chat inbox | cache → load | none | `chat:message` for unknown room → debounced (3s) list refresh |
| Chat thread | `loadMessages` | none | `chat:message` for room; resume → reload page |
| Notifications | load | none | `notification:new` |
| Customer map | load | none | `craftsman:location` |
| Craftsman map | load | none | `TaskEventBus` → debounced reload (600 ms) |

`TaskRefreshCoordinator.requestRefresh(key, work)` guarantees one in-flight read per key and at most one
trailing read. `suspend()`/`resume()` wrap the account boundary (`resetTaskSessions`). `startBoundedPolling` exists but
is **not used**: the socket is the live channel, and reconnect/resume resync covers gaps.

## 4. Push notifications

1. After login: request permission → `POST /notifications/device-token { token, platform }`; re-send on token refresh.
2. Foreground push: don't show a system banner for the open chat room; update badges instead.
3. Tap: route with `NotificationRouter` using `entityType` + `referenceId`
   (task → task detail for the current role, chat → room, verification → dashboard, subscription → billing).
4. Logout: stop listening; the server stops sending when the token is replaced by another account's.

## 5. Lifecycle

App-level `AppLifecycleListener` (in `AppInitializer`), on resume:
1. `SocketService.ensureConnected()`.
2. An untargeted `TaskEventBus` resync (only when the socket stayed connected; a real reconnect fires the reconnect resync).
3. `CustomerNotificationsCubit.refreshSilently()`.

The chat cubits also reload the open room on resume.

## 6. Socket authentication

- The handshake `auth` is a **function**: every connect and automatic reconnect reads the freshest stored access token
  (tokens live 1 h).
- A rejected handshake calls `AuthInterceptor.refreshNow()` (throttled 20 s) and retries. Socket.IO never retries
  middleware rejections on its own.
- Reconnection is unlimited (1 s → 10 s backoff).
