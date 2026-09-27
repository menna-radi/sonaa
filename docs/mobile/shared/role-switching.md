# Role switching (customer ⇄ craftsman)

## 1. Goal
One account can act as customer or craftsman. The toggle on home switches the whole app mode.

## 2. Backend contract

| Endpoint | Body | Result |
|---|---|---|
| `POST /auth/switch-role` | `{ role: "CUSTOMER" \| "CRAFTSMAN" }` | `{ accessToken, refreshToken, user }` — JWT role updated; missing profile is created (craftsman profile starts unverified, title "Specialist") |
| `GET /profile?role=CRAFTSMAN` | — | craftsman profile (404 if none) |

## 3. Rules
- The **JWT role** drives role-gated routes (`authorize("CRAFTSMAN")`): billing, earnings, payout, verification,
  availability, portfolio. Mode switch **must** swap tokens.
- A user can never act on both sides of the same task (server rejects self-accept; lists exclude self-posted tasks).
- Each mode has its own inbox, task lists and home (server filters by acting role).

## 4. Flow
1. User taps the toggle → show a short blocking overlay.
2. `POST /auth/switch-role` → save tokens + user.
3. Account-epoch bump for role-scoped singletons; reconnect socket with the new token.
4. Navigate to the target shell (bottom nav changes); target home loads (`loadHomeData`).
5. Failure → stay in the current mode, show error.

## 5. State
`CustomerHomeCubit.activeRole` drives the toggle UI; the shell listens and swaps navigation. Keep the other
mode's cubits alive but idle (no polling) so switching back is instant.

## 6. Test checklist
- [ ] Switch to craftsman → billing/earnings screens load (no 403).
- [ ] Chat started as customer is not in the craftsman inbox.
- [ ] Switch back → customer home shows own tasks; craftsman surfaces stop polling.
