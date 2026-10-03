# 03 · Data contract — types, endpoints, query keys, validation, errors

Everything here is **copy-paste ready**. Tickets say "create file X with the code from 03 §N".
Backend facts are in [00](00-backend-deep-dive.md). Optional backend additions are in [08](08-backend-tickets.md);
**every frontend repository must work against the backend as it is today** and use the optional endpoint only
when it exists (see §8 "capability fallback").

## 1. Dependencies
Add to `package.json` `dependencies`: `"zod": "^3.23.8"` (must stay on v3 — the code below uses v3 APIs).

## 2. API client fix (ticket F002) — `src/core/network/apiClient.ts` + `src/core/errors/AppError.ts`

Today `handleError` throws away the backend body, so `400/409` become `ServerError` and the error `code`
(`COMMISSION_DEBT_UNSETTLED`…) is lost. Required behaviour:

```ts
// AppError.ts — ADD
export class ConflictError extends AppError { public readonly code = 'CONFLICT_ERROR'; }
export class BadRequestError extends AppError { public readonly code = 'BAD_REQUEST_ERROR'; }
// give the abstract base optional transport info:
export abstract class AppError extends Error {
  public abstract readonly code: string;
  /** Backend error code, e.g. COMMISSION_DEBT_UNSETTLED (body.error). */
  public backendCode?: string;
  public status?: number;
  constructor(message: string) { super(message); Object.setPrototypeOf(this, new.target.prototype); }
}
```
```ts
// apiClient.ts handleError — replace the switch with:
const body = axiosError.response.data as { error?: string; message?: string; details?: Array<{ field: string; message: string }> } | undefined;
let err: AppError;
switch (status) {
  case 400: err = body?.error === 'VALIDATION_ERROR' || body?.details?.length
      ? new ValidationError(msg, body?.details ?? []) : new BadRequestError(msg); break;
  case 401: /* keep existing side effects */ err = new UnauthorizedError(msg); break;
  case 403: err = new ForbiddenError(msg); break;
  case 404: err = new NotFoundError(msg); break;
  case 409: err = new ConflictError(msg); break;
  default:  err = new ServerError(msg, status);
}
err.backendCode = body?.error; err.status = status;
return err;
```
Also add to `ApiClient`: `patch<T>(url, data?)` and `delete<T>(url, params?)`, and let `get<T>(url, params)` keep working. Do **not** change the 401 refresh logic.

## 3. Error → message map (ticket F002) — `src/core/errors/errorMessage.ts`

```ts
import type { AppError } from './AppError';

/** backend `error` code → i18n key (all keys must exist in en/ar/he). */
export const ERROR_CODE_KEYS: Record<string, string> = {
  COMMISSION_DEBT_UNSETTLED: 'err_commission_debt',
  BILLING_SWITCH_BLOCKED_DEBT: 'err_commission_debt',
  REQUEST_ALREADY_APPROVED: 'err_request_already_approved',
  INVALID_FREE_TASKS_COUNT: 'err_free_tasks_range',
  COMMISSION_PAYMENT_LEDGER_MISMATCH: 'err_ledger_mismatch',
  VERIFICATION_NOT_REVIEWABLE: 'err_verification_not_reviewable',
  VERIFICATION_EVIDENCE_INCOMPLETE: 'err_verification_incomplete',
  UNIQUE_CONSTRAINT_FAILED: 'err_duplicate',
  RECORD_NOT_FOUND: 'err_not_found',
  NOT_FOUND: 'err_not_found',
  CONFLICT: 'err_conflict',
  FORBIDDEN: 'err_forbidden',
  UNAUTHORIZED: 'err_session_expired',
};
export const STATUS_KEYS: Record<string, string> = {
  NETWORK_ERROR: 'err_network', TIMEOUT_ERROR: 'err_timeout', SERVER_ERROR: 'err_server',
  FORBIDDEN_ERROR: 'err_forbidden', UNAUTHORIZED_ERROR: 'err_session_expired', NOT_FOUND_ERROR: 'err_not_found',
};
/** Returns a translated, user-safe message. Falls back to the server message, then a generic key. */
export function errorMessage(error: unknown, t: (k: string) => string): string {
  const e = error as Partial<AppError> | undefined;
  const key = (e?.backendCode && ERROR_CODE_KEYS[e.backendCode]) || (e?.code && STATUS_KEYS[e.code]);
  if (key) return t(key);
  if (e?.message && e.message !== 'HTTP Request Failed') return e.message;
  return t('err_generic');
}
/** ValidationError.details → { fieldName: message } for FormModal. */
export function fieldErrorsFrom(error: unknown): Record<string, string> {
  const d = (error as { details?: Array<{ field: string; message: string }> })?.details;
  return d ? Object.fromEntries(d.map((x) => [x.field.split('.').pop() ?? x.field, x.message])) : {};
}
```
i18n keys to add (en / ar / he): `err_generic` ("Something went wrong. Please try again." / "حدث خطأ ما. حاول مرة أخرى." / "משהו השתבש. נסה שוב."), `err_network`, `err_timeout`, `err_server`, `err_forbidden`, `err_session_expired`, `err_not_found`, `err_conflict`, `err_duplicate`, `err_commission_debt` ("Settle the craftsman's outstanding commission first."), `err_request_already_approved`, `err_free_tasks_range` ("Free tasks must be a whole number from 0 to 100."), `err_ledger_mismatch`, `err_verification_not_reviewable`, `err_verification_incomplete`.

## 4. Shared helpers (ticket F003)

```ts
// src/core/query/unwrap.ts
import type { Result } from '../result/Result';
export function unwrap<T>(r: Result<T>): T { if (r.success) return r.data; throw r.error; }
```
```ts
// src/core/query/queryKeys.ts
export const queryKeys = {
  dashboard: { all: ['dashboard'] as const, overview: (range: string) => ['dashboard', 'overview', range] as const },
  counts: ['admin', 'counts'] as const,
  billing: {
    all: ['billing'] as const,
    summary: ['billing', 'summary'] as const,
    plans: ['billing', 'plans'] as const,
    requests: (q: object) => ['billing', 'requests', q] as const,
    subscribers: (q: object) => ['billing', 'subscribers', q] as const,
    commissionPayments: (q: object) => ['billing', 'commission-payments', q] as const,
    ledger: (q: object) => ['billing', 'ledger', q] as const,
    bit: ['billing', 'bit'] as const,
    platform: ['billing', 'platform'] as const,
  },
  payments: { all: ['payments'] as const, summary: ['payments', 'summary'] as const,
    withdrawals: (q: object) => ['payments', 'withdrawals', q] as const, failed: (q: object) => ['payments', 'failed', q] as const },
  offers: { all: ['offers'] as const, list: ['offers', 'list'] as const },
  ads: { all: ['ads'] as const, list: ['ads', 'list'] as const },
  craftsmen: { all: ['craftsmen'] as const, list: (q: object) => ['craftsmen', 'list', q] as const },
  tasks: { all: ['tasks'] as const, list: (q: object) => ['tasks', 'list', q] as const, detail: (id: string) => ['tasks', 'detail', id] as const },
  disputes: { all: ['disputes'] as const, list: (q: object) => ['disputes', 'list', q] as const },
  reports: { all: ['reports'] as const, list: (q: object) => ['reports', 'list', q] as const },
  verification: { all: ['verification'] as const, queue: (q: object) => ['verification', 'queue', q] as const },
  users: { all: ['users'] as const, list: (q: object) => ['users', 'list', q] as const },
  team: ['admin', 'team'] as const,
  settings: { all: ['settings'] as const, platform: ['settings', 'platform'] as const, autoVerification: ['settings', 'auto-verification'] as const },
  audit: { list: (q: object) => ['audit', 'list', q] as const },
  broadcasts: { all: ['broadcasts'] as const, list: (q: object) => ['broadcasts', 'list', q] as const },
  categories: { all: ['categories'] as const },
  analytics: (tf: string) => ['analytics', tf] as const,
  live: ['live-activity'] as const,
};
```
```ts
// src/core/query/useAdminMutation.ts
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useToast } from '../../presentation/components/ui/Toast';
import { useLanguage } from '../../presentation/context/LanguageContext';
import { errorMessage } from '../errors/errorMessage';

export function useAdminMutation<TVars, TData>(opts: {
  mutationFn: (vars: TVars) => Promise<TData>;
  invalidate?: QueryKey[];
  successKey?: string;
  onSuccess?: (data: TData, vars: TVars) => void;
  silentError?: boolean;
}) {
  const qc = useQueryClient();
  const { success, error } = useToast();
  const { t } = useLanguage();
  return useMutation<TData, Error, TVars>({
    mutationFn: opts.mutationFn,
    onSuccess: (data, vars) => {
      opts.invalidate?.forEach((k) => qc.invalidateQueries({ queryKey: k }));
      if (opts.successKey) success(t(opts.successKey));
      opts.onSuccess?.(data, vars);
    },
    onError: (e) => { if (!opts.silentError) error(errorMessage(e, t)); },
  });
}
```
```ts
// src/data/mappers/pageMapper.ts — tolerate array OR {items,total,page,limit}
export interface Page<T> { items: T[]; total: number; page: number; limit: number }
export function toPage<R, T>(raw: unknown, page: number, limit: number, map: (r: R) => T, filter?: (t: T) => boolean): Page<T> {
  const arr: R[] = Array.isArray(raw) ? (raw as R[]) : ((raw as { items?: R[] })?.items ?? []);
  const mapped = arr.map(map);
  if (Array.isArray(raw)) {                       // legacy unpaginated endpoint → paginate on the client
    const f = filter ? mapped.filter(filter) : mapped;
    return { items: f.slice((page - 1) * limit, page * limit), total: f.length, page, limit };
  }
  const total = (raw as { total?: number })?.total ?? mapped.length;
  return { items: mapped, total, page, limit };
}
```
```ts
// src/core/utils/format.ts — ADD (keep existing exports)
export function formatDate(d: string | number | Date | null | undefined, locale: SupportedLocale = 'en'): string
export function formatDateTime(d: string | number | Date | null | undefined, locale: SupportedLocale = 'en'): string
export function formatDuration(minutes: number | null | undefined): string   // "1h 18m"
export function formatPercentValue(v: number | null | undefined, digits = 1): string // "8.0%" (no sign)
export function formatCompact(v: number | null | undefined, locale: SupportedLocale = 'en'): string // 12.4K
```
Return `'—'` for null/invalid. Use `Intl.DateTimeFormat` with locales `en-GB`/`ar-EG`/`he-IL`, `{ day:'2-digit', month:'short', year:'numeric' }` and `+ hour:'2-digit', minute:'2-digit'` for DateTime.

## 5. Domain types (ticket F020) — `src/domain/entities/Billing.ts`

```ts
export type BillingModel = 'SUBSCRIPTION' | 'COMMISSION';
export type CraftsmanSubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
export type SubscriptionRequestStatus = 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type CommissionPaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type CommissionLedgerStatus = 'DUE' | 'PAID';

export interface SubscriptionPlan {
  id: string; key: string; nameEn: string; nameAr: string; durationMonths: number; price: number;
  currency: 'ILS'; featuresEn: string[]; featuresAr: string[]; isPopular: boolean; isActive: boolean;
  subscribersCount?: number; pendingRequests?: number;
}
export interface PlanInput {
  key: string; nameEn: string; nameAr: string; durationMonths: number; price: number;
  featuresEn: string[]; featuresAr: string[]; isPopular: boolean; isActive: boolean;
}
export interface SubscriptionRequest {
  id: string; userId: string; userName: string; userEmail?: string; userPhone?: string;
  craftsmanTitle: string; avatarUrl?: string; planTitle: string; durationMonths: number; price: number;
  currency: string; paymentMethod: string; paymentProofUrl: string; notes?: string;
  status: SubscriptionRequestStatus; chatRoomId?: string; rejectionReason?: string; createdAt: string;
}
export interface Subscriber {
  id: string;                       // CraftsmanProfile.id
  name: string; title: string; email?: string; phone?: string; userId?: string;
  subscriptionStatus: CraftsmanSubscriptionStatus; startDate?: string; expiryDate?: string;
  freeTasksRemaining: number; billingModel: BillingModel | null; commissionLocked: boolean;
  isAllowedToAcceptTasks: boolean; commissionDue?: number;
}
export interface CommissionPayment {
  id: string; craftsmanProfileId: string; craftsmanName: string; craftsmanTitle: string; avatarUrl?: string;
  email?: string; phone?: string; commissionLocked: boolean; amount: number; paymentProofUrl: string;
  notes?: string; status: CommissionPaymentStatus; reviewedAt?: string; createdAt: string;
}
export interface CommissionLedgerEntry {
  id: string; taskId: string; taskDisplayId?: string; craftsmanProfileId: string; craftsmanName?: string;
  amount: number; rate: number; status: CommissionLedgerStatus; paymentId?: string; createdAt: string; paidAt?: string;
}
export interface BitSettings { phoneNumber: string; recipientName: string; instructionsEn: string; instructionsAr: string }
export interface PlatformSettings { freeTasksCount: number; commissionRate: number /* fraction 0.08 */; autoVerifyCraftsmen: boolean }
export interface BillingSummary {
  pendingReceipts: number; pendingCommissionPayments: number; commissionDueTotal: number;
  lockedCraftsmen: number; activeSubscribers: number; pendingWithdrawals: number;
}
export interface ListQuery { page: number; limit: number; search?: string }
```

### Billing repository interface — `src/domain/repositories/BillingRepository.ts`
```ts
import type { Result } from '../../core/result/Result';
import type { Page } from '../../data/mappers/pageMapper';
import type * as B from '../entities/Billing';

export interface BillingRepository {
  getPlans(): Promise<Result<B.SubscriptionPlan[]>>;
  createPlan(input: B.PlanInput): Promise<Result<B.SubscriptionPlan>>;
  updatePlan(id: string, input: Partial<B.PlanInput>): Promise<Result<B.SubscriptionPlan>>;
  deletePlan(id: string): Promise<Result<boolean>>;

  getRequests(q: B.ListQuery & { status: B.SubscriptionRequestStatus | 'ALL' }): Promise<Result<Page<B.SubscriptionRequest>>>;
  approveRequest(id: string): Promise<Result<boolean>>;
  rejectRequest(id: string, reason: string): Promise<Result<boolean>>;

  getSubscribers(q: B.ListQuery & { filter: 'all' | 'active' | 'free' | 'commission' | 'locked' | 'expired' }): Promise<Result<Page<B.Subscriber>>>;
  extendSubscriber(id: string, days: number): Promise<Result<boolean>>;
  cancelSubscriber(id: string): Promise<Result<boolean>>;
  setFreeTasks(id: string, freeTasksRemaining: number): Promise<Result<boolean>>;

  getCommissionPayments(q: B.ListQuery & { status: B.CommissionPaymentStatus | 'ALL' }): Promise<Result<Page<B.CommissionPayment>>>;
  approveCommissionPayment(id: string): Promise<Result<{ unlocked: boolean; settledEntries: number }>>;
  rejectCommissionPayment(id: string, reason: string): Promise<Result<boolean>>;
  /** null = backend does not offer the ledger endpoint (B05) → UI hides the tab. */
  getCommissionLedger(q: B.ListQuery & { status: B.CommissionLedgerStatus | 'ALL' }): Promise<Result<Page<B.CommissionLedgerEntry> | null>>;

  getBitSettings(): Promise<Result<B.BitSettings>>;
  updateBitSettings(s: B.BitSettings): Promise<Result<B.BitSettings>>;
  getPlatformSettings(): Promise<Result<B.PlatformSettings>>;
  updatePlatformSettings(s: Partial<B.PlatformSettings>): Promise<Result<B.PlatformSettings>>;
  /** null = backend does not offer /admin/counts or summary blocks (B09/B10). */
  getSummary(): Promise<Result<B.BillingSummary | null>>;
}
```

### Mapping rules for `ApiBillingRepository` (current backend)
| Method | Call | Mapping |
|---|---|---|
| getPlans | `GET /admin/subscriptions/plans` | `price = Number(p.price)`; arrays default `[]`; `currency:'ILS'`; `isActive = p.isActive !== false` |
| createPlan | `POST /admin/subscriptions/plans` | body exactly `{key,nameEn,nameAr,durationMonths,price,featuresEn,featuresAr,isPopular}` (backend sets `isActive:true`); if `isActive===false` follow with `PUT …/:id {isActive:false}` |
| updatePlan | `PUT /admin/subscriptions/plans/:id` | send **only** keys of `Partial<PlanInput>` except `key` |
| deletePlan | `DELETE …/:id` | |
| getRequests | `GET /admin/subscriptions/requests?status=` (omit when `ALL`→send `ALL`) | `toPage(raw, page, limit, mapRequest, search filter on userName/planTitle/userPhone)` |
| approve / reject | `POST …/requests/:id/approve` · `…/reject {reason}` | |
| getSubscribers | `GET /admin/subscriptions/subscribers` | row→`Subscriber`: `name=craftsmanName`, `title=craftsmanTitle`, `email=user.email`, `phone=user.phoneNumber`, `userId=user.id`; client filter: `active`=status ACTIVE & expiry>now, `free`=freeTasksRemaining>0, `commission`=billingModel COMMISSION, `locked`=commissionLocked, `expired`=not active; search on name/phone/email |
| extend/cancel/setFreeTasks | `POST …/extend {days}` · `POST …/cancel` · `PUT …/:id/free-tasks {freeTasksRemaining}` | |
| getCommissionPayments | `GET /admin/commission-payments?status=` | `craftsmanName = user.firstName+' '+user.lastName`; others from `craftsmanProfile` |
| approve/reject commission | `POST /admin/commission-payments/:id/approve` → `{unlocked,settledEntries}` · `…/reject {reason}` | |
| getCommissionLedger | `GET /admin/commission/ledger` | **404 → `ok(null)`** |
| getBitSettings | `GET /admin/subscriptions/bit-settings` | `BIT_PHONE_NUMBER→phoneNumber` … |
| updateBitSettings | `PUT /admin/subscriptions/bit-settings` | send the four `BIT_*` keys |
| getPlatformSettings | `GET /admin/settings/platform` **if 200**, else `GET /admin/settings` + `GET /admin/settings/auto-verification` | parse `FREE_TASKS_COUNT` (default 3), `COMMISSION_RATE` (default 0.08, accept 0<r<1 only), `enabled` |
| updatePlatformSettings | `PUT /admin/settings` with `{FREE_TASKS_COUNT: String(n), COMMISSION_RATE: String(fraction)}` and `PUT /admin/settings/auto-verification {enabled}` | |
| getSummary | `GET /admin/billing/summary` | **404 → `ok(null)`** |

Mock twin `MockBillingRepository` (ticket F021): in-memory arrays seeded with 3 plans, 4 requests, 6 subscribers, 3 commission payments; same async API with 200 ms delay. Register both in `DependencyProvider` as `billingRepository`.

## 6. Status domains (ticket F004) — extend `components/ui/status.ts`

`StatusDomain = 'task' | 'craftsman' | 'verification' | 'report' | 'billing' | 'commission' | 'subscription' | 'dispute' | 'offer' | 'broadcast' | 'withdrawal' | 'userAccount'`.

| Domain | Status → pill variant |
|---|---|
| billing (SubscriptionRequest) | PENDING_VERIFICATION `warning` · APPROVED `success` · REJECTED `danger` · CANCELLED `muted` |
| commission (CommissionPayment) | PENDING `warning` · APPROVED `success` · REJECTED `danger` |
| ledger (use `commission` domain with DUE/PAID) | DUE `warning` · PAID `success` |
| subscription (craftsman) | ACTIVE `success` · EXPIRED `muted` · CANCELLED `muted` · LOCKED `danger` · FREE `info` · COMMISSION `neutral` |
| dispute | PENDING `warning` · RESOLVED `success` |
| report | PENDING `warning` · UNDER_INVESTIGATION `info` · RESOLVED `success` · DISMISSED `muted` (keep severity mapping HIGH/MEDIUM/LOW) |
| offer | ACTIVE `success` · PAUSED `muted` · SCHEDULED `info` · ENDED `muted` |
| broadcast | SENT `success` · SCHEDULED `info` · CANCELLED `muted` · FAILED `danger` |
| withdrawal | PENDING `warning` · COMPLETED `success` · FAILED `danger` |
| userAccount | ACTIVE `success` · SUSPENDED `warning` · BLOCKED `danger` |
| task (REPLACE the current list) | PENDING `outline` · ACCEPTED/PRE_CHAT_PENDING/CHAT_OPEN/AGREEMENT_PENDING/IN_PROGRESS `neutral` · WORK_SUBMITTED/RATING_PENDING `info` · CLOSED/COMPLETED `success` · DISPUTED `warning` · FROZEN `inverse` · CANCELLED/REJECTED `muted` · EMERGENCY `danger` |

Label keys: `statusLabelKey(domain, status)` → `status_<lowercase>`; add every status above to i18n (e.g. `status_pending_verification`, `status_under_investigation`, `status_work_submitted`, `status_rating_pending`, `status_chat_open`, …).

## 7. Validation schemas (ticket F001/F023…) — `src/domain/validation/`

Message convention: zod `message` is an **i18n key** optionally followed by `|param` (e.g. `val_min_len|3`). Helper:
```ts
// src/domain/validation/index.ts
import type { ZodError, ZodTypeAny, z } from 'zod';
export type FieldErrors = Record<string, string>;
export function validate<S extends ZodTypeAny>(schema: S, data: unknown): { ok: true; data: z.infer<S> } | { ok: false; errors: FieldErrors } {
  const r = schema.safeParse(data);
  if (r.success) return { ok: true, data: r.data };
  return { ok: false, errors: flatten(r.error) };
}
function flatten(e: ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const i of e.issues) { const k = i.path.join('.') || '_'; if (!out[k]) out[k] = i.message; }
  return out;
}
/** 'val_min_len|3' → t('val_min_len').replace('{n}','3') */
export function tError(t: (k: string) => string, msg?: string): string | undefined {
  if (!msg) return undefined; const [key, param] = msg.split('|'); const s = t(key); return param ? s.replace('{n}', param) : s;
}
```
Validation i18n keys (en): `val_required` "This field is required" · `val_min_len` "Minimum {n} characters" · `val_max_len` "Maximum {n} characters" · `val_positive` "Must be greater than 0" · `val_int` "Must be a whole number" · `val_range` "Must be between {n}" (param like `0-100`) · `val_url` "Enter a valid http(s) link" · `val_email` "Enter a valid email" · `val_phone` "Enter a valid phone number" · `val_key_format` "Use 3–32 capital letters, digits or _" · `val_date_order` "End must be after start" · `val_future` "Must be in the future" · `val_max_items` "At most {n} items".

```ts
// src/domain/validation/common.ts
import { z } from 'zod';
export const req = (n = 1) => z.string().trim().min(n, n === 1 ? 'val_required' : `val_min_len|${n}`);
export const text = (min: number, max: number) =>
  z.string().trim().min(min, min <= 1 ? 'val_required' : `val_min_len|${min}`).max(max, `val_max_len|${max}`);
export const httpUrl = z.string().trim().max(2000, 'val_max_len|2000')
  .transform((v) => (/^https?:\/\//i.test(v) ? v : `https://${v}`))
  .refine((v) => { try { const u = new URL(v); return (u.protocol === 'http:' || u.protocol === 'https:') && u.hostname.includes('.'); } catch { return false; } }, 'val_url');
/** '' → null, otherwise a validated http(s) URL */
export const optionalHttpUrl = z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? null : v), z.union([z.null(), httpUrl]));
export const isoDateOrNull = z.preprocess((v) => (v === '' || v == null ? null : v), z.union([z.null(), z.string().refine((s) => !Number.isNaN(Date.parse(s)), 'val_required')]));
export const email = z.string().trim().toLowerCase().email('val_email');
export const phone = z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, 'val_phone');
```
```ts
// src/domain/validation/billing.ts
import { z } from 'zod';
import { text, phone } from './common';

const lines = (max: number) => z.preprocess(
  (v) => (typeof v === 'string' ? v.split('\n').map((s) => s.trim()).filter(Boolean) : v),
  z.array(z.string().max(120, 'val_max_len|120')).max(max, `val_max_items|${max}`),
);
export const planSchema = z.object({
  key: z.string().trim().toUpperCase().regex(/^[A-Z0-9_]{3,32}$/, 'val_key_format'),
  nameEn: text(3, 80), nameAr: text(3, 80),
  durationMonths: z.coerce.number({ invalid_type_error: 'val_int' }).int('val_int').min(1, 'val_range|1-36').max(36, 'val_range|1-36'),
  price: z.coerce.number({ invalid_type_error: 'val_positive' }).positive('val_positive').max(100000, 'val_range|0-100000'),
  featuresEn: lines(10), featuresAr: lines(10),
  isPopular: z.boolean().default(false), isActive: z.boolean().default(true),
});
export type PlanFormValues = z.input<typeof planSchema>;
export const bitSettingsSchema = z.object({
  phoneNumber: phone, recipientName: text(2, 80), instructionsEn: text(10, 1000), instructionsAr: text(10, 1000),
});
export const rejectReasonSchema = z.object({ reason: text(3, 500) });
export const extendDaysSchema = z.object({ days: z.coerce.number({ invalid_type_error: 'val_int' }).int('val_int').min(1, 'val_range|1-3650').max(3650, 'val_range|1-3650') });
export const freeTasksSchema = z.object({ freeTasksRemaining: z.coerce.number({ invalid_type_error: 'val_int' }).int('val_int').min(0, 'val_range|0-100').max(100, 'val_range|0-100') });
export const platformSettingsSchema = z.object({
  freeTasksCount: z.coerce.number().int('val_int').min(0, 'val_range|0-100').max(100, 'val_range|0-100'),
  commissionRatePercent: z.coerce.number({ invalid_type_error: 'val_positive' }).gt(0, 'val_range|0.1-50').max(50, 'val_range|0.1-50'),
});
/** UI shows percent; API stores a fraction with ≤4 decimals. */
export const percentToFraction = (p: number) => Math.round((p / 100) * 10000) / 10000;
export const fractionToPercent = (f: number) => Math.round(f * 10000) / 100;
```
```ts
// src/domain/validation/offers.ts
import { z } from 'zod';
import { text, optionalHttpUrl, isoDateOrNull } from './common';
export const OFFER_TARGETS = ['NONE', 'URL', 'CRAFTSMAN', 'CATEGORY', 'TASK', 'SERVICE'] as const;
export const offerSchema = z.object({
  titleEn: text(3, 80), titleAr: text(3, 80),
  subtitleEn: text(3, 160), subtitleAr: text(3, 160),
  buttonTextEn: text(1, 30), buttonTextAr: text(1, 30),
  imageUrl: z.string().trim().min(5, 'val_required'),
  bannerType: z.enum(['PROMO', 'EMERGENCY_SOS']),
  placement: z.enum(['TOP', 'FEATURED']),
  targetType: z.enum(OFFER_TARGETS),
  targetId: z.string().trim().optional(),
  targetUrl: optionalHttpUrl,
  startDate: isoDateOrNull, endDate: isoDateOrNull,
}).superRefine((v, ctx) => {
  if (v.targetType === 'URL' && !v.targetUrl) ctx.addIssue({ code: 'custom', path: ['targetUrl'], message: 'val_required' });
  if (['CRAFTSMAN', 'CATEGORY', 'TASK', 'SERVICE'].includes(v.targetType) && !v.targetId) ctx.addIssue({ code: 'custom', path: ['targetId'], message: 'val_required' });
  if (v.startDate && v.endDate && Date.parse(v.endDate) <= Date.parse(v.startDate)) ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'val_date_order' });
});
export const adCampaignSchema = z.object({
  name: text(3, 80),
  budget: z.coerce.number({ invalid_type_error: 'val_positive' }).positive('val_positive').max(10_000_000, 'val_range|0-10000000'),
  placement: z.enum(['Home Banner', 'Featured Slots']),
  imageUrl: z.string().trim().optional(), description: z.string().trim().max(160, 'val_max_len|160').optional(),
  ctaText: z.string().trim().max(30, 'val_max_len|30').optional(),
  targetUrl: optionalHttpUrl, startDate: isoDateOrNull, endDate: isoDateOrNull,
  durationHours: z.coerce.number().positive('val_positive').optional(),
}).superRefine((v, ctx) => {
  if (v.startDate && v.endDate && Date.parse(v.endDate) <= Date.parse(v.startDate)) ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'val_date_order' });
});
```
```ts
// src/domain/validation/ops.ts — people / operations / platform
import { z } from 'zod';
import { text, email, optionalHttpUrl } from './common';
export const loginSchema = z.object({ identifier: z.string().trim().min(3, 'val_min_len|3'), password: z.string().min(6, 'val_min_len|6') });
export const moderationNotesSchema = (required: boolean) => z.object({
  notes: required ? text(3, 500) : z.string().trim().max(500, 'val_max_len|500').optional(),
});
export const disputeResolveSchema = z.object({ resolution: z.enum(['REFUND_CLIENT', 'PAY_CRAFTSMAN']), notes: z.string().trim().max(500).optional() });
export const reportModerateSchema = z.object({ action: z.enum(['dismiss', 'suspend', 'ban']), notes: z.string().trim().max(500).optional() });
export const suspendSchema = z.object({ reason: text(3, 300) });
export const broadcastSchema = z.object({
  title: text(3, 80), body: text(3, 500),
  audience: z.enum(['ALL', 'CUSTOMERS', 'CRAFTSMEN']),
  targetCity: z.string().trim().max(60).optional(),
  imageUrl: optionalHttpUrl, deepLink: z.string().trim().max(300).optional(),
  scheduledAt: z.string().optional(),
}).superRefine((v, ctx) => {
  if (v.scheduledAt && !(Date.parse(v.scheduledAt) > Date.now())) ctx.addIssue({ code: 'custom', path: ['scheduledAt'], message: 'val_future' });
});
export const categorySchema = z.object({
  key: z.string().trim().toUpperCase().regex(/^[A-Z0-9_]{3,32}$/, 'val_key_format'),
  nameEn: text(3, 60), nameAr: text(3, 60), nameHe: z.string().trim().max(60).optional(),
});
export const subCategorySchema = z.object({ nameEn: text(2, 60), nameAr: text(2, 60), nameHe: z.string().trim().max(60).optional() });
export const fieldSchema = z.object({
  label: text(2, 60),
  fieldKey: z.string().trim().regex(/^[a-z][a-zA-Z0-9_]{1,39}$/, 'val_key_format'),
  fieldType: z.enum(['text', 'number', 'select', 'textarea', 'image']),
  options: z.string().optional(), isRequired: z.boolean().default(false),
}).superRefine((v, ctx) => {
  if (v.fieldType === 'select' && !(v.options ?? '').split('\n').map((s) => s.trim()).filter(Boolean).length)
    ctx.addIssue({ code: 'custom', path: ['options'], message: 'val_required' });
});
export const newAdminSchema = z.object({ firstName: text(2, 40), lastName: text(2, 40), email, title: text(2, 60) });
export const userStatusSchema = z.object({ status: z.enum(['ACTIVE', 'SUSPENDED', 'BLOCKED']), reason: z.string().trim().max(300).optional() });
```

## 8. Capability fallback (optional backend endpoints)
Optional endpoints (marked *opt* in the page specs) are called inside a helper:
```ts
// src/data/repositories/optional.ts
import { ok, type Result } from '../../core/result/Result';
import { NotFoundError } from '../../core/errors/AppError';
export async function optional<T>(call: () => Promise<T>, map: (raw: T) => Result<unknown>): Promise<Result<any>> {
  try { return map(await call()); } catch (e) { if (e instanceof NotFoundError) return ok(null); throw e; }
}
```
UI contract: `data === null` ⇒ hide the feature (no empty card, no error). Cache the "unsupported" answer with `staleTime: Infinity` so we do not hammer a missing route.

## 9. New endpoint constants (ticket F002) — add to `API_ENDPOINTS.admin`
```ts
billingSummary: '/admin/billing/summary', commissionPayments: '/admin/commission-payments',
approveCommissionPayment: (id: string) => `/admin/commission-payments/${id}/approve`,
rejectCommissionPayment: (id: string) => `/admin/commission-payments/${id}/reject`,
commissionLedger: '/admin/commission/ledger', freeTasks: '/admin/subscriptions/free-tasks',
setFreeTasks: (id: string) => `/admin/subscriptions/subscribers/${id}/free-tasks`,
platformSettings: '/admin/settings/platform', counts: '/admin/counts',
team: '/admin/team', teamMember: (id: string) => `/admin/team/${id}`,
userStatus: (id: string) => `/admin/users/${id}/status`, task: (id: string) => `/admin/tasks/${id}`,
promotion: (id: string) => `/admin/promotions/${id}`, report: (id: string) => `/admin/reports/${id}`,
subcategory: (id: string) => `/admin/categories/subcategories/${id}`, field: (id: string) => `/admin/fields/${id}`,
```
Remove the dead `metrics.*` keys that point to non-existent `/metrics/...` routes (only `/admin/overview-stats` and `/admin/metrics/cohort` are real).
