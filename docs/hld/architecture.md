# Crimson Club — Architecture (HLD)

High-level design for a **simple, free-tier** deployment. User base ~5 people. One app, one database, no paid services.

---

## 1. Goal

- **Product:** PWA for daily execution tracking, weekly/monthly goals, reflection, and lessons (see [product/prd.md](../product/prd.md)).
- **Deployment:** Free tier only. Minimal moving parts. Easy to run locally and deploy to Cloudflare.

---

## 2. System shape

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (PWA)                            │
│  Next.js app (React, Tailwind), installable to home screen     │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare Pages                              │
│  • Static assets + PWA                                          │
│  • Next.js server (SSR, API routes) via Pages Functions         │
│  • All server logic and API in this one app                     │
└────────────────────────────┬────────────────────────────────────┘
                             │ D1 binding
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare D1 (SQLite)                       │
│  • Users, sessions (auth)                                       │
│  • Journeys, dimensions, daily entries, goals, reviews, lessons │
│  • Single database; Drizzle ORM + migrations                    │
└─────────────────────────────────────────────────────────────────┘
```

No separate Workers project, no Redis/KV, no external auth provider. One Pages project + one D1 database.

---

## 3. Components

| Component | Responsibility |
|-----------|----------------|
| **Browser / PWA** | UI (Next.js + React + Tailwind). Mobile-first, crimson theme. Offline-capable where it makes sense (e.g. cache static assets). |
| **Pages (Next.js)** | Serve the app, SSR where needed, and **all API routes** (auth, journeys, dimensions, daily log, goals, weekly review, lessons, leaderboards). Uses D1 binding for every DB call. |
| **D1** | Single source of truth for all persistent data. Schema and migrations via Drizzle. |

---

## 4. Data flow (high level)

- **Auth:** Login/signup hit Next.js API routes → read/write `users` and `sessions` in D1. Session cookie for subsequent requests.
- **App data:** All journey, dimension, daily entry, goal, review, and lesson operations go through Next.js API routes → D1 (Drizzle). No direct DB access from the browser.
- **Static:** HTML/JS/CSS and PWA manifest served from Pages edge; no DB for static assets.

---

## 5. Boundaries and “no”s (keep it simple)

- **No microservices** — One Next.js app does all server work.
- **No separate Worker** — Pages Functions (Workers under the hood) are enough for our API.
- **No paid auth SaaS** — Email/password and sessions in D1.
- **No Redis/KV for sessions** — D1 is fine for ~5 users; keep session table small (e.g. token, user_id, expiry).
- **No R2/blob storage** — PRD says no photo uploads; no object store needed.
- **No background job queue** — Weekly/monthly logic can run on-demand when the user opens the app or hits a relevant API. No cron for v1 if we can avoid it.

---

## 6. Free-tier fit

| Need | How we cover it | Free tier |
|------|------------------|-----------|
| Hosting | Cloudflare Pages | 500 builds/month, 100k requests/day |
| Database | One D1 database | 5 GB total, 500 MB per DB |
| Auth | In-app (D1) | No extra cost |
| Server logic | Pages Functions | Same 100k/day |

For ~5 users, we stay well within these limits. If we grow, we reassess; until then, we don’t add paid services.

---

## 7. Local development

- **Docker Compose** runs the app and (optionally) wrangler for local D1 so the stack matches production.
- **wrangler dev** gives local D1 (SQLite); Next.js runs against it via the same D1 binding as in production.
- See [tech-stack/tech-stack.md](../tech-stack/tech-stack.md) for stack details and local setup.

---

## 8. Out of scope for this HLD

- Detailed API contracts → [lld/](../lld/) or code.
- Schema and tables → [db/](../db/) (design) and Drizzle migrations in repo.
- Deployment steps and env/branch mapping → [deployment/](../deployment/).

---

_Last updated: 2025-03-14_
