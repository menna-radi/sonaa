# Dashboard UI refactor — "Monochrome Ops" design

A plan to restyle the admin dashboard (`Arox-front-end/`) to the reference mockups: black sidebar, white
cards on an off-white page, black primary actions. Colour is used only for meaning: green = up/online/OK,
red = emergency/danger, amber = pending/disputed. It covers mobile, tablet and desktop.

The plan is written so a **low-cost model** (e.g. Claude Haiku 4.5) can execute it ticket by ticket. Each
ticket names its exact files, steps, and acceptance checks, and does not depend on judgement calls. Tickets
that do need judgement are marked **[strong model]** (Sonnet/Opus) in the execution plan.

## Read in this order
| # | File | What it gives you |
|---|---|---|
| 00 | [Audit of the current UI](00-audit.md) | What exists today, measured, and what is broken |
| 01 | [Design tokens](01-design-tokens.md) | Colours (light + dark), type scale, radii, spacing, shadows, motion |
| 02 | [Component library](02-components.md) | Every shared component: anatomy, props, states, CSS |
| 03 | [Responsive rules](03-responsive.md) | Breakpoints and how each pattern changes on mobile / tablet / desktop |
| 04 | [Page · Overview](04-page-overview.md) | Mockup 1 |
| 05 | [Page · Live Activity](05-page-live-activity.md) | Mockup 2 |
| 06 | [Page · Craftsmen](06-page-craftsmen.md) | Mockup 3 |
| 07 | [Page · Tasks](07-page-tasks.md) | Mockup 4 |
| 08 | [Page · Verification review](08-page-verification.md) | Mockup 5 |
| 09 | [All other pages](09-other-pages.md) | Reports, Payments, Analytics, Broadcast, Notifications, Ads ×6, Chat, Settings, Service management, Login |
| 10 | [Execution plan (tickets)](10-execution-plan.md) | Ordered tickets, model per ticket, prompt template, definition of done |

## Non-negotiable rules (apply to every ticket)
1. **No fake data.** The mockups contain sample numbers (SAR, Riyadh, OCR 98.4%, ETA "12 min"). Show only
   what the backend returns. When a value is missing, show `—` or hide the element. Do not invent it. The
   platform currency is **ILS (₪)**; format money with the shared `formatMoney()` (ticket T02).
2. **No behaviour changes in a UI ticket.** Hooks, repositories, query keys, mutations and endpoints stay
   exactly as they are unless the ticket says otherwise. Integration contracts live in the feature guides
   ([`../README.md`](../README.md)).
3. **Tokens only.** No raw hex/rgba in `.tsx` files after a page is migrated. Use `var(--…)` tokens from
   `tokens.css` or the component classes.
4. **Logical CSS only** (`margin-inline-start`, `inset-inline-end`, `text-align: start`). The dashboard
   runs in English (LTR), Arabic and Hebrew (RTL).
5. **Every string through `t()`**, with keys added to all three languages in `LanguageContext.tsx`.
6. **Keep the brand name as it is today** (read it from one constant, `BRAND_NAME`). The mockups say
   "Sonaa". Renaming is a product decision, not part of this refactor.
7. **A11y:** visible focus ring, `aria-label` on icon-only buttons, dialogs trap focus and close on
   `Escape`, contrast WCAG AA.
