# 10 · Execution plan (tickets for a low-cost model)

## How to run a ticket
- **Model:** tickets marked **[low]** are for Claude Haiku 4.5 (`claude-haiku-4-5-20251001`). **[mid]**
  means Sonnet (`claude-sonnet-5`). **[strong model]** means Opus. Use a low-cost model only on a
  ticket whose dependencies are merged.
- **One ticket = one branch = one PR.** Never combine tickets, and never touch files outside the ticket's
  list.
- **Gate for every ticket:**
  ```bash
  cd Arox-front-end
  npm run build            # tsc + vite, must pass
  npm run lint             # no new errors
  node scripts/ui-audit.mjs <changed page dir>   # from T00; hex=0 and inline<=dynamic-only for migrated files
  ```
  Then a manual check at 390 / 1024 / 1440 px in `en` and `ar`, light and dark ([03](03-responsive.md)).

### Prompt template (paste into the low-cost model)
```
You are refactoring the Arox admin dashboard UI. Follow the docs exactly; do not improvise design.
Read: docs/dashboard/ui-refactor/README.md (rules), 01-design-tokens.md, 02-components.md, 03-responsive.md,
and the page doc: <PAGE DOC>.
Ticket: <TICKET ID + TEXT FROM 10-execution-plan.md>
Constraints:
- Only edit the files listed in the ticket.
- Do NOT change hooks, repositories, query keys, API calls or business logic.
- No hex/rgba colours in .tsx; use tokens or ui- classes. No new inline styles except dynamic values.
- Every new string via t() with keys added for en, ar, he in LanguageContext.tsx.
- Use logical CSS properties (inline-start/end). Never show invented data: '—' or hide.
When finished: run `npm run build` and `npm run lint`, fix all errors, and list what you changed
and any acceptance item you could not meet.
```

---

## Phase 0 · Groundwork
| ID | Model | Title | Files | Steps | Done when |
|---|---|---|---|---|---|
| T00 | low | Baseline + audit script | `scripts/ui-audit.mjs` (new), `package.json` | `npm ci`. Record `npm run build`/`lint` output in the PR. Create `ui-audit.mjs`: for each `.tsx/.css` under a given dir, print counts of `style={{`, hex, `rgba(`, `!important`, `<style`, `window.confirm/alert`. Exit code 1 if `--strict` and hex > 0 | Script runs; baseline numbers pasted in the PR |
| T01 | low | Delete dead files | `src/index.css`, `src/App.css`, `features/live_activity/components/LiveActivityTailwind.tsx`, unused `assets/*` | Grep each filename for imports; delete only unimported ones | Build passes |
| T02 | low | Shared formatters | `src/core/utils/format.ts` (new) | `formatMoney(v)` (Intl, `ILS`, current language locale, no decimals ≥1000), `formatNumber`, `formatPercent(delta)` (sign + 1 decimal), `formatRelativeTime(date)` (Intl.RelativeTimeFormat, en/ar/he) | Unit-free; used by later tickets |

## Phase 1 · Design system
| ID | Model | Title | Files | Done when |
|---|---|---|---|---|
| T10 | low | Tokens | `styles/tokens.css` (new) with sections 1–6 and 8 of [01](01-design-tokens.md); `global.css` imports it first; delete `variables.css` after moving its font imports | Every page renders with the new palette. Dark OS no longer shows white-on-white on pages already using `var(--…)` |
| T11 | low | Remove decoration | `global.css`: delete the `body::before/::after` glows, the purple hover in `.glass-card`, and `backdrop-filter` on cards | Flat cards; no purple anywhere |
| T12 | mid | Theme switch | `context/ThemeContext.tsx` (new), `App.tsx` provider | `theme: 'system'|'light'|'dark'` in `localStorage('arox.theme')` sets `data-theme` on `<html>` |
| T13 | low | `status.ts` | `components/ui/status.ts` | Map from [01 §7](01-design-tokens.md) with typed `pillVariantFor(domain, status)` |
| T14 | low | Primitives A | `components/ui/{Button,IconButton,StatusPill,ScoreChip,Avatar,VerifiedMark,ProgressBar,Skeleton,EmptyState,ErrorState}.tsx` + `ui.css` + `index.ts` | Per [02](02-components.md). A temporary `#ui-gallery` page (hash route, dev only) shows all variants |
| T15 | low | Primitives B | `Card,KpiCard,StatTile,ListItem,IconCircle,ChecklistChip,KeyValueList,Segmented,SearchInput,TextField,TextArea,Select,Switch,Checkbox` | Added to the gallery; keyboard works on `Segmented` |
| T16 | mid | Overlays | `Modal,Drawer,ConfirmDialog(useConfirm),Toast(useToast),Dropdown,ImageLightbox` | Focus trap, Escape, bottom-sheet on mobile, portal to `document.body` |
| T17 | mid | DataTable | `DataTable.tsx` (+ `useBreakpoint.ts`) | Columns, selection, row tone, skeleton, empty, pagination, mobile renderer, sticky header |
| T18 | low | Charts | `components/charts/{AreaChart,GroupedBarChart,LineChart,Sparkline}.tsx` | Extract the SVG logic from `RevenueChart`, `CohortVelocity` and `AdAnalyticsPage`; monochrome tokens |

## Phase 2 · Shell
| ID | Model | Title | Files | Done when |
|---|---|---|---|---|
| T20 | mid | `AppShell` | `layouts/AppShell.tsx` (new), `DashboardPage.tsx` router wraps pages in `AppShell` | The shell renders once; sidebar state survives navigation; remove the `_sidebarScrollTop` hack |
| T21 | low | Sidebar restyle + counts hook | `layouts/Sidebar.tsx`, `hooks/useSidebarCounts.ts` (new) | Matches mockups (black, white active pill, badges, LIVE chip, user footer). Counts come from React Query 60 s. Tablet rail with tooltips |
| T22 | low | Topbar restyle | `layouts/Header.tsx` | Centred search pill with `Ctrl/⌘K`, bell dot; unchanged search behaviour |
| T23 | low | Mobile chrome | `layouts/MobileBottomTabs.tsx`, `layouts/MobileTopBar.tsx` (new) | Real badge counts (no `'99'`/`'7'`); search and bell buttons work; "More" opens the drawer; safe-area padding |
| T24 | low | `PageHeader` | `components/ui/PageHeader.tsx` | Per [02](02-components.md) incl. mobile icon-only actions |
| T25 | low × 18 | Strip local shells | one PR **per page file**: remove `<Sidebar/>`, `<Header/>`, `.mobile-header`, `.mobile-subheader`, `sidebarOpen` state; add `PageHeader` with the page's existing title/subtitle keys | Each page renders inside `AppShell` with no duplicate chrome |

## Phase 3 · Mockup pages
Do these in order: Overview is the smallest and proves the kit.
| ID | Model | Page doc | Split into tickets |
|---|---|---|---|
| T30 | low | [04 Overview](04-page-overview.md) | T30a KPI row (`MetricsGrid` → `KpiCard`) · T30b Revenue + Top categories · T30c Cohort + Pending reports · T30d Verification rail + delete page `<style>` |
| T31 | mid | [05 Live Activity](05-page-live-activity.md) | T31a layout grid + remove fixed heights · T31b map restyle (greyscale tiles, marker shapes) **[mid]** · T31c feed + jobs · T31d suspicious + zones + system status from `/health` · T31e pause/resume buffering **[mid]** |
| T32 | low | [06 Craftsmen](06-page-craftsmen.md) | T32a split file (no visual change) **[mid]** · T32b list card + DataTable + mobile rows · T32c detail panel · T32d drawer on tablet/mobile · T32e actions + ConfirmDialog |
| T33 | low | [07 Tasks](07-page-tasks.md) | T33a split file **[mid]** · T33b KPI row · T33c table + columns + row tone · T33d mobile rows · T33e emergency banner + actions |
| T34 | strong model → low | [08 Verification](08-page-verification.md) | T34a split the 2,972-line file into the component tree **[strong model]** · T34b queue · T34c header + actions · T34d step tabs + document cards · T34e notes + keyboard shortcuts · T34f mobile flow |

## Phase 4 · Remaining pages ([09](09-other-pages.md))
One ticket per page, following the 5-step recipe. Split tickets (**[mid]**) go first for files over
1,500 lines.
| ID | Page | Model |
|---|---|---|
| T40 | Reports | split [mid] → restyle [low] |
| T41 | Payments + BitSubscriptionManager | split [mid] → restyle [low] → polling to React Query [mid] |
| T42 | Analytics | low |
| T43 | Broadcast | split [mid] → restyle [low] |
| T44 | Notifications | low |
| T45 | Chat | **strong model** (split + restyle, realtime) |
| T46 | Settings (+ Appearance/theme section) | split [mid] → restyle [low] |
| T47 | Service management | split [mid] → restyle [low] |
| T48 | Ads dashboard | low |
| T49 | Active/Scheduled/Expired | low |
| T50 | Create ad | low (don't touch `AndroidPhoneBannerPreview` colours) |
| T51 | Promotions | split [mid] → restyle [low] |
| T52 | Ad analytics | low |
| T53 | Login | low |

## Phase 5 · Hardening
| ID | Model | Title | Done when |
|---|---|---|---|
| T60 | low | Replace all `window.alert/confirm` | `grep -rn "window.confirm\|window.alert\|alert(" src` returns nothing |
| T61 | mid | Polling budget | No `setInterval` for data (only clocks). All data polling via React Query ≥ 30 s, off in background tabs |
| T62 | low | i18n sweep | No English literals in JSX; `ar`/`he` keys complete |
| T63 | low | Remove aliases + `GlassCard` | Delete the alias block ([01 §8](01-design-tokens.md)) and `GlassCard.tsx`; build passes |
| T64 | low | Strict audit | `node scripts/ui-audit.mjs src/presentation --strict` passes (hex 0 outside the allowed exceptions); `!important` < 20 |
| T65 | mid | A11y pass | axe DevTools: 0 serious issues on Overview, Craftsmen, Tasks, Verification |
| T66 | low | Remove `#ui-gallery` from production builds | Gallery route only when `import.meta.env.DEV` |

## Rough size
The ticket count sets the pace. About 60 PRs: ~40 **[low]**, ~15 **[mid]**, ~3 **[strong model]**.
Phases 0–2 unblock everything and should land first. After that, Phases 3 and 4 can run in parallel with
one page per branch, because pages no longer share CSS once their `<style>` blocks are gone.

## Global definition of done
- [ ] Every page renders inside `AppShell` with no local chrome.
- [ ] No page `<style>` blocks; no hex in `.tsx` (except the listed exceptions).
- [ ] Light + dark + RTL correct at 360–1920 px with no page-level horizontal scroll.
- [ ] Skeletons on first load, `ErrorState` with Retry, and `EmptyState` everywhere.
- [ ] Zero `window.alert/confirm`; all dialogs are accessible (Escape, focus trap).
- [ ] No invented data. Every figure traces to an API field.
