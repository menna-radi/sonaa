# 03 · Verification queue

## Rules
- A craftsman is verified when the request is `APPROVED` **and** `CraftsmanProfile.isVerifiedId = true`.
- **Auto-verification** (default ON): a craftsman who completes all 5 steps is approved on submit; the queue
  then only contains requests submitted while it was OFF, or resubmissions.
- Approve requires `UNDER_REVIEW` + personal info + both ID sides + selfie + ≥1 skill
  (`VERIFICATION_NOT_REVIEWABLE` / `VERIFICATION_EVIDENCE_INCOMPLETE`).
- Deciding twice → 409 `VERIFICATION_ALREADY_DECIDED`.

## Backend contract
| Endpoint | Body / query | Notes |
|---|---|---|
| `GET /admin/verification/queue` | `status?` (`UNDER_REVIEW`, `PENDING_SUBMISSION`, `APPROVED`, `REJECTED`, `FLAGGED`, alias `PENDING_REVIEW`, `ALL`), `page`, `limit` | `{ queueCount, avgSlaRemainingHours, submissions[] }` (default = under review + pending submission); unknown status → 400 `INVALID_STATUS` |
| `POST /admin/verification/moderate` | `{ requestId, decision: APPROVED\|REJECTED\|FLAGGED\|REQUEST_CHANGES, moderatorNotes? }` | notifies the craftsman; REQUEST_CHANGES = FLAGGED |
| `GET/PUT /admin/settings/auto-verification` | `{ enabled: boolean }` | audit-logged |
| `POST /admin/craftsmen/:id/verify/item` | `{ itemKey: nationalId\|selfieMatch\|tradeLicense\|bankIban\|backgroundCheck\|insurance, approved }` | `nationalId=false` **revokes** (request → FLAGGED + notification); `nationalId=true` only if already approved (else 400 `VERIFICATION_REVIEW_REQUIRED`) |

## Flow
1. Queue table: name, phone, submitted at, SLA remaining, steps complete; filter by status; `refetchInterval 30s`.
2. Detail drawer: personal info, ID front/back + selfie (private uploads — fetch with the admin token), skills,
   certifications, history (`VerificationEvent`s).
3. Approve / Reject (notes required for reject/flag) → mutation → invalidate `['admin','verification']` +
   `['admin','craftsmen']`.
4. Settings switch "Auto-verification" with a clear explanation of both modes.

## Test checklist
- [ ] Reject with notes → craftsman app shows the note.
- [ ] Revoke ID → craftsman app shows rejected and cannot accept.
- [ ] Auto ON → new submissions don't appear under review.
