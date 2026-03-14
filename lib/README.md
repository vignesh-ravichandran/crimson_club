# Lib

- **API client** — Fetch wrapper for `/api/*`; auth cookie sent automatically.
- **Types** — Request/response types aligned with [docs/lld/api-contracts.md](../docs/lld/api-contracts.md); can live in `lib/types/` or next to client.
- **Utils** — formatScore, date helpers (user TZ), constants (e.g. canonical scale labels).
- **DB** — Drizzle schema, client, and migrations live here (or in `db/` at root); see [docs/db/data-model.md](../docs/db/data-model.md).

Backend code (auth helpers, session, validation) can also live under `lib/` or next to API routes.
