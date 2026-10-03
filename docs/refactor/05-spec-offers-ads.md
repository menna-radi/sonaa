# 05 · Spec — Offers, banners & campaigns

Backend facts: [00 §3.3](00-backend-deep-dive.md) (an `Offer` and an `AdCampaign` are one banner; `AdCampaign.id === Offer.id`).
Gaps closed: O-01…O-06. Validation: [03 §7](03-data-contract.md) (`offerSchema`, `adCampaignSchema`).

## 1. Navigation (ticket F054)
Replace the six ad entries + "Craftsman Promotions" with **two** sidebar items in a section `sec_growth`:

| Nav | Page key | Content |
|---|---|---|
| `nav_offers` "Offers & Banners" | `promotions` | CRUD of banners shown in the mobile home (this is what the app really reads) |
| `nav_campaigns` "Campaigns" | `campaigns` | Scheduling/analytics view of the same banners: tabs **Active · Scheduled · Ended · Analytics** |

Keep the page keys `ads`, `scheduled`, `expired`, `ad_analytics`, `create_ad` valid so old hash links work: `NavigationContext` maps
`ads→campaigns`, `scheduled→campaigns(tab scheduled)`, `expired→campaigns(tab ended)`, `ad_analytics→campaigns(tab analytics)` using
`sessionStorage 'campaigns_tab'`; `create_ad` stays a real page (reached from the "New campaign" button).

## 2. Offers & Banners page (`features/ads/pages/PromotionsPage.tsx`, rewritten, ≤ 220 lines)

**Delete everything fabricated**: `globalFeatures`, `packages`, `CraftsmanPromotion`, `PromotionPackageCards`, `PromotionFeaturesCard`,
`PromotionPackage/PromotionFeature` types, the `craftsmanPromotions` table. Their i18n keys may stay unused.

Layout
```
PageHeader(offers_title "Offers & Banners", subtitle) [New offer]
ui-kpi-grid--4: Total offers · Active now · Scheduled · Ended           (derived from the list — real)
Toolbar: SearchInput · Segmented placement (All | Home carousel (TOP) | Featured) · Segmented state (All|Active|Paused|Scheduled|Ended)
ui-grid-auto of OfferCard   (image 16:9, title, subtitle, pills: placement, bannerType SOS, state; dates; link icon with host)
```
* `OfferCard` actions: Edit · Pause/Resume (`PUT /promotions/:id/toggle`) · Preview (opens `AndroidPhoneBannerPreview` in a Modal) · Delete (`confirm` danger).
* **State derivation** (client): `ENDED` if `endDate < now`; `SCHEDULED` if `startDate > now`; else `ACTIVE` if `isActive` else `PAUSED`. Put in `features/ads/offerState.ts` and unit-use it everywhere.
* Empty: `offers_empty` + button New offer.

### OfferFormModal (create + edit) — `FormModal`, `offerSchema`
Fields (2-column `ui-form-grid--2` ≥ 640 px): Title EN, Title AR, Subtitle EN, Subtitle AR, Button text EN, Button text AR, Image (upload via `POST /uploads` multipart → store returned `fileUrl`; show preview; accept png/jpg/webp ≤ 5 MB; recommended 1200×628), Banner type (`PROMO` | `EMERGENCY_SOS`, SOS shows red-tone helper), Placement (`TOP` | `FEATURED`), **Opens** (`NONE | URL`), Link (shown for URL; `optionalHttpUrl`), Starts (datetime-local), Ends (datetime-local) or Duration presets (24 h / 7 d / 30 d / custom → fills Ends).
* Until backend ticket B20 is deployed the **Opens** select offers only `NONE` and `URL` (constant `OFFER_TARGETS_ENABLED` in `features/ads/offerTargets.ts`); ticket F055 (needs B20) enables `CRAFTSMAN/CATEGORY/TASK/SERVICE` with an id picker.
* Mapping to API (current backend): `title=titleEn`, `subtitle=subtitleEn`, `buttonText=buttonTextEn`, `imageUrl`, `bannerType`, `placement`, `targetUrl`, `startDate`, `endDate`. **Create** → `POST /admin/promotions`; **Edit** → `PATCH /admin/promotions/:id` (send changed fields only; `targetUrl:null` clears the link). The Arabic fields are sent as `titleAr/subtitleAr/buttonTextAr` too (ignored today, honoured after B20).
* Dates are sent as ISO (`new Date(local).toISOString()`); on edit prefill via `toLocalInput(iso)`.
* Server `details[]` errors are mapped to fields with `fieldErrorsFrom`.

### Domain (ticket F050) — `src/domain/entities/Offer.ts`
```ts
export type OfferState = 'ACTIVE' | 'PAUSED' | 'SCHEDULED' | 'ENDED';
export interface Offer {
  id: string; titleEn: string; titleAr: string; subtitleEn: string; subtitleAr: string;
  buttonTextEn: string; buttonTextAr: string; imageUrl: string;
  bannerType: 'PROMO' | 'EMERGENCY_SOS'; placement: 'TOP' | 'FEATURED';
  targetType: 'NONE' | 'URL' | 'CRAFTSMAN' | 'CATEGORY' | 'TASK' | 'SERVICE'; targetId?: string; targetUrl?: string;
  isActive: boolean; startDate?: string; endDate?: string; createdAt: string;
}
export interface OfferInput extends Omit<Offer, 'id' | 'createdAt' | 'isActive'> {}
```
`OfferRepository` (new, replaces the promotion methods of `AdRepository`): `list()`, `create(input)`, `update(id, patch)`, `toggle(id)`, `remove(id)`. Mapper rule: `titleEn = item.titleEn ?? item.title`, `titleAr = item.titleAr ?? item.title` (never invent text like "Special Offer"); `targetType` default `'NONE'`.

## 3. Campaigns (`features/ads/pages/ActiveCampaignsPage.tsx` etc.)
A campaign = an `AdCampaign` row shadowing an offer; it adds **name, schedule and counters**.

* Tabs: **Active** (status ACTIVE & not ended & started), **Scheduled** (`startDate > now`), **Ended** (`endDate < now` or status ENDED), **Analytics**.
* Table columns: Campaign (thumb + name), Placement, Window (start → end), Impressions, Clicks, CTR, Status pill (`offer` domain), Actions (Edit, Pause/Resume, End, Delete).
* Remove **Budget/Spent** columns and any ROI/funnel — the backend does not track money for ads (`spent` is always 0). Keep `budget` only inside the create/edit form **if** the backend still requires it (`createAdCampaignSchema.budget` is required): label it "Internal budget (reference only)" and default to `1`. (After B20 it becomes optional and the field is removed.)
* **Fix status mapping** in `ApiAdRepository`: `ACTIVE→'Active'`, `PAUSED→'Paused'`, `ENDED→'Ended'`; `Campaign.status` union gains `'Ended'`. `updateAd` must send `status` as `ACTIVE|PAUSED|ENDED`, never UI words.
* `CreateAdPage` + `EditCampaignModal` use `adCampaignSchema`; field errors inline; `targetUrl` validated with `optionalHttpUrl`; `endDate > startDate`; `durationHours` preset chips (24/72/168/720).
* **Analytics tab** (`AdAnalyticsPage` simplified, ≤ 250 lines): KPIs = total impressions, total clicks, overall CTR, active campaigns; chart = impressions vs clicks per campaign (`GroupedBarChart`), top 5 table. Banner `AlertBanner tone="info"` when total clicks = 0: "Clicks are recorded only when the app reports taps." No fabricated series. Any time-series chart is removed unless the backend returns one.

## 4. Remove / keep
* Delete after migration: `PromotionPackageCards.tsx`, `PromotionFeaturesCard.tsx`, `features/ads/types.ts` entries for packages/features, `MockAdRepository` promotion fixtures that reference packages.
* Keep `AndroidPhoneBannerPreview.tsx` untouched (hex allowed there only). It may be given real offer props.

## 5. i18n keys
`nav_offers`, `nav_campaigns`, `sec_growth`, `offers_title`, `offers_subtitle`, `offers_new`, `offers_edit`, `offers_empty`, `offers_kpi_total|active|scheduled|ended`, `offers_field_*`, `offers_opens_none|url|craftsman|category|task|service`, `offers_placement_top|featured`, `offers_type_promo|sos`, `offers_delete_body`, `offers_preview`, `campaigns_tab_active|scheduled|ended|analytics`, `campaigns_budget_reference`, `campaigns_clicks_note`, `status_ended`, `status_scheduled`, `status_paused`, `toast_offer_saved|deleted|toggled`.

## 6. Acceptance
- [ ] Offers page shows only real data; no "Craftsman Promotions" anywhere; sidebar has 2 growth items.
- [ ] Create/edit/pause/delete offer works (bilingual fields captured); invalid link/date blocked client-side with translated errors.
- [ ] Campaign status round-trips (`ENDED` stays Ended). No budget/spend/ROI shown.
- [ ] `ui-audit --strict` clean for `features/ads` (except `AndroidPhoneBannerPreview.tsx`).
