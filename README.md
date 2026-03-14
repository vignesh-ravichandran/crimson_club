# Crimson Club

Habit tracker and reviewer (monorepo).

---

## Local setup (foundation + auth)

1. **Install:** `npm install`
2. **Secrets:** Copy `.env.example` to `.env.local` and set `SESSION_SECRET` (min 32 characters). For wrangler use `.dev.vars` (gitignored).
3. **Database (local):** `mkdir -p .data && npm run db:push:local` to create SQLite at `.data/local.sqlite` with `users` and `sessions`. For D1 use `wrangler d1 create crimson-club`, set `database_id` in `wrangler.toml`, then `wrangler d1 migrations apply crimson-club`.
4. **Run:** `npm run dev` — app at http://localhost:3000. Auth: POST `/api/auth/sign-up`, `/api/auth/sign-in`, `/api/auth/sign-out`; GET `/api/auth/me` (with session cookie).

---

## Where things live

| What | Where |
|------|--------|
| **Current work & status** | [plans/CURRENT.md](plans/CURRENT.md) — single source of truth for "what we're doing now" |
| **All plans (indexed)** | [plans/INDEX.md](plans/INDEX.md) · [plans/README.md](plans/README.md) |
| **Reference docs** (product, tech stack, HLD, LLD, design, DB design, deployment, services/accounts) | [docs/README.md](docs/README.md) — index; [docs/DOCS-MANDATE.md](docs/DOCS-MANDATE.md) — enforced |
| **How to contribute (any tool)** | [CONTRIBUTING.md](CONTRIBUTING.md) — when to update docs/plans, styles |
| **Raw files for tasks** (file-based input) | [input/](input/) — drop files here for the AI or tasks to read/organize/use (contents gitignored) |
| **Code** | `app/`, `components/`, `hooks/`, `lib/`, `styles/`, `public/` — Next.js App Router + API; see each folder's README |
| **Contributing (FE/BE)** | [docs/contributing/](docs/contributing/) — [frontend](docs/contributing/frontend.md), [backend](docs/contributing/backend.md) |

Cursor and other tools should use **plans/CURRENT.md** by default for context; keep docs and plans updated so the repo stays indexed and consistent.
