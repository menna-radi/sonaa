# 08 · Backend tickets (repo `Arox-backend`, track **B**)

Why: the dashboard can only be correct if the admin API stops lying, leaking and skipping validation (defects **G-xx** in [00 §6](00-backend-deep-dive.md)).
These tickets are **additive and backward-compatible** — the frontend works without them (it hides features whose endpoint answers 404, see [03 §8](03-data-contract.md)).

## Rules for every backend ticket
- Repo: `D:\Mohamed Ali\Arox App\Arox-backend`, Node 24, TypeScript, Express, Prisma, Zod, path alias `@/…` → `src/…`.
- Follow the existing style: controller `static async x(req,res,next){ try { … } catch(e){ next(e) } }`, service methods on `AdminService`, errors from `@/shared/errors/AppError` (`BadRequestError`, `ConflictError`, `NotFoundError`, `AppError(msg,status,CODE)`), audit via `writeAuditLog` from `@/shared/services/audit.service`, notifications via `createNotification` from `@/shared/services/notification.service`.
- **Never** run `prisma migrate`/`db push` (no database is available). For a schema change: edit `prisma/schema.prisma`, hand-write `prisma/migrations/<YYYYMMDDHHMMSS>_<name>/migration.sql` (use timestamps ≥ `20261004000000`, increasing), then run `npx prisma generate`.
- **Backward compatibility rule for lists:** paginate **only when the request has a `page` query parameter**; without it keep today's response shape (plain array). Paginated shape is always `{ items, total, page, limit }`.
- Validation: every new/changed route validates `req.body`/`req.query` with Zod in `admin.validators.ts` (strict: unknown keys stripped, never spread into Prisma).
- Admin routes stay under `router.use(authenticate); router.use(authorize("ADMIN"))`.
- Add `/** … */` doc comment per new route in `admin.routes.ts`. Update `API_DOCUMENTATION.md` only in ticket **B25**.
- **Gate (runs automatically):** `npx tsc --noEmit` and `npx eslint src/` must pass. If you add pure unit tests, name them `*.unit.test.ts` under `__tests__/` (they run with `npx jest -c jest.unit.config.js`); do not write DB integration tests.
- Do not touch `dist/`, `node_modules/`, `.env*`, `uploads/`.

Priority: **P0** = security/correctness, do first · **P1** = needed by a frontend feature · **P2** = polish.

---

### T-B01 · Admin input validation for billing, settings, dispatch (G-03, G-21)
- repo: backend
- tier: low
- priority: P0
- files: src/modules/admin/admin.validators.ts; src/modules/admin/admin.controller.ts; src/modules/admin/admin.service.ts
- gate: backend

Add these Zod schemas to `admin.validators.ts` and use them in the controller (replace every direct use of `req.body`):
```ts
export const planKeySchema = z.string().trim().toUpperCase().regex(/^[A-Z0-9_]{3,32}$/, "Key must be 3-32 chars: A-Z, 0-9, _");
const featureList = z.array(z.string().trim().min(1).max(120)).max(10);
export const createPlanSchema = z.object({
  key: planKeySchema, nameEn: z.string().trim().min(3).max(80), nameAr: z.string().trim().min(3).max(80),
  durationMonths: z.number().int().min(1).max(36), price: z.number().positive().max(100000),
  featuresEn: featureList.default([]), featuresAr: featureList.default([]), isPopular: z.boolean().default(false),
});
export const updatePlanSchema = createPlanSchema.omit({ key: true }).extend({ isActive: z.boolean() }).partial()
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field is required" });
export const rejectReasonSchema = z.object({ reason: z.string().trim().min(3, "Reason must be at least 3 characters").max(500) });
export const extendSubscriberSchema = z.object({ days: z.number().int().min(1).max(3650) });
export const freeTasksSchema = z.object({ freeTasksRemaining: z.number().int().min(0).max(100) });
export const bitSettingsSchema = z.object({
  BIT_PHONE_NUMBER: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/).optional(),
  BIT_RECIPIENT_NAME: z.string().trim().min(2).max(80).optional(),
  BIT_INSTRUCTIONS_EN: z.string().trim().min(10).max(1000).optional(),
  BIT_INSTRUCTIONS_AR: z.string().trim().min(10).max(1000).optional(),
}).strict().refine((v) => Object.keys(v).length > 0, { message: "At least one Bit setting is required" });
export const dispatchBackupSchema = z.object({ craftsmanProfileId: z.string().uuid() });
export const suspendSchema = z.object({ reason: z.string().trim().min(3).max(300).optional() });
export const toggleAutoVerificationSchema = z.object({ enabled: z.boolean() });
```
Controller changes: `createSubscriptionPlan`→`createPlanSchema.parse`; `updateSubscriptionPlan`→`updatePlanSchema.parse` and the service must `select` only those keys (no spreading of arbitrary data); `rejectSubscriptionRequest` and `rejectCommissionPayment`→`rejectReasonSchema` (reason now **required**); `extendSubscriber`→`extendSubscriberSchema` (remove `parseInt || 30`); `setCraftsmanFreeTasks`→`freeTasksSchema`; `updateBitSettings`→`bitSettingsSchema`; `dispatchBackup`→`dispatchBackupSchema`; `suspendCraftsman`→`suspendSchema`; `toggleAutoVerificationSetting`→`toggleAutoVerificationSchema`. In `AdminService.updateSettings` replace the passthrough with an allow-list (see T-B06). Keep response shapes unchanged. Zod errors already become `400 VALIDATION_ERROR` via the global handler.

### T-B02 · Subscription plans: stats, guards, no seeding in GET (G-05, G-06, G-27)
- repo: backend
- tier: low
- priority: P1
- depends: T-B01
- files: src/modules/admin/admin.service.ts; src/modules/admin/admin.controller.ts
- gate: backend

1. `getSubscriptionPlans()` must **not** write: delete the default-seeding branch (call `SubscriptionService.seedDefaultsIfNeeded()` from `@/modules/subscription/subscription.service` once at the start instead — it already seeds idempotently). Always return `{ id,key,nameEn,nameAr,durationMonths,price:number,currency:"ILS",currencySymbol:"₪",featuresEn,featuresAr,isPopular,isActive,subscribersCount,pendingRequests,createdAt,updatedAt }[]` ordered by `durationMonths`.
   - `pendingRequests` = count of `SubscriptionRequest` with that `planId` and status `PENDING_VERIFICATION`.
   - `subscribersCount` = count of **distinct users** with an `APPROVED` request for that plan whose craftsman profile `subscriptionStatus = ACTIVE` and `subscriptionExpiryDate > now`. Use two `groupBy`/`count` queries, not N+1.
2. `createSubscriptionPlan`: on duplicate `key` throw `ConflictError("A plan with this key already exists")`; write audit `SUBSCRIPTION_PLAN_CREATED` (`targetType "SubscriptionPlanConfig"`, `after` = plan). Needs `adminId` → pass `req.user!.id`.
3. `updateSubscriptionPlan`: 404 if missing; audit `SUBSCRIPTION_PLAN_UPDATED` with `before`/`after`.
4. `deleteSubscriptionPlan(id, adminId)`: 404 if missing; if any `SubscriptionRequest` references the plan → **soft delete** (`isActive:false`) and return `{ deleted:false, deactivated:true }`; else hard delete → `{ deleted:true, deactivated:false }`. Audit `SUBSCRIPTION_PLAN_DELETED`.
5. Delete the unused `getSubscriptionPlansStats` (reads the retired customer table).

### T-B03 · Subscription requests: status guards, pagination, search (G-04, G-12)
- repo: backend
- tier: low
- priority: P0
- depends: T-B01
- files: src/modules/admin/admin.service.ts; src/modules/admin/admin.controller.ts; src/modules/admin/admin.validators.ts
- gate: backend

1. `approveSubscriptionRequest`: only `PENDING_VERIFICATION` may be approved; otherwise `ConflictError("This request has already been reviewed")`. Keep the commission-debt guard. Format dates in the chat/notification text with `toISOString().slice(0,10)` (not server locale).
2. `rejectSubscriptionRequest`: same guard; run the request update + `craftsmanSubscription.updateMany` + chat message inside one `prisma.$transaction`; send the notification after commit.
3. `getSubscriptionRequests`: add query schema `{ status?: string; page?: coerce int ≥1; limit?: coerce int 1-100; q?: string }`. If `page` is present return `{ items, total, page, limit }` (items = same mapped objects as today, plus `planId`), applying `status` filter (`PENDING_VERIFICATION|APPROVED|REJECTED|CANCELLED|ALL`) and `q` (case-insensitive match on user first/last name, phone, `planTitle`). Without `page` keep the legacy array.
4. Validate `status` values (400 on unknown).

### T-B04 · Subscribers: filters, pagination, billing fields, safer cancel/extend (G-12, G-20, G-21)
- repo: backend
- tier: mid
- priority: P1
- depends: T-B01
- files: src/modules/admin/admin.service.ts; src/modules/admin/admin.controller.ts; src/modules/admin/admin.validators.ts
- gate: backend

1. `getSubscribers(params)` with schema `{ page?, limit?(1-100), q?, filter?: "all"|"active"|"free"|"commission"|"locked"|"expired" }`. With `page` → `{ items, total, page, limit }`, else legacy array. Filters (Prisma `where` on `CraftsmanProfile`): `active` = `subscriptionStatus ACTIVE` & `subscriptionExpiryDate > now`; `free` = `freeTasksRemaining > 0`; `commission` = `billingModel COMMISSION`; `locked` = `commissionLocked true`; `expired` = not active. `q` = name/phone/email. Order by `subscriptionExpiryDate desc nulls last`.
2. Each item keeps today's fields and adds `commissionDue` (sum of DUE ledger amounts via one grouped query for the page) and `avatarUrl`.
3. `cancelSubscriber(id, adminId, reason?)`: in a transaction set `subscriptionStatus "EXPIRED"`, `subscriptionExpiryDate = now`, and `craftsmanSubscription` rows `ACTIVE` → `EXPIRED`; notify the craftsman (`PAYMENT`, entityType `subscription`, "Your subscription was cancelled by administration"); audit keeps before/after + reason. Body `{ reason?: string(≤300) }`.
4. `extendSubscriber`: body validated by T-B01; also update `craftsmanSubscription` latest ACTIVE row `endDate`; notify the craftsman ("Your subscription was extended by N days"); audit as today.

### T-B05 · Commission admin API: summary, ledger, waive, receipts with ledger (new)
- repo: backend
- tier: mid
- priority: P1
- depends: T-B01
- files: src/modules/admin/admin.service.ts; src/modules/admin/admin.controller.ts; src/modules/admin/admin.routes.ts; src/modules/admin/admin.validators.ts
- gate: backend

New routes (all admin):
- `GET /admin/commission/ledger?status=DUE|PAID|ALL&craftsmanId&page&limit` → `{ items, total, page, limit, totals:{ due:number, paid:number } }`. Item: `{ id, taskId, taskDisplayId, craftsmanProfileId, craftsmanName, amount:number, rate:number, status, paymentId, createdAt, paidAt }` (join `task.displayId`, craftsman name). Always paginated (default page 1, limit 20).
- `POST /admin/commission/ledger/:id/waive` body `{ reason: min 3 }` → only `DUE` entries without a `PENDING` payment (`paymentId` null or payment not PENDING): in a transaction set `status "PAID"`, `paidAt now` (waived), and if the craftsman has no other DUE rows set `commissionLocked=false`; notify (`COMMISSION_UNLOCKED` if unlocked else `PAYMENT`); audit `COMMISSION_WAIVED` with reason. Conflict (409) if linked to a pending payment.
- `GET /admin/commission-payments`: add optional `page/limit/q` pagination (same rule as B03) and include `ledgerEntries: [{ id, taskId, taskDisplayId, amount }]` in each item. Add `reason` param validation (already in T-B01).
Response numbers are JS numbers (not Decimal strings).

### T-B06 · Platform settings: typed read/write with validation (G-03, G-25)
- repo: backend
- tier: low
- priority: P0
- depends: T-B01
- files: src/modules/admin/admin.service.ts; src/modules/admin/admin.controller.ts; src/modules/admin/admin.routes.ts; src/modules/admin/admin.validators.ts
- gate: backend

1. New `GET /admin/settings/platform` → `{ freeTasksCount:number, commissionRate:number /*fraction*/, autoVerifyCraftsmen:boolean, currency:"ILS" }` using `getFreeTasksAllowance()`, `getCommissionRate()` and `isAutoVerificationEnabled()` (defaults 3 / 0.08 / true).
2. New `PUT /admin/settings/platform` body (Zod, all optional, ≥1 key): `{ freeTasksCount: int 0-100, commissionRate: number >0 and <1 (max 4 decimals), autoVerifyCraftsmen: boolean }` → writes `FREE_TASKS_COUNT`, `COMMISSION_RATE` (`String(rate)`), `AUTO_VERIFY_CRAFTSMEN`, audits `SETTINGS_CHANGED` with before/after, returns the same shape as GET.
3. Legacy `PUT /admin/settings`: replace `.passthrough()` with an allow-list of keys `FREE_TASKS_COUNT`, `COMMISSION_RATE`, `AUTO_VERIFY_CRAFTSMEN`; unknown keys → 400 `VALIDATION_ERROR`. `COMMISSION_RATE` is validated `0<r<1` (previously silently ignored when ≥1). Remove the unused `maintenanceMode/commissionPercentage/payoutDelayHours` from the schema.
4. Legacy `GET /admin/settings` additionally returns defaults for missing allow-listed keys.

### T-B07 · Admin team management (G-02)
- repo: backend
- tier: mid
- priority: P1
- depends: T-B01
- files: src/modules/admin/admin.service.ts; src/modules/admin/admin.controller.ts; src/modules/admin/admin.routes.ts; src/modules/admin/admin.validators.ts
- gate: backend

New routes (admin only): 
- `GET /admin/team` → `[{ id, name, email, title, status, createdAt, isSelf }]` — users with `role ADMIN` (`select` only safe fields; join `adminProfile.title/fullName`).
- `POST /admin/team` body `{ firstName, lastName, email(valid), title }` → creates `User{role ADMIN,status ACTIVE,emailVerified:true,username: unique "admin_<local-part>_<4 random digits>"}` + `AdminProfile{fullName,title}`; password = server-generated 14-char random (crypto.randomBytes, letters+digits, at least one of each), hashed with `@/shared/utils/password`; **return** `{ id, email, temporaryPassword }` once; 409 `ConflictError` on duplicate email; audit `ADMIN_CREATED` (never log the password).
- `PUT /admin/team/:id/status` body `{ status: "ACTIVE"|"SUSPENDED", reason? }` → cannot target self (400), cannot suspend the last ACTIVE admin (409); call `SocketService.enforceAccountStatus`; delete Redis key `user:status:<id>` via `getRedis().del`; audit `ADMIN_STATUS_CHANGED`.
Also add alias routes `GET/POST /admin/roles/users` pointing to the same handlers (the deployed dashboard calls them).

### T-B08 · Audit log: IP/user-agent, filters, missing events (G-19)
- repo: backend
- tier: mid
- priority: P1
- files: prisma/schema.prisma; prisma/migrations/20261004000100_audit_ip/migration.sql; src/shared/services/audit.service.ts; src/modules/admin/admin.controller.ts; src/modules/admin/admin.service.ts; src/modules/admin/admin.validators.ts
- gate: backend

1. Schema: `AuditLog` gets `ipAddress String?` and `userAgent String?`. Migration SQL: `ALTER TABLE "AuditLog" ADD COLUMN "ipAddress" TEXT, ADD COLUMN "userAgent" TEXT;`. Run `npx prisma generate`.
2. `AuditLogInput` gains optional `ipAddress`, `userAgent`; `writeAuditLog` stores them. Add helper `auditMeta(req): { ipAddress?: string; userAgent?: string }` in `audit.service.ts` (`req.ip`, `req.headers["user-agent"]` trimmed to 255). Update **every** `AdminController` method that triggers an `AdminService` method that writes an audit row to pass `auditMeta(req)` through (add an optional trailing `meta` parameter to those service methods; keep it optional so other callers compile).
3. `getAuditLogs(page, limit, filters)` with schema `{ page, limit, actor?: string (user id), action?: string, targetType?: string, targetId?: string, from?: ISO date, to?: ISO date, q?: string }`; `q` matches `action`, `targetId`, actor name/email (insensitive). Response `{ total, page, limit, items, filters:{ actions:string[], targetTypes:string[] } }` where `filters` lists distinct values (two `findMany({distinct})` queries limited to 100).
4. Add missing audit writes (action names exactly): `OFFER_CREATED|OFFER_UPDATED|OFFER_DELETED|OFFER_TOGGLED`, `AD_CREATED|AD_UPDATED|AD_STATUS_CHANGED|AD_DELETED`, `CATEGORY_CREATED|CATEGORY_UPDATED|CATEGORY_HIDDEN|CATEGORY_SHOWN`, `SUBCATEGORY_CREATED|SUBCATEGORY_HIDDEN|SUBCATEGORY_SHOWN|SUBCATEGORY_MOVED`, `FIELD_CREATED|FIELD_DELETED|FIELD_REQUIRED_TOGGLED`, `BROADCAST_SENT|BROADCAST_SCHEDULED|BROADCAST_DELETED`, `WITHDRAWAL_APPROVED|WITHDRAWAL_REJECTED|WITHDRAWAL_RETRIED`. These methods currently have no `adminId`; thread `req.user!.id` from the controller. Do it in a small helper `await audit(adminId, action, targetType, targetId, before?, after?, meta?)` to keep the diff small.

### T-B09 · Overview stats: honest numbers, range, billing block (G-08)
- repo: backend
- tier: mid
- priority: P1
- files: src/modules/admin/admin.service.ts; src/modules/admin/admin.controller.ts; src/modules/admin/admin.validators.ts
- gate: backend

`GET /admin/overview-stats?range=7d|30d|90d` (default `30d`; invalid → 400). Keep every existing field and add:
- `analytics.chartData[]` items become `{ date: "YYYY-MM-DD" (UTC), revenue:number, commission:number, subscription:number }` for the requested range (fill zero days). Compute buckets with `toISOString().slice(0,10)` — not locale strings.
- `analytics.disputeRate` = `disputesTotal / max(totalTasks,1) * 100` rounded to 1 decimal (remove the constant `0.8`).
- GMV/avg order via `prisma.task.aggregate({ _sum:{budgetAmount}, _count, where:{status in [RATING_PENDING,CLOSED]} })` — no more loading rows.
- `disputes[]` items → `{ id, title: dispute.reason, subtitle: "<customer> vs <craftsman>", createdAt: ISO }` sourced from `Dispute` rows with `status PENDING` (take 5, newest first), plus top-level `pendingDisputesCount`.
- `categories[]` → `{ category:key, nameEn, nameAr, count }`.
- `deltas`: `{ users, tasks, revenue }` = % change of the current range vs the previous equal range (users by `createdAt`, tasks by `createdAt`, revenue by paid commission + approved subscriptions) — `null` when the previous value is 0.
- New `billing` block: `{ pendingReceipts, pendingCommissionPayments, commissionDueTotal:number, lockedCraftsmen, activeSubscribers, pendingWithdrawals }` (counts via `count`/`aggregate`).
- Run independent queries with `Promise.all`.

### T-B10 · Sidebar counts endpoint (X-09)
- repo: backend
- tier: low
- priority: P1
- files: src/modules/admin/admin.service.ts; src/modules/admin/admin.controller.ts; src/modules/admin/admin.routes.ts
- gate: backend

`GET /admin/counts` → `{ verificationPending, reportsPending, disputesPending, subscriptionRequestsPending, commissionPaymentsPending, withdrawalsPending, emergenciesActive, lockedCraftsmen }` using only `count()` queries in one `Promise.all` (`verificationPending` = `VerificationRequest status UNDER_REVIEW`; `reportsPending` = `DiscreetReport status in [PENDING, UNDER_INVESTIGATION]`; `disputesPending` = `Dispute PENDING`; `withdrawalsPending` = `Transaction type WITHDRAWAL status PENDING`; `lockedCraftsmen` = `commissionLocked true`).

### T-B11 · Payments summary & withdrawals integrity (G-07, G-13, G-14)
- repo: backend
- tier: mid
- priority: P1
- files: src/modules/admin/admin.service.ts; src/modules/admin/admin.controller.ts
- gate: backend

1. `getPaymentsSummary()` returns `{ gmvMtd, netRevenue, takeRate, mrr, pendingPayouts, pendingCraftsmenCount, gmvChangePct, revenueChangePct }`:
   - `takeRate = netRevenue/gmvMtd*100`.
   - **MRR**: for each craftsman with `subscriptionStatus ACTIVE` and `subscriptionExpiryDate > now`, take their latest `APPROVED` `SubscriptionRequest` and add `price / durationMonths`. (Do not read the customer `Subscription` table.)
   - `pendingPayouts` = sum of `Transaction(WITHDRAWAL, PENDING).amount`; `pendingCraftsmenCount` = distinct balances among them.
   - `gmvChangePct` / `revenueChangePct` vs the previous calendar month (`null` if previous is 0).
2. `moderateWithdrawalRequest`: use `ConflictError` for "already processed"; write audit `WITHDRAWAL_APPROVED|REJECTED` (with amount, craftsman); notify the craftsman (`PAYMENT`, entityType `payout`); do it inside the existing transaction except the notification.
3. `retryFailedTransaction`: `ConflictError` for wrong state; **only allow retry when the failure did not refund the balance** — mark refunds: when rejecting a withdrawal create the refund and set `referenceId` to `"REFUNDED"` if null (or append `|REFUNDED`); `retry` must refuse (409 `WITHDRAWAL_ALREADY_REFUNDED`) when the transaction was refunded, otherwise re-debit the balance (`availableAmount decrement`, fail with 409 if insufficient) before setting `PENDING`. Audit `WITHDRAWAL_RETRIED`.
4. `freezeTask`/`unfreezeTask`: replace `NotFoundError` used for state conflicts with `ConflictError`.

### T-B12 · Craftsmen list: no secrets, correct filters, billing fields (G-01, G-11) — **P0 security**
- repo: backend
- tier: mid
- priority: P0
- files: src/modules/admin/admin.service.ts; src/modules/admin/admin.validators.ts
- gate: backend

1. In `getCraftsmen` replace `include: { user: true }` by `include: { user: { select: { id:true, firstName:true, lastName:true, email:true, phoneNumber:true, status:true, createdAt:true } }, skills:{ select:{ id:true, name:true, category:true } }, verificationRequest:{ select:{ id:true, status:true, submittedAt:true, reviewedAt:true } } }`. The response must never contain `passwordHash`, `googleId`, `appleId`, coordinates.
2. Status filter semantics: `verified` (`isVerifiedId true`), `pending` (`isVerifiedId false`), `suspended` (`user.status in [SUSPENDED, BLOCKED]`), `banned` (`user.status BLOCKED`), `locked` (`commissionLocked true`). `counts` = `{ all, verified, pending, suspended, banned, locked }` computed with the same base filters. Validate `status` (400 on unknown). Add optional `sort` = `rating|created|jobs` (default `rating`).
3. Each item additionally exposes `freeTasksRemaining, billingModel, commissionLocked, subscriptionStatus, subscriptionExpiryDate, completedTasksCount, trustScore` (already on the profile) — keep them flat on the item.
4. Do the same hygiene in `getTasks`/`getDisputes`/`getPayments` includes: replace bare `customerProfile: true` / `craftsmanProfile: true` with `select`s of `{ id, firstName, lastName, avatarUrl, userId }` (and `title`, `locationCity` for craftsmen).

### T-B13 · Tasks: server filters and a detail endpoint
- repo: backend
- tier: mid
- priority: P1
- depends: T-B12
- files: src/modules/admin/admin.service.ts; src/modules/admin/admin.controller.ts; src/modules/admin/admin.routes.ts; src/modules/admin/admin.validators.ts
- gate: backend

1. `GET /admin/tasks` accepts `status` (single value **or** comma list, each validated against `TaskStatus`; unknown → 400), `statuses` alias, `distributionType`, `serviceType`, `from`, `to` (createdAt range), `q`, `sort=created|amount` + `order`. Response items add `offersCount` (`_count.offers`) and keep `dispute`, `emergencyRequest`; response also includes `counts:{ all, live, emergency, disputed, done, cancelled, frozen }` computed by `groupBy status` once (live = ACCEPTED,PRE_CHAT_PENDING,CHAT_OPEN,AGREEMENT_PENDING,IN_PROGRESS,WORK_SUBMITTED; done = RATING_PENDING,CLOSED,COMPLETED; cancelled = CANCELLED,REJECTED; emergency = tasks with ACTIVE emergencyRequest).
2. `GET /admin/tasks/:id` → `{ task (safe select), customer{id,name,phone}, craftsman{id,name,phone,title}|null, offers[{id,craftsman,amount,status,note,createdAt}], agreement|null (latest CONFIRMED or PROPOSED), workProof:{ imageUrls, submittedAt }, dispute|null, emergency|null, commission|null ({amount,rate,status}), cancel:{ reason, note } }`. 404 when missing.

### T-B14 · Disputes: validated resolution, notes, notifications (G-16)
- repo: backend
- tier: mid
- priority: P1
- files: prisma/schema.prisma; prisma/migrations/20261004000200_dispute_resolution/migration.sql; src/modules/admin/admin.service.ts; src/modules/admin/admin.controller.ts; src/modules/admin/admin.validators.ts
- gate: backend

1. Schema: `Dispute` gets `resolution String?`, `adminNotes String?`, `resolvedById String?`, `resolvedAt DateTime?`. Migration adds the four nullable columns. `npx prisma generate`.
2. `resolveDisputeSchema` = `{ resolution: z.enum(["REFUND_CLIENT","PAY_CRAFTSMAN"]), notes: z.string().trim().max(500).optional() }`. The legacy value `"RELEASE_TO_CRAFTSMAN"`/any other string is rejected with 400.
3. `resolveDispute` stores the four columns, notifies **both** parties (`DISPUTE_UPDATED`, entityType `task`, text states the outcome: refunded / paid to craftsman) after commit, and emits `SocketService.emitTaskStatus`.
4. `getDisputes(page,limit,status?)` accepts `status=PENDING|RESOLVED`; items expose `reason, description, status, resolution, adminNotes, resolvedAt, createdAt` and a safe `task` select (`id, displayId, title, status, budgetAmount, customerProfile{id,firstName,lastName}, craftsmanProfile{id,firstName,lastName}`); response adds `counts:{ pending, resolved }`.

### T-B15 · Safety reports: real statuses, detail, notifications (G-15)
- repo: backend
- tier: low
- priority: P1
- files: src/modules/admin/admin.service.ts; src/modules/admin/admin.controller.ts; src/modules/admin/admin.routes.ts; src/modules/admin/admin.validators.ts
- gate: backend

1. `moderateReportSchema.action` = `"dismiss"|"investigate"|"suspend"|"ban"`; notes **required (≥3)** for `suspend`/`ban`. Status result: `dismiss→DISMISSED`, `investigate→UNDER_INVESTIGATION` (do not set `resolvedAt`), `suspend|ban→RESOLVED`. Only reports not already `RESOLVED|DISMISSED` can be moderated (409 otherwise).
2. Notify the **suspect** on `suspend`/`ban` (SYSTEM, "Your account was suspended after a safety report") — do not reveal the reporter.
3. `GET /admin/reports` supports `category` filter and returns `counts:{ pending, investigating, resolved, dismissed }`; `GET /admin/reports/:id` → full item (reporter/suspect safe select incl. `status`, task `{id,displayId,title}`, `resolvedBy`).

### T-B16 · Emergencies list & resolve (optional)
- repo: backend
- tier: low
- priority: P2
- files: src/modules/admin/admin.service.ts; src/modules/admin/admin.controller.ts; src/modules/admin/admin.routes.ts
- gate: backend

`GET /admin/emergencies?status=ACTIVE|RESOLVED|ALL&page&limit` → `{ items:[{ id,status,latitude,longitude,customer{id,name,phone},task{id,displayId,title,craftsman{id,name}}|null,createdAt,resolvedAt }], total,page,limit }`. `POST /admin/emergencies/:id/resolve` `{ notes? }` → sets `RESOLVED`, `resolvedAt`, `assignedAdminId=req.user.id`, audit `EMERGENCY_RESOLVED`, 409 if already resolved.

### T-B17 · Live activity: remove fabricated data (G-09)
- repo: backend
- tier: mid
- priority: P1
- files: src/modules/admin/admin.service.ts
- gate: backend

In `getLiveActivity`: (a) drop the hard-coded Jerusalem busy zones; compute `busy_zones` as the top 5 groups of **active tasks** by the first comma-separated token of `locationAddress` (trimmed, non-empty) with `{ zone_name, active_job_count, max_job_capacity: null }`; `busy_zones_count` = length; (b) `amount_sar` = real `budgetAmount` (no `350` fallback); rename output key to `amount` and keep `amount_sar` as alias; (c) `progress_pct` = status mapping `PENDING 0, ACCEPTED 10, PRE_CHAT_PENDING 15, CHAT_OPEN 20, AGREEMENT_PENDING 30, IN_PROGRESS 60, WORK_SUBMITTED 85, RATING_PENDING 95, DISPUTED 60, FROZEN 60`; (d) tasks without coordinates are returned with `lat:null,lng:null` (no default Jerusalem point) and excluded from `activeTasks` map markers; (e) craftsman events subtitle uses `c.locationCity` and event type `craftsman_registered`; `IN_PROGRESS` task event type `job_started`; (f) `suspicious_alerts`: craftsmen with `commissionLocked` and ≥3 DiscreetReports as suspect in 30 days → `{ id, title, subtitle, severity:"medium", occurred_at }`; (g) never include whole `user` rows — select explicit fields.

### T-B18 · Analytics: honest KPIs and real timeframe (G-10)
- repo: backend
- tier: mid
- priority: P1
- files: src/modules/admin/admin.service.ts; src/modules/admin/admin.controller.ts; src/modules/admin/admin.validators.ts
- gate: backend

`GET /admin/analytics?timeframe=7d|30d|90d` (validate; default 30d) must (1) echo `timeframe` in the response; (2) filter task/user/feedback/dispute aggregates by `createdAt >= now - timeframe` (totals for "all-time" fields keep their name, windowed ones are suffixed `…InRange`); (3) replace the hard-coded zone list by grouping tasks by the first comma token of `locationAddress` (top 8) with `{ name, tasksCount, percentage }` (drop `trend/isPositive/barWidth` fudge — keep `barWidth` = tasksCount/max*100); (4) **remove** KPI `eta_accuracy` and `refund_rate`; compute `dispute_rate = disputes/tasks*100`; (5) `change` strings removed — return numeric `previous` (same metric in the preceding window) and the frontend computes the delta; (6) run queries in `Promise.all`.

### T-B19 · Broadcast: fix crash, validation, audience integrity (G-17)
- repo: backend
- tier: low
- priority: P1
- depends: T-B08
- files: src/modules/admin/admin.service.ts; src/modules/admin/admin.validators.ts; src/modules/admin/admin.controller.ts
- gate: backend

1. `resolveBroadcastAudience`: remove the non-existent `customerProfile.addresses` relation. City filter applies to `CRAFTSMEN` only (`craftsmanProfile.locationCity contains`); for `CUSTOMERS`/`ALL` a `targetCity` is rejected with 400 `CITY_FILTER_CRAFTSMEN_ONLY` at validation time. Always restrict to `status: "ACTIVE"` users and exclude `ADMIN` role for `ALL`.
2. `createBroadcastSchema`: `scheduledAt` must be a valid ISO datetime **in the future** (else 400); `deepLink` max 300 and must match `^(arox|sonaa)://` or an `https://` URL; `imageUrl` must be an `https://` URL or start with `/api/v1/uploads/`.
3. `getBroadcasts(page?, limit?)` with the B03 pagination rule; `deleteBroadcast` for `SCHEDULED` sets `status CANCELLED` (keeps the row for history) and for `SENT` deletes the log only; both audited (`BROADCAST_DELETED`).
4. Add `POST /admin/notifications/broadcasts/:id/cancel` (SCHEDULED only → CANCELLED, 409 otherwise).

### T-B20 · Offers & ads: bilingual, targets, cascade, click tracking (G-18)
- repo: backend
- tier: mid
- priority: P1
- depends: T-B08
- files: src/modules/admin/admin.service.ts; src/modules/admin/admin.validators.ts; src/modules/admin/admin.controller.ts; src/modules/admin/admin.routes.ts; src/modules/offer/offer.service.ts; src/modules/offer/offer.controller.ts; src/modules/offer/offer.routes.ts
- gate: backend

1. `createOfferSchema`/`updateOfferSchema` accept optional `titleEn,titleAr,subtitleEn,subtitleAr,buttonTextEn,buttonTextAr` (each min 1) **in addition** to `title/subtitle/buttonText` (fallback = En). Store them separately (no more Arabic = English copy). `targetType` (`NONE|URL|CRAFTSMAN|CATEGORY|TASK|SERVICE`) and `targetId` accepted on create and update and normalised with the existing `resolveOfferTarget`. Validate `endDate > startDate` (400).
2. `deleteOffer` also deletes the `AdCampaign` with the same id (transaction). `getAdCampaigns` becomes read-only: delete the auto-adopt `create` loop; instead `createOffer` creates the matching `AdCampaign` (name = title, status ACTIVE) in the same transaction, and a one-off idempotent adoption runs inside `SubscriptionService`-style bootstrap `AdminService.adoptOrphanOffers()` called once from `server.ts` at startup.
3. `createAdCampaignSchema.budget` becomes optional (default 0); `updateAdCampaign` response returns the real `placement` label from the Offer (not the constant "Home Banner").
4. **Click tracking:** `POST /api/v1/offers/:id/click` (authenticated, any role) → increments `AdCampaign.clicks` by 1 (404 if missing); rate-limit by Redis key `offer:click:<userId>:<offerId>` TTL 30 s (return 204 without incrementing when throttled). `OfferService.getOffers` keeps impression increments but only when `?track=1` is passed (the app sends it on the home screen) so dashboards/tests do not inflate impressions.
5. `GET /admin/promotions/:id` returns one offer (404 if missing).

### T-B21 · Categories: Hebrew names, rename/edit endpoints (G-26)
- repo: backend
- tier: low
- priority: P2
- depends: T-B08
- files: src/modules/admin/admin.service.ts; src/modules/admin/admin.validators.ts; src/modules/admin/admin.controller.ts; src/modules/admin/admin.routes.ts
- gate: backend

`createCategorySchema` + `createSubCategorySchema` accept optional `nameHe` and persist it; `getCategories` returns `nameHe`, `subCategoryCount`, `fieldCount`. New `PUT /admin/categories/subcategories/:subId` body `{ nameEn?, nameAr?, nameHe?, imageUrl? }` (≥1 key; imageUrl same rule as create) and `PUT /admin/fields/:id` body `{ label?, options?, isRequired?, isActive?, sortOrder? }`. Field `fieldKey` must be unique per category (409 `ConflictError`) and `select` fields require non-empty `options`. Audit via the T-B08 helper.

### T-B22 · Users: status management and detail (G-24)
- repo: backend
- tier: mid
- priority: P1
- files: src/modules/admin/admin.service.ts; src/modules/admin/admin.controller.ts; src/modules/admin/admin.routes.ts; src/modules/admin/admin.validators.ts
- gate: backend

1. `GET /admin/users`: add `status` to each user, query `status?` filter, `role` validated (`CUSTOMER|CRAFTSMAN|ADMIN|ALL`), `limit` 1-100, `offset ≥ 0`; exclude nothing.
2. `GET /admin/users/:id` → safe profile (`id,name,email,phone,role,status,createdAt,customerProfile{id,postedTasksCount,rating},craftsmanProfile{id,title,isVerifiedId},counts:{ tasks, reportsAgainst }`).
3. `PUT /admin/users/:id/status` body `{ status: "ACTIVE"|"SUSPENDED"|"BLOCKED", reason? }`: cannot change self or another ADMIN (403); calls `SocketService.enforceAccountStatus`, deletes Redis `user:status:<id>`, notifies the user on SUSPENDED/BLOCKED, audit `USER_STATUS_CHANGED`.

### T-B23 · Admin actions hardening: dispatch backup & verification (G-22, G-23)
- repo: backend
- tier: mid
- priority: P1
- depends: T-B01
- files: src/modules/admin/admin.service.ts
- gate: backend

`dispatchBackup`: require task status in `PENDING|ACCEPTED|PRE_CHAT_PENDING|CHAT_OPEN|AGREEMENT_PENDING|IN_PROGRESS` (409 otherwise); craftsman must be `isVerifiedId`, user `ACTIVE`, and `evaluateBillingEligibility(craftsman).eligible` (409 with the eligibility `code`); set `acceptedAt` if empty, keep `startedAt`; notify the **customer** too (SYSTEM "A backup craftsman was assigned"). `moderateRequest`: when decision ≠ APPROVED the notes must be ≥3 chars (400 `NOTES_REQUIRED`); approval keeps flipping the flags but writes `after.flagsGranted: [...]` into the audit row.

### T-B24 · Remove retired customer-subscription code paths (G-27)
- repo: backend
- tier: low
- priority: P2
- depends: T-B02
- files: src/modules/admin/admin.service.ts
- gate: backend

Delete any remaining read of `prisma.subscription` in the admin module (e.g. MRR code replaced in T-B11). Do not drop the model/table (mobile compatibility). Add a comment above the `Subscription` model in `schema.prisma`: `// RETIRED: customer subscriptions are no longer offered; kept for legacy rows only.`

### T-B25 · Docs, swagger and validator unit tests
- repo: backend
- tier: low
- priority: P2
- depends: T-B01, T-B05, T-B06, T-B07, T-B09, T-B10
- files: API_DOCUMENTATION.md; src/modules/admin/__tests__/admin.validators.unit.test.ts
- gate: backend

1. Add `API_DOCUMENTATION.md` sections for every new/changed admin route from tickets B01–B24 (method, path, query/body, response example, error codes) under a heading `## Admin dashboard API (v2)`.
2. Create `src/modules/admin/__tests__/admin.validators.unit.test.ts` (pure Zod tests, no Prisma): at least 3 passing + 3 failing cases each for `createPlanSchema`, `bitSettingsSchema`, `rejectReasonSchema`, `extendSubscriberSchema`, `freeTasksSchema`. It must pass with `npx jest -c jest.unit.config.js src/modules/admin`.
