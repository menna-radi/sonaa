# Chat (customer & craftsman)

## 1. Goal & actors
WhatsApp-like messaging between a customer and a craftsman. Two room kinds:
- **Direct room** — started from a craftsman profile ("Message"); one per customer→craftsman pair; never locked.
- **Task room** — one per task, created when **both sides confirm the pre-chat**; readable/writable only in
  chat statuses.

## 2. Screens
Inbox (bottom tab, per mode) → Thread. Entry points: inbox row, task detail chat icon (`chatRoomId`),
schedule card chat button, craftsman profile "Message", notification tap.

## 3. Backend contract

| Endpoint | Notes |
|---|---|
| `GET /chatrooms?mobile=true` (+ `x-acting-role`) | Inbox for the acting role only: rooms where the user is in that role's slot. Locked task rooms are excluded. Each item: `{ id, taskId, craftsman*/customer* fields, jobCategory, isOnline, unreadCount, messages:[lastMessage] }` |
| `POST /chatrooms` `{ craftsmanId }` (customer) / `{ customerId }` (craftsman) | Get-or-create the direct room for that exact pair → room + `otherParticipant` |
| `POST /craftsmen/:id/chat` | Customer shortcut → `{ chatRoomId }` |
| `GET /chatrooms/:id/messages?limit=50&before=<ISO>` | Newest page first; marks retrieved incoming as READ; 403 when a task room is locked |
| `POST /chatrooms/:id/messages` `{ content, imageUrl? }` | 201 message; 403 locked; moderation may reject |

Chat-open task statuses: `CHAT_OPEN, AGREEMENT_PENDING, IN_PROGRESS, WORK_SUBMITTED, RATING_PENDING, CLOSED,
COMPLETED, DISPUTED` (`TaskStatus.isChatAvailable`). Rooms created before their task are never locked.

Socket: `chat:message` (new message), `chat:message:read` (receipts), client `chat:acknowledge`.

## 4. Rules
- Inbox is **per mode**: messaging a craftsman as customer never appears in your craftsman inbox.
- Moderation (client + server): blocked words and phone-number slicing across messages are refused.
- Visibility: admin "whispers" (`CUSTOMER_PRIVATE`/`CRAFTSMAN_PRIVATE`) are shown only to their target.

## 5. Step-by-step flow
**Inbox**
1. Cubit hydrates from cache (`chat_conversations_<role>`) → paints instantly.
2. `GET /chatrooms?mobile=true` → merge into state (**union messages by id**, keep local history) → write cache.
3. Sort by last message time desc; unread badge = sum of `unreadCount` (nav bar badge).

**Open thread**
1. `setActiveRoom(roomId)` + `markAsRead(roomId)` locally.
2. `loadMessages(roomId)` → union with local messages (server copy wins per id), sorted oldest→newest.
3. Scroll to bottom; `chat:acknowledge` for incoming messages as they render.
4. Scroll to top → `loadOlderMessages(roomId)` with `before = oldest.time`; stop when page < limit.
5. 403/404 → mark room stale, remove it, refresh inbox, show "chat unavailable" (and redirect if an
   unambiguous replacement room exists).

**Send**
1. Validate (non-empty, moderation, slicing guard).
2. Append optimistic message `msg_user_<ts>` with status `sending`.
3. `POST …/messages` → replace optimistic with server message (id, time, status).
4. Failure → status `failed` + retry button (`retryMessage`); image messages keep the local path for retry.
5. Socket echo of own message → reconciled by text/image/time, never duplicated.

**Images**: add preview immediately (local path) → upload with progress → send with `imageUrl` → failures retry
without re-uploading when a URL already exists.

## 6. State management
- `CustomerChatCubit` / `CraftsmanChatCubit` (lazy singletons): `conversations`, `isLoading`, `errorMessage`,
  `searchQuery`, `staleConversationId`. `_activeRoomId` in the cubit.
- Helpers: `_unionMessages(local, server)`, `_isPending`, `_matchesConfirmed`, `_debouncedRefresh` (3s).

## 7. Caching
Inbox + recent messages cached for instant paint only; every server load merges by id. Clear on logout.

## 8. UX
- Pending: clock icon; sent: ✓; read: ✓✓ (blue). Failed: red icon + tap to retry.
- Day separators, grouped bubbles, quick replies (customer and craftsman share the same design).
- Locked task chat: disabled composer with "Chat opens after both confirm the pre-chat details".

## 9. Realtime
`chat:message` for an unknown room → debounced inbox refresh. App resume → inbox refresh + reload open page.

## 10. Edge cases
- Two tasks between the same pair → two task rooms + possibly one direct room (three threads, each labeled).
- Self-chat is impossible (server filters).
- Blocked users: `POST /profile/blocked { targetUserId }` → hide their rooms and block sending.

## 11. Test checklist
- [ ] Send text → no earlier message disappears; after app resume history is intact.
- [ ] Airplane mode send → failed → retry works.
- [ ] Image send with progress; retry after failure.
- [ ] Customer-started chat not in craftsman inbox (dual account).
- [ ] Task chat locked before pre-chat confirmation; opens after both confirm.
- [ ] Unread badge updates live and clears on open.
