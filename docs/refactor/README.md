# Admin dashboard — Refactor v2 (backend-aligned, Overview-standard)

**Goal:** make the admin dashboard match what the Arox backend really does today (craftsman subscriptions, commission, free tasks,
offers, disputes, audit…), remove everything fake, add the missing validation, and bring every page up to the standard of the
Overview page. Written so a **low-cost model (Claude Haiku 4.5)** can implement it unattended, ticket by ticket.

## Read in this order
| # | File | What it is |
|---|---|---|
| 00 | [Backend deep-dive](00-backend-deep-dive.md) | Every admin endpoint, data model, business rule, and **28 defects (G-xx)** found in `Arox-backend` |
| 01 | [Frontend gap analysis](01-frontend-gap-analysis.md) | What is missing / fake / broken in the dashboard (IDs X-, B-, O-, P-, S-, V-) |
| 02 | [The Overview standard](02-overview-standard.md) | The 16-point contract every page must meet + layout primitives + canonical page skeleton |
| 03 | [Data contract](03-data-contract.md) | Types, repository interfaces, API-client fix, query keys, **zod schemas**, status domains, capability fallback |
| 04 | [Billing & Payments spec](04-spec-billing.md) | New Billing center (receipts, commission, subscribers, plans, rates) + payouts page |
| 05 | [Offers & campaigns spec](05-spec-offers-ads.md) | Real offers CRUD, campaigns, honest analytics |
| 06 | [People & operations spec](06-spec-people-ops.md) | Craftsmen, tasks (14 statuses), **disputes (new UI)**, verification, reports, users, live activity |
| 07 | [Platform spec](07-spec-platform.md) | Settings (team, platform, audit, security), service mgmt, broadcast, notifications, chat, analytics, login, sidebar |
| 08 | [Backend tickets](08-backend-tickets.md) | 25 additive, backward-compatible API tickets (track **B**) |
| 09a/b/c | [Frontend tickets](09a-tickets-foundation-overview-billing.md) · [09b](09b-tickets-offers-people-ops.md) · [09c](09c-tickets-platform-hardening.md) | 55 tickets (track **F**) with exact files and steps |

## Non-negotiable rules (apply to every ticket)
1. **No fake data.** If the backend does not return it: show `—` or hide it. Currency is **ILS (₪)** via `formatMoney`. Arox never holds job money (no escrow).
2. **Tokens only** — no hex/rgb in `.tsx`/feature CSS, no undefined CSS variables. Inline `style={{}}` only for runtime values (≤ 6 per file).
3. **Every string through `t()`** with **en + ar + he** entries in `LanguageContext.tsx`. Logical CSS (`inline-start/end`) — the app runs LTR and RTL.
4. **Server state = TanStack Query** via hooks; no `useEffect` fetching, no `setInterval` for data. Repositories return `Result<T>`; hooks `unwrap()`.
5. **Validate every form** with the zod schemas of 03 §7 and show field errors; map server errors with `errorMessage()` / `fieldErrorsFrom()`.
6. **Dangerous/money actions** go through `useConfirm`/`confirmWithReason`; results through `useToast`. No `window.confirm/alert`.
7. **No `any`**, no `@ts-ignore`. Files stay small (page ≤ 250, component ≤ 300, hook ≤ 200 lines).
8. **Optional backend endpoints** (B-tickets) are used only when present (404 ⇒ hide the feature). The dashboard must work against today's backend.
9. **Mock repositories keep working** (`VITE_USE_MOCK=true`): update the Mock twin whenever you change a repository interface.
10. Edit **only** the files listed in the ticket. Never touch `.env`, `dist/`, `node_modules/`. Do not run git commit/reset — the runner does.
11. Keep brand text as is (`brand_name` key). Do not rename the product.

## Glossary for translations (use exactly these terms)
| English | العربية | עברית |
|---|---|---|
| Craftsman | حرفي | בעל מקצוע |
| Customer | عميل | לקוח |
| Subscription | اشتراك | מנוי |
| Plan | باقة | חבילה |
| Commission | عمولة | עמלה |
| Receipt / proof of payment | إيصال الدفع | אישור תשלום |
| Free tasks | مهام مجانية | משימות חינם |
| Locked (account) | مقفل | נעול |
| Approve / Reject | موافقة / رفض | אישור / דחייה |
| Dispute | نزاع | סכסוך |
| Offer / Banner | عرض / بانر | מבצע / באנר |
| Campaign | حملة | קמפיין |
| Task | مهمة | משימה |
| Payout / Withdrawal | سحب | משיכה |
| Audit log | سجل التدقيق | יומן ביקורת |
| Verification | التحقق | אימות |
| Broadcast | بث إشعارات | שידור הודעות |
| Settings | الإعدادات | הגדרות |
Hebrew you are not sure about: copy the English text into `he` and add `// TODO-HE` on that line.

## How to run it (unattended)
Prerequisites: Claude Code CLI logged in (`claude --version`), Node ≥ 20, both repos have **clean working trees**
(`Arox-front-end` on `dash-dev`, `Arox-backend` on `main`). The runner creates its own branches
(`refactor/dash-v2` in the frontend, `refactor/admin-api-v2` in the backend), commits the specs once, then one commit per ticket.

```powershell
cd "D:\Mohamed Ali\Arox App\Arox-front-end"

node scripts/refactor/run.mjs --dry-run            # validate tickets and print the plan (changes nothing)
node scripts/refactor/run.mjs --track frontend     # frontend only (works against today's backend)
node scripts/refactor/run.mjs                      # everything: backend tickets first, then frontend
node scripts/refactor/run.mjs --status             # table of DONE / FAILED / BLOCKED / PENDING
node scripts/refactor/run.mjs --retry-failed       # give FAILED/BLOCKED tickets another go
node scripts/refactor/run.mjs --only T-F010,T-F011 # specific tickets
```
Keep the machine awake while it runs (Windows: *Settings → System → Power → Screen and sleep → Never*, or run
`powercfg /change standby-timeout-ac 0` first). Closing the terminal stops it; **re-running resumes** from `.refactor-state.json`.

### What the runner does per ticket
1. Builds a prompt from the ticket + spec references and runs `claude -p --model claude-haiku-4-5-20251001` (tier **mid** tickets use `claude-sonnet-5-5`; `--all-low` forces Haiku everywhere).
2. Runs the **gate**: scope check (only the ticket's files) → `npm run build` → ESLint on touched files (0 errors) → `scripts/refactor/gate.mjs` (inline-style budget, no hex, no `<style>`, no `setInterval`, no `any`, i18n en/ar/he complete, no undefined CSS vars). Backend: `tsc --noEmit` + ESLint on touched files (+ unit tests when the ticket adds them).
3. **Pass → commit.** Fail → retries up to 3 times feeding the exact gate output back, then one escalation attempt with the stronger model, then **rolls the ticket back and continues** (dependents are marked BLOCKED).
4. Rate limits / overload: sleeps with back-off (1 min → 1 h, up to 24 h total) and retries — it does not give up.
5. Logs: `.refactor-logs/<ticket>-aN.log` (full model output), `STATUS.txt` (live), `SUMMARY.md` (at the end). State: `.refactor-state.json` (git-ignored).
Useful flags: `--attempts 3 --timeout-min 45 --max-budget-usd 5 --no-escalate --low <model> --mid <model> --from T-F031 --backend-dir <path>`.

### Order and phases
`B01…B25` (backend: security fixes first) → `F001-F006` foundation → `F010-F011` **Overview standard** → `F020-F040` Billing & Payments →
`F050-F056` Offers & campaigns → `F060-F069` People & operations → `F070-F079` Platform & shell → `F090-F095` hardening, a11y, docs, report.
The last ticket writes `REPORT.md` (build/lint/audit results and known gaps).

### Manual verification after the run (what the runner cannot judge)
* `npm run dev`, then check at 390 / 1024 / 1440 px, English/Arabic/Hebrew, light/dark: Overview, Billing (all 5 tabs), Payments, Offers, Campaigns, Craftsmen, Tasks + Disputes, Verification, Reports, Users, Settings, Service management, Broadcast, Notifications, Chat, Analytics, Login.
* Review the diff per ticket (`git log --oneline refactor/dash-v2`), merge the branches when satisfied. Deploy the **backend first** (new migrations: `20261004000100_audit_ip`, `20261004000200_dispute_resolution`), then the dashboard.

## Status (filled by T-F094 from `.refactor-state.json`)
_Not run yet._
