# Notifications

## 1. Goal
In-app list + push for task, chat, verification, billing and system events; every item opens the right screen.

## 2. Backend contract

| Endpoint | Notes |
|---|---|
| `GET /notifications?mobile=true` | `[{ id, titleKey, bodyKey, timeKey, isRead, type, section, referenceId, entityType, createdAt }]` |
| `PUT /notifications/:id/read` | mark one |
| `PUT /notifications/read-all` | mark all |
| `DELETE /notifications/:id`, `DELETE /notifications` | delete one / all (persisted) |
| `POST /notifications/device-token` `{ token, platform: ANDROID\|IOS }` | push registration |

Socket: `notification:new`. Push payload carries `type`, `referenceId`, `entityType`.

## 3. Routing (`NotificationRouter`)

| `entityType` / type | Destination |
|---|---|
| `task` + customer mode | customer task detail (`referenceId` = taskId) |
| `task` + craftsman mode | active job detail / request detail by status |
| `chat` | thread (`referenceId` = roomId) |
| `verification` / `VERIFICATION` | verification dashboard |
| subscription / commission | billing screen |
| broadcast with `deepLink` | internal route or external URL |
| unknown | notifications list only (no crash) |

## 4. Flow
1. Screen open → load list; group by `section` (today/earlier).
2. Tap → optimistic `isRead=true` → `PUT …/read` → route.
3. Swipe to delete → optimistic remove → `DELETE` (restore on failure).
4. `notification:new` → prepend + badge++.

## 5. State & caching
`CustomerNotificationsCubit` (singleton), badge = unread count. List not cached (fresh each open).
Text: `NotificationText` maps known English server titles to `notif.<slug>.title/body` keys.

## 6. Test checklist
- [ ] Each type opens the correct screen in both modes.
- [ ] Read-all and delete-all persist after reload.
- [ ] Push tap from killed state routes after bootstrap.
