# 05 · Page · Live Activity Center (mockup 2)

Files: `features/live_activity/pages/LiveActivityPage.tsx` and `components/{OperationalMap,LiveFeed,ActiveJobsList,SuspiciousActivity,BusyZones,SystemStatus,SosBanner,LiveSummaryCards}.tsx`.
Data: `useLiveActivity()` (snapshot, socket `subscribeToFeed`, `isPaused`). **Delete
`components/LiveActivityTailwind.tsx`** (dead Figma export, see audit).

## Layout (desktop)
```
PageHeader "Live Activity Center" / "Real-time operations dispatch"      [● Live 19:18:14] [❚❚ Pause feed]
Row 1  Operational Map card (2fr)                                 | Live Activity Feed (1fr, same height)
Row 2  Active Jobs in Progress (1.4fr) | Suspicious Activity (1fr) | Busy Zones + System Status (0.8fr)
SosBanner (only when an active emergency exists) — pinned above Row 1
```
Heights: Row 1 cards `min-height: 560px`. The feed list scrolls inside its card, and the map fills its
card (`flex:1`). **Remove all fixed `height: 582px/519px` and `min-width: 500px` rules** from `global.css`
(`.live-desktop-*`).

Tablet: Row 1 stacked (map 440 px, then feed with `max-height 480px` and inner scroll). Row 2 in 2 columns
(Jobs | Suspicious), with Busy Zones + System full width below (zones and status side by side).
Mobile: everything stacks. Map 320 px. Header actions become the `LiveIndicator` plus an icon-only
pause button.

## Section specs
| Section | Spec | Data |
|---|---|---|
| Live indicator | `LiveIndicator` with a clock that updates every 1 s. **Keep the existing timer, but only when the tab is visible** (`document.visibilityState`) | local clock |
| Pause feed | `Button primary`; label toggles "Pause feed" / "Resume feed" | existing `isPaused` toggle |
| Operational Map | `Card padding="none"`, header inside with padding: eyebrow "Operational Map", title "{city} · Live dispatch" (hide the city if unknown). `Segmented` layer filter with counts: All activity · Active jobs · Online craftsmen · Emergencies · Busy zones | existing snapshot counts |
| Map style | Leaflet with a **greyscale basemap** (CARTO Positron light, CARTO Dark Matter in dark theme). Markers: active job = 10 px black square; online craftsman = 10 px white circle with a 2 px black ring; emergency = 12 px red dot with the pulse. Cluster count bubble = black rounded rect with white text | `OperationalMap` props |
| Live Activity Feed | `Card` eyebrow "Live Activity Feed", title "Last hour · auto-streaming", end: green "● Live" text. `ListItem` per event: `IconCircle` by type (task posted = briefcase, online = user, completed = check, SOS = red siren tone danger, verification = shield), title = **bold actor** plus action text, subtitle = area · amount, meta = relative time. New events slide in from the top (`--dur-base`), and at most 50 are kept | `ActivityEvent` stream |
| Active Jobs in Progress | `Card` eyebrow "Active Jobs in Progress", title "Top 5", end: pill "All {count}" → `navigate('tasks')`. Row: 36 px icon box, title + `#SN-…` id (12 faint), "customer ↔ craftsman · area", `ProgressBar` with %, amount end-aligned | `ActiveJobsList` props. **Progress % only if the backend provides it; otherwise hide the bar** |
| Suspicious Activity | `Card` with a danger icon, eyebrow "Suspicious Activity", title "{n} alerts unresolved". Items as bordered inner cards (`--radius-md`): title 600, `StatusPill` severity (high = danger, medium = warning), description 12 muted, time, `Button link` "Investigate →" (opens the related user/task) | `SuspiciousActivity` props |
| Busy Zones | Eyebrow "Busy Zones", title "Active jobs by zone". Row: pin icon, zone name, count end-aligned, `ProgressBar` relative to the max | `BusyZones` props |
| System Status | Eyebrow "System Status". Rows: API Gateway, Payments, Notifications, Geo services → "● Operational" (success) / "Degraded" (warning) / "Down" (danger). Drive it from `GET /health`: `checks.*`, `migrations.status`, `push` | `/health` (see [`../02-overview-analytics-live.md`](../02-overview-analytics-live.md)) |
| SOS banner | `AlertBanner` (danger) with actions "View on map" (focus the marker) and "Dispatch backup" (existing mutation + `ConfirmDialog`) | `SosBanner` props |

## Behaviour rules
- Pausing stops **both** the poll interval and applying socket events. Buffered events are applied on resume
  with a "{n} new events" chip at the top of the feed.
- Don't re-render the map for every feed event. Memoise markers by id.
- Leaflet is loaded from a CDN today. Keep it, but show a `Skeleton` in the map card until it's loaded, and
  an `ErrorState` if the script fails.

## Acceptance
- [ ] No overflow between 1025 and 1279 px (the current bug).
- [ ] Feed scrolls inside its card, and the page doesn't grow with events.
- [ ] Dark theme uses the dark basemap.
- [ ] System Status reflects a stopped Redis (`checks.redis = error` → Down).
