# 02 · Component library

Location: `src/presentation/components/ui/`. Each component is one `.tsx` file plus its rules in
`components/ui/ui.css`, which `global.css` imports after `tokens.css`. Class prefix: **`ui-`**, BEM-ish
(`ui-card`, `ui-card__header`, `ui-card--inverse`). **No inline styles** except dynamic values (a progress
width, a chart height). Export everything from `components/ui/index.ts`.

Why plain CSS classes and not a UI kit or Tailwind: the project already uses global CSS and logical
properties. Adding a framework to 42k lines of inline styles would mean two systems during migration. Plain
classes are also the easiest thing for a low-cost model to apply correctly.

---

## Layout

### `AppShell`
Renders the sidebar, top bar and mobile chrome **once** in `DashboardPage`. Pages render only their content.
```tsx
<AppShell>            // owns sidebarOpen state, closes drawer on navigate + Escape
  {pageElement}       // from the existing switch(currentPage)
</AppShell>
```
Anatomy: `.ui-shell` › `Sidebar` + `.ui-shell__main` › `Topbar` + `<main class="ui-shell__content">`.
`MobileBottomTabs` renders only below 768 px. Pages **must delete** their own `<Sidebar/>`, `<Header/>`,
`.mobile-header` and `.mobile-subheader` blocks.

### `Sidebar` (restyle of `layouts/Sidebar.tsx`)
- Black background, full height, and its own scroll area for the nav.
- Brand block: 32 px white rounded square with the initial, then two lines: `BRAND_NAME` (14/600, white)
  and "Admin Console" (12, `--n-500`).
- Section title: `--fs-micro`, `--sidebar-section`, margin-top 20 px.
- Item: height 36 px, radius `--radius-sm`, icon 16 px, gap 10 px, text 14/500 `--sidebar-text`.
  - Hover: `--sidebar-item-hover` background, white text.
  - **Active: white pill, black text and icon**, font 600.
- Count badge (end aligned): min-width 22 px, height 20 px, radius 6, `--sidebar-badge-bg`, 11/600.
- `LIVE` badge: red outline pill, 10/700, with a 6 px pulsing dot before the text.
- Footer: "Settings" item, then a user row: 32 px initials avatar (`--n-800` bg), name 13/600 white, role
  12 `--n-500`, and a chevron that opens a menu (language, theme, logout).
- Badge counts come from **one** `useSidebarCounts()` React Query hook (`staleTime 30s`,
  `refetchInterval 60s`), shared with `MobileBottomTabs`. This replaces the per-mount `setInterval`.

### `Topbar` (restyle of `layouts/Header.tsx`)
- Height 64 px, `--surface-card`, bottom border.
- Search is centred, max-width 560 px, height 38 px, pill radius, `--surface-sunken`, search icon at the
  start, and a `⌘K`/`Ctrl K` kbd hint at the end (`--radius-xs`, `--border`, 11 px). `Ctrl/⌘+K` focuses it.
- End side: notification bell (icon button, with a 8 px `--live` dot when unread), then the existing
  language switcher.

### `PageHeader`
```tsx
<PageHeader title={t('tasks_title')} subtitle={t('tasks_subtitle')}
  meta={<QueueMeta/>}                // optional, e.g. "129 in queue · Avg SLA 3h 12m"
  actions={<><Button variant="outline" icon={<Filter/>}>…</Button><Button icon={<Download/>}>…</Button></>} />
```
- Title `--fs-page-title`, subtitle `--fs-small` `--text-muted`, 4 px apart.
- Actions end-aligned, gap 8 px.
- The header sits on `--surface-card` with a bottom border, full bleed to the content edges (mockups 3–5).
- Mobile: actions become icon-only buttons (keep `aria-label`), and the subtitle clamps to one line.

### `Card`
```tsx
<Card eyebrow="Revenue Analytics" title="SAR 842,308" actions={<Segmented …/>} padding="md|none" variant="default|inverse|danger">
```
- `--surface-card`, 1 px `--border`, radius `--radius-lg`, padding `--card-pad`.
- Header: eyebrow (`--fs-micro`, muted) above title (`--fs-card-title`), actions end-aligned.
- `padding="none"` for cards that contain a full-bleed table or map.
- `inverse` = black card, white text (Earnings card, mockup 3).
- `danger` = `--danger-soft` background with `--danger-border` (Emergency KPI, SOS banner).
- Replaces `GlassCard` (keep `GlassCard` as a thin wrapper around `Card` until all usages are gone).

### `Grid` helpers (CSS only)
`.ui-grid` with modifiers `--kpi` (auto-fit, min 160 px), `--2-1` (2fr 1fr), `--1-1`, `--3`
(1.4fr 1fr 0.8fr). Every modifier collapses per [03](03-responsive.md).

---

## Data display

### `KpiCard`
Mockups 1 and 4.
```tsx
<KpiCard icon={<Wrench/>} label={t('kpi_active_craftsmen')} value="6,847" delta={8.2} caption="312 online now" tone="default|danger" />
```
- **Icon box**: 32 px, `--radius-md`, 1 px `--border`, icon 16 px `--text-strong`.
- **Delta**: end-aligned, 12/600, `▲`/`▼` plus a percentage. Green if > 0, red if < 0, muted `0%` if 0.
  Omit it when the backend gives no comparison.
- Label is `--fs-caption` muted, value is `--fs-kpi`, caption is 12 muted.
- `tone="danger"`: `danger` card variant, and the value turns `--danger`.
- Loading state: `Skeleton` blocks of the same size, so the layout doesn't jump.

### `Segmented`
Tab filter with counts (mockups 2–5).
```tsx
<Segmented value={tab} onChange={setTab} items={[{value:'all',label:t('all'),count:6847},{value:'emergency',label:…,tone:'danger'}]} />
```
- Track: `--surface-sunken`, radius `--radius-sm`, padding 3 px.
- Item: height 30 px, padding 0 12 px, 13/600.
- **Active item: white background, 1 px border** (Craftsmen, Tasks). Variant `solid` makes the active
  item black (Verification step tabs, Overview 30D/90D/YTD).
- Count chip after the label: 11/600, radius 6. It is black-on-white when active, grey-on-grey otherwise.
- `tone:'danger'` makes the label red (Tasks → "Emergency").
- Keyboard: `role="tablist"`, arrow keys move between items.
- **Mobile:** scrolls horizontally with no visible scrollbar, and the active item scrolls into view.

### `DataTable`
```tsx
<DataTable columns={cols} rows={items} rowKey="id" selectedKey={id} onRowClick={select}
  rowTone={(r) => r.isEmergency ? 'alert' : undefined} loading={isLoading} empty={<EmptyState …/>}
  mobile={(row) => <TaskMobileRow row={row}/>} />
```
- Header row: `--fs-caption`, `--text-muted`, 600, height 40 px, bottom border. Columns are sticky when
  the table scrolls.
- Body row: min-height 56 px, 1 px `--border` divider, hover `--surface-hover`, selected `--surface-sunken`.
  `rowTone='alert'` gives a `--row-alert` background.
- Numeric columns are end-aligned with `tabular-nums`.
- Loading shows 8 skeleton rows. Empty shows the `empty` slot.
- Pagination footer: "1–20 of 1,238" and prev/next buttons. Pagination is server-side and keeps the
  existing `page/limit` params.
- **Mobile (< 768 px):** renders `mobile(row)` cards instead of the table. If `mobile` isn't given, the
  table sits in an `overflow-x:auto` wrapper with the first column sticky.

### `StatusPill`
```tsx
<StatusPill variant="success|danger|warning|info|neutral|inverse|outline|muted" dot?>{label}</StatusPill>
```
- Height 22 px, padding 0 8 px, radius `--radius-xs` (mockup 4 uses squared-ish pills), 12/600.
- `soft` background plus a semantic text colour. `inverse` is black with white text (Frozen).
- The variant always comes from `status.ts` ([01 §7](01-design-tokens.md)).

### `ScoreChip`
Trust score (mockup 3): 28×22 px, radius 6, 12/700.
- ≥ 90: black with white text.
- 70–89: `--surface-sunken` with strong text.
- < 70: `--danger-soft` with `--danger` text.
- The backend `trustScore` is 0–1, so show `Math.round(trustScore*100)`.

### `Avatar`
Sizes 24/32/40/64/96. It shows the image (resolved with `core/utils/mediaUrl.ts`), and falls back to
initials on `--n-200` (or to a grey square for size ≥ 64, as in mockup 3). Optional `presence` dot at the
bottom end: 10 px, 2 px white ring. `online` is `--success`, `offline` is `--n-300`, `busy` is `--warning`,
`flagged` is `--danger`. `shape="square"` gives the large detail avatar radius `--radius-md`.

### `VerifiedMark`
14 px shield-check icon next to a name when `isVerifiedId`.

### `ProgressBar`
Height 6 px (4 px in dense lists), track `--surface-sunken`, fill `--chart-1`, radius full. Optional
end-aligned `%` label. Used in Top Categories, Busy Zones and Active Jobs.

### `StatTile`
Small grey tile with a label, value and caption (Craftsman detail: Rating/Jobs/Response/Trust).
`--surface-sunken`, radius `--radius-md`, padding 12 px.

### `ListItem`
The generic row in feed/queue lists.
```tsx
<ListItem leading={<IconCircle icon={<AlertTriangle/>} tone="danger"/>} title="Service Dispute" subtitle="Saad → Mohammed" meta="12m ago" trailing={<ChevronRight/>} selected onClick />
```
- `IconCircle` is 32 px, black with a white icon by default. `tone` switches it to a soft semantic
  background.
- Title 14/600, subtitle 12 muted, meta 12 faint (end-aligned, top).

### `ChecklistChip`
Verification items (mockup 3): a bordered row with a check-circle (`--text-strong`) or an x (`--danger`)
and a label. Laid out in 2 columns.

### `KeyValueList`
Label (muted, 13) on the start side, value (600, 13) on the end side, 8 px row gap. Used in document
cards and details.

### Charts
Chart components live in `components/charts/` and are hand-rolled SVG, as today. Don't add a chart
library in this refactor.
- `AreaChart`: black fill (`--chart-1`), no gridlines except a faint baseline, and a tooltip on hover.
- `GroupedBarChart`: series colours `--chart-1/2/3`, with the legend at the top end as squares and labels.
- `Sparkline`: 1.5 px stroke, `currentColor` (white on the inverse card).
- All charts get `role="img"` and `aria-label` with a summary sentence.

---

## Actions and input

### `Button`
| Variant | Look | Use |
|---|---|---|
| `primary` (default) | `--surface-inverse` bg, `--on-inverse` text | Export, Approve all, Pause feed |
| `outline` | card bg, 1 px `--border-strong` | Filters, Last 7 days, Flag, View on map |
| `ghost` | transparent, hover sunken | "View all", icon actions in rows |
| `soft-danger` | `--danger-soft` bg, `--danger` text | Reject, Ban |
| `soft-warning` | `--warning-soft` bg, `--warning` text | Suspend |
| `danger` | `--danger` bg, white text | Dispatch backup |
| `link` | text only, 13/600, trailing `→` | "Review →", "Investigate →", "Open queue (129)" |

- Sizes: sm 32 / md 36 / lg 40 px height. Radius `--radius-sm`, 13–14/600, icon 16 px, gap 6 px.
- `loading` prop: spinner replaces the icon and the button is disabled (prevents double submit).
- `IconButton`: square, needs `aria-label`.
- Focus: `box-shadow: var(--focus-ring)`.

### `SearchInput`
Height 36 px, `--surface-sunken`, no border (a border appears on focus), radius `--radius-sm` (pill in the
top bar), leading search icon, clear button when not empty. Debounce 300 ms before touching query keys.

### `Select`, `TextField`, `TextArea`, `Switch`, `Checkbox`
Height 36 px, 1 px `--border-strong`, radius `--radius-sm`, focus ring, error text 12 `--danger`
below. `TextArea` is used for moderator notes (mockup 5): `--surface-sunken` and no border.

### `Dropdown` / `Menu`
The `···` row menu and user menu.
- Popover `--surface-card`, `--shadow-pop`, radius `--radius-md`, items 36 px.
- Closes on outside click and on `Escape`.
- Arrow-key navigation.

---

## Overlays and feedback

### `Modal`
Replaces the ~15 per-page modal implementations.
- `role="dialog"`, `aria-modal`, focus trap, `Escape` closes, click on the backdrop closes (unless `busy`).
- Width sm 420 / md 560 / lg 760.
- On mobile it becomes a **bottom sheet** (full width, radius-top 16, max-height 90vh, scrolls inside).

### `ConfirmDialog`
Replaces **all 13** `window.alert/confirm` calls.
```tsx
const confirm = useConfirm();
if (await confirm({ title: t('ban_title'), body: t('ban_body'), tone: 'danger', confirmLabel: t('ban'), requireReason: true })) { … }
```

### `Drawer`
Side panel for details on tablet and mobile (the Craftsmen/Verification detail panel moves here).
It uses logical side `inline-end`, width 440 px (or 100 % on mobile), and has the same a11y rules as
`Modal`.

### `Toast`
`useToast()`, bottom-end on desktop and top on mobile, auto-dismiss after 4 s. Variants: success, error,
info. Use it after every mutation instead of alerts.

### `AlertBanner`
Emergency banner (mockup 4):
- `--danger-soft` background with a `--danger-border` border.
- Icon box, then a title in `--danger` 600 with an `SOS` inverse-danger pill, then the body.
- Actions end-aligned (outline + danger). It stacks on mobile.

### `Skeleton`
A block with `--surface-sunken` and a shimmer (disabled under reduced motion). Provide `Skeleton.Text`,
`Skeleton.Circle` and `Skeleton.Card`. **Every list/table/KPI shows a skeleton on first load.** A refetch
never blanks the content; instead show a small spinner in the card header.

### `EmptyState`
Icon in a 48 px sunken circle, a 15/600 title, a 13 muted body and an optional action. Always
distinguish "no data yet" from "filters hide everything". The second case offers a "Clear filters" action.

### `ErrorState`
Inline card with the message from `core/errors` and a "Retry" button that calls `refetch()`. Never show
raw error JSON.

### `LiveIndicator`
Mockup 2: a pill with a pulsing red dot, "Live", and a monospace clock `19:18:14`. When paused it shows a
grey dot and "Paused".

---

## Definition of done for a component
- [ ] Renders correctly in light and dark (toggle `data-theme` in devtools).
- [ ] Renders correctly in `dir="rtl"` (Arabic) with no mirrored-icon mistakes. Chevrons and arrows flip
      via CSS `[dir=rtl] .ui-icon--directional { transform: scaleX(-1) }`.
- [ ] Keyboard: reachable by Tab, visible focus, Enter/Space activate, Escape closes overlays.
- [ ] No raw colours, and no inline styles except dynamic values.
- [ ] Added to `components/ui/index.ts`.
