# 09b · Frontend tickets — Phase 3 Offers & Campaigns · Phase 4 People & operations

Same conventions as [09a](09a-tickets-foundation-overview-billing.md): read README + 02 + 03 first; the gate is automatic; edit only the listed `files` (new files inside the same feature folder are allowed).
Mock repositories must keep compiling and behaving (`VITE_USE_MOCK=true`): whenever you change a domain type or repository interface, update the matching `Mock*Repository` in the same ticket.

---
## Phase 3 — Offers, banners & campaigns ([05 spec](05-spec-offers-ads.md))

### T-F050 · Offer domain, repository, ad-status fix
- repo: frontend
- tier: mid
- depends: T-F003, T-F001
- spec: 05-spec-offers-ads.md; 03-data-contract.md
- files: src/domain/entities/Offer.ts; src/domain/repositories/OfferRepository.ts; src/data/repositories/ApiOfferRepository.ts; src/data/repositories/MockOfferRepository.ts; src/data/repositories/ApiAdRepository.ts; src/data/repositories/MockAdRepository.ts; src/domain/repositories/AdRepository.ts; src/core/di/DependencyProvider.tsx
- audit: src/data
- gate: frontend

1. Create `Offer`/`OfferInput`/`OfferState` exactly as in 05 §2 "Domain" and `OfferRepository { list(); create(input); update(id, patch: Partial<OfferInput>); toggle(id); remove(id) }`.
2. `ApiOfferRepository`: `GET /admin/promotions`, `POST /admin/promotions`, `PATCH /admin/promotions/:id`, `PUT …/toggle`, `DELETE`. Mapper rules in 05 §2 (never invent text). Request mapping: `title=titleEn, subtitle=subtitleEn, buttonText=buttonTextEn` plus `titleEn,titleAr,subtitleEn,subtitleAr,buttonTextEn,buttonTextAr,targetType,targetId` (extra keys are harmless today) and `targetUrl` (`null` clears), dates as ISO or `null`. `MockOfferRepository` in memory (4 offers).
3. Register `offerRepository` in `DependencyProvider`.
4. `AdRepository`/`ApiAdRepository`: `Campaign.status` becomes `'Active' | 'Paused' | 'Ended'`; map `ACTIVE/PAUSED/ENDED` both ways (never map ENDED to Paused); `updateAd` sends `status: 'ACTIVE'|'PAUSED'|'ENDED'`; add `clicks?: number` (from `conversions`) and `ctr` as a number. **Remove the promotion methods** (`getPromotions/createPromotion/togglePromotionStatus/deletePromotion`) and `PromotionOffer` from `AdRepository` + both implementations **after** T-F051 stops using them — to avoid a build break in this ticket keep them marked `@deprecated`.

### T-F051 · Offers & Banners page
- repo: frontend
- tier: mid
- depends: T-F050, T-F006, T-F005
- spec: 05-spec-offers-ads.md
- files: src/presentation/features/ads/pages/PromotionsPage.tsx; src/presentation/features/ads/components/OfferCard.tsx; src/presentation/features/ads/components/OfferFormModal.tsx; src/presentation/features/ads/components/OfferPreviewModal.tsx; src/presentation/features/ads/hooks/useOffers.ts; src/presentation/features/ads/offerState.ts; src/presentation/features/ads/offerTargets.ts; src/presentation/features/ads/ads.css; src/presentation/features/ads/components/PromotionPackageCards.tsx; src/presentation/features/ads/components/PromotionFeaturesCard.tsx; src/presentation/features/ads/types.ts; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/ads/pages/PromotionsPage.tsx,src/presentation/features/ads/hooks
- gate: frontend

Rewrite `PromotionsPage` per 05 §2. Steps: (1) `offerState.ts` `getOfferState(offer, now)`; (2) `offerTargets.ts` `export const OFFER_TARGETS_ENABLED = ['NONE','URL'] as const;` (3) `useOffers.ts` (TanStack Query, `queryKeys.offers.list`, mutations create/update/toggle/delete invalidating `offers.all` and `ads.all`); (4) `OfferFormModal` (create+edit, `validate(offerSchema,…)`, image upload through `apiClient.post('/uploads', FormData)` reading `fileUrl` or `data.fileUrl`, 5 MB / png-jpg-webp guard, duration presets); (5) `OfferCard` with pills via `offer` status domain; (6) `OfferPreviewModal` wraps `AndroidPhoneBannerPreview` (do not edit that file; look at its props and pass title/subtitle/button/image); (7) delete `PromotionPackageCards.tsx`, `PromotionFeaturesCard.tsx` and the package/feature types from `types.ts`; remove all fabricated arrays/state from the page. The page file must be ≤ 220 lines; no inline styles except runtime values; all strings via `t()` (keys in 05 §5).
Audit note: `AndroidPhoneBannerPreview.tsx` is exempt from the hex rule.

### T-F052 · Campaigns page (tabs) and honest columns
- repo: frontend
- tier: mid
- depends: T-F050, T-F051
- spec: 05-spec-offers-ads.md
- files: src/presentation/features/ads/pages/ActiveCampaignsPage.tsx; src/presentation/features/ads/pages/CampaignsPage.tsx; src/presentation/features/ads/components/CampaignsTable.tsx; src/presentation/features/ads/components/CampaignRow.tsx; src/presentation/features/ads/hooks/useCampaigns.ts; src/presentation/features/ads/ads.css; src/presentation/features/dashboard/pages/DashboardPage.tsx; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/ads/pages/CampaignsPage.tsx,src/presentation/features/ads/components/CampaignsTable.tsx,src/presentation/features/ads/hooks
- gate: frontend

1. Create `CampaignsPage` (`Segmented` tabs Active / Scheduled / Ended / Analytics; initial tab from `sessionStorage 'campaigns_tab'`, default `Active`). Analytics tab renders `AdAnalyticsPage` lazily (built in T-F053; until then render `EmptyState coming_soon`).
2. Move the table logic out of `ActiveCampaignsPage.tsx` (609 lines) into `CampaignsTable`/`CampaignRow` (≤ 300 lines each). Columns exactly per 05 §3 (no Budget/Spent). Actions: Edit (opens the existing `EditCampaignModal`), Pause/Resume (`updateAdStatus`), End (`confirm`, sends `ENDED`), Delete (`confirm` danger). Data from `useCampaigns()` (TanStack Query, key `queryKeys.ads.list`, `refetchInterval 60000`). Tab filter logic: Active = status Active and `startDate ≤ now` and (no endDate or `endDate ≥ now`); Scheduled = `startDate > now`; Ended = status Ended or `endDate < now`.
3. `DashboardPage` routes `campaigns`, `scheduled`, `expired`, `ads`, `ad_analytics` to `CampaignsPage` (`sessionStorage 'campaigns_tab'` set to the tab implied by the key before render: scheduled→Scheduled, expired→Ended, ad_analytics→Analytics, others→Active). Keep `create_ad` → `CreateAdPage`, `promotions` → `PromotionsPage`.
4. Delete `ActiveCampaignsPage.tsx` once nothing imports it (`grep`). Empty/error/skeleton states per standard. Strings via `t()`.

### T-F053 · Ad analytics — honest metrics only
- repo: frontend
- tier: mid
- depends: T-F052
- spec: 05-spec-offers-ads.md
- files: src/presentation/features/ads/pages/AdAnalyticsPage.tsx; src/presentation/features/ads/pages/AdsPage.tsx; src/presentation/features/ads/components/AdsKpis.tsx; src/presentation/features/ads/components/AdsPerformanceChart.tsx; src/presentation/features/ads/components/TopPerformingAds.tsx; src/presentation/features/ads/pages/CampaignsPage.tsx; src/presentation/features/ads/ads.css; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/ads/pages/AdAnalyticsPage.tsx
- gate: frontend

Rewrite `AdAnalyticsPage` (≤ 250 lines) per 05 §3 "Analytics tab": 4 KPI cards (impressions, clicks, CTR, active campaigns) computed from `useCampaigns()`; `GroupedBarChart` (components/charts) of impressions vs clicks for the top 8 campaigns by impressions; "Top 5" table; `AlertBanner tone="info"` when total clicks = 0. Remove time-series, budget, spend, conversion funnel, ROI. It must render inside `CampaignsPage`'s Analytics tab **without** its own `PageHeader` (accept `embedded` prop). Delete `AdsPage.tsx`, `AdsKpis.tsx`, `AdsPerformanceChart.tsx`, `TopPerformingAds.tsx` when they have no remaining importers (`grep`; `DashboardPage` must no longer import `AdsPage`).

### T-F054 · Sidebar growth section (2 items instead of 7)
- repo: frontend
- tier: low
- depends: T-F052, T-F051
- spec: 05-spec-offers-ads.md
- files: src/presentation/layouts/Sidebar.tsx; src/presentation/layouts/MobileBottomTabs.tsx; src/presentation/context/NavigationContext.tsx; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/layouts
- gate: frontend

In `Sidebar.tsx` replace the entries for `ads`, `campaigns`, `scheduled`, `expired`, `promotions`, `ad_analytics` by a section `sec_growth` with exactly: **Offers & Banners** (`promotions`, `nav_offers`, icon `Percent`) and **Campaigns** (`campaigns`, `nav_campaigns`, icon `Megaphone`); move `broadcast` into this section. Keep the old page keys valid in `NavigationContext`. Mark the active state of **Campaigns** for all of `campaigns|scheduled|expired|ads|ad_analytics|create_ad`. Update the mobile "More" list the same way. Keys: `sec_growth`, `nav_offers`, `nav_campaigns`.

### T-F055 · Offers: in-app targets and bilingual fields (after backend B20)
- repo: frontend
- tier: low
- depends: T-F051
- needs: T-B20
- spec: 05-spec-offers-ads.md
- files: src/presentation/features/ads/offerTargets.ts; src/presentation/features/ads/components/OfferFormModal.tsx; src/presentation/features/ads/components/TargetPicker.tsx; src/data/repositories/ApiOfferRepository.ts; src/data/repositories/ApiAdRepository.ts; src/presentation/features/ads/pages/CreateAdPage.tsx; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/ads
- gate: frontend

`OFFER_TARGETS_ENABLED` → all six targets. `TargetPicker`: for `CATEGORY` a `Select` of categories (`categoryRepository.getCategories`), for `CRAFTSMAN` a searchable list (`/admin/craftsmen?q=` via `craftsmanRepository` or `apiClient.get(API_ENDPOINTS.admin.craftsmen,{q,limit:10})`), for `TASK`/`SERVICE` a text id input with helper text. `CreateAdPage` budget field becomes optional (label unchanged). Repository payloads include `targetType/targetId`. No behavioural change for NONE/URL.

### T-F056 · Create/Edit campaign forms with validation
- repo: frontend
- tier: mid
- depends: T-F052, T-F006
- spec: 05-spec-offers-ads.md
- files: src/presentation/features/ads/pages/CreateAdPage.tsx; src/presentation/features/ads/components/EditCampaignModal.tsx; src/presentation/features/ads/components/NewCampaignModal.tsx; src/presentation/features/ads/components/CampaignForm.tsx; src/presentation/features/ads/ads.css; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/ads/pages/CreateAdPage.tsx,src/presentation/features/ads/components/EditCampaignModal.tsx,src/presentation/features/ads/components/NewCampaignModal.tsx,src/presentation/features/ads/components/CampaignForm.tsx
- gate: frontend

Extract the shared form into `CampaignForm` (fields: name, internal budget (default 1, label `campaigns_budget_reference`), placement (`Home Banner`|`Featured Slots`), image upload, description, CTA text, link, start, end, duration presets) validated with `validate(adCampaignSchema, values)` on submit and on blur per field; used by `CreateAdPage` (page layout `ui-split`: form + `AndroidPhoneBannerPreview`) and `EditCampaignModal` (`FormModal`). `NewCampaignModal.tsx`: if `grep` shows no importer, delete it. Remove all inline styles/hex from these three files (the preview component stays untouched). Submit → `adRepository.createAd/updateAd`; map server `details` via `fieldErrorsFrom`; success toast + `navigate('campaigns')` after create.

---
## Phase 4 — People & operations ([06 spec](06-spec-people-ops.md))

### T-F060 · Craftsmen data layer (server paging, account status, billing fields)
- repo: frontend
- tier: mid
- depends: T-F003
- needs: T-B12
- spec: 06-spec-people-ops.md
- files: src/domain/entities/Craftsman.ts; src/domain/repositories/CraftsmanRepository.ts; src/data/repositories/ApiCraftsmanRepository.ts; src/data/repositories/MockCraftsmanRepository.ts; src/presentation/features/craftsmen/hooks/useCraftsmen.ts; src/presentation/components/ui/status.ts
- audit: src/presentation/features/craftsmen/hooks
- gate: frontend

Apply 06 §1 "Data" + "Domain": `Craftsman` gains `accountStatus`, `billing`; status union gains `'banned'`; remove earnings fields; `CraftsmanRepository.getCraftsmen(q: { q?: string; status: 'all'|'verified'|'pending'|'suspended'; page: number; limit: number })` returns `Result<{ items: Craftsman[]; total: number; counts: { all: number; verified: number; pending: number; suspended: number } }>`; suspend/unsuspend/ban/toggleVerificationItem return `Result<boolean>` (**no more "refetch whole list to find the row"**). Api mapper reads the flat billing fields; the `suspended` tab is computed client-side from `accountStatus !== 'ACTIVE'` when `counts.suspended` disagrees. `useCraftsmen` becomes TanStack Query (`queryKeys.craftsmen.list`) with mutations (invalidate `craftsmen.all`, `counts`); expose `{ rows, total, counts, loading, error, refetch, page, setPage, search, setSearch, tab, setTab, mutations }`; initial search from `sessionStorage 'craftsmen_search'` (read once, then remove). No `setInterval`.

### T-F061 · Craftsmen UI (list, billing chips, detail panel, actions)
- repo: frontend
- tier: mid
- depends: T-F060, T-F034, T-F006
- spec: 06-spec-people-ops.md
- files: src/presentation/features/craftsmen/pages/CraftsmenPage.tsx; src/presentation/features/craftsmen/components/CraftsmenTable.tsx; src/presentation/features/craftsmen/components/columns.tsx; src/presentation/features/craftsmen/components/CraftsmanDetailPanel.tsx; src/presentation/features/craftsmen/components/CraftsmanActions.tsx; src/presentation/features/craftsmen/components/CraftsmanBillingSection.tsx; src/presentation/features/craftsmen/craftsmen.css; src/presentation/features/billing/components/ExtendModal.tsx; src/presentation/features/billing/components/FreeTasksModal.tsx; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/craftsmen
- gate: frontend

Layout per 02 §3 and 06 §1: `PageHeader` → `Segmented` tabs with counts + `SearchInput` toolbar → `Card padding="none"` `DataTable` (server pagination) → detail `Drawer` (desktop/tablet) or sheet (mobile). Add `CraftsmanBillingSection` (free tasks, model pill, subscription expiry, lock, quick actions reusing the Billing modals; "Open in Billing" link). Actions: Suspend (`confirmWithReason`, reason ≥ 3 validated with `suspendSchema`), Unsuspend (`confirm`), Ban (`confirmWithReason` with extra check: user must type the word BAN — implement by rendering the confirm body with a `TextField` is **not possible** with the current `ConfirmDialog`; instead extend `ConfirmDialog` with option `confirmText?: string` (when set, the confirm button stays disabled until the typed text equals it, rendered as an extra `TextField`) — allowed to edit `ConfirmDialog.tsx` for this). All strings via `t()`; no inline styles beyond runtime values; each file ≤ 300 lines.
(Editing `ConfirmDialog.tsx` and `ui/index.ts` is permitted in this ticket.)

### T-F062 · Tasks data layer (14 statuses, server paging, detail)
- repo: frontend
- tier: mid
- depends: T-F003, T-F004
- needs: T-B13
- spec: 06-spec-people-ops.md
- files: src/domain/entities/Task.ts; src/domain/repositories/TaskRepository.ts; src/data/repositories/ApiTaskRepository.ts; src/data/repositories/MockTaskRepository.ts; src/data/mappers/TaskMapper.ts; src/data/dto/TaskDTO.ts; src/domain/use_cases/tasks/GetTasksUseCase.ts; src/domain/use_cases/tasks/FreezeTaskUseCase.ts; src/presentation/features/tasks/hooks/useTasks.ts
- audit: src/presentation/features/tasks/hooks
- gate: frontend

Apply 06 §2.1. `TaskRepository`: `getTasks(q: { status: TaskFilter; q?: string; page: number; limit: number })` → `Result<{ items: Task[]; total: number; counts?: Record<TaskFilter, number> }>` with `TaskFilter = 'all'|'live'|'emergency'|'disputed'|'done'|'cancelled'|'frozen'`; the Api repo maps a filter to backend `status` values (single `status=` per request; for multi-status groups request `limit` rows without status and filter client-side **until** `counts`/comma lists exist — detect `counts` in the response), `getTask(id)` (`GET /admin/tasks/:id`, **opt** → falls back to the list row), `freezeTask`, `unfreezeTask`, `dispatchBackup(id, craftsmanProfileId)` all returning `Result<boolean>`. Update the use cases and `TaskMapper/TaskDTO` (or delete the DTO/mapper if only the Mock used them — then Mock builds `Task` directly). `useTasks` → TanStack Query (`queryKeys.tasks.list`, `refetchInterval 30000`), mutations invalidate `tasks.all`, `disputes.all`, `counts`. No `setInterval`. Never collapse statuses.

### T-F063 · Tasks UI (filters, table, detail drawer, dispatch)
- repo: frontend
- tier: mid
- depends: T-F062, T-F006
- spec: 06-spec-people-ops.md
- files: src/presentation/features/tasks/pages/TasksPage.tsx; src/presentation/features/tasks/components/TasksTable.tsx; src/presentation/features/tasks/components/columns.tsx; src/presentation/features/tasks/components/TaskDetailDrawer.tsx; src/presentation/features/tasks/components/TasksKpis.tsx; src/presentation/features/tasks/components/EmergencyBanner.tsx; src/presentation/features/tasks/components/DispatchBackupModal.tsx; src/presentation/features/tasks/tasks.css; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/tasks
- gate: frontend

Layout per 02 and 06 §2.1: `PageHeader` (Export CSV with `toCsv`) → `ui-kpi-grid ui-kpi-grid--4` (Open now, Emergency, Disputed, Completed) from `counts` (hide a card when its count is unknown) → toolbar (`Segmented` filters with counts, `SearchInput`) → `DataTable` (server pagination, row tone alert) → `TaskDetailDrawer` (summary, parties, timeline, work-proof images with `ProofViewer`, cancel reason, dispute card placeholder, actions Freeze/Unfreeze with `confirm`, **Dispatch backup** via `DispatchBackupModal`). Currency via `formatMoney`; status via `<StatusPill variant={pillVariantFor('task', s)} label={t(statusLabelKey('task', s))}/>`. `EmergencyBanner` shows the newest emergency task (`isEmergency`) with an "Open" button. The page shell is the top-level `Segmented` **Tasks | Disputes** from 06 §2.2 — render the Disputes segment as `EmptyState coming_soon` until T-F064. Remove the `eta` column.

### T-F064 · Disputes — queue and resolution (new UI)
- repo: frontend
- tier: mid
- depends: T-F063, T-F006
- needs: T-B14
- spec: 06-spec-people-ops.md
- files: src/domain/entities/Dispute.ts; src/domain/repositories/DisputeRepository.ts; src/data/repositories/ApiDisputeRepository.ts; src/data/repositories/MockDisputeRepository.ts; src/presentation/features/tasks/hooks/useDisputes.ts; src/presentation/features/tasks/components/DisputesTab.tsx; src/presentation/features/tasks/components/ResolveDisputeModal.tsx; src/presentation/features/tasks/pages/TasksPage.tsx; src/presentation/features/tasks/tasks.css; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/tasks
- gate: frontend

Implement 06 §2.2. `Dispute` entity: `{ id; taskId; taskDisplayId; taskTitle; customerName; craftsmanName: string|null; reason: 'SERVICE_QUALITY'|'OVERCHARGING'|'NO_SHOW'|'SAFETY_CONCERN'|'OTHER'; description: string; status: 'PENDING'|'RESOLVED'; resolution?: 'REFUND_CLIENT'|'PAY_CRAFTSMAN'; adminNotes?: string; amount: number; createdAt: string; resolvedAt?: string }`. `DisputeRepository`: `getDisputes(q:{status,page,limit}) → Result<{items,total,counts?}>`, `resolveDispute(id, resolution, notes?)`. Api: `GET /admin/disputes?page&limit&status`, `POST /admin/disputes/:id/resolve {resolution, notes}`. Drop the `split_split` option everywhere. `ResolveDisputeModal` = `FormModal` with two radio cards, consequence text, optional notes, `validate(disputeResolveSchema)`. `DisputesTab` = toolbar (`Segmented` Pending/Resolved/All + count), `DataTable` + mobile cards. The Tasks drawer shows the dispute card with a Resolve button when `task.hasDispute` (look up via `useDisputes` data by `taskId`). Honour `sessionStorage 'tasks_tab' === 'disputes'` (read once, then remove).

### T-F065 · Verification page — standard conformance and validation
- repo: frontend
- tier: mid
- depends: T-F002, T-F001, T-F005
- spec: 06-spec-people-ops.md
- files: src/presentation/features/verification/pages/VerificationPage.tsx; src/presentation/features/verification/components/ReviewDecisionStep.tsx; src/presentation/features/verification/components/ModeratorNotes.tsx; src/presentation/features/verification/components/SubmissionHeader.tsx; src/presentation/features/verification/components/ReviewQueue.tsx; src/presentation/features/verification/components/ReviewStepTabs.tsx; src/presentation/features/verification/components/ProfileInfoStep.tsx; src/presentation/features/verification/components/NationalIdStep.tsx; src/presentation/features/verification/components/FaceMatchStep.tsx; src/presentation/features/verification/components/SkillsStep.tsx; src/presentation/features/verification/components/PortfolioStep.tsx; src/presentation/features/verification/components/DocumentCard.tsx; src/presentation/features/verification/verification.css; src/presentation/features/verification/hooks/useVerificationQueue.ts; src/data/repositories/ApiVerificationRepository.ts; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/verification
- gate: frontend

Apply 06 §3 (1–5): notes validation (`moderationNotesSchema(required)` — required for Reject/Flag/Request changes) with inline error; approve confirm lists granted badges; error mapping with `errorMessage`; queue via TanStack Query hook `useVerificationQueue({status,page})` (`queryKeys.verification.queue`) with pagination and SLA text only when `avgSlaRemainingHours > 0`; then clean inline styles/hex/literals in all listed files until the gate passes. Do not change the visual layout of the review workspace (mockup 5) beyond moving styles into classes.

### T-F066 · Safety reports data layer (remove fabricated data)
- repo: frontend
- tier: mid
- depends: T-F003
- needs: T-B15
- spec: 06-spec-people-ops.md
- files: src/domain/repositories/SafetyReportRepository.ts; src/data/repositories/ApiSafetyReportRepository.ts; src/data/repositories/MockSafetyReportRepository.ts; src/presentation/features/reports/types.ts; src/presentation/features/reports/hooks/useReports.ts
- audit: src/presentation/features/reports/hooks
- gate: frontend

Replace the `SafetyReport` model with the one in 06 §4; **delete the hard-coded fallback array** in `ApiSafetyReportRepository` entirely. API: `getSafetyReports(q:{status,page,limit}) → Result<{items,total,counts?}>` (`GET /admin/reports?status&page&limit`; map `reporter`/`suspect`/`task`/`resolvedBy` safely, name = `firstName lastName`), `moderateReport(id, action: 'dismiss'|'investigate'|'suspend'|'ban', notes?)`. Unknown `action` `investigate` is only sent when the UI offers it (see T-F067: offer it only if the server `counts.investigating` field exists, i.e. B15). `useReports(q)` TanStack Query (`queryKeys.reports.list`), mutation invalidates `reports.all`, `counts`. Update the Mock repo to the new model (4 realistic mock rows, clearly mock). Remove severity/escrow/chatLogs/evidence/auditTrail from every type.

### T-F067 · Reports & SOS UI
- repo: frontend
- tier: mid
- depends: T-F066, T-F006
- spec: 06-spec-people-ops.md
- files: src/presentation/features/reports/pages/ReportsPage.tsx; src/presentation/features/reports/components/ReportsQueue.tsx; src/presentation/features/reports/components/ReportDetailPanel.tsx; src/presentation/features/reports/components/ReportsKpis.tsx; src/presentation/features/reports/components/LinkedOrderModal.tsx; src/presentation/features/reports/reports.css; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/reports
- gate: frontend

Apply 06 §4 (UI part): standard layout (`PageHeader` → KPI strip from `counts` or derived page values → `ui-split` with the queue `Card` (Segmented status filter + list) and the detail `Card`); detail shows reporter/suspect cards (`Avatar`, name, phone `ui-num`, account-status pill if provided), category, description, task link (opens `LinkedOrderModal` with real fields only), moderator notes/resolver. Actions per 06 §4 with validation (`reportModerateSchema`; notes ≥ 3 for suspend/ban) and `confirm` for ban. `ReportDetailPanel.tsx` (781 lines, 75 inline styles) must be split into `ReportHeader`, `PartyCard`, `ReportActions` (each ≤ 250 lines) and use classes. Delete panels for chat logs/evidence/audit trail. Mobile: detail opens in a bottom sheet/Drawer.

### T-F068 · Users page (read + status management)
- repo: frontend
- tier: mid
- depends: T-F003, T-F006
- needs: T-B22
- spec: 06-spec-people-ops.md
- files: src/domain/entities/UserSummary.ts; src/domain/repositories/UserDirectoryRepository.ts; src/data/repositories/ApiUserDirectoryRepository.ts; src/data/repositories/MockUserDirectoryRepository.ts; src/presentation/features/users/pages/UsersPage.tsx; src/presentation/features/users/hooks/useUsers.ts; src/presentation/features/users/users.css; src/presentation/context/NavigationContext.tsx; src/presentation/features/dashboard/pages/DashboardPage.tsx; src/presentation/layouts/Sidebar.tsx; src/core/di/DependencyProvider.tsx; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/users
- gate: frontend

Implement 06 §5. Add page key `users`, sidebar item `nav_users` (section Manage, icon `UserCog`), DI `userDirectoryRepository`. `UsersPage`: toolbar (search, role `Segmented` All/Customers/Craftsmen/Admins), `DataTable` with offset pagination, status pill when the server returns `status`, actions (`Dropdown`: Suspend/Unsuspend/Block with `confirmWithReason`) only when `status` exists in the data **and** role ≠ ADMIN; else the read-only note banner. Mutation: `PUT /admin/users/:id/status` (404 ⇒ toast `err_not_found`).

### T-F069 · Live activity — remove fabricated blocks, kill timers, split the map
- repo: frontend
- tier: mid
- depends: T-F003, T-F005
- needs: T-B17
- spec: 06-spec-people-ops.md
- files: src/presentation/features/live_activity/pages/LiveActivityPage.tsx; src/presentation/features/live_activity/hooks/useLiveActivity.ts; src/presentation/features/live_activity/flags.ts; src/presentation/features/live_activity/live_activity.css; src/presentation/features/live_activity/components/OperationalMap.tsx; src/presentation/features/live_activity/components/MapCanvas.tsx; src/presentation/features/live_activity/components/MapMarkers.tsx; src/presentation/features/live_activity/components/MapLegend.tsx; src/presentation/features/live_activity/components/BusyZones.tsx; src/presentation/features/live_activity/components/ActiveJobsList.tsx; src/presentation/features/live_activity/components/SuspiciousActivity.tsx; src/presentation/features/live_activity/components/SystemStatus.tsx; src/presentation/features/live_activity/components/SosBanner.tsx; src/presentation/features/live_activity/components/LiveFeed.tsx; src/presentation/features/live_activity/components/LiveSummaryCards.tsx; src/data/mappers/LiveActivityMapper.ts; src/data/repositories/MockLiveActivityRepository.ts; src/presentation/context/LanguageContext.tsx
- audit: src/presentation/features/live_activity
- gate: frontend

Apply 06 §6: `flags.ts` `export const LIVE_FABRICATED_FIELDS_TRUSTED = false`; when false hide Busy zones, job progress bars and `amount_sar` (mapper sets `amount` only if flag true else `null`); tasks without real coordinates are not drawn (mapper must not substitute default coordinates); `useLiveActivity` → TanStack Query `queryKeys.live` with `refetchInterval 15000` (foreground), no `setInterval`; the page keeps only clock timers if any (allowed only for a visible "last updated" clock — prefer deriving from `dataUpdatedAt`). Split `OperationalMap.tsx`; move its `<style>` block to `live_activity.css`; replace all hex with tokens (`--chart-*`, `--danger`, `--success`, `--info`, `--n-*`); marker colours by meaning only. `SystemStatus` additionally shows `migrations.status` and `push` from `/health` (keys `live_migrations`, `live_push`). `MockLiveActivityRepository` may keep its own timers only inside the mock file (it is allowed to contain `setInterval`; add the file to nothing else).
