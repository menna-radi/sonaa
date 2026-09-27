# 04 · Loading, empty & error UX

## 1. The five visual states

| State | When | Component |
|---|---|---|
| **Initial loading** | first load, no cached data | `CustomShimmer` matching the final layout (same card heights) |
| **Content** | data present | normal UI |
| **Refreshing** | pull-to-refresh / background refresh with content | keep content; `RefreshIndicator` or a thin top progress bar |
| **Empty** | loaded, zero items | icon + one-line reason + primary action (e.g. "Post a task") |
| **Error** | load failed and no content | icon + translated reason + **Retry** |
| Error with content | refresh failed, cached/old content | keep content + dismissible banner "Couldn't refresh — Retry" |

Never replace existing content with a full-screen error because a background refresh failed.

## 2. Commands (buttons)

1. Disable the button and show an inline spinner while in flight (`CustomButton(isLoading: true)`).
2. Ignore duplicate taps (in-flight guard in the cubit, not only the UI).
3. On success: optimistic local update → publish invalidation → navigate/close.
4. On failure: keep the form/sheet open, show the specific reason (error-code mapping), keep user input.

## 3. Optimistic UI — where allowed

| Allowed | Not allowed |
|---|---|
| Chat send (pending bubble → confirmed/failed) | Accepting a task (eligibility is server-side) |
| Mark notification read | Payments, subscriptions, commission |
| Availability toggle (revert on failure) | Task status transitions (wait for server) |
| Removing a declined request from the local list | Verification decisions |

## 4. Pagination

- `limit` 20–50; `page` or `before` cursor (chat uses `before=<ISO date>`).
- Trigger "load more" at 80% scroll; show a footer spinner; stop when a page returns `< limit`.
- Pull-to-refresh resets to page 1 but **merges** (don't blank the list).

## 5. Snackbars & dialogs

- `AppSnackBar.success/error/warning/info(context, text)` with translated text.
- Destructive actions (cancel task, delete account, delete notifications) use a confirmation sheet with the
  consequence spelled out.
- Guard double-pop: sheets pop themselves with a result; the parent reacts to the result (fixes `!_debugLocked`).

## 6. Accessibility & layout

- Test at 320px width and with large fonts; every row with dynamic text uses `Flexible/Expanded` + ellipsis.
- RTL: use `EdgeInsetsDirectional`, `PositionedDirectional`, direction-aware arrows.
- Tap targets ≥ 40×40.
