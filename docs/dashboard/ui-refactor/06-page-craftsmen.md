# 06 · Page · Craftsmen (mockup 3)

File: `features/craftsmen/pages/CraftsmenPage.tsx` (1,700 lines, 169 inline styles, 159 hex).
Split it while refactoring:
```
craftsmen/
  pages/CraftsmenPage.tsx              (layout + state only, < 250 lines)
  components/CraftsmenTable.tsx        (search, Segmented, DataTable, mobile rows)
  components/CraftsmanDetailPanel.tsx  (right panel / drawer content)
  components/CraftsmanActions.tsx      (View / Suspend / Ban + ConfirmDialog with reason)
  components/columns.tsx               (DataTable column defs)
```
Data: `useCraftsmen()` → `GET /admin/craftsmen?q&status&page&limit`, response
`{ items, counts:{all,verified,pending,suspended} }`. Mutations suspend/unsuspend/ban, and verification
item toggles. See [`../04-craftsmen.md`](../04-craftsmen.md). **Unchanged.**

## Layout
- Desktop: `PageHeader` ("Craftsmen", subtitle "{counts.all} craftsmen" with the formatted count) with
  actions Filters (outline, opens the filter popover) and Export (primary). Body is a two-column grid:
  list card `1fr` and detail panel `400px`, sticky.
- Tablet: the list is full width. Clicking a row opens `Drawer` with `CraftsmanDetailPanel`.
- Mobile: a card list. Tapping a card opens a full-screen drawer with a back button.

## List card
- `SearchInput` "Search by name, trade, or ID…" → existing `q` (debounced 300 ms).
- `Segmented` with counts: All · Verified · Pending · **Low trust** (the backend `status=suspended`
  actually filters `trustScore < 0.7`; label it honestly, as noted in the integration guide).
- `DataTable` columns:

| Column | Render | Desktop | Tablet | Mobile card |
|---|---|---|---|---|
| Craftsman | `Avatar 32` with presence dot (`isAvailable` → online/offline; suspended → flagged) + name 600 + `VerifiedMark` if `isVerifiedId`; line 2 trade (12 muted) | ✓ | ✓ | title |
| Rating | ★ (filled, `--text-strong`) `4.9` 600 + `(234)` faint | ✓ | ✓ | fact 1 |
| Jobs | `completedTasksCount`, end-aligned | ✓ | hide | fact 2 |
| Trust | `ScoreChip` (trustScore×100) | ✓ | ✓ | chip on the end |
| Status | coloured text: online `--success`, offline `--text-muted`, busy `--warning`, flagged/suspended `--danger` | ✓ | ✓ | pill |

- The selected row gets the `--surface-sunken` background. `↑/↓` moves the selection while the table has
  focus.
- Pagination footer (server-side).

## Detail panel (`CraftsmanDetailPanel`)
1. **Header:** `Avatar 64 square`, name (`--fs-display` scaled to 22 px) + `VerifiedMark`, line
   "{trade} · Joined {month year}", `StatusPill` online/offline, and "ID #{displayId or short id}" faint.
   `···` menu at the top end (copy ID, open in app, audit log).
2. **Stat tiles (4, `StatTile`):**
   - Rating ("{n} reviews")
   - Jobs ("completed")
   - Response ("{responseTimeMinutes} min", "avg time"). Show `—` when the backend has no median yet.
   - Trust ("out of 100")
3. **Verification:** eyebrow, then a 2-column grid of `ChecklistChip`s: National ID, Selfie match, Trade
   license, Bank IBAN, Background check, Insurance. Toggling uses the existing `verify/item` mutation with
   `ConfirmDialog`. **Revoking National ID uses a danger confirm** (the backend flags the request and
   notifies the craftsman).
4. **Earnings card (`Card variant="inverse"`):** "Earnings · Last 30 days", the amount in `--fs-display`
   with a green delta and a white `Sparkline`. **Render only if the admin API returns earnings for the
   craftsman.** If it doesn't, hide the card; never show a fake SAR figure.
5. **Actions row (3 equal buttons):** View (`ghost` + eye, opens the public profile or task history),
   Suspend/Unsuspend (`soft-warning`), Ban (`soft-danger`). Each goes through `ConfirmDialog` with a
   required reason. After success: `Toast` and invalidate `['admin','craftsmen']`.

Empty panel (nothing selected, desktop): an `EmptyState` saying "Select a craftsman to see details".

## Acceptance
- [ ] 1440 px matches mockup 3. 1024 px shows the list only, with a drawer on click. 390 px shows cards.
- [ ] Segmented counts come from `counts`, not `items.length`.
- [ ] Every destructive action needs a confirm with a reason, and there are no `window.confirm`.
- [ ] The file is split as above. `CraftsmenPage.tsx` is < 250 lines and has no hex colours.
