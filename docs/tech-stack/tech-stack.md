# Crimson Club — Tech stack

Single source of truth for languages, frameworks, and tooling. Update this doc when the stack changes (see [DOCS-MANDATE.md](../DOCS-MANDATE.md)).

---

## 0. Deployment goal: simple and free

- **Target:** Free-tier deployment; user base ~5 people.
- **Implications:** One app, one database, no paid services. Auth and sessions live in our own DB (D1). No Redis, no separate auth SaaS unless we add it later. See [hld/architecture.md](../hld/architecture.md) for the high-level shape.

---

## 1. Stack overview

| Layer | Technology | Role |
|-------|------------|------|
| **Frontend** | Next.js | React framework, SSR/SSG, routing, API routes (or hybrid with Workers) |
| **UI** | React | Component model, hooks |
| **Language** | TypeScript | Typing across app and backend |
| **Styling** | Tailwind CSS | Utility-first CSS, design tokens (align with [design/colour-palette.md](../design/colour-palette.md)) |
| **Charts** | Recharts | React chart library for Insights (line, radar); design tokens (brand.crimson) per colour-palette |
| **Runtime / edge** | Cloudflare Workers | Serverless/edge execution (API, server logic, or full Next on CF) |
| **Database** | Cloudflare D1 | SQLite-based serverless DB (backed by SQLite locally) |
| **Data layer** | Drizzle ORM | Schema, migrations, type-safe queries for D1 |
| **Local dev** | Docker + Docker Compose | Consistent local environment (Node, wrangler, services) |

---

## 2. Why these choices

- **Next.js + React + TypeScript** — Standard, great DX, broad ecosystem; fits PWA and mobile-first (see [product/prd.md](../product/prd.md)).
- **Tailwind** — Fast UI work, easy to align with our colour palette and design system.
- **Cloudflare Workers + D1** — Edge runtime and serverless DB; good fit for a PWA with global users and simple ops.
- **Drizzle** — Lightweight ORM with first-class D1 support, migrations, and TypeScript.
- **Docker + Docker Compose** — One-command local setup; same stack for every developer and CI.

---

## 3. Local development

### How we run locally

- **Docker Compose** — Primary way to run the app and dependencies locally. Defines services (e.g. Next.js app, wrangler dev for Workers + D1, any other containers). One command to start the full stack.
- **Wrangler** — `wrangler dev` runs Workers and **local D1** (Miniflare/SQLite under the hood). Local and production D1 are separate unless you use `--remote`.
- **Next.js** — Either run via Docker (e.g. `next dev` in a container) or locally with `npm run dev`; must match how we integrate with Cloudflare (e.g. `@opennextjs/cloudflare` or Pages/Workers adapter).
- **Drizzle** — Migrations and schema: use `wrangler d1 migrations apply` for local D1, or point Drizzle at the local SQLite file created by wrangler (e.g. under `.wrangler/state/...`) for `drizzle-kit studio` or custom scripts.

Concrete commands and Compose layout will live in the repo (e.g. `docker-compose.yml`, `package.json` scripts, and a short **Runbook** in `docs/deployment/` or README).

### Is this stack easy for developing locally?

**Yes, with a few caveats.**

| Aspect | Ease | Notes |
|--------|------|--------|
| **Next.js + React + TypeScript + Tailwind** | ✅ Very easy | Standard `npm run dev`; hot reload; familiar to most. |
| **Docker + Docker Compose** | ✅ Easy | One command to start; no “works on my machine” if everyone uses Compose. Slight learning curve if the team is new to Docker. |
| **Drizzle** | ✅ Easy | Works with local D1/SQLite; migrations and Studio are straightforward once D1 binding is set. |
| **Cloudflare Workers + D1** | ⚠️ Slightly more setup | Not “just Node”: you need **wrangler** and (optionally) **Node 18+** for compatibility. Local D1 is SQLite, so it’s fast and simple. `wrangler dev` gives you a local Workers + D1 environment that mirrors production. Main nuance: some bindings (e.g. R2, KV) may need extra config or remote for full parity. |

**Summary:** The stack is **easy enough for local development**:

- Docker Compose gives a single, consistent environment.
- Next.js, React, TypeScript, and Tailwind behave like any standard front-end setup.
- D1 locally is “just” SQLite, so no extra DB install.
- The only non-standard part is Cloudflare (wrangler + local Workers/D1), which is well documented and works well once the project and `wrangler.toml`/`wrangler.jsonc` are set up.

Recommendation: document the exact “first-time setup” (Node version, wrangler install, Docker Compose up, env vars) in the repo README or `docs/deployment/` so onboarding is a single path.

---

## 4. Free-tier deployment (production)

We run entirely on Cloudflare free tier. No paid add-ons for ~5 users.

| Component | What we use | Free-tier note |
|-----------|-------------|----------------|
| **Hosting** | Cloudflare Pages | Free: 500 builds/month, 100k requests/day (Pages Functions). Enough for 5 users. |
| **Database** | Cloudflare D1 | Free: 5 GB total storage, 500 MB per DB. All app data + auth + sessions in one D1 DB. |
| **Auth** | In-app (email/password) | No Auth0/Clerk etc. Users and sessions stored in D1; implement with Next.js API routes + D1. |
| **Runtime** | Pages Functions (Workers) | Same 100k/day limit. Next.js server/API runs here via Cloudflare adapter. |
| **Static** | Pages | PWA assets and static output served from the edge. |

We avoid: separate Workers paid plan, R2/KV unless needed, any third-party paid APIs. Keep one Next.js app on Pages talking to one D1 database.

---

## 5. References

- [Cloudflare D1 — Local development](https://developers.cloudflare.com/d1/best-practices/local-development)
- [Cloudflare D1 — Limits](https://developers.cloudflare.com/d1/platform/limits)
- [Cloudflare Pages — Limits](https://developers.cloudflare.com/pages/platform/limits)
- [Drizzle ORM — D1](https://orm.drizzle.team/docs/get-started/d1-new)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)

---

_Last updated: 2025-03-14_
