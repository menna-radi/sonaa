# 02 · The Overview standard — the contract every page must meet

The Overview page (`features/dashboard`) is the visual and structural reference. This document turns "make it
look like Overview" into rules a low-cost model can follow without taste. **Ticket F010 first cleans the
Overview itself** so that what the other tickets copy is actually clean.

## 1. What "Overview-grade" means (checklist used in every page ticket)

| # | Rule | How it is verified |
|---|---|---|
| 1 | Page root is `<div className="ui-page">`; first child is `<PageHeader title subtitle meta actions/>`. | grep |
| 2 | KPI strip uses `<div className="ui-kpi-grid">` + `KpiCard` (max 6 cards; 2 columns on mobile, 3 tablet, 6 desktop). | visual |
| 3 | Content sections are `Card` (eyebrow + title + actions) laid out with `ui-split` (2fr/1fr) or `ui-split--even` (1fr/1fr). Never inline `display:grid`. | `ui-audit` |
| 4 | **Zero inline `style={{}}`** except values that are computed at runtime (a bar width `%`, a rotation). Everything else is a `ui-*` class or a feature class in `features/<x>/<x>.css`. | `node scripts/ui-audit.mjs <dir> --strict` |
| 5 | **Zero hex/rgb colours** in `.tsx`/feature CSS. Tokens only (`var(--…)`, see tokens.css). Only `AndroidPhoneBannerPreview.tsx` is exempt. | `ui-audit --strict` |
| 6 | Every user-visible string goes through `t('key')` with **en + ar + he** entries in `LanguageContext.tsx`. No `isRtl ? 'عربي' : 'English'` ternaries. | `node scripts/i18n-audit.mjs` |
| 7 | Server data comes from **TanStack Query** hooks in `features/<x>/hooks/`. No `useEffect(fetch)`, no `setInterval` for data. Polling only through `refetchInterval` (≥ 30 s, `refetchIntervalInBackground:false`). | grep `setInterval` |
| 8 | Three states are always rendered: **loading** (`Skeleton` shaped like the final layout), **error** (`ErrorState` with retry → `refetch`), **empty** (`EmptyState` with next action). | visual |
| 9 | Money → `formatMoney(v,'ILS',language)`; numbers → `formatNumber`; dates → `formatDate/formatDateTime/formatRelativeTime` from `core/utils/format.ts`. No `toLocaleString()` in components, no `₪` literals, no `(x/1e6).toFixed(2)M`. | grep |
| 10 | Numbers/IDs/phones inside RTL text are wrapped `<bdi>` or have class `ui-num` (forces `direction:ltr; unicode-bidi:isolate`). | visual in `ar` |
| 11 | Destructive or money-moving actions use `useConfirm()` / `confirmWithReason()`; success/failure use `useToast()`. **No `window.confirm/alert`.** | grep |
| 12 | Forms use `FormModal` (F006) + zod schema from `src/domain/validation/*` + field-level `error` props. Submit disabled while pending; server `details[]` mapped back onto fields. | review |
| 13 | Logical CSS only (`margin-inline-start`, `inset-inline-end`, `text-align:start`); icons that point (→) carry `className="ui-icon--directional"`. | review |
| 14 | Files: page ≤ 250 lines, component ≤ 300 lines, hook ≤ 200 lines. Split before exceeding. No `any` (use the domain types); no `// @ts-ignore`. | `npm run lint` + review |
| 15 | No invented data: if the backend does not return a value, show `—` or hide the element. Never a literal sample number or name. | review |
| 16 | Interactive elements ≥ 36 px high (44 px on touch), visible focus ring, `aria-label` on icon-only buttons, dialogs close on Escape. | a11y pass |

## 2. Layout primitives (added by ticket F005 to `ui.css`)

```css
/* ---- Page layout primitives (Overview standard) ---- */
.ui-page            { display: flex; flex-direction: column; gap: var(--sp-5); width: 100%; min-width: 0; }
.ui-stack           { display: flex; flex-direction: column; gap: var(--sp-4); min-width: 0; }
.ui-stack--tight    { gap: var(--sp-2); }
.ui-row             { display: flex; align-items: center; gap: var(--sp-2); flex-wrap: wrap; }
.ui-row--between    { justify-content: space-between; }
.ui-row--end        { justify-content: flex-end; }
.ui-toolbar         { display: flex; align-items: center; gap: var(--sp-3); flex-wrap: wrap; }
.ui-toolbar__grow   { flex: 1 1 240px; min-width: 0; }
.ui-kpi-grid        { display: grid; gap: var(--gap-grid); grid-template-columns: repeat(2, minmax(0, 1fr)); }
@media (min-width: 768px)  { .ui-kpi-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (min-width: 1280px) { .ui-kpi-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
                             .ui-kpi-grid--4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
                             .ui-kpi-grid--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.ui-split           { display: grid; gap: var(--gap-grid); grid-template-columns: minmax(0, 1fr); align-items: stretch; }
@media (min-width: 1100px) { .ui-split { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); }
                             .ui-split--even { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.ui-split > *, .ui-grid-auto > * { min-width: 0; }
.ui-grid-auto       { display: grid; gap: var(--gap-grid); grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
.ui-form-grid       { display: grid; gap: var(--sp-4); grid-template-columns: minmax(0, 1fr); }
@media (min-width: 640px) { .ui-form-grid--2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.ui-num             { direction: ltr; unicode-bidi: isolate; font-variant-numeric: tabular-nums; }
.ui-text-muted      { color: var(--text-muted); }
.ui-text-faint      { color: var(--text-faint); }
.ui-text-strong     { color: var(--text-strong); }
.ui-caption         { font-size: var(--fs-caption); color: var(--text-muted); }
.ui-eyebrow         { font-size: var(--fs-micro); font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--text-muted); }
.ui-clamp-1         { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ui-scroll-x        { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.ui-center          { display: flex; align-items: center; justify-content: center; }
```

## 3. Canonical page skeleton (copy this shape)

```tsx
// features/<x>/pages/XPage.tsx
import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { PageHeader, Button, ErrorState, Skeleton } from '../../../components/ui';
import { formatRelativeTime } from '../../../../core/utils/format';
import { useXSummary } from '../hooks/useX';
import { XKpis } from '../components/XKpis';
import { XMainCard } from '../components/XMainCard';
import { XSideCard } from '../components/XSideCard';
import { RefreshCw } from 'lucide-react';

export const XPage: React.FC = () => {
  const { t, language } = useLanguage();
  const q = useXSummary();

  return (
    <div className="ui-page">
      <PageHeader
        title={t('x_title')}
        subtitle={t('x_subtitle')}
        meta={q.dataUpdatedAt ? `${t('updated')} ${formatRelativeTime(q.dataUpdatedAt, language)}` : undefined}
        actions={
          <Button variant="outline" size="sm" icon={<RefreshCw size={14} />} loading={q.isFetching} onClick={() => q.refetch()}>
            {t('btn_refresh')}
          </Button>
        }
      />
      {q.isError ? (
        <ErrorState title={t('status_error')} message={q.error.message} onRetry={() => q.refetch()} />
      ) : (
        <>
          <XKpis data={q.data} loading={q.isLoading} />
          <div className="ui-split">
            <XMainCard data={q.data} loading={q.isLoading} />
            <XSideCard data={q.data} loading={q.isLoading} />
          </div>
        </>
      )}
    </div>
  );
};
export default XPage;
```
`PageHeader` gets an optional `meta` string (already supported). `ErrorState` already exists in
`components/ui/EmptyState.tsx`; F004 makes its default texts translatable (`title`/`message`/`retryLabel` props).

## 4. Data-layer pattern (no component talks to axios)

```
component → useXxx() hook (TanStack Query) → repositories.xRepository (interface in domain/) → ApiXRepository (apiClient) / MockXRepository
```
* Repositories return `Result<T>`; hooks convert with `unwrap(result)` (F003) which **throws the `AppError`** so React Query's `error` is always an `AppError`.
* Query keys come only from `src/core/query/queryKeys.ts` (F003). Mutations invalidate by key prefix, e.g. `queryClient.invalidateQueries({ queryKey: queryKeys.billing.all })`.
* Dates and money stay **raw** in domain objects (ISO string / number). Formatting happens in the component.
* A mutation hook is `useAdminMutation({ mutationFn, invalidate, successKey, onSuccess })` (F003): it toasts `t(successKey)` on success and `errorMessage(error)` on failure, and invalidates the listed keys.

## 5. Component recipes

**KPI strip**
```tsx
<div className="ui-kpi-grid ui-kpi-grid--4">
  <KpiCard icon={<Wallet size={16} />} label={t('billing_kpi_commission_due')} value={formatMoney(s.commissionDue,'ILS',language)} caption={…} loading={loading} />
</div>
```
`delta` only when the API provides a real previous value. `tone="danger"` only for genuine incidents (locked craftsmen > 0, emergencies > 0).

**Table page** = `PageHeader` → `ui-toolbar` (SearchInput + `Segmented` filters + right-aligned actions) → `Card padding="none"` containing `DataTable` with server pagination → row click opens a `Drawer` (≥ md) or full-screen sheet (mobile). Always pass `mobile={(row)=> <MobileRow … />}`.

**Status** — one place: `components/ui/status.ts`. Add a domain there (F004) instead of writing `style={{ color }}`; render with `<StatusPill variant={pillVariantFor('billing', s)} label={t(statusLabelKey('billing', s))} />`.

**Confirm / reason**
```tsx
const { confirm, confirmWithReason } = useConfirm();
const { confirmed, reason } = await confirmWithReason({ title: t('billing_reject_title'), body: …, tone: 'danger', requireReason: true });
if (!confirmed) return;
reject.mutate({ id, reason });
```

**Form modal** (F006): `<FormModal title onSubmit pending submitLabel isOpen onClose>{fields}</FormModal>` — renders `<form noValidate>`, runs the zod schema on submit, focuses the first invalid field, shows `TextField error`.

## 6. Overview cleanup spec (ticket F010 / F011 — do these first)

Files: `features/dashboard/pages/DashboardPage.tsx`, `components/{MetricsGrid,RevenueChart,TopCategories,CohortVelocity,PendingReports,ModeratorReview}.tsx`, `hooks/useDashboard.ts`, `domain/repositories/MetricRepository.ts`, `data/repositories/ApiMetricRepository.ts`.

1. Move `OverviewPage` out of `DashboardPage.tsx` into `features/dashboard/pages/OverviewPage.tsx`; `DashboardPage.tsx` keeps only the router + `PageErrorBoundary` + `Suspense` (≤ 120 lines).
2. Replace every inline layout with the primitives in §2.
3. Replace literals with keys (add to `LanguageContext.tsx`, all 3 languages): `status_error_title`, `btn_sync` ("Refresh"), `range_last_7d/30d/90d`, `rev_gmv`, `rev_take_rate`, `rev_avg_order`, `rev_disputes`, `rev_no_data`, `rev_subtitle`, `unit_tasks`, `updated`, `empty_pending_reports`, `empty_verification`.
4. **Range control:** when backend ticket **B09** is deployed, `GET /admin/overview-stats?range=7d|30d|90d` is honoured → show a real `Segmented` (7D/30D/90D) and pass `range` into `useDashboard(range)` (query key includes it). Until then render *no* range control. Remove the dead "Last 7 days" button.
5. `RevenueChart` receives `summary` + `analytics` via props (no own fetch). GMV formatted with `formatMoney`. Trend badge only from real series (existing `deriveTrend`). Chart `date` strings parsed with `new Date(point.date)` when ISO (B09) else printed as-is.
6. `PendingReports` → rename to **`PendingDisputes`** (title key `sec_pending_disputes`), rows link to `navigate('tasks')` with the disputes tab preselected (`sessionStorage 'tasks_tab' = 'disputes'`, F064). Row title = dispute `title`, subtitle = `A → B`, time = `formatRelativeTime(createdAt)` (needs B09 `createdAt`), falling back to `—`. Remove the `report_*` icon switch.
7. `ModeratorReview` → keep the rail, restyle with classes (`ui-rail`, `ui-rail__card`), `Open queue (N)` link.
8. **Billing snapshot row (F011, needs B09/B10):** a second KPI strip `ui-kpi-grid ui-kpi-grid--4` under the main KPIs: *Pending receipts* · *Commission due (₪)* · *Locked craftsmen* · *Pending withdrawals*. Each card is clickable → `navigate('billing' | 'payments')` and gets `tone="danger"` only when locked craftsmen > 0. Hidden when the backend does not return the `billing` block.
9. Acceptance: `node scripts/ui-audit.mjs src/presentation/features/dashboard --strict` → inline ≤ 6 (runtime widths only), hex 0; `node scripts/i18n-audit.mjs` passes; `npm run build && npm run lint` pass; visual check at 390/1024/1440 in en/ar/he, light/dark.

## 7. i18n key naming
`<area>_<thing>[_<state>]`, lower-snake. Areas: `nav_`, `sec_`, `btn_`, `status_`, `err_`, `empty_`, `confirm_`, `toast_`, `billing_`, `commission_`, `offers_`, `tasks_`, `disputes_`, `craftsmen_`, `settings_`, `audit_`, `team_`, `broadcast_`, `reports_`, `users_`. Never reuse a key with a different meaning. Arabic must be real Arabic (not transliteration); Hebrew real Hebrew. If unsure of the Hebrew, copy the English text into `he` and add `// TODO-HE` on the line — the audit script tolerates identical text but reports it.
