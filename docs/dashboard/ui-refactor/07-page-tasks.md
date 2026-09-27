# 07 · Page · Tasks (mockup 4)

File: `features/tasks/pages/TasksPage.tsx` (1,650 lines, 100 `!important`). Split it into
`components/{TasksKpis,TasksTable,TaskMobileRow,TaskRowActions,TaskDetailDrawer,EmergencyBanner}.tsx` and
`columns.tsx`.
Data: `useTasks()` → `GET /admin/tasks?q&status&page&limit`, plus freeze/unfreeze/dispatch-backup and
disputes. See [`../05-tasks-disputes.md`](../05-tasks-disputes.md). **Unchanged.**

## Layout
```
PageHeader "Tasks" / "Monitor live tasks, freeze suspicious activity, resolve disputes"   [Filters] [Export]
KPI ×5   Active tasks | Emergency (danger tone) | Disputed | Frozen | Completed today
Card     [Segmented: All · Live · Emergency(red) · Disputed · Completed]        [Search by task ID…]
         DataTable
AlertBanner (sticky to the bottom of the content while an emergency is active)
```
Tablet: KPI in 3 columns (3 + 2 wrapping). The table hides Customer and Zone. Mobile: KPI in 2 columns, and the table becomes `TaskMobileRow` cards. The banner is
fixed above the bottom tabs.

## Segmented → backend status
| Tab | `status` query |
|---|---|
| All | none |
| Live | the in-progress family: `IN_PROGRESS` (plus the others if the API supports a list; otherwise `IN_PROGRESS` only) |
| Emergency | tasks with an `emergencyRequest`. Use the backend filter if one exists; otherwise filter the current page client-side **and label the count "on this page"** |
| Disputed | `DISPUTED` |
| Completed | `CLOSED` |

## Table columns
| Column | Render | Tablet | Mobile card |
|---|---|---|---|
| Task | title 600; line 2 `#SN-…` (`displayId`, 12 faint). A warning triangle `--warning` before the title if disputed or emergency | ✓ | title + id |
| Customer | name | hide | line 2 |
| Craftsman | short name ("Mohammed Z.") or "—" if unassigned | ✓ | line 2 |
| Zone | pin icon + the area part of `locationAddress` (text after the first comma, trimmed) | hide | hide |
| Budget | `formatMoney(budgetAmount)` end-aligned; "Open price" if `budgetType` isn't SPECIFIC | ✓ | end |
| ETA | clock + value **only if the API returns an ETA** (emergencies). Red "NOW" for an active SOS. Otherwise "—" | ✓ | hide |
| Status | `StatusPill` via `status.ts` | ✓ | pill |
| Actions | icon buttons: Freeze/Unfreeze (snowflake), Resolve (check, disputed only), `···` menu (open chat, open details, dispatch backup) | ✓ | `···` only |

Row tone: `alert` (`--row-alert`) for emergency or disputed rows.

## Emergency banner
`AlertBanner`:
- Title: "Emergency in progress" plus an `SOS` pill.
- Body: "{task} · {area} · {customer} triggered SOS {relative time} ago." Add "Nearest craftsman: {name}
  ({km} km)" **only if provided**.
- Actions: "View on map" → `navigate('live_activity')` focusing that emergency; "Dispatch backup" →
  `ConfirmDialog` → the existing mutation.

## Acceptance
- [ ] The Emergency KPI card is red-tinted only when its value > 0.
- [ ] Freeze → `ConfirmDialog` → `Toast` → the row status pill turns black "Frozen" after invalidation.
- [ ] No column shows invented values (ETA, zone). "—" is used when data is absent.
- [ ] 390 px: cards, no horizontal scroll, and the banner doesn't cover the last card.
