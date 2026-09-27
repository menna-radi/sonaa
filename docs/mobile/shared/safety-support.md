# Safety & support

## 1. Backend contract

| Endpoint | Body | Notes |
|---|---|---|
| `POST /safety/emergency` | `{ latitude, longitude, taskId? (uuid) }` | Creates SOS; admins alerted in realtime (`broadcastToAdmin`) |
| `PUT /safety/emergency/:id/location` | `{ latitude, longitude }` | Stream every 10–15s while active |
| `PUT /safety/emergency/:id/resolve` | — | User marks safe |
| `POST /safety/discreet-report` | `{ reportedUserId (uuid), category, description?, attachmentUrl?, taskId?, chatRoomId? }` — **taskId or chatRoomId required** | Categories: `INAPPROPRIATE_CONDUCT, VEHICLE_SAFETY, VERBAL_ABUSE, THEFT, PROPERTY_DAMAGE, OTHER` |
| `GET /help/faqs` | — | Cache 24h |
| `POST /help/ticket` | `{ subject, message, category? (default GENERAL), contactChannel? }` | |
| `POST /profile/feedback` | `{ message }` (10–2000 chars) | App feedback |

## 2. Flows
**SOS**: long-press button (prevent accidents) → get GPS (fallback last known) → `POST /safety/emergency` →
full-screen "Help is on the way" with a location stream (foreground service on Android) → "I'm safe" →
`resolve`. Offline → offer to call local emergency number directly.
**Discreet report**: from chat/task menu → category + description → submit → confirmation (no notification to
the reported user).

## 3. State & caching
Screen-scoped cubits; no caching except FAQs. SOS state persisted locally so a restart resumes the active SOS.

## 4. Test checklist
- [ ] SOS appears in the dashboard live activity within seconds.
- [ ] Location updates continue with the screen locked.
- [ ] Report from chat links the room id.
