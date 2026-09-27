# 03 · Responsive rules (mobile · tablet · desktop)

## Breakpoints
Use these three variables in every media query. Do not invent other widths.

| Name | Range | Shell |
|---|---|---|
| **mobile** | `< 768px` | No sidebar. Compact top bar (brand, search icon, bell). Bottom tabs. Sidebar opens as an off-canvas drawer from the "More" tab or the brand button |
| **tablet** | `768px – 1279px` | Icon **rail** sidebar (72 px, labels hidden, tooltips on hover, badges as dots). Full top bar |
| **desktop** | `≥ 1280px` | Full 240 px sidebar and full top bar. Content max width `--content-max` (1440), centred on ultra-wide |

```css
/* in ui.css — copy these exact queries */
@media (max-width: 767.98px)  { /* mobile */ }
@media (min-width: 768px) and (max-width: 1279.98px) { /* tablet */ }
@media (min-width: 1280px)    { /* desktop */ }
```
> Change from today: tablet was 769–1024 and desktop started at 1025. The mockups' two-column layouts
> (table + 380 px detail panel) need ≥ 1280 px. Between 1025 and 1279 they are cramped, which is exactly
> where Live Activity overflows now.

JS needs the breakpoint in only two places: `DataTable` mobile cards and the detail panel → drawer switch.
Use a single hook, `useBreakpoint()` (`matchMedia`, SSR-safe, one listener shared via context). Never
use `window.innerWidth` inside render.

## Spacing per breakpoint
| Token | Desktop | Tablet | Mobile |
|---|---|---|---|
| `--page-pad` | 32px | 20px | 16px |
| `--card-pad` | 20px | 20px | 16px |
| `--gap-grid` | 20px | 16px | 12px |
| `--fs-page-title` | 28px | 24px | 20px |
| `--fs-kpi` | 26px | 24px | 22px |

## Pattern rules
| Pattern | Desktop ≥1280 | Tablet 768–1279 | Mobile <768 |
|---|---|---|---|
| KPI row (5–6 cards) | One row (`repeat(6,1fr)` / 5) | 3 columns | **2 columns**. With an odd count, the last card spans 2 |
| Two-column "main + side" (Overview rows, Live map + feed) | `2fr 1fr` | stacked, side card full width | stacked |
| Three-column bottom row (Live jobs / suspicious / zones) | `1.4fr 1fr 0.8fr` | 2 columns, the third wraps full width | stacked |
| **List + detail panel** (Craftsmen, Verification, Reports, Chat) | Side-by-side: list `1fr`, detail `400px` sticky (`top: calc(var(--topbar-h) + 16px)`) | List only; the detail opens in a `Drawer` (inline-end, 440 px) | List only; the detail opens as a **full-screen page** with a back button (uses the `Drawer` full-width variant) |
| Data table | Full table | Full table; hide low-priority columns (see each page doc) | **Card list** via `DataTable.mobile`. Each card shows title, status pill, 2 key facts and a `···` menu |
| Segmented tabs | Inline | Inline | Horizontal scroll, no wrap |
| Page header actions | Text + icon buttons | Text + icon | Icon-only buttons; the overflow goes into a `···` menu |
| Filters | Inline toolbar | Inline, wraps | "Filters" button opens a **bottom sheet** with all filters and an "Apply" button |
| Modal | Centred dialog | Centred dialog | **Bottom sheet** |
| Charts | Full | Full, fewer x-labels (every 2nd) | Height 180 px, every 3rd label, tooltips on tap |
| Map (Live Activity) | Height 560 px | Height 440 px | Height 320 px. The layer tabs scroll, and the feed goes below |
| Horizontal card rail (Overview "Recent verification submissions") | 5 cards in a row | Scroll-snap row | Scroll-snap row, card width 72vw |

## Mobile shell details
- Top bar: 56 px plus `env(safe-area-inset-top)`.
  - Start: brand mark (tap opens the sidebar drawer).
  - Centre: page title, 16/600.
  - End: search icon (opens a full-screen search sheet bound to `searchQuery`) and the bell.
  - **Both buttons must work.** Today they have no handler.
- Bottom tabs: Overview · Live · Verify · Tasks · More.
  - "More" opens the drawer with the full navigation.
  - Badges come from `useSidebarCounts()`. **Remove the hardcoded `'99'`/`'7'`.**
  - Height 60 px plus `env(safe-area-inset-bottom)`.
- Content gets `padding-bottom: calc(60px + env(safe-area-inset-bottom) + 16px)` so the last row isn't
  hidden.
- Touch targets ≥ 44 px (row menus, pills with actions, close buttons).

## Tablet rail details
- Keep the current collapse logic (`.sidebar-brand-text` etc. hidden) but move it to the new classes.
- Each item gets a tooltip (`title` attribute plus a CSS tooltip) showing its label.
- Numeric badges become an 8 px dot at the icon's top end.

## Things that must never happen (check on each page)
- Horizontal page scroll at any width from 360 to 1920 px. Only tables, maps and charts may scroll
  inside their own container.
- Fixed pixel heights on cards (`height: 582px`). Use `min-height`, or let the content define height.
- `min-width` bigger than the viewport (e.g. `min-width: 500px` on the map card).
- Text overlapping in Arabic. Cairo is wider than Inter, so check every pill and button in `ar`.

## QA widths
Test each page at **360, 390, 768, 1024, 1280, 1440, 1920** in LTR (`en`) and RTL (`ar`), light and dark:
7 widths × 2 directions × 2 themes. Chrome devtools device toolbar is enough. Screenshot 390/1024/1440
for the PR.
