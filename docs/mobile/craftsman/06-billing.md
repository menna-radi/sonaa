# Craftsman · Billing (free tasks → subscription or commission)

## 1. Rules (server)
1. Every craftsman starts with **`FREE_TASKS_COUNT`** free tasks (dashboard setting, default 3).
2. A free slot is **reserved at assignment** (accept / offer accepted) and **refunded on cancel**; consumed at
   completion (`freeTaskReserved`).
3. With no free slots, taking work requires a billing model:
   - `SUBSCRIPTION`: active and unexpired plan (Bit receipt approved by admin). An active paid plan with no
     recorded model counts as SUBSCRIPTION.
   - `COMMISSION`: allowed until unpaid commission locks the account (`COMMISSION_LOCKED`).
4. Existing assigned work is never blocked by billing — only new accepts/offers.
5. **While an active, unexpired subscription covers the job, no free task is used** — free tasks are kept for
   later (e.g. after the plan expires). The card then says "saved for later" and shows used · in progress · left.

## 2. Backend contract

| Endpoint | Notes |
|---|---|
| `GET /commission/status` | `{ success, data: { freeTasksRemaining, freeTasksAvailable, freeTasksReserved, freeTasksConsumed, freeTasksTotal, billingModel: null\|SUBSCRIPTION\|COMMISSION, commissionLocked, commissionDue } }` |
| `POST /commission/billing-model { billingModel: SUBSCRIPTION\|COMMISSION }` | blocked while debt/pending payment |
| `GET /commission/ledger` | commission entries |
| `POST /commission/payments { paymentProofUrl, notes? }` | pay-to-unlock receipt (admin approves) |
| `GET /subscriptions/plans` | `{ success, data: { plans[], bitConfig, bitSettings } }` (plan: `id, key, nameEn/Ar, durationMonths, price, currency, featuresEn/Ar, isPopular`) |
| `GET /subscriptions/current` | `{ success, data: { status: ACTIVE\|EXPIRED\|…, isAllowedToAcceptTasks, startDate, expiryDate, daysRemaining, pendingRequest, freeTasks* (same 5 fields), commissionRate (e.g. 0.08), billingModel, commissionLocked, commissionDue } }` — a brand-new craftsman reads `EXPIRED` + `isAllowedToAcceptTasks: true` (free tasks) |
| `POST /subscriptions/request { planId, paymentProofUrl, notes? }` | one pending request at a time (second → 4xx) |

## 3. Flow
1. **Billing screen**: show free tasks "X of Y left" or current plan/commission rate — never a red warning while
   the craftsman can still work.
2. Accept blocked with `BILLING_MODEL_REQUIRED` → sheet: "Subscribe" or "Pay commission per job".
3. **Subscribe**: plans → Bit instructions (phone, recipient, amount) → upload receipt → `POST /subscriptions/request`
   → "Pending approval" state → push on approval → status ACTIVE (days remaining).
4. **Commission**: `POST /commission/billing-model {COMMISSION}` → accept works; when locked, "Pay balance"
   → Bit receipt → `POST /commission/payments` → pending → unlocked on approval.

## 4. State & caching
`CraftsmanSubscriptionCubit` (singleton) + commission cubit. Plans/Bit settings cached 6h; **status never cached**
— reload before showing the accept button result.

## 5. Test checklist
- [ ] 3 free accepts → 4th asks for a plan; task stays in the list.
- [ ] Cancel after accept returns the slot.
- [ ] Receipt pending → second request refused; approval → ACTIVE → accept works.
- [ ] Commission lock → accept blocked with pay-to-unlock path.
