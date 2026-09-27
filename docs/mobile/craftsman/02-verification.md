# Craftsman · Verification

## 1. Goal
A craftsman must be ID-verified to accept/offer on work. Five steps; **auto-verification** (default ON,
dashboard switch) approves on submit when all evidence is complete; otherwise an admin reviews.

## 2. Backend contract (`/craftsman/verify/*`, CRAFTSMAN role)

| Step | Endpoint | Body |
|---|---|---|
| Status | `GET /status` | `{ overallStatus: NOT_STARTED\|PENDING_REVIEW\|APPROVED\|REJECTED, completedStepsCount, totalSteps: 5, personalInfoStatus, nationalIdStatus, selfieStatus, tradeSkillsStatus, backgroundCheckStatus, moderatorNotes }` (step status: `pending\|verified\|in_review`; "verified" = submitted until the account is approved) |
| 1 Personal | `POST /personal-info` | `{ firstName, lastName, dateOfBirth (ISO), gender: MALE\|FEMALE\|OTHER, nationality, residentialAddress, emergencyContactPhone? }` |
| 2 ID | `POST /upload-id` | `{ idFrontImage, idBackImage }` (uploads with `visibility=private`) |
| 3 Selfie | `POST /selfie` | `{ selfieImageUrl }` (private) |
| 4 Skills | `POST /skills` | `{ primaryCategory: <category key>, skillIds: ["name or id", …], yearsExperience ≥1 }` — unknown names are created under the category; `INVALID_CATEGORY` if the key doesn't exist |
| (opt) Certs | `POST /certifications` | `{ certImageUrl, certAuthority, insuranceLimit }` |
| 5 Submit | `POST /submit` | → `{ status: "APPROVED", isApproved: true }` (auto) or `{ status: "UNDER_REVIEW", estimatedSlaHours: 24 }` |

## 3. Rules
- Full paths: `POST /craftsman/verify/personal-info`, `POST /craftsman/verify/upload-id`, `POST /craftsman/verify/selfie`, `POST /craftsman/verify/skills`, `POST /craftsman/verify/certifications`, `POST /craftsman/verify/submit`, `GET /craftsman/verify/status`.
- Steps must be done in order (`400 "Please complete Step N…"`); all steps locked while `UNDER_REVIEW`.
- Editing any step after approval **demotes** the account (unverified until re-approved/auto-approved on resubmit).
- Editing after REJECTED/FLAGGED reopens the request (`NOT_STARTED`), admin notes are kept.
- Admin revoke (ID toggle off) → `REJECTED` with notes; accept blocked (`CRAFTSMAN_NOT_VERIFIED`).
- A request waiting in review is approved when the craftsman submits again if auto-verification is ON.

## 4. Flow
1. Dashboard loads status → progress (x/5) + 5 tiles; badges "Submitted" vs "Verified" (only when approved).
2. `REJECTED` → red banner with `moderatorNotes`; "Continue" goes to the first step needing changes.
3. Each step screen: form → upload (private) → POST → reload status → next step.
4. Review screen → `POST /submit`:
   - `APPROVED` → "Verification complete" screen → home reloads (banner gone).
   - `UNDER_REVIEW` → "Under review" screen (SLA 24h).
5. Admin decision push (`VERIFICATION`) → deep link to dashboard.

## 5. State
`CraftsmanVerificationCubit`: form fields per step + step statuses + `overallStatus`, `rejectionNotes`,
`isLoading`, `statusLoadFailed`; getters `isApproved`, `isRejected`, `completedStepsCount`.

## 6. Caching
Never cache status. Keep typed form values in the cubit while navigating steps.

## 7. Test checklist
- [ ] Complete all steps → submit → verified immediately; home/profile/verification agree.
- [ ] Dashboard switch OFF → submit → under review → admin approves → verified.
- [ ] Reject with note → banner shows note → fix ID → resubmit.
- [ ] Revoke → all screens show unverified; accept blocked.
