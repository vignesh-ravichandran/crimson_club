# Parallel task 00: Foundation + Auth (do first — sequential)

**Use this brief when running this task in a dedicated agent.** No parallel — do before any other task.

---

## Objective

Set up the Next.js app with Tailwind, Drizzle, D1, and env config; implement auth (sign-up, sign-in, sign-out, session, me). All other backend and frontend work depends on this.

---

## Prerequisites

- None. This is the first implementation task.

---

## Docs to refer to (read these)

| Doc | Path | Use for |
|-----|------|--------|
| Tech stack | `docs/tech-stack/tech-stack.md` | Next.js, D1, Drizzle, local dev |
| HLD | `docs/hld/architecture.md` | Single app, Pages + D1 |
| DB data model | `docs/db/data-model.md` | All tables (users, sessions, etc.), canonical scale, types |
| DB ER | `docs/db/er-diagram.md` | Relationships |
| API contracts | `docs/lld/api-contracts.md` | Auth request/response shapes, **§2 Error format**, **§3 Auth & session contract** (cookie name, HttpOnly, Secure, SameSite, Max-Age; password hashing) |
| APIs and modules | `docs/lld/apis-and-modules.md` | Auth routes list, session flow |
| Env and config | `docs/deployment/env-and-config.md` | SESSION_SECRET, D1 binding, .dev.vars |
| Backend contributing | `docs/contributing/backend.md` | Conventions, where code lives |
| Colour palette | `docs/design/colour-palette.md` | Tailwind tokens for root layout |

---

## Scope (subtasks)

1. **Init project**
   - Next.js (App Router), TypeScript, Tailwind. Match `docs/tech-stack/tech-stack.md`.
   - Extend Tailwind with tokens from `docs/design/colour-palette.md` (e.g. brand.crimson, bg.app, text.primary).

2. **Drizzle + D1**
   - Wrangler config: D1 database binding (e.g. `DB`). See `docs/deployment/env-and-config.md`.
   - Drizzle schema: tables from `docs/db/data-model.md` — at minimum `users`, `sessions` for this task. (Full schema can be added now or in Phase 2.)
   - Migrations in repo; apply locally: `wrangler d1 migrations apply`.

3. **Env**
   - `.env.example` with placeholders (e.g. SESSION_SECRET=; no real secrets). Document in example.
   - App reads SESSION_SECRET and D1 binding per `docs/deployment/env-and-config.md`. Use `.dev.vars` for local secrets (gitignored).

4. **Auth API**
   - POST `/api/auth/sign-up`: body per `docs/lld/api-contracts.md` §3.3; validate email, password, publicDisplayName; hash password (bcrypt); insert user; create session; set cookie per §3.1; return 201 + user.
   - POST `/api/auth/sign-in`: body email, password; verify password; create session; set cookie; return 200 + user. 401 on failure.
   - POST `/api/auth/sign-out`: clear session in DB; clear cookie; 200.
   - GET `/api/auth/me`: require valid session (read cookie, lookup session); return 200 with user or 401. Response shape per api-contracts.
   - Session cookie: name, HttpOnly, Secure (false in dev if HTTP), SameSite Lax, Path /, Max-Age. Opaque token stored in cookie; server stores hash in `sessions`.

5. **Auth helper**
   - Shared helper/middleware: get session from cookie (hash token, lookup in `sessions`, check expiry). Attach user to request for protected routes. Use in all future mutation endpoints.

6. **Root layout**
   - Minimal `app/layout.tsx`; import global CSS. No auth UI yet (Phase 5).

---

## Acceptance criteria

- [x] `npm run dev` (or wrangler dev) runs; app loads.
- [x] D1 has `users` and `sessions` tables (migrations applied). (Local: SQLite via `npm run db:push:local`; D1: `wrangler d1 migrations apply` with database_id in wrangler.toml.)
- [x] Sign-up (curl/Postman): 201, Set-Cookie, user in response.
- [x] Sign-in: 200, Set-Cookie, user in response.
- [x] GET /api/auth/me with cookie: 200, user. Without cookie or invalid: 401.
- [x] Sign-out: 200, cookie cleared.
- [x] All 4xx/5xx responses use body `{ error: string; code?: string }` per api-contracts §2.

---

## Manual test steps

1. Start app and wrangler (if needed). Apply migrations.
2. POST /api/auth/sign-up with `{ "email": "test@example.com", "password": "password123", "publicDisplayName": "Test" }`. Expect 201 and Set-Cookie.
3. GET /api/auth/me with that cookie. Expect 200 and user object.
4. POST /api/auth/sign-out (with cookie). Expect 200.
5. GET /api/auth/me again. Expect 401.
6. POST /api/auth/sign-in with same email/password. Expect 200 and Set-Cookie. GET /api/auth/me again; expect 200.

---

### Session summary (foundation complete)

- **Init:** Next.js 14 (App Router), TypeScript, Tailwind with colour tokens from `docs/design/colour-palette.md`.
- **DB:** Drizzle schema `lib/db/schema.ts` (users, sessions); migrations in `drizzle/`; wrangler.toml with D1 binding `DB`. Local dev uses SQLite at `.data/local.sqlite` via `npm run db:push:local`.
- **Env:** `.env.example` documents SESSION_SECRET; app reads it; `.dev.vars` gitignored for wrangler.
- **Auth API:** POST sign-up, sign-in, sign-out; GET me. Cookie `crimson_session`, HttpOnly, SameSite Lax, Max-Age 30 days, Secure in production.
- **Auth helper:** `lib/auth/session.ts` — `getSessionUser()`, `createSession()`, `destroySession()`, `sessionCookieOptions()`.
- **Manual tests:** All steps passed (sign-up → me → sign-out → me 401 → sign-in → me 200).

_Last updated: 2025-03-14_
