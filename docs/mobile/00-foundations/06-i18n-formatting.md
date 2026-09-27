# 05 · i18n, formatting & RTL

## 1. Translation files

- `assets/i18n/{ar,en,he}.json` — **flat dotted keys** (`"workflow.chat_open"`) and nested objects are both
  supported by `AppLocalizations`. Prefer flat keys for new work.
- `context.tr('key', args: {'count': '3'})` translates; `context.trOrRaw(key)` returns the key when missing
  (use for dynamic keys like `skill.<slug>`, `edit_profile.trades.<name>`).
- Edit JSON with a Node script (UTF-8, preserve CRLF). PowerShell 5.1 corrupts UTF-8 without BOM.
- Every new key must exist in **all three** files (checked by `Arox-backend/scripts/e2e/i18n_audit.js`).

## 2. Backend-provided text

| Content | Source | Rule |
|---|---|---|
| Category names | `nameEn/nameAr/nameHe` | Pick by locale; `nameHe` may be null → app translation → `nameEn` |
| Task titles/descriptions | `title/titleAr/titleHe` | Server localizes via `Accept-Language`; show as-is |
| Notification titles/bodies | English server text | Map to `notif.<slug>.title/body` via `NotificationText`; fall back to server text |
| Error messages | English | Map by `errorCode`; never show raw English in ar/he |
| Skills | free text names | `SkillText.localize` → `skill.<slug>` or raw |

## 3. Formatting

- Currency: `AppSettingsCubit.state.currency` (₪ / ILS); format integers without decimals (`350 ₪`).
- Dates: `intl` `DateFormat` with the current locale; relative times via `TimeAgoHelper` (translated).
- Numbers: Western digits everywhere (consistent with backend and payments).
- Phone numbers: +970 / +972 only (backend rejects others) — normalize with `PhoneNormalizer`.

## 4. RTL checklist

- [ ] No `left/right` paddings or `Positioned(left:)` in feature code.
- [ ] Arrows/chevrons flip with `Directionality.of(context)`.
- [ ] Mixed Latin/Arabic strings (addresses, names) use `TextDirection` auto or `Bidi` isolates where needed.
