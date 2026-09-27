# 08 · Page · Verification Review (mockup 5)

File: `features/verification/pages/VerificationPage.tsx`. It is **the largest file** (2,972 lines,
127 `!important`). Refactor it in two tickets (split first, restyle second):
```
verification/
  pages/VerificationPage.tsx            (< 250 lines: layout, selected id, tab)
  components/ReviewQueue.tsx            (left list)
  components/SubmissionHeader.tsx       (avatar, meta, Flag / Reject / Approve all)
  components/ReviewStepTabs.tsx         (1 National ID · 2 Face match · 3 Portfolio · 4 Skills)
  components/DocumentCard.tsx           (front/back image + key-value facts + zoom)
  components/FaceMatchStep.tsx, PortfolioStep.tsx, SkillsStep.tsx
  components/ModeratorNotes.tsx
  components/ImageLightbox.tsx
```
Data: `GET /admin/verification/queue` → `{ queueCount, avgSlaRemainingHours, submissions[] }`, and
`POST /admin/verification/moderate`. Rules in [`../03-verification.md`](../03-verification.md). **Unchanged.**

## Layout
- Desktop:
  - `PageHeader` "Verification Review" / "Moderate craftsman verification submissions". Meta at the end:
    "**{queueCount}** in queue · Avg SLA **{h}h {m}m**", from `avgSlaRemainingHours`.
  - Body grid: queue `280px`, then the review column `1fr`.
- Tablet: the queue collapses into a horizontal avatar strip above the review, or a "Queue (n)" button that
  opens a `Drawer`. Pick the drawer; it's simpler.
- Mobile: the queue is the page. Tapping an item opens the review full-screen with a back button. The
  action buttons become a sticky bottom bar (Flag · Reject · Approve).

## Components
| Part | Spec |
|---|---|
| Queue card | Eyebrow "Review Queue", title "Awaiting moderation"; `ListItem`s with `Avatar 32`, name 600, "{trade} · {relative time}", chevron on the selected row; selected = `--surface-sunken`. Filter `Segmented` (Under review · Flagged · All) above the list → the `status` param. Empty → "Queue is clear" `EmptyState`, which also says "Auto-verification is ON" when enabled |
| Submission header | `Avatar 48`, name `--fs-card-title`, meta "{trade} · Submitted {relative} · ID #{short id}". Actions: Flag (`outline`, flag icon), Reject (`soft-danger`, x), **Approve all** (`primary`, check-circle). Each goes through `ConfirmDialog`. Reject and Flag require a note (prefill it from Moderator notes) |
| Step tabs | `Segmented solid` with numbered items. The active step is black with a white number circle, and inactive steps show a grey number. A step with missing evidence shows a warning dot |
| Document cards | 2-column grid (1 column on mobile). `Card` with the title "Front side"/"Back side" and a zoom `IconButton` that opens `ImageLightbox`. The image area has a 16:10 aspect ratio, `object-fit: contain`, on `--surface-sunken`. Below it a `KeyValueList` showing **only the fields the backend returns** (document type, detected name, expiry). The mockup's "OCR confidence 98.4%" appears **only if** the API returns a confidence value, coloured `--success` ≥ 90, `--warning` 70–89, `--danger` < 70 |
| Face match | Selfie and ID photo side by side with the same `DocumentCard` shell. Show a match score only if one is provided |
| Portfolio | Image grid (3/2/1 columns), lightbox on click |
| Skills | Chips list with years of experience |
| Moderator notes | `Card` with eyebrow "Moderator notes" and a `TextArea` (sunken, 4 rows) with the placeholder "Add a note for the audit log…". The note is sent as `moderatorNotes` with the decision |

## Behaviour
- After a decision: `Toast`, then auto-select the **next** queue item (keep the moderator's flow). The
  `['admin','verification']` queue is invalidated.
- A 409 `VERIFICATION_ALREADY_DECIDED` shows a toast "Already decided by another moderator" and refreshes
  the queue.
- A 400 `VERIFICATION_EVIDENCE_INCOMPLETE` shows an inline warning above the actions, naming the missing
  step.
- Keyboard shortcuts (desktop only; shown in a `?` tooltip): `J/K` next/previous, `A` approve,
  `R` reject, `F` flag. The confirm dialogs still appear.

## Acceptance
- [ ] `VerificationPage.tsx` < 250 lines, and every part is a separate component.
- [ ] No placeholder facts (OCR/expiry) are shown when the API lacks them.
- [ ] Images: lazy-loaded, with a skeleton while loading and a broken-image fallback.
- [ ] Mobile: sticky action bar and no horizontal scroll with long names in Arabic.
