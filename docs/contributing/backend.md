# Contributing — Backend

Conventions and checklist for **API routes, auth, DB access, and server-side logic**. Contracts: [../lld/api-contracts.md](../lld/api-contracts.md). Route list and flows: [../lld/apis-and-modules.md](../lld/apis-and-modules.md). Main contributing rules: [../../CONTRIBUTING.md](../../CONTRIBUTING.md).

---

## 1. Where code lives

| Area | Folder | Notes |
|------|--------|--------|
| API route handlers | `app/api/` | e.g. `app/api/auth/sign-in/route.ts`, `app/api/journeys/route.ts` |
| DB schema and migrations | `lib/db/` or `db/` | Drizzle schema; migrations applied via wrangler |
| Auth helpers | `lib/auth/` or next to API | Session validation, cookie set/clear, password hash/verify |
| Shared types | `lib/types/` | Request/response types aligned with api-contracts.md |
| Business logic | In route handlers or `lib/` | Keep handlers thin; move scoring, leaderboard, etc. to lib |

---

## 2. Conventions

- **Auth:** Every mutation requires a valid session. Use a shared middleware or helper that reads cookie, looks up session in DB, returns 401 if invalid. Cookie and password rules: [api-contracts §2, §3](../lld/api-contracts.md).
- **Errors:** Always return JSON `{ error: string; code?: string }` for 4xx/5xx. Use consistent status codes (401, 403, 404, 400).
- **Validation:** Validate request body and query params (types, required fields, 7-day window, weights sum 100, etc.) before DB writes. Return 400 with error body on failure.
- **DB:** Use Drizzle; no raw SQL unless necessary. Schema and types from [docs/db/data-model.md](../db/data-model.md). Canonical scale 0–5 in DB; map to/from in API if needed.
- **Dates:** All dates ISO `YYYY-MM-DD`. Week = Monday–Sunday, month = calendar month; compute using `users.timezone` (IANA).

---

## 3. Before you submit

- [ ] New or changed endpoints match [api-contracts.md](../lld/api-contracts.md) request/response shapes.
- [ ] Errors use the standard `{ error, code? }` body.
- [ ] Session is validated for all mutation routes; 401 when missing or invalid.
- [ ] If you changed an API contract or auth behavior, update api-contracts.md and any shared types (DOCS-MANDATE).
- [ ] If you changed the data model, update [docs/db/](../db/) and add a Drizzle migration.

---

## 4. References

- [docs/lld/api-contracts.md](../lld/api-contracts.md) — Request/response shapes, error format, auth contract
- [docs/lld/apis-and-modules.md](../lld/apis-and-modules.md) — Modules, routes, key flows
- [docs/db/data-model.md](../db/data-model.md) — Tables, canonical scale, indexes
- [docs/deployment/env-and-config.md](../deployment/env-and-config.md) — Env vars (D1, SESSION_SECRET)

---

_Last updated: 2025-03-14_
