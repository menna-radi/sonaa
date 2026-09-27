# Craftsman · Active job lifecycle

## 1. Stages (craftsman side)

| Status | Craftsman can | Endpoint |
|---|---|---|
| PRE_CHAT_PENDING | submit pre-chat details, confirm | `POST /tasks/:id/prechat {details, areas}` → `POST /tasks/:id/prechat/accept` |
| CHAT_OPEN | chat, **propose agreement** (then confirm own side) | `POST /tasks/:id/agreement { finalPrice ≥0, scope 1–5000, scheduledAt ISO, details? }` → `POST …/agreement/confirm` |
| AGREEMENT_PENDING | wait / revise (reject → back to CHAT_OPEN) | `POST …/agreement/reject` |
| IN_PROGRESS | submit **work proof** (≥1 photo) | `POST /tasks/:id/work-proof { imageUrls[] }` |
| WORK_SUBMITTED | wait for customer confirmation (reminders at 24/48h, escalation 72h) | — |
| RATING_PENDING | rate the customer once | `POST /tasks/:id/rating { rating, comment? }` |
| CLOSED | view summary; chat stays open | — |
| any active | cancel/withdraw (reason) | `PUT /tasks/:id/status { status: "CANCELLED", cancelReason, cancelNote? }` |

Work-proof errors: 403 not the assigned craftsman, 409 not IN_PROGRESS, 400 invalid photos. Verification is
**not** required to finish an already-assigned job (only to take new ones).

## 2. Flow
1. Open from schedule card / My tasks / notification → `GET /tasks/:id?mobile=true`.
2. Status stepper with dates (`createdAt`, `acceptedAt`, `startedAt`, `completedAt`).
3. Action area per status (table). Chat button enabled when `TaskStatus.isChatAvailable(status)`; opens
   `chatRoomId` (one room per task).
4. **Agreement**: form (final price defaults to budget, scope, date/time) → propose → confirm own side
   automatically → "Waiting for customer".
5. **Work proof sheet**: pick ≤6 images → each uploads with progress (preview from local file) → submit → close
   with success → detail refetch.
6. Commands publish `TaskInvalidation`; home/schedule refresh.

## 3. State
`ActiveJobDetail` screen cubit/state + shared `CraftsmanJobsCubit` lists. Refetch on `task:status` for this id.

## 4. Test checklist
- [ ] Full flow to CLOSED; earnings today increase by the agreed price.
- [ ] Work proof photos preview correctly; errors explain the reason.
- [ ] Second task with the same customer has its own chat room.
- [ ] Cancel releases the reserved free task (billing status shows it again).
