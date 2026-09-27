# 01 · Auth & session

## Backend contract
| Endpoint | Body | Result |
|---|---|---|
| `POST /auth/login` | `{ identifier (email/phone/username), password }` | `{ accessToken, refreshToken, user }` — reject in UI if `user.role !== 'ADMIN'` |
| `POST /auth/refresh` | `{ refreshToken }` | new pair |
| `POST /auth/logout` | `{ refreshToken }` | revoke |
| `GET /auth/me` | — | current admin |
| `GET /auth/sessions`, `DELETE /auth/sessions/:id`, `POST /auth/logout-all` | — | session management |

Rate limit: 30 auth requests/min per IP.

## Flow
1. Login form → `POST /auth/login` → verify `role === 'ADMIN'` → store tokens → `GET /auth/me` → dashboard.
2. Route guard: no token → login; `/auth/me` 401 after refresh → login.
3. Idle timeout (recommended 30 min): logout + clear React Query cache (`queryClient.clear()`).
4. Logout: `POST /auth/logout`, clear storage + query cache + socket.

## State & caching
`['admin','me']` staleTime ∞ (invalidate on login/logout). Never persist query cache across logins.

## Test checklist
- [ ] Customer/craftsman credentials → "admins only".
- [ ] Expired access token → transparent refresh.
- [ ] Logout in one tab → other tabs redirect on next request.
