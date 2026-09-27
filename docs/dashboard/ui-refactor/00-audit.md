# 00 · Audit of the current dashboard UI

Measured on `Arox-front-end/src/presentation` on 2026-09-26 (41.7k lines of TS/TSX/CSS).

## Stack and styling today
- React 19 + Vite + TypeScript, TanStack Query (5 `useQuery` calls; most data still in hand-rolled hooks),
  axios, socket.io-client, `lucide-react` icons. **No CSS framework.**
- Styles come from four sources at once:

| Source | Amount | Problem |
|---|---|---|
| Inline `style={{…}}` | **1,951** | Can't be themed, can't use media queries, duplicated everywhere |
| Per-page `<style>{`…`}</style>` blocks | **30** (one or two in almost every page) | Global selectors leak between pages; each page redefines headers, pills, tables |
| `styles/global.css` + `styles/variables.css` | 930 lines | Reasonable base, but 206 `!important` |
| `!important` overall | **912** | Specificity war; new styles can't win without more `!important` |

- **119 distinct hex colours** (1,504 hex literals + 424 `rgba()`). There are four grey families mixed
  together: neutral `#171717/#737373/#A3A3A3/#E5E5E5`, zinc `#71717A/#F4F4F5/#E4E4E7`, gray
  `#111827/#6B7280/#E5E7EB` and slate `#0F172A/#1E293B/#64748B/#94A3B8`. Greens: `#22C55E/#10B981/#16A34A/#15803D/#4ADE80`.
  Reds: `#EF4444/#DC2626/#F87171/#B91C1C`.
- `src/index.css` and `src/App.css` are **unused Vite template files** (never imported). Delete them.
- `features/live_activity/components/LiveActivityTailwind.tsx` (1,234 lines) is a **dead Figma export**.
  It uses Tailwind classes (Tailwind isn't installed), loads images from `http://localhost:3845`, and nothing
  imports it. Delete it.

## Theme
- Tokens exist (`--bg-base`, `--bg-surface`, `--text-primary`, …) and switch on
  `@media (prefers-color-scheme: dark)` only. There is no in-app toggle.
- Dark mode is broken in practice: 152× `#FFFFFF` and 150× `#171717` are hardcoded in pages, so on a
  dark OS you get white cards with near-white text, and black text on dark surfaces.
- `body::before/::after` paint purple/orange radial "glow" blobs. These are not in the design; remove them.
- `.glass-card` uses `backdrop-filter` blur plus a purple hover glow. The mockups use flat white cards with
  a 1px border.

## Layout shell
- `DashboardPage.tsx` switches pages from `currentPage` (hash routing, `NavigationContext`). This works; keep it.
- **Each of 18 pages renders its own `<Sidebar/>`, `<Header/>`, mobile header and mobile sub-header.**
  That causes three problems:
  - The sidebar unmounts and remounts on every navigation.
  - Its badge fetch (4 endpoints, `setInterval` 15 s) restarts each time.
  - A module-level variable exists only to restore the sidebar scroll position.
- Mobile header markup is copy-pasted in 16 pages, and its search/bell buttons have **no `onClick`**.
- `MobileBottomTabs.tsx` shows **hardcoded fake badges `'99'` and `'7'`**.
- Hardcoded English strings in shells, e.g. Overview's mobile sub-header `"Last 7 days · Updated 2m ago"`,
  and Craftsmen's `"Moderate & manage platform service providers"`.
- Breakpoints: mobile ≤768 (sidebar becomes an off-canvas drawer, and the top header is hidden), tablet
  769–1024 (64 px icon rail), desktop ≥1025. Live Activity uses **fixed pixel heights** (`582px`, `519px`)
  and `min-width: 500px`, which overflows at 1025–1280 px.

## Behaviour and accessibility
| Check | Result |
|---|---|
| Skeleton loaders | **0**; pages show spinners or nothing while loading |
| Modals | Re-implemented per page (Service Management mentions "modal" 85×, Chat 40×) |
| `Escape` closes dialogs | **0** handlers |
| `role="dialog"` / focus trap | **0** |
| `aria-*` attributes | **3** in the whole app |
| `window.alert/confirm` | **13** calls (block the UI, can't be translated/styled) |
| Wide tables on mobile | 15 files use `overflow-x`; the others overflow the viewport |
| Polling | 9 `setInterval` loops (3–15 s) plus the sidebar. Against the 300 req/min/IP limit this is risky; see [`../00-foundations.md`](../00-foundations.md) polling budget |

## Page inventory (size → refactor risk)
| Page | Lines | Pattern it maps to |
|---|---|---|
| VerificationPage | 2,972 | Queue list + detail (mockup 5) |
| ChatPage | 2,189 | Split list + conversation |
| AdsPage | 1,871 | KPI + table + modals |
| PromotionsPage | 1,771 | KPI + table + modals |
| ServiceManagementPage | 1,732 | Tree/list + table + modals |
| ReportsPage | 1,727 | Queue list + detail |
| CreateAdPage | 1,725 | Form + live preview |
| CraftsmenPage | 1,700 | Table + detail panel (mockup 3) |
| BroadcastPage | 1,691 | Form + history table |
| TasksPage | 1,650 | KPI + table + banner (mockup 4) |
| SettingsPage | 1,607 | Settings sections + drawers |
| PaymentsPage (+BitSubscriptionManager 1,215) | 1,580 | KPI + chart + tables |
| ActiveCampaignsPage (Active/Scheduled/Expired) | 1,510 | Table + tabs |
| AdAnalyticsPage | 1,498 | KPI + charts |
| AnalyticsPage | 1,209 | KPI + charts |
| NotificationsPage | 901 | Feed list + tabs |
| DashboardPage (Overview + router) | 639 | Mockup 1 |
| LoginPage | 362 | Standalone |
| LiveActivityPage (+ components) | 338 | Mockup 2 |

## What is already good (keep)
- Clean layers (`domain → data → presentation`), repositories behind `DependencyProvider`.
- Logical properties are already used in the shell (`inset-inline-start`, `margin-inline-start`).
- The `LanguageContext` sets `dir` and `lang` on `<html>`, and fonts switch per language (Cairo for Arabic).
- The token names in `variables.css` are a good base to extend (see [01](01-design-tokens.md)).
