# 09 · All other pages

There are no mockups for these pages. They use **the same building blocks** as mockups 1–5, so each one
is mapped to a pattern below. Every page ticket follows the same recipe:
1. Remove the local shell: `Sidebar`, `Header`, `.mobile-header` and `.mobile-subheader`.
2. Add `PageHeader`.
3. Replace KPI markup with `KpiCard`, tables with `DataTable`, pills with `StatusPill`, modals with
   `Modal`/`ConfirmDialog`, and `alert/confirm` with `Toast`/`ConfirmDialog`.
4. Delete the page `<style>` block and replace hex with tokens (table in [01 §9](01-design-tokens.md)).
5. Split files over ~600 lines into `components/`.

| Page | File(s) | Pattern | Specific notes |
|---|---|---|---|
| **Reports & safety** | `reports/pages/ReportsPage.tsx` | KPI ×4 · **list + detail** (like Verification) | Filter pills → `Segmented`. Severity → `StatusPill`. Moderation actions through `ConfirmDialog` with a note. The mobile "Back" button comes from the `Drawer` full-screen variant, so delete the custom one. The success banner becomes a `Toast` |
| **Payments** | `payments/pages/PaymentsPage.tsx`, `components/BitSubscriptionManager.tsx` | KPI ×4 · chart card · tables | GMV/Net revenue/Take rate/Pending payouts → `KpiCard`. Move the page's `formatCurrency` into shared `formatMoney()` (ILS). The mobile toggle pills → `Segmented`. Bit subscription requests table → `DataTable`, where the receipt image opens `ImageLightbox`. Approve/Reject go through `ConfirmDialog`. The 3 s/10 s `setInterval`s in `BitSubscriptionManager` become React Query `refetchInterval: 30s` with `refetchIntervalInBackground: false` |
| **Analytics** | `analytics/pages/AnalyticsPage.tsx` | KPI ×4 · 2-col chart rows | Date pills → `Segmented solid`. Cohort chart → `GroupedBarChart`. "High demand zones" → the Busy Zones list style (`ProgressBar`) |
| **Broadcast** | `broadcast/pages/BroadcastPage.tsx` | KPI · **form + live preview** · history table | Form fields → `TextField/TextArea/Select`, and channels → `Checkbox` group. Preview on the end side (below the form on tablet/mobile). The page's own "success toast" → shared `Toast`. Sending → `ConfirmDialog` showing the audience size |
| **Notifications** | `notifications/pages/NotificationsPage.tsx` | feed list + side settings | Tabs → `Segmented`. Items → `ListItem` (unread = 6 px dot plus a 600 title). Subscription toggles → `Switch`. On tablet/mobile the side card moves below the feed |
| **Chat (Live support)** | `chat/pages/ChatPage.tsx` (2,189 lines) | **list + conversation** split | Split into `ConversationList`, `ThreadHeader`, `MessageList`, `Composer`, `QuickTemplates`, `NewMessageModal`. Bubbles: admin = `--surface-inverse` with `--on-inverse` text; others = `--surface-sunken`; internal notes = `--warning-soft` with a "Internal" pill. Mobile: the list is the page, and the thread opens full-screen. Keep the existing socket/polling logic untouched. **[strong model]** because of the size and the realtime state |
| **Settings** | `settings/pages/SettingsPage.tsx` | sub-nav + content | Left sub-nav card → on mobile a `Select`/`Segmented` at the top. Permissions matrix → `DataTable` with `Checkbox`es. Audit log → `DataTable` with a filter toolbar. The role-members side drawer → shared `Drawer`. **Add an "Appearance" section: Theme (System / Light / Dark) setting `data-theme`** (see [01 §2](01-design-tokens.md)). Auto-verification switch → `Switch` + `ConfirmDialog` |
| **Service management** | `service_management/pages/ServiceManagementPage.tsx` | KPI · insight cards · master–detail tables · schema builder | 85 "modal" mentions → one `Modal` per form (Category, Subcategory, Field). Categories and subcategories → `DataTable` + `ListItem` selector. The "donut placeholder to match mockup" must show real data or be removed. Split into `CategoriesSection`, `SubcategoriesSection`, `FieldsBuilder` |
| **Ads dashboard** | `ads/pages/AdsPage.tsx` | KPI ×5 · campaigns table | "Last 7 days" pill → the same range control as Overview (hide it if the API has no range). New campaign → `Button primary` → `navigate('create_ad')` |
| **Active / Scheduled / Expired** | `ads/pages/ActiveCampaignsPage.tsx` | `Segmented` + toolbar + `DataTable` | Search/filters/sort toolbar → inline on desktop, a bottom sheet on mobile. Row actions → `Dropdown` |
| **Create ad** | `ads/pages/CreateAdPage.tsx` + `components/AndroidPhoneBannerPreview.tsx` | form + device preview | The form uses the new fields. **Leave `AndroidPhoneBannerPreview` colours literal**, because it imitates the mobile app. Preview sticky on desktop, below the form on tablet/mobile. Image upload → a dropzone card (`--border-strong` dashed, `--radius-md`) |
| **Craftsman promotions** | `ads/pages/PromotionsPage.tsx` | KPI · package comparison cards · table | Package cards: `Card` with the recommended one `inverse`. Mobile floating buttons → header `···` menu actions |
| **Ad analytics** | `ads/pages/AdAnalyticsPage.tsx` | KPI · line chart · breakdown table | The SVG line chart → shared `LineChart` (same monochrome rules; the selected series is black and the others grey) |
| **Login** | `auth/pages/LoginPage.tsx` | standalone | Split screen on desktop: a black brand panel at the start (brand mark, one-line value prop) and a white form at the end. Single column on mobile. Inputs/buttons from the library. Keep the auth logic unchanged |

## Cross-page cleanups (one ticket each)
- **Delete dead code:** `src/index.css`, `src/App.css`, `live_activity/components/LiveActivityTailwind.tsx`,
  `assets/react.svg`, `assets/vite.svg`, `assets/hero.png`. Grep that they aren't imported first.
- **Polling → React Query:** replace the 9 `setInterval` data loops with `refetchInterval` (≥ 30 s,
  disabled in background tabs). Chat/live data that has a socket should rely on the socket plus a 60 s
  safety refetch. This follows the polling budget in [`../00-foundations.md`](../00-foundations.md).
- **`window.alert/confirm` → `ConfirmDialog`/`Toast`** (13 call sites).
- **i18n sweep:** every English literal left in JSX (`grep -n ">[A-Z][a-z]"` in pages) gets a key in all 3
  languages.
