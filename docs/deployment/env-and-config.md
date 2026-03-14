# Crimson Club — Environment and config

**Reference only.** List of environment variables and config the app expects. No secret values in this doc; store secrets in env or secret manager per environment. See [services-and-accounts.md](services-and-accounts.md) (when added) for where each env is set (e.g. Cloudflare dashboard, `.dev.vars`).

---

## 1. Required for runtime

| Variable / config | Purpose | Example (non-secret) | Where set |
|-------------------|---------|----------------------|-----------|
| **D1 database binding** | DB access (Cloudflare) | Binding name e.g. `DB` in wrangler; D1 database id in Cloudflare account | `wrangler.toml` / Pages project settings |
| **SESSION_SECRET** (or equivalent) | Signing/verifying session token or encrypting cookie | Min 32 chars; random | Env / Cloudflare Pages env vars / `.dev.vars` for local |
| **NODE_ENV** | `development` \| `production` | Usually set by platform | Env |

On Cloudflare Pages, D1 is attached via project binding; no `DATABASE_URL`. Session secret is in env vars (or secret). Local dev: wrangler uses `.dev.vars` for secrets and local D1.

---

## 2. Optional / feature-specific

| Variable / config | Purpose | When needed |
|-------------------|---------|-------------|
| **NEXT_PUBLIC_APP_URL** (or similar) | Full app URL for invite links, redirects | If we build invite URLs or redirects that need origin |
| **LOG_LEVEL** | `debug` \| `info` \| `warn` \| `error` | If we add structured logging and want to tune verbosity |

Add rows here when we introduce new config (e.g. feature flags, third-party API keys). Never commit secret values; reference “set in env” or “set in Cloudflare secrets”.

---

## 3. Local development

- **.dev.vars** (in repo root or app root, gitignored): `SESSION_SECRET=...` and any other secrets for `wrangler dev`.
- **D1:** Local D1 created by `wrangler dev`; no extra env for DB URL. Migrations: `wrangler d1 migrations apply` against local or remote (see [tech-stack](../tech-stack/tech-stack.md)).
- **Next.js:** If the app reads `process.env.SESSION_SECRET` etc., ensure `.env.local` or `.dev.vars` is loaded in local dev (per Next + wrangler setup). For `next dev`, use `.env.local` with `SESSION_SECRET`; local DB is SQLite at `.data/local.sqlite` (create with `npm run db:push:local`). See repo README for first-time setup.

---

## 4. Checklist before first deploy

- [ ] D1 database created in Cloudflare; binding configured in Pages project (or wrangler).
- [ ] `SESSION_SECRET` (or chosen name) set in Cloudflare Pages env vars / secrets.
- [ ] Migrations applied to production D1 (`wrangler d1 migrations apply --remote` or equivalent for your pipeline).
- [ ] No secrets in repo or in this doc; only variable names and purpose.

---

_Last updated: 2025-03-14_
