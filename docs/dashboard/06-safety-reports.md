# 06 · Safety reports & SOS

## Backend contract
| Endpoint | Body / query |
|---|---|
| `GET /admin/reports` | `page, limit, status?` (`PENDING, UNDER_INVESTIGATION, RESOLVED, DISMISSED`) |
| `PUT /admin/reports/:id/moderate` | `{ action: dismiss\|suspend\|ban, notes? }` |
| Emergencies | pushed to admins via socket (`broadcastToAdmin`) + live activity; location updates stream while active |

Report fields: reporter, suspect, category (`INAPPROPRIATE_CONDUCT, VEHICLE_SAFETY, VERBAL_ABUSE, THEFT,
PROPERTY_DAMAGE, OTHER`), description, attachment, task/chat link.

## Flow
1. SOS: full-width alert banner + sound on socket event; map with live location; "Resolved" when the user marks safe.
2. Reports queue: filter by status; drawer with linked chat transcript (admin sees all visibilities) → action.
3. Actions are audit-logged; suspend/ban also affect the craftsmen table (invalidate both).

## Test checklist
- [ ] SOS from app → banner within seconds, location updates move the pin.
- [ ] Report from chat links the room and shows the transcript.
