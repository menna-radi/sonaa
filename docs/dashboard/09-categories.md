# 09 · Categories, sub-categories & fields

## Why it matters
Categories drive: the app's service picker, craftsman trade list (edit profile), verification skills, task
matching (craftsman skill categories ↔ `task.serviceType`), filters and search. `GET /tasks/categories` (public)
is **server-cached** — the app sees changes after the cache expires / next refresh.

## Backend contract
| Endpoint | Body |
|---|---|
| `GET /admin/categories` | list incl. inactive |
| `POST /admin/categories` | `{ key ≥3 (UPPERCASE, e.g. GARDENER), nameEn ≥3, nameAr ≥3 }` (+ `nameHe` via update) |
| `PUT /admin/categories/:id` | `{ nameEn?, nameAr?, nameHe? }` |
| `PUT /admin/categories/:id/visibility` | `{ visible: boolean }` |
| `DELETE /admin/categories/:id` | **soft delete** (`isActive = false`) — same visible effect as hiding; data and key are kept |
| `GET /admin/categories/:id/subcategories` | `page, limit (50), isActive?` |
| `POST /admin/categories/:id/subcategories` | multipart `image` + `{ nameEn ≥2, nameAr ≥2 }` or `imageUrl` |
| `PUT /admin/categories/subcategories/:id/move` | `{ targetCategoryId (uuid) }` |
| `PUT /admin/categories/subcategories/:subId/visibility` | `{ visible }` |
| `DELETE /admin/categories/subcategories/:subId` | |
| `GET/POST /admin/categories/:id/fields` | `{ label ≥2, fieldKey ≥2, fieldType: text\|number\|select\|textarea\|image, options?, isRequired? }` |
| `POST /admin/fields/:id/toggle-required`, `DELETE /admin/fields/:id` | |

## Rules
- **Always fill `nameHe`** — the app falls back to its own translation or English when it's missing.
- Delete is a soft delete (deactivates); existing tasks/skills keep referencing the key.
- The key is permanent (used by apps and tasks); only names change.

## Flow
Category list (drag to order if supported) → drawer with names (ar/en/he), visibility switch, sub-categories and
custom fields. Mutations invalidate `['admin','categories']`.

## Test checklist
- [ ] New category appears in the app's service picker and craftsman trade list after refresh.
- [ ] Hidden category disappears from the app but old tasks still display it.
