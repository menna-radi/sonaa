# 07 · Offers, banners & ad campaigns

## Concepts
- **Offer** (`Offer` table) = banner shown in the app (`GET /offers`). Placement `TOP` (home carousel) or
  `FEATURED`; `bannerType` `PROMO` or `EMERGENCY_SOS`; active window `startDate/endDate`.
- **Ad campaign** (`AdCampaign`) = budgeted campaign; creating/updating one **syncs an Offer with the same id**.
- **Target** — what a tap does in the app: in-app (`CRAFTSMAN`/`CATEGORY`/`TASK`/`SERVICE` + `targetId`) or an
  external link (`targetType: URL` + http(s) `targetUrl`). Audience values (CUSTOMERS/CRAFTSMEN/ALL) are **not**
  targets and are ignored as such.

## Backend contract
| Endpoint | Body |
|---|---|
| `GET /admin/promotions` | list |
| `POST /admin/promotions` | `{ title ≥3, subtitle ≥3, buttonText (default "Claim Offer"), imageUrl, bannerType, placement, targetUrl? (http/https; scheme added if missing), startDate?, endDate?, durationHours? }` |
| `PATCH /admin/promotions/:id` | any of the above; `targetUrl: null` removes the link |
| `PUT /admin/promotions/:id/toggle` | active on/off |
| `DELETE /admin/promotions/:id` | |
| `GET/POST /admin/ads`, `PUT /admin/ads/:id`, `PUT /admin/ads/:id/status {ACTIVE\|PAUSED\|ENDED}`, `DELETE /admin/ads/:id` | `{ name ≥3, budget > 0, placement?, imageUrl?, description?, ctaText?, targetType?, targetId?, targetUrl?, startDate?, endDate?, durationHours? }` |

Image: upload via `POST /uploads` (multipart `file`) → `fileUrl`. Recommended 1200×628.

## Flow
1. Create form with live phone preview; optional **Offer link** field validated as http(s) before submit.
2. Mutation → invalidate `['admin','promotions']` (+ `['admin','ads']` for campaigns).
3. Toggle active optimistically (rollback on error).

## Test checklist
- [ ] Offer with link → app shows link button and opens the browser.
- [ ] Campaign without link → app banner has no link button (no fake `/offers/...` path).
- [ ] Expired offer disappears from the app.
