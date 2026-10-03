# 00 · Backend deep-dive (Arox-backend) — what the dashboard must integrate with

Source of truth: `D:\Mohamed Ali\Arox App\Arox-backend` (branch at audit time: HEAD `6c6dedf`).
Stack: Node 24 · Express 4 · Prisma 5 (PostgreSQL) · Zod · Socket.IO · Redis · FCM. API prefix `/api/v1`.
Everything below was read from source, not from the older docs. Where the older docs under
older docs disagree with this file, **this file wins**.

---

## 1. Conventions

| Topic | Fact |
|---|---|
| Auth | `Authorization: Bearer <JWT>`. `authenticate` checks the user's `status` (cached in Redis 60 s) and rejects non-`ACTIVE` accounts with **401**. `authorize("ADMIN")` gates the whole `/admin` router (**403** otherwise). |
| Admin login | Same `POST /auth/login` `{ identifier, password }` as the app. `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout` `{ refreshToken }`. There is **no admin sign-up / invite flow** — admins are created by scripts/seed. |
| Error body | `{ error: "<CODE>", message: "<text>", details?: [{field, message}] }`. Zod failures → **400** `VALIDATION_ERROR` with `details`. Unique violation → **409** `UNIQUE_CONSTRAINT_FAILED`. Prisma not found → **404** `RECORD_NOT_FOUND`. Domain errors use `AppError(message, status, CODE)`. |
| Pagination | **Inconsistent.** `page`+`limit` → `{ total, page, limit, items }` for craftsmen/tasks/disputes/payments/reports/withdrawals/audit-logs. Verification queue → `{ queueCount, avgSlaRemainingHours, submissions }`. `GET /admin/users` uses `limit`+`offset` → `{ users, total }`. Subscribers, subscription requests, commission payments, broadcasts, ads, promotions, categories → **plain unpaginated arrays**. |
| Currency | **ILS (₪)** everywhere. Some response fields are still named `amount_sar` / `amountSAR` (legacy naming) — the value is ILS. |
| Dates | ISO strings. `overview-stats.analytics.chartData[].date` is a **locale string** (`"Oct 3"`, server timezone) — not ISO. |
| Money model | The platform **never holds job money** (no escrow). Revenue = paid commission + approved subscription fees. GMV is informational only. |
| Realtime | Socket.IO. Admin sockets auto-join rooms `admin_room` and `admin_notifications`. Events used by the dashboard: `notification:new`, `task:status`, `account:status`, `chat:*`, `craftsman:location`. |
| Audit | `writeAuditLog({actorId, action, targetType, targetId, before, after})` → table `AuditLog`. **No IP / user-agent column.** |

## 2. Data model the admin touches

```
User(role CUSTOMER|CRAFTSMAN|ADMIN, status ACTIVE|SUSPENDED|BLOCKED, passwordHash, …)
 ├─ AdminProfile(fullName, title)
 ├─ CustomerProfile ── Task[], EmergencyRequest[]
 └─ CraftsmanProfile
      isVerifiedId/Cert/Selfie/BankIban/Background, isInsured, isAvailable, trustScore, rating,
      subscriptionStatus(ACTIVE|CANCELLED|EXPIRED), subscriptionStartDate, subscriptionExpiryDate,
      freeTasksRemaining(default 3), billingModel(SUBSCRIPTION|COMMISSION|null), commissionLocked
      ├─ VerificationRequest(status UNDER_REVIEW…, 5 steps, ocr*, faceMatchScore, slaDeadline, moderatorNotes)
      ├─ CommissionLedger(taskId unique, amount, rate, status DUE|PAID, paymentId, paidAt)
      ├─ CommissionPayment(amount, paymentProofUrl, status PENDING|APPROVED|REJECTED, reviewedById)
      ├─ CraftsmanSubscription(planId, status PENDING|ACTIVE|EXPIRED|REJECTED, proof, start/end)   ← dual-written
      └─ Balance → Transaction(type EARNING|WITHDRAWAL, status PENDING|COMPLETED|FAILED, payoutAccount)
SubscriptionRequest(userId, planId→SubscriptionPlanConfig, planTitle, durationMonths, price, paymentProofUrl,
                    status PENDING_VERIFICATION|APPROVED|REJECTED|CANCELLED, rejectionReason, chatRoomId, moderatedAt)
SubscriptionPlanConfig(key unique, nameEn/Ar, durationMonths, price, featuresEn[]/Ar[], isPopular, isActive)
Task(status: 14 values, distributionType DIRECT|BROADCAST, budgetType SPECIFIC|OPEN, budgetAmount,
     freeTaskReserved, workProof*, cancelReason/cancelNote, preFreezeStatus) ── Dispute(1:1) · TaskOffer[] · Agreement[] · CommissionLedger(1:1)
Dispute(reason, description, status PENDING|RESOLVED)      ← no resolution/resolvedBy/notes columns
DiscreetReport(category, status PENDING|UNDER_INVESTIGATION|RESOLVED|DISMISSED, suspectId, moderatorNotes)
EmergencyRequest(status ACTIVE|RESOLVED, lat/lng, taskId)
Offer(title/titleEn/titleAr, subtitle*, buttonText*, imageUrl, bannerType PROMO|EMERGENCY_SOS, placement TOP|FEATURED,
      targetType CRAFTSMAN|TASK|CATEGORY|SERVICE|URL|NONE, targetId, targetUrl, isActive, startDate, endDate)
AdCampaign(id == Offer.id, name, status ACTIVE|PAUSED|ENDED, budget, spent, impressions, clicks, start/end)  ← 1:1 shadow of Offer
BroadcastLog(title, body, audience ALL|CUSTOMERS|CRAFTSMEN, targetCity, imageUrl, deepLink, status SENT|SCHEDULED|CANCELLED, reach, scheduledAt)
Category(key, nameEn/Ar/He, isActive) → SubCategory(nameEn/Ar/He, imageUrl, isActive) · CategoryField(label, fieldKey, fieldType, options, isRequired)
AppSetting(key unique, value string)
AuditLog(actorId, action, targetType, targetId, before JSON, after JSON, createdAt)
```

### TaskStatus (14) — the dashboard currently understands only 5 of them
`PENDING · ACCEPTED · PRE_CHAT_PENDING · CHAT_OPEN · AGREEMENT_PENDING · IN_PROGRESS · WORK_SUBMITTED · RATING_PENDING · CLOSED · CANCELLED · REJECTED · DISPUTED · FROZEN · COMPLETED(never persisted)`.
"Done" = `RATING_PENDING` or `CLOSED`.

## 3. Business rules (must be reflected in UI copy and validation)

### 3.1 Craftsman billing (the heart of the "subscriptions & commission" change)
1. Every craftsman starts with `freeTasksRemaining = FREE_TASKS_COUNT` (AppSetting, default **3**, allowed 0–100).
2. A free task is **reserved at assignment** (accept / offer accepted) and **refunded** when the task is cancelled / refunded before completion (`Task.freeTaskReserved`). An active unexpired subscription covers a job *without* spending a free task.
3. After free tasks are gone the craftsman needs exactly one of:
   - **SUBSCRIPTION** — an `ACTIVE`, unexpired subscription (Bit receipt approved by an admin).
   - **COMMISSION** — pay `COMMISSION_RATE` (AppSetting fraction, default **0.08**, valid `0 < r < 1`) of each completed task's final amount. Each completed billable task creates a `CommissionLedger` row (`DUE`) **and sets `commissionLocked = true`** → the craftsman cannot accept new work until they pay.
4. Paying commission = craftsman uploads a Bit receipt → `CommissionPayment(PENDING)` that links *all currently DUE rows* → admin **approves** (rows → `PAID`, lock cleared only if no DUE remains) or **rejects** (rows unlinked, reason stored in `notes`).
5. A subscription request cannot be **created** or **approved** while the craftsman has `DUE` commission or a `PENDING` commission payment (`COMMISSION_DEBT_UNSETTLED` / `BILLING_SWITCH_BLOCKED_DEBT`).
6. Approving a subscription request sets `billingModel = SUBSCRIPTION`, `commissionLocked = false`, extends from the current expiry if still active, posts a message in the request's chat room and notifies the craftsman.
7. Eligibility (`evaluateBillingEligibility`) order: locked → blocked (`COMMISSION_LOCKED`); free tasks > 0 → ok; subscription active → ok; `COMMISSION` model → ok; no model chosen → `BILLING_MODEL_REQUIRED`; lapsed → `SUBSCRIPTION_REQUIRED`.
8. Dispute resolution `REFUND_CLIENT` → task `CANCELLED` + free task refunded; any other string → task `RATING_PENDING` + billing settled.

### 3.2 Verification
5-step craftsman flow (personal info → national ID → selfie → skills → certifications). `AUTO_VERIFY_CRAFTSMEN` (default `true`) auto-approves on final submit. Admin queue lives at `/admin/verification/queue`; decisions `APPROVED | REJECTED | FLAGGED | REQUEST_CHANGES(→FLAGGED)`. Approval sets **all** verification flags.

### 3.3 Offers & ads (one entity, two admin surfaces)
`/admin/promotions` (Offer) and `/admin/ads` (AdCampaign) are two views of the same banner (`AdCampaign.id === Offer.id`). The mobile app reads `GET /offers?placement=` which returns only `isActive` offers inside `[startDate, endDate]` and **increments `AdCampaign.impressions` per request** (not per unique view). Nothing increments `clicks` yet.
Link rules (`resolveOfferTarget`): in-app targets `CRAFTSMAN|CATEGORY|TASK|SERVICE` + id, or a real `http(s)` URL with a dotted hostname (scheme-less input gets `https://`); anything else → `NONE`.

### 3.4 Settings keys (AppSetting)
| Key | Meaning | Consumer |
|---|---|---|
| `FREE_TASKS_COUNT` | free tasks per new craftsman (0–100) | commission.service |
| `COMMISSION_RATE` | fraction, `0<r<1` (**not validated on write**) | commission.service |
| `AUTO_VERIFY_CRAFTSMEN` | `"true"/"false"` | verification.service |
| `BIT_PHONE_NUMBER`, `BIT_RECIPIENT_NAME`, `BIT_INSTRUCTIONS_EN`, `BIT_INSTRUCTIONS_AR` | Bit payee shown to craftsmen | subscription.service |
| `maintenanceMode`, `commissionPercentage`, `payoutDelayHours` | accepted by the Zod schema, **read by nobody** | — |

## 4. Admin endpoint inventory (all `ADMIN`-only, prefix `/api/v1/admin`)

Legend: **V** = request validated by Zod · **A** = writes AuditLog · **N** = notifies the affected user.

### Overview / analytics / live
| Method · Path | Request | Response | V | A | N |
|---|---|---|---|---|---|
| GET `/overview-stats` | — | `{ metrics{totalUsers,activeCraftsmen,onlineCraftsmenCount,activeTasks,revenueMtd,emergencyReqs,verificationReqs}, analytics{gmv,takeRate,avgOrderValue,disputeRate(hard-coded 0.8),chartData[{date,revenue}] 30d}, categories[{category(key),count}], disputes[{id,title,subtitle,timeLabel}] }` | – | – | – |
| GET `/metrics/cohort?weeks=7` | `weeks` | `[{week,users,craftsmen,tasks}]` | – | – | – |
| GET `/analytics?timeframe=30d` | timeframe **ignored** | `{userGrowth,activeCraftsmen,marketplaceActivity,conversionRate,gmv,cohorts,zones,kpis[]}` (partly fabricated, see G-10) | – | – | – |
| GET `/live-activity` | — | `{active_jobs,online_craftsmen,sos_count,busy_zones_count,feed_events[],busy_zones[],active_job_list[],suspicious_alerts[],emergencies[],activeTasks[],activeCraftsmen[]}` (partly fabricated, see G-09) | – | – | – |

### Verification / craftsmen
| GET `/verification/queue?status&page&limit` | status `UNDER_REVIEW\|PENDING_SUBMISSION\|APPROVED\|REJECTED\|FLAGGED\|ALL` (aliases `PENDING_REVIEW`,`NOT_STARTED`) | `{queueCount,avgSlaRemainingHours,submissions[VerificationRequest+craftsmanProfile{user,skills}]}` | ✔ | – | – |
| POST `/verification/moderate` | `{requestId, decision, moderatorNotes?}` | updated request | ✔ | ✔ | ✔ |
| GET `/craftsmen?q&category&status&page&limit` | `status: verified\|pending\|suspended(trustScore<0.7 ⚠)` | `{total,page,limit,items[CraftsmanProfile+user(FULL ROW ⚠)+skills+verificationRequest],counts{all,verified,pending,suspended}}` | ✔ | – | – |
| PUT `/craftsmen/:id/suspend` `{reason?}` · `/unsuspend` · `/ban` | id = profileId \| userId \| verificationRequestId | `{id,status}` | ✘ | ✔ | suspend only |
| POST `/craftsmen/:id/verify/item` | `{itemKey,approved}` | `{id,verifications{…}}` | ✔ | ✔ | revoke only |

### Tasks / disputes / reports
| GET `/tasks?q&status&page&limit` | `status` = raw TaskStatus, **not validated** | `{total,page,limit,items[Task+customerProfile+craftsmanProfile+dispute+emergencyRequest]}` | ✔(shape only) | – | – |
| POST `/tasks/:id/freeze` · `/unfreeze` | — | `{id,task_status}` | ✘ | ✔ | ✔ |
| POST `/tasks/:id/dispatch-backup` | `{craftsmanProfileId}` **unvalidated** | task | ✘ | ✔ | ✔ |
| GET `/disputes?page&limit` | — | `{total,page,limit,items[Dispute+task{customerProfile,craftsmanProfile}]}` | ✔ | – | – |
| POST `/disputes/:id/resolve` | `{resolution:string}` (`REFUND_CLIENT` = refund; **anything else = pay craftsman**) | dispute | ✔ | ✔ | ✘ |
| GET `/reports?status&page&limit` | — | `{total,page,limit,items[DiscreetReport+task+reporter+suspect+resolvedBy]}` | ✔ | – | – |
| PUT `/reports/:id/moderate` | `{action: dismiss\|suspend\|ban, notes?}` | report (always `RESOLVED`, never `DISMISSED`) | ✔ | ✔ | ✘ |

### Billing (subscriptions + commission)
| GET `/subscriptions/plans` (alias `/payments/plans`) | — | `[SubscriptionPlanConfig…, price:number, currency, currencySymbol]` (**seeds defaults inside the GET**) | – | – | – |
| POST `/subscriptions/plans` | `{key,nameEn,nameAr,durationMonths,price,featuresEn?,featuresAr?,isPopular?}` **no schema** | plan | ✘ | ✘ | – |
| PUT `/subscriptions/plans/:id` | raw body → prisma `update` (**mass assignment**) | plan | ✘ | ✘ | – |
| DELETE `/subscriptions/plans/:id` | — | deleted plan (hard delete, no guard) | ✘ | ✘ | – |
| GET `/subscriptions/requests?status` | `PENDING_VERIFICATION\|APPROVED\|REJECTED\|ALL` | `[{id,userId,userName,userEmail,userPhone,craftsmanTitle,avatarUrl,planTitle,durationMonths,price,currency,paymentMethod,paymentProofUrl,notes,status,chatRoomId,rejectionReason,createdAt}]` | ✘ | – | – |
| POST `/subscriptions/requests/:id/approve` | — | `{requestId,status,startDate,expiryDate}` | – | ✔ | ✔ + chat msg |
| POST `/subscriptions/requests/:id/reject` | `{reason?}` (default "Payment verification failed") | `{requestId,status,rejectionReason}` | ✘ | ✔ | ✔ + chat msg |
| GET `/subscriptions/subscribers` | — | `[{id,craftsmanName,craftsmanTitle,user,subscriptionStatus,startDate,expiryDate,freeTasksRemaining,billingModel,commissionLocked,isAllowedToAcceptTasks}]` (**every craftsman**, unpaginated) | – | – | – |
| POST `/subscriptions/subscribers/:id/extend` | `{days}` (`parseInt \|\| 30`, negatives allowed) | craftsman profile | ✘ | ✔ | ✘ |
| POST `/subscriptions/subscribers/:id/cancel` | — | craftsman profile | – | ✔ | ✘ |
| GET `/subscriptions/free-tasks` | — | `{freeTasksCount}` | – | – | – |
| PUT `/subscriptions/subscribers/:id/free-tasks` | `{freeTasksRemaining}` 0–100 (service-validated) | `{id,freeTasksRemaining,isAllowedToAcceptTasks}` | service | ✔ | ✔ |
| GET `/subscriptions/bit-settings` | — | `{BIT_PHONE_NUMBER,BIT_RECIPIENT_NAME,BIT_INSTRUCTIONS_EN,BIT_INSTRUCTIONS_AR}` | – | – | – |
| PUT `/subscriptions/bit-settings` | any `BIT_*` key | same | ✘ | ✔ | – |
| GET `/commission-payments?status` | `PENDING\|APPROVED\|REJECTED\|ALL` | `[CommissionPayment + craftsmanProfile{id,title,avatarUrl,commissionLocked,user}]` (no ledger rows, unpaginated) | ✘ | – | – |
| POST `/commission-payments/:id/approve` | — | `{paymentId,status,settledEntries,unlocked}` (409 if already reviewed) | – | ✔ | ✔ |
| POST `/commission-payments/:id/reject` | `{reason?}` | `{paymentId,status}` | ✘ | ✔ | ✔ |
| GET `/payments/summary` | — | `{gmvMtd,netRevenue,takeRate,mrr}` (**`mrr` reads the retired customer-subscription table → always 0**; no `pendingPayouts`) | – | – | – |
| GET `/payments?page&limit` | — | `{total,page,limit,items[Transaction+balance.craftsmanProfile+payoutAccount]}` | ✔ | – | – |
| GET `/payments/withdrawal-requests?status&page&limit` | `status` = `PENDING\|COMPLETED\|FAILED` | same shape | ✔ | – | – |
| PUT `/payments/withdrawal-requests/:id/status` | `{status: approved\|rejected}` | `{id,status}` | ✔ | ✘ | ✘ |
| POST `/payments/failed-transactions/:id/retry` | — | `true` | – | ✘ | ✘ |

### Offers, ads, broadcasts, categories
| GET/POST `/promotions`, PATCH `/promotions/:id`, PUT `/promotions/:id/toggle`, DELETE `/promotions/:id` | create `{title,subtitle,buttonText?,imageUrl,bannerType,placement,targetUrl?,startDate?,endDate?,durationHours?}`; **no targetType/targetId, no Arabic fields** | Offer row | ✔ | ✘ | – |
| GET/POST `/ads`, PUT `/ads/:id`, PUT `/ads/:id/status`, DELETE `/ads/:id` | `{name≥3,budget>0,placement,imageUrl,description,ctaText,targetType,targetId,targetUrl,startDate,endDate,durationHours}` | `{id,name,placement("Home Banner"\|"Featured Slots"),status,budget,spent,impressions,ctr,conversions,imageUrl,description,ctaText,targetType,targetId,targetUrl,startDate,endDate,createdAt}` | ✔ | ✘ | – |
| POST `/notifications/broadcast` | `{title≥3,body≥3,audience ALL\|CUSTOMERS\|CRAFTSMEN,targetCity?,imageUrl?,deepLink?,scheduledAt?}` | BroadcastLog | ✔ | ✘ | ✔ |
| GET `/notifications/broadcasts` · DELETE `/notifications/broadcasts/:id` | — | `BroadcastLog[]` (unpaginated) | – | ✘ | – |
| GET/POST `/categories`, PUT `/:id`, DELETE `/:id` (soft), PUT `/:id/visibility` | create `{key≥3,nameEn,nameAr}` (**no nameHe**) | category | ✔ | ✘ | – |
| GET/POST `/categories/:id/subcategories` (multipart `image`), PUT `/categories/subcategories/:id/move`, DELETE/visibility `/categories/subcategories/:subId/…` | `{nameEn,nameAr,imageUrl?}` (**no nameHe, no rename**) | subcategory | ✔ | ✘ | – |
| GET/POST `/categories/:id/fields`, POST `/fields/:id/toggle-required`, DELETE `/fields/:id` | `{label,fieldKey,fieldType,options?,isRequired?}` (**no edit, no reorder**) | field | ✔ | ✘ | – |

### Settings, audit, users
| GET `/settings` | — | raw `{KEY:"value"}` of **existing rows only** | – | – | – |
| PUT `/settings` | `{maintenanceMode?,commissionPercentage?,payoutDelayHours?,…passthrough}` → upserts **any key** | echoed body | weak | ✔ | – |
| GET/PUT `/settings/auto-verification` | `{enabled}` | `{enabled}` | ✘ | ✔ | – |
| GET `/audit-logs?page&limit` | **no filters** | `{total,page,limit,items[AuditLog+actor{id,firstName,lastName,email}]}` | ✔ | – | – |
| GET `/users?q&role&limit&offset` | — | `{users[{id,name,firstName,lastName,phoneNumber,email,role,avatarUrl,customerProfileId,craftsmanProfileId,trade,rating,createdAt}],total}` (no `status`) | ✘ | – | – |
| **`/roles/users` (GET/POST)** | **does not exist** — the dashboard calls it | 404 | – | – | – |

## 5. Non-admin endpoints the dashboard also uses
`POST /auth/login|logout|refresh`, `GET /auth/me` · `GET/POST /chatrooms`, `GET/POST /chatrooms/:id/messages` (admin may send `visibility: PUBLIC | CUSTOMER_PRIVATE | CRAFTSMAN_PRIVATE | ADMIN_INTERNAL`; admin name is masked as "Sonaa Admin") · `GET /notifications`, `PUT /notifications/:id/read`, `PUT /notifications/read-all` · `POST /uploads` (multipart) and `GET /uploads/:filename` · `GET /health` (`{status,checks{api,database,redis},migrations{status,pending?},push}`).

## 6. Defects and gaps found (numbered; backend tickets reference these)

| ID | Sev | Where | Problem |
|---|---|---|---|
| G-01 | **P0 security** | `AdminService.getCraftsmen` (`include: { user: true }`) | The craftsmen list returns the **entire `User` row — `passwordHash`, `googleId`, `appleId`, location** — to the browser. Must `select` explicit fields. |
| G-02 | P0 | dashboard `ApiAuthRepository.getAdmins/createAdmin` → `/admin/roles/users` | Endpoint does not exist (404). `createAdmin` also hard-codes password `Password123!`. Needs a real `/admin/team` API. |
| G-03 | P0 | `AdminController.createSubscriptionPlan/updateSubscriptionPlan/updateBitSettings/extendSubscriber/rejectSubscriptionRequest/rejectCommissionPayment/dispatchBackup` | **No input validation.** `updateSubscriptionPlan` passes `req.body` straight to Prisma (mass assignment of any column). `extend` accepts negative days. `updateSettings` upserts arbitrary keys and never validates `COMMISSION_RATE` (an admin typing `8` silently falls back to 8 % default because `getCommissionRate` rejects `≥1`). |
| G-04 | P0 | `rejectSubscriptionRequest` / `approveSubscriptionRequest` | Reject has **no status check** (an `APPROVED` request can be rejected after activation); approve only blocks `APPROVED` (a `REJECTED`/`CANCELLED` request can be approved). Reject is not transactional. |
| G-05 | P1 | `deleteSubscriptionPlan` | Hard delete with no existence/usage guard; requests referencing the plan lose `planId`. |
| G-06 | P1 | `getSubscriptionPlans` | Seeds defaults **inside a GET**; first call returns raw Prisma Decimals without `currency`; no `subscribersCount` / `pendingRequests` (dashboard expects `subscribersCount`). `getSubscriptionPlansStats` exists but reads the retired customer `Subscription` table. |
| G-07 | P1 | `getPaymentsSummary` | `mrr` is computed from the retired customer `Subscription` table → always `0`; the response has no `pendingPayouts`, `pendingCraftsmenCount` or change percentages that the dashboard types require. |
| G-08 | P1 | `getOverviewStats` | `disputeRate` hard-coded `0.8`; dispute rows have constant title `"Service Dispute"` and `timeLabel "Recent"`; chart `date` is a server-locale string; loads every completed task into memory to sum GMV; `activeCraftsmen` = verified count (not active). ~15 sequential queries. |
| G-09 | P1 | `getLiveActivity` | **Fabricated data**: 3 fixed Jerusalem "busy zones" computed as 40/35/25 % of active tasks, `amount_sar` falls back to `350`, `progress_pct` always `50`, default coordinates `31.7683,35.2137` for tasks without location, craftsman events say "Jerusalem", `IN_PROGRESS` tasks labelled `craftsman_online`, `suspicious_alerts` always `[]`. |
| G-10 | P1 | `getAnalytics` | `timeframe` ignored; zone list hard-coded (anything unmatched counted as "Old City"); `eta_accuracy: 95` and `refund_rate: 0` are constants; `change` strings like `"+N Users"` are not changes. |
| G-11 | P1 | `getCraftsmen` | Tab `suspended` filters `trustScore < 0.7` but suspend/ban set `User.status` → wrong rows, wrong counts; banned craftsmen not filterable. |
| G-12 | P1 | subscribers / requests / commission-payments / broadcasts / ads / promotions / categories | Unbounded, unpaginated lists (subscribers returns **every craftsman**). |
| G-13 | P2 | `freezeTask`, `unfreezeTask`, `retryFailedTransaction`, `moderateWithdrawalRequest` | State conflicts raised as `NotFoundError` (404) instead of 409/400. |
| G-14 | P1 | `moderateWithdrawalRequest`, `retryFailedTransaction` | No audit log, no notification to the craftsman. `retry` re-opens a withdrawal as `PENDING` without re-debiting the balance — a rejected (already refunded) withdrawal could be paid out twice. |
| G-15 | P1 | `moderateReport` | `dismiss`, `suspend`, `ban` all write status `RESOLVED` (`DISMISSED` never used, `UNDER_INVESTIGATION` unreachable); reporter/suspect not notified. |
| G-16 | P1 | `resolveDispute` | `resolution` is a free string; "split" or any typo silently means *pay the craftsman*. Dispute has no `resolution`/`adminNotes`/`resolvedBy`/`resolvedAt`. Neither party is notified. |
| G-17 | P1 | `createBroadcast` / `resolveBroadcastAudience` | `CUSTOMERS`+city queries `customerProfile.addresses`, a relation that **does not exist** → Prisma runtime error. `scheduledAt` accepts any string (Invalid Date) incl. the past. Suspended/blocked users counted in `reach`. No audit log for create/delete. |
| G-18 | P1 | offers/ads | `createOffer` ignores `targetType/targetId`; `titleAr/subtitleAr` are **copies of the English text** (Arabic app users see English); `deleteOffer` leaves the `AdCampaign` shadow row; `getAdCampaigns` **writes** (auto-adopt) inside a GET; `clicks` is never incremented so CTR is always 0; `impressions` counts API calls; `budget/spent` have no real meaning. |
| G-19 | P1 | audit | No IP/user-agent, no filters (actor/action/target/date), and **no audit rows** for plan CRUD, offers/ads CRUD, categories/subcategories/fields, broadcasts, withdrawals, retry. |
| G-20 | P1 | `cancelSubscriber` | Sets `subscriptionStatus=EXPIRED` but leaves `subscriptionExpiryDate` in the future and `CraftsmanSubscription` `ACTIVE`; no notification. |
| G-21 | P1 | `extendSubscriber` | No validation; negative/huge days; no reason; no notification. |
| G-22 | P1 | `dispatchBackup` | `craftsmanProfileId` unvalidated; no task-state guard (can dispatch on a completed task); no check that the craftsman is verified / not suspended / billing-eligible; customer not notified. |
| G-23 | P2 | `moderateRequest` | Approval flips **all five** flags (incl. `isInsured`, `isVerifiedBackground`) regardless of what was reviewed; default note `"Processed by admin"`; rejection needs no reason. |
| G-24 | P1 | users | No way to suspend/unsuspend/block a **customer** (only craftsmen endpoints); `/admin/users` has no `status`, includes admins, no detail endpoint. |
| G-25 | P2 | settings | `GET /settings` returns only stored rows (no defaults/types); `maintenanceMode`, `commissionPercentage`, `payoutDelayHours` are accepted but unused. |
| G-26 | P2 | all list endpoints | Raw Prisma rows with whole relations (`customerProfile`, `craftsmanProfile`…). Bloated and leak-prone; define DTOs. |
| G-27 | P2 | schema | Retired customer `Subscription` model + `getSubscriptionPlansStats` still present; `CraftsmanSubscription` and `SubscriptionRequest` are dual-written (dashboard must only use `SubscriptionRequest`). |
| G-28 | P2 | `approveSubscriptionRequest` | Chat/notification text formats dates with the server locale (`toLocaleDateString()`); message text is English-only. |
