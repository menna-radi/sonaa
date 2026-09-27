# Customer · My tasks & task lifecycle

## 1. State machine (server-enforced)

```
PENDING ──craftsman accepts / customer accepts offer──▶ PRE_CHAT_PENDING
PRE_CHAT_PENDING ──both submit details + both confirm──▶ CHAT_OPEN (task chat room created)
CHAT_OPEN ──agreement proposed──▶ AGREEMENT_PENDING ──both confirm──▶ IN_PROGRESS (startedAt)
IN_PROGRESS ──craftsman work proof──▶ WORK_SUBMITTED ──customer confirms──▶ RATING_PENDING (completedAt)
RATING_PENDING ──both rate──▶ CLOSED
Side: CANCELLED (reason), REJECTED (direct request declined → broadcast), DISPUTED, FROZEN (admin)
```

Groups: `statusGroup=ACTIVE` = ACCEPTED…WORK_SUBMITTED + DISPUTED + FROZEN; `HISTORY` = COMPLETED, RATING_PENDING,
CLOSED, CANCELLED, REJECTED.

## 2. Backend contract (customer side)

| Action | Endpoint | Body |
|---|---|---|
| Lists | `GET /tasks?statusGroup=ACTIVE\|HISTORY&mobile=true&limit=50` (+ `x-acting-role: CUSTOMER`) | |
| Detail | `GET /tasks/:id?mobile=true` | returns `imageUrls[]`, `preChatDetail`, `agreements[]`, `offers[]`, `workProofImageUrls[]`, `feedbacks[]`, `chatRoomId`, `cancelReason`, `createdAt/acceptedAt/startedAt/completedAt` |
| Offers (OPEN price) | `GET /tasks/:id/offers`; `POST /tasks/:id/offers/:offerId/accept\|reject` | accept → PRE_CHAT_PENDING, other offers CLOSED |
| Broadcast after decline | `POST /tasks/:id/broadcast` | |
| Pre-chat | `POST /tasks/:id/prechat { details:{notes}, areas:{service,location,time,scope,estimate(number),notes} }` then `POST /tasks/:id/prechat/accept` | |
| Agreement | `POST /tasks/:id/agreement/confirm` or `/reject` (either side may also propose: `{ finalPrice, scope, scheduledAt }`) | |
| Confirm completion | `PUT /tasks/:id/status { status: "COMPLETED" }` (only from WORK_SUBMITTED) | → RATING_PENDING |
| Cancel | `PUT /tasks/:id/status { status: "CANCELLED", cancelReason (≤50), cancelNote? (≤500) }` | releases the craftsman's reserved free task |
| Rating | `POST /tasks/:id/rating { rating 1–5, comment? }` | 409 `FEEDBACK_ALREADY_EXISTS` (pending), 400 `INVALID_TASK_STATUS` (closed) |
| Dispute | `POST /tasks/:id/dispute { reason: SERVICE_QUALITY\|OVERCHARGING\|NO_SHOW\|SAFETY_CONCERN\|OTHER, description }` | → DISPUTED |

## 3. Step-by-step

Full paths also used: `POST /tasks/:id/offers/:offerId/reject`, `POST /tasks/:id/agreement/reject` (back to CHAT_OPEN). Legacy: `POST /tasks/:id/feedback` (customer-only rating from old clients) — new code uses `POST /tasks/:id/rating`.

1. **Lists** (tabs Active / History): load on open + pull-to-refresh; card shows status badge (`TaskStatus.badgeFor`),
   price, date, craftsman.
2. **Detail**: header images pager (all `imageUrls`), status stepper with a date per stage
   (created → accepted → started → completed), action area driven by status:
   - PENDING (OPEN price): offers list → accept/reject.
   - PRE_CHAT_PENDING: pre-chat sheet (submit details → confirm). Chat icon disabled.
   - CHAT_OPEN / AGREEMENT_PENDING: chat button (`chatRoomId`), agreement card (confirm/reject).
   - IN_PROGRESS: "waiting for work proof".
   - WORK_SUBMITTED: proof images → "Confirm completion" or "Open dispute".
   - RATING_PENDING: rate the craftsman (once).
   - CLOSED: summary + both ratings.
3. Every command: in-flight guard → call → on success refetch detail + publish `TaskInvalidation` → lists refresh.
4. Cancel: sheet with reasons (incl. "Something else" + note) → the sheet pops itself with a result (no double-pop).

## 4. State
`CustomerTasksCubit` (singleton lists) + `TaskDetailsCubit` (screen). Detail refetches on `task:status` for its id
and on resume.

## 5. Caching
None for tasks (the other party changes state at any time).

## 6. Realtime
`task:status` → bridge → bus → refetch. Push "Work submitted", "Agreement proposed" etc. deep link to detail.

## 7. Test checklist
- [ ] Full journey to CLOSED with dates on every stage.
- [ ] Cancel with "Something else" → no crash, reason visible.
- [ ] Rating twice → "already rated".
- [ ] Chat icon disabled before pre-chat confirmation, works after (incl. CLOSED).
- [ ] Direct request declined → "post to everyone" works.
