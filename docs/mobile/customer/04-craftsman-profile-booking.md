# Customer · Craftsman profile & direct booking

## 1. Backend contract

| Endpoint | Notes |
|---|---|
| `GET /craftsmen/:id?mobile=true` (optional auth) | Public profile: `rating`, `reviewsCount` (**customer reviews only**), `reviews[]`, `completedTasksCount`, `responseTimeMinutes` (median, **null** = not enough data), `trustScore` (0–1, **null** = new), `repeatCustomersPercent` (nullable), `isVerified`, `isAvailable`, `skills[]`, `title/trade`, `canChat`, `existingChatRoomId` |
| `GET /craftsmen/:id/portfolio` | images |
| `POST /craftsmen/:id/chat` | direct room → `{ chatRoomId }` |
| `POST /tasks` with `distributionType: DIRECT`, `craftsmanProfileId` | direct request (see create-task guide) |

## 2. Rules
- Metrics are measured; show **"—" / "New"** for null values, never a default number.
- Booking pre-selects the craftsman's trade (`categoryRaw`/skills) — the customer must not re-pick it.
- Direct requests fail with `CRAFTSMAN_UNAVAILABLE` / `CRAFTSMAN_NOT_VERIFIED` / `CRAFTSMAN_BILLING_INELIGIBLE`
  → translated message, keep the draft, offer "post to everyone" (broadcast).

## 3. Flow
1. Open with the list item (instant header) → fetch profile + portfolio in parallel.
2. "Message" → `POST /craftsmen/:id/chat` → open thread (reuses `existingChatRoomId`).
3. "Book" → wizard with service + craftsman prefilled, distribution DIRECT.

## 4. State & caching
Screen cubit; header can render from the passed list item; no persistent cache.

## 5. Test checklist
- [ ] New craftsman shows "New"/"—" metrics.
- [ ] Reviews count equals customer reviews only.
- [ ] Booking skips the service step and uses the craftsman's trade.
