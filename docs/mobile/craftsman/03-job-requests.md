# Craftsman · Job requests & accepting

## 1. Sources
- **Open pool**: `PENDING` + `BROADCAST` + unassigned tasks whose `serviceType` is in the craftsman's **skill
  categories** (from verification step 4 — not the profile title), not self-posted. Visible only when
  `isAvailable && isVerifiedId && billing eligible`.
- **Direct requests**: `PENDING` tasks with `targetCraftsmanProfileId` = me (always visible).

`GET /tasks?status=PENDING&mobile=true&limit=50` (+ `x-acting-role: CRAFTSMAN`).

## 2. Actions

| Action | Endpoint | Result / errors |
|---|---|---|
| Accept (SPECIFIC price) | `PUT /tasks/:id/status { status: "ACCEPTED" }` | → `PRE_CHAT_PENDING`, free task reserved. Errors: `CRAFTSMAN_NOT_VERIFIED`, `BILLING_MODEL_REQUIRED`, `SUBSCRIPTION_REQUIRED`, `COMMISSION_LOCKED`, `CRAFTSMAN_LOAD_LIMIT_EXCEEDED`, `OFFER_REQUIRED` (OPEN price), 409 already taken |
| Send offer (OPEN price) | `POST /tasks/:id/offers { amount > 0, note? ≤500 }` | `{ offerId, taskId, amount, status }`; same eligibility errors |
| Decline direct request | `PUT /tasks/:id/status { status: "REJECTED" }` | customer can broadcast it |
| Hide pool task | local only (`_declinedIds`) + optional reason sheet | pool tasks can't be "rejected" server-side (400) |

## 3. Flow
1. Request card → detail (images pager, description, distance, budget, customer).
2. **Accept**: confirm sheet → in-flight guard → call →
   - success: remove from requests, add to schedule, snackbar "Moved to today's schedule" + action "View" →
     navigates to My tasks/active job.
   - error: branch on code → verification sheet / billing sheet / load-limit message / refresh (409).
3. **Offer**: amount sheet (currency, min > 0) → submit → "Offer sent" state on the card.
4. **Decline**: reason sheet → hide locally (pool) or `REJECTED` (direct).

## 4. State
Requests live in `CraftsmanHomeCubit.jobRequests` and `CraftsmanJobsCubit` (Jobs tab: available / my tasks).
Accept is idempotent per task id (in-flight set).

## 5. Test checklist
- [ ] Plumber skills → only plumbing pool tasks.
- [ ] 4th free-task accept without plan → billing sheet, task stays listed.
- [ ] Two craftsmen accept at once → one wins, other gets "already taken".
- [ ] Unverified → verification sheet (no generic error).
