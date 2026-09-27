# 01 · Design tokens

All values below go into **one new file**, `src/presentation/styles/tokens.css`, imported first by
`global.css`. It replaces `variables.css`. Keep the old variable names as aliases (section 8) until every
page is migrated, then delete the aliases.

The look is **monochrome**: black, white and neutral greys carry the UI. Colour appears only in small doses
(deltas, status pills, alert tint, live dot) and always means something.

## 1. Colour — light (default)
```css
:root {
  /* Neutral scale (Tailwind "neutral"; the ONLY grey family allowed) */
  --n-0:   #FFFFFF;
  --n-25:  #FCFCFC;
  --n-50:  #FAFAFA;
  --n-100: #F5F5F5;
  --n-150: #EFEFEF;
  --n-200: #E5E5E5;
  --n-300: #D4D4D4;
  --n-400: #A3A3A3;
  --n-500: #737373;
  --n-600: #525252;
  --n-700: #404040;
  --n-800: #262626;
  --n-900: #171717;
  --n-950: #0A0A0A;
  --n-1000:#000000;

  /* Surfaces */
  --surface-page:     var(--n-50);   /* app background behind cards */
  --surface-card:     var(--n-0);    /* cards, tables, header bar */
  --surface-sunken:   var(--n-100);  /* search inputs, stat tiles, segmented-control track, selected row */
  --surface-hover:    var(--n-100);
  --surface-inverse:  var(--n-950);  /* black cards (earnings), primary buttons, active segment */
  --on-inverse:       var(--n-0);

  /* Text */
  --text-strong:  var(--n-900);  /* titles, numbers, table primary text */
  --text-body:    var(--n-700);
  --text-muted:   var(--n-500);  /* labels, captions, secondary lines */
  --text-faint:   var(--n-400);  /* placeholders, timestamps */

  /* Lines */
  --border:        var(--n-200); /* card border, table row divider */
  --border-strong: var(--n-300); /* outline buttons, inputs */
  --focus-ring:    0 0 0 3px rgba(23, 23, 23, 0.18);

  /* Sidebar (stays dark in BOTH themes) */
  --sidebar-bg:          var(--n-1000);
  --sidebar-border:      #1F1F1F;
  --sidebar-text:        var(--n-400);
  --sidebar-text-hover:  var(--n-0);
  --sidebar-item-hover:  rgba(255, 255, 255, 0.08);
  --sidebar-active-bg:   var(--n-0);
  --sidebar-active-text: var(--n-1000);
  --sidebar-section:     var(--n-500);  /* "OPERATIONS", "MANAGE", "INSIGHTS" */
  --sidebar-badge-bg:    #262626;
  --sidebar-badge-text:  var(--n-300);

  /* Semantic (text / soft background / border) */
  --success:        #16A34A;  --success-soft: #F0FDF4;  --success-border: #BBF7D0;
  --danger:         #DC2626;  --danger-soft:  #FEF2F2;  --danger-border:  #FECACA;
  --warning:        #D97706;  --warning-soft: #FFFBEB;  --warning-border: #FDE68A;
  --info:           #2563EB;  --info-soft:    #EFF6FF;  --info-border:    #BFDBFE;
  --live:           #EF4444;  /* live dot / notification dot only */
  --row-alert:      #FFFBEB;  /* tinted table row for emergency/disputed (mockup 4) */

  /* Charts: monochrome series first, colour only for highlight */
  --chart-1: var(--n-950);
  --chart-2: var(--n-500);
  --chart-3: var(--n-300);
  --chart-grid: var(--n-150);
  --chart-up: var(--success);
  --chart-down: var(--danger);
}
```

## 2. Colour — dark
Theme is chosen by `data-theme` on `<html>` (`light` | `dark`). When it is absent, the OS preference
applies. Add a toggle in Settings → Appearance and persist it in `localStorage('arox.theme')`.
```css
:root[data-theme="dark"] { color-scheme: dark; /* same block as the media query below */ }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --surface-page:    #0B0B0B;
    --surface-card:    #141414;
    --surface-sunken:  #1C1C1C;
    --surface-hover:   #202020;
    --surface-inverse: var(--n-0);
    --on-inverse:      var(--n-950);
    --text-strong: #FAFAFA;  --text-body: #D4D4D4;  --text-muted: #A3A3A3;  --text-faint: #737373;
    --border: #262626;  --border-strong: #333333;
    --focus-ring: 0 0 0 3px rgba(255, 255, 255, 0.22);
    --success-soft: rgba(22,163,74,.14);  --danger-soft: rgba(220,38,38,.14);
    --warning-soft: rgba(217,119,6,.14);  --info-soft:   rgba(37,99,235,.14);
    --success-border: rgba(22,163,74,.35); --danger-border: rgba(220,38,38,.35);
    --warning-border: rgba(217,119,6,.35); --info-border:   rgba(37,99,235,.35);
    --success: #4ADE80; --danger: #F87171; --warning: #FBBF24; --info: #60A5FA;
    --row-alert: rgba(217,119,6,.08);
    --chart-1: #FAFAFA; --chart-2: #A3A3A3; --chart-3: #525252; --chart-grid: #262626;
    --sidebar-bg: #000000; --sidebar-active-bg: #FAFAFA;
  }
}
```
Copy the same declarations into `:root[data-theme="dark"]`. There are two blocks so the toggle wins in
both directions.

## 3. Typography
Font stack stays: `Inter` for English and Hebrew, `Cairo` for Arabic (via `--font-current`). Numbers use
`font-variant-numeric: tabular-nums` so they don't jitter.

| Token | Size / line / weight | Use (from the mockups) |
|---|---|---|
| `--fs-display` | 32/38 · 700 · -0.02em | Revenue headline "842,308", Craftsman detail name |
| `--fs-page-title` | 28/36 · 700 · -0.02em | "Overview", "Craftsmen", "Tasks" |
| `--fs-kpi` | 26/32 · 700 · -0.01em | KPI card values |
| `--fs-card-title` | 16/22 · 600 | "Top Categories", "Weekly cohort velocity" |
| `--fs-body` | 14/20 · 400 | Table cells, list titles (600 for primary line) |
| `--fs-small` | 13/18 · 400 | Page subtitle, secondary lines |
| `--fs-caption` | 12/16 · 500 | KPI labels, table header, timestamps |
| `--fs-micro` | 11/14 · 600 · 0.04em uppercase | Card eyebrow ("REVENUE ANALYTICS"), sidebar section titles |

The card **eyebrow + title** pair is a signature of the mockups: a muted micro label above a 16/600 title
(e.g. "Marketplace Growth" / "Weekly cohort velocity").

## 4. Spacing, sizing, radii
```css
:root {
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;

  --radius-xs: 6px;    /* chips inside tables (trust score), kbd */
  --radius-sm: 8px;    /* buttons, inputs, segmented items */
  --radius-md: 12px;   /* stat tiles, list items inside cards, icon boxes */
  --radius-lg: 16px;   /* cards */
  --radius-full: 9999px; /* pills, avatars, search bar */

  --control-h-sm: 32px;  --control-h: 36px;  --control-h-lg: 40px;
  --touch-min: 44px;     /* any tappable target on touch screens */

  --sidebar-w: 240px;  --sidebar-rail-w: 72px;  --topbar-h: 64px;
  --content-max: 1440px;  /* page content max width on very wide screens */
  --page-pad: 32px;        /* 20px tablet, 16px mobile (see 03) */
  --card-pad: 20px;        /* 16px on mobile */
  --gap-grid: 20px;        /* 16px tablet, 12px mobile */
}
```

## 5. Elevation
Flat by default: cards use a **1px `--border` and no shadow**. Shadow is only for floating layers.
```css
:root {
  --shadow-card:    none;
  --shadow-pop:     0 8px 24px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04); /* dropdowns, popovers */
  --shadow-modal:   0 24px 64px rgba(0,0,0,.18);
  --backdrop:       rgba(10,10,10,.45);
}
```

## 6. Motion
```css
:root {
  --ease: cubic-bezier(.2,.8,.2,1);
  --dur-fast: 120ms;   /* hover, press */
  --dur-base: 200ms;   /* drawer, dropdown, tab indicator */
  --dur-slow: 320ms;   /* modal enter */
}
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 1ms !important; transition-duration: 1ms !important; } }
```
Only one decorative animation is allowed: the pulsing **live dot** (`livePulse`, already in `global.css`).

## 7. Status → colour map (single source)
Put it in `src/presentation/components/ui/status.ts` and use it everywhere. Never pick colours inline.

| Domain status | Pill variant | Label key |
|---|---|---|
| Task `IN_PROGRESS`, `CHAT_OPEN`, `AGREEMENT_PENDING`, `PRE_CHAT_PENDING` | `neutral` | `status_in_progress` … |
| Task `PENDING` | `outline` | `status_open` |
| Task `WORK_SUBMITTED`, `RATING_PENDING` | `info` | `status_review` |
| Task `CLOSED` | `success` | `status_completed` |
| Task `DISPUTED` | `warning` | `status_disputed` |
| Task `FROZEN` | `inverse` (black) | `status_frozen` |
| Task `CANCELLED`, `REJECTED` | `muted` | `status_cancelled` |
| Emergency / SOS | `danger` | `status_emergency` |
| Craftsman online (`isAvailable`) / offline / suspended / low trust | text `success` / text `muted` / `warning` / `danger` | |
| Verification `UNDER_REVIEW` / `APPROVED` / `REJECTED` / `FLAGGED` / `PENDING_SUBMISSION` | `warning` / `success` / `danger` / `danger` / `outline` | |
| Report severity high / medium / low | `danger` / `warning` / `neutral` | |

## 8. Migration aliases (temporary)
```css
:root {
  --bg-base: var(--surface-page);   --bg-surface: var(--surface-card);  --bg-card: var(--surface-card);
  --bg-secondary: var(--surface-sunken); --bg-hover: var(--surface-hover); --bg-surface-hover: var(--surface-hover);
  --border-color: var(--border);    --text-primary: var(--text-strong);  --text-secondary: var(--text-muted);
  --text-disabled: var(--text-faint); --color-primary: var(--n-900);    --color-success: var(--success);
  --color-danger: var(--danger);    --color-warning: var(--warning);     --color-secondary: var(--info);
  --glass-bg: var(--surface-card);  --glass-border: var(--border);       --glass-shadow: none;
  --border-radius-sm: var(--radius-sm); --border-radius-md: var(--radius-md); --border-radius-lg: var(--radius-lg);
}
```
The alias block makes every page pick up the new palette on day one. That includes the dark-mode fix
for everything already using `var(--…)`, before any page is touched.

## 9. Hex → token replacement table (for the page tickets)
| Found in code | Replace with |
|---|---|
| `#FFFFFF`, `#FFF`, `white` (as background) | `var(--surface-card)` |
| `#FFFFFF` (text on a black button/card) | `var(--on-inverse)` |
| `#FAFAFA`, `#F8FAFC`, `#F9FAFB` | `var(--surface-page)` |
| `#F5F5F5`, `#F4F4F5`, `#F3F4F6`, `#F1F5F9` | `var(--surface-sunken)` |
| `#E5E5E5`, `#E4E4E7`, `#E5E7EB`, `#E2E8F0`, `#D1D6DB` | `var(--border)` |
| `#D4D4D4`, `#CBD5E1` | `var(--border-strong)` |
| `#A3A3A3`, `#9CA3AF`, `#94A3B8` | `var(--text-faint)` |
| `#737373`, `#71717A`, `#6B7280`, `#64748B` | `var(--text-muted)` |
| `#525252`, `#404040`, `#475569`, `#4B5563` | `var(--text-body)` |
| `#171717`, `#111827`, `#0F172A`, `#1E293B`, `#0A0A0A`, `#09090B`, `#000` (text) | `var(--text-strong)` |
| `#171717`, `#0A0A0A`, `#000` (button/card background) | `var(--surface-inverse)` |
| `#22C55E`, `#10B981`, `#16A34A`, `#15803D`, `#4ADE80` | `var(--success)` |
| `#F0FDF4`, `#DCFCE7`, `#ECFDF5` | `var(--success-soft)` |
| `#EF4444`, `#DC2626`, `#B91C1C`, `#F87171` | `var(--danger)` |
| `#FEF2F2`, `#FEE2E2` | `var(--danger-soft)` |
| `#F59E0B`, `#D97706`, `#FBBF24` | `var(--warning)` |
| `#FFFBEB`, `#FEF3C7` | `var(--warning-soft)` |
| `#3B82F6`, `#2563EB`, `#60A5FA` | `var(--info)` |
| purple `#8B5CF6`/`rgba(139,92,246,…)`, orange glow `rgba(190,90,50,…)` | **delete** (decorative) |

Exceptions: `AndroidPhoneBannerPreview.tsx` (a phone mock-up that must look like the mobile app), map
marker colours, and ad colours that come from backend data. Leave those literal.
