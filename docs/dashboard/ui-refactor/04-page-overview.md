# 04 · Page · Overview (mockup 1)

Files: `features/dashboard/pages/DashboardPage.tsx` (the `OverviewPage` part) and
`features/dashboard/components/{MetricsGrid,RevenueChart,TopCategories,CohortVelocity,PendingReports,ModeratorReview}.tsx`.
Data: `useDashboard()` → `['dashboardData']` (`GET /admin/overview-stats` and related). **No data changes.**

## Layout (desktop ≥1280)
```
PageHeader  "Overview" / subtitle                          [Last 7 days ▾] [⤓ Export]
KPI row ×6  Total Users | Active Craftsmen | Active Tasks | Revenue (MTD) | Emergency Reqs | Verification Reqs
Row 2       Revenue Analytics (2fr)                        | Top Categories (1fr)
Row 3       Marketplace Growth / Weekly cohort velocity (2fr) | Pending Reports (1fr)
Row 4       Recent Verification Submissions — horizontal rail of 5 cards, "Open queue (N)" link
```
Tablet: KPI 3 columns. Rows 2–3 are stacked, with the side cards (Top Categories, Pending Reports) side
by side in a 2-column row under the main cards. Mobile: KPI 2 columns, and everything stacks. Row 4 becomes
a scroll-snap rail.

## Section specs
| Section | Component | Content → data |
|---|---|---|
| Header | `PageHeader` | Title `t('overview_title')`. Subtitle `t('overview_subtitle')` ("Marketplace performance"). Drop the region name unless the backend returns one |
| Range | `Button outline` + `Dropdown` | "Last 7 days / 30 days / 90 days". **Only if the backend accepts a range.** If not, hide it (don't ship a dead control) |
| Export | `Button primary` | Existing `handleExport` CSV logic, unchanged |
| KPI ×6 | `KpiCard` | The metric ids `users`, `craftsmen`, `tasks`, `revenue`, `emergency`, `verification` from `metrics[]`. Icons: Users, Wrench, Briefcase, Wallet (or ₪), Siren, ShieldCheck. `delta` only if the metric has a trend value. `emergency` uses `tone="danger"` when value > 0 |
| Revenue Analytics | `Card` eyebrow "Revenue Analytics", title = formatted revenue, green delta; `Segmented solid` 30D/90D/YTD (only the ranges the API supports); `AreaChart` black; footer 4 mini stats (GMV · Take rate · Avg order · Disputes) in a 4-col grid → 2×2 on mobile | `revenueMetric` + existing chart series in `RevenueChart` |
| Top Categories | `Card` eyebrow "Top Categories", title "By volume", `···` menu; rows: name (14/600) · `ProgressBar` · "2,841 tasks · +14%" (12 muted, delta coloured) | `categories[]` (`nameKey`, `tasksCount`, `percentage`) |
| Weekly cohort velocity | `Card` eyebrow "Marketplace Growth"; `GroupedBarChart` series Users/Craftsmen/Tasks in `--chart-1/2/3`; legend top end | `cohortData` |
| Pending Reports | `Card` eyebrow "Pending Reports", title "N require review", `Button link` "View all" → `navigate('reports')`; `ListItem` with a black `IconCircle` (type icon), title, "A → B" subtitle, relative time | `reports[]` |
| Recent verification submissions | `Card` title "Awaiting moderator review", `Button link` "Open queue (N)" → `navigate('verification')`; mini cards: `Avatar 40`, name, trade, time, "Review →" | `submissions[]` |

## Remove
- The per-page `Sidebar/Header/mobile-header/mobile-subheader` (moved into `AppShell`).
- The hardcoded `"Last 7 days · Updated 2m ago"`. Show "Updated {relative time}" from React Query's
  `dataUpdatedAt`.
- The page `<style>` block (≈200 lines, including `.mobile-status-grid`). Its rules become `ui-` classes
  or are deleted.

## States
- First load: 6 KPI skeletons, a chart skeleton at 240 px, 5 list skeleton rows.
- Error: `ErrorState` in place of the grid, with Retry calling `refresh()`.
- Empty lists: "No pending reports 🎉"-style `EmptyState` (no emoji in the Arabic copy; keep it neutral).

## Acceptance
- [ ] Matches mockup 1 at 1440 px (spacing ±4 px, same hierarchy).
- [ ] No horizontal scroll at 360 px. KPI shows 2 columns on mobile.
- [ ] Every number comes from `useDashboard()`; there are no literals like "48,392".
- [ ] RTL: deltas and "→" links flip correctly; numbers stay LTR (`dir="ltr"` on number spans).
