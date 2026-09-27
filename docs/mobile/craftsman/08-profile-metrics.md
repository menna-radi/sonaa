# Craftsman · Profile, metrics, portfolio & availability

## 1. Backend contract

| Endpoint | Notes |
|---|---|
| `GET /profile?role=CRAFTSMAN` | profile + `activeJobsCount`, `completionRate` ("67%"), **measured** `responseTimeMinutes` (median reply/accept minutes, 30 days, null = no data), `trustScore` (0–1, null until first finished task), `repeatCustomersPercent` (null = none), `trustFactors { ratingAverage, ratingsCount, completionRate, disputesCount, verified }`, `isVerifiedId` |
| `PUT /profile?role=CRAFTSMAN` | `{ firstName?, lastName?, email?, avatarUrl?, title?, locationCity?, locationLat?, locationLng? }` |
| `PUT /profile/availability { isAvailable }` | toggle |
| `PUT /craftsman/location { latitude, longitude }` | live base location (craftsman role) |
| `POST /craftsmen/portfolio { imageUrl, caption? }`, `DELETE /craftsmen/portfolio/:imageId`, `GET /craftsmen/:id/portfolio` | portfolio |

## 2. Trust score formula (server)

(Alias: `PUT /craftsmen/location` behaves like `PUT /craftsman/location`.)

`0.45·(avg rating/5, neutral 0.8 if unrated) + 0.30·completion + 0.15·(1 − disputes/finished) + 0.10·ID verified`.
Stored back to the profile (ranking uses it).

## 3. UI rules
- Null metrics → "—" / "New"; never show defaults (old bug: everyone showed 15 min and 100/100).
- Trust card: score colour (≥80 green, ≥60 amber, else red) + factor chips (rating·count, completion, disputes,
  ID) instead of marketing text.
- Verification tile subtitle: verified → "All checks complete", else "Complete verification to start receiving jobs";
  reload profile after returning from verification.
- Main trade list from `GET /tasks/categories` (see profile/settings guide).

## 4. Test checklist
- [ ] New craftsman: response "—", trust "New", repeat "—".
- [ ] After first closed job: trust shows a score and factors.
- [ ] Availability toggle reflects immediately and survives reload.
