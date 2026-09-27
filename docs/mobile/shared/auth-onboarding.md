# Auth & onboarding (phone + OTP)

## 1. Goal & actors
Any user registers or logs in with a **phone number + 6-digit OTP**. There is **no password** in the app and
**no change-password option** anywhere (product decision). Email/password and Google/Apple routes exist on the
backend for the dashboard/legacy only.

## 2. Screens
Splash → Language → Welcome/Walkthrough → Phone entry → OTP → Profile setup (new users) → Shell (home).

## 3. Backend contract

| Step | Endpoint | Body | Success | Errors |
|---|---|---|---|---|
| Register: send OTP | `POST /auth/register/phone` | `{ phoneNumber }` | `{ status: "OTP_SENT", phoneNumber, expiresIn: 300 }` | 400 `PHONE_ALREADY_REGISTERED`, 400 invalid region, 429 `OTP_COOLDOWN` (60s), `OTP_RATE_LIMIT_HOURLY` (2/h) |
| Register: verify | `POST /auth/register/verify-otp` | `{ phoneNumber, code }` | `{ registrationToken }` | 400 `INVALID_OTP`, attempts exhausted, expired |
| Complete profile | `POST /auth/register/complete` (Bearer **registrationToken**) | `{ username (3–30, a-z0-9_), firstName, lastName, role: CUSTOMER\|CRAFTSMAN, agreeToTerms: true, email? }` + craftsman: **`title` (required)**, `locationCity?`, `yearsExperience?` | `{ accessToken, refreshToken, token, user, message }` | 400 `title is required for CRAFTSMAN role`, 409 duplicate username/email |
| Login: send OTP | `POST /auth/login/phone` | `{ phoneNumber }` | `{ status: "OTP_SENT" }` | 404 `PHONE_NOT_REGISTERED`, 429 |
| Login: verify | `POST /auth/login/verify-otp` | `{ phoneNumber, code }` | `{ accessToken, refreshToken, user }` | 400 invalid/expired |
| Session | `GET /auth/me` | — | `user` | 401 |
| Refresh | `POST /auth/refresh` | `{ refreshToken }` | new pair | 401 → logout |
| Logout | `POST /auth/logout` | `{ refreshToken }` | 200 | — |
| Sessions | `GET /auth/sessions`, `DELETE /auth/sessions/:id`, `POST /auth/logout-all` | — | devices list | — |
| Walkthrough | `GET /onboarding/status`, `PUT /onboarding/complete` | — | `{ completed }` | — |

Phone rules: only **+970** (Palestine: 059/056…) and **+972** (Israel/Jerusalem: 05x) are accepted; the server
normalizes leading `00`/`0`. Reviewer/test numbers (e.g. `+970590000000`) accept a fixed OTP and never send SMS.

## 4. Domain rules
- A newly registered **craftsman** gets a JWT with role `CUSTOMER` until they switch mode → call
  `POST /auth/switch-role {role: CRAFTSMAN}` when entering craftsman mode (see role switching).
- OTP: 5 minutes validity, 5 wrong attempts invalidate it, resend replaces the previous code.

## 5. Step-by-step flow
1. **Phone screen**: validate format locally (`PhoneNormalizer`); decide register vs login by the user's choice.
   If register returns `PHONE_ALREADY_REGISTERED` → offer "Log in instead" (auto-switch and call login).
2. **Send OTP** → navigate to OTP screen with `phoneNumber` + purpose; start a 60s resend countdown.
3. **OTP screen**: 6 boxes with autofill (SMS retriever on Android); auto-submit on the 6th digit.
4. **Verify**:
   - login → save tokens + user → `PostAuthBootstrap.run()` → shell.
   - register → keep `registrationToken` in memory → Profile setup.
5. **Profile setup**: name (split first/last), username (auto-suggest), role choice, terms checkbox. Craftsman
   extras: title (trade), city, years. Submit → tokens → bootstrap → shell (craftsman → verification banner).
6. **Walkthrough** once: `GET /onboarding/status`; after finishing, `PUT /onboarding/complete`.

## 6. State management
- `LoginCubit`, `OtpCubit` (countdown, attempts, verifying), `ProfileSetupCubit` (form + submit) — screen scoped.
- `AuthGuard.isAuthenticated` (global), `AuthLocalDataSource` (session user).
- Never keep the OTP code in state after submit.

## 7. Caching
Tokens + session user only. Never cache OTP state across app restarts (restart = start again).

## 8. Loading / error UX
- Buttons show spinners; OTP boxes shake + clear on invalid code with remaining attempts message.
- Cooldown: disable "Resend" with remaining seconds; map 429 codes to translated text.
- Network errors keep the entered phone/code.

## 9. Realtime
After login: connect socket with the access token; register push token.

## 10. Edge cases
- Switching language on the phone screen must not reset the entered number.
- App killed on the OTP screen → user restarts at phone entry (server replaces the code on resend).
- `registrationToken` expired (long pause) → 401 on complete → restart from phone.
- Two devices: sessions list lets the user revoke others.

## 11. Test checklist
- [ ] Register new number → OTP → profile → home (customer).
- [ ] Register as craftsman → craftsman mode → verification banner visible.
- [ ] Wrong OTP ×5 → invalidated, clear message.
- [ ] Resend before 60s → blocked with countdown.
- [ ] Non +970/+972 number → validation message.
- [ ] Login with unregistered number → offer registration.
- [ ] No password / change-password UI anywhere.
