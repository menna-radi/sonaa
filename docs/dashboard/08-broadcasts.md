# 08 · Broadcast notifications

## Backend contract
| Endpoint | Body |
|---|---|
| `POST /admin/notifications/broadcast` | `{ title ≥3, body ≥3, audience: ALL\|CUSTOMERS\|CRAFTSMEN, targetCity?, imageUrl?, deepLink?, scheduledAt? (ISO) }` |
| `GET /admin/notifications/broadcasts` | history |
| `DELETE /admin/notifications/broadcasts/:id` | cancel scheduled / remove |

Delivery: in-app notification + FCM push to matching users; app routes `deepLink` (internal route or URL).

## Flow
1. Composer with audience + optional city, preview of push and in-app card, character counters.
2. Confirmation modal showing the estimated recipients.
3. Mutation → invalidate history. Scheduled items show "scheduled" until sent.

## Test checklist
- [ ] CRAFTSMEN audience not received by customer-only users.
- [ ] Deep link opens the right screen in the app.
