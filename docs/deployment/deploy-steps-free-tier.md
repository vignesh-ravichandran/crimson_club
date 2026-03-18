# Deploy to Cloudflare (free tier) — step-by-step

Deploy Crimson Club to **Cloudflare Workers + D1** using the free tier. Stack: Next.js (OpenNext adapter), D1 (SQLite), env vars for secrets.

**Free-tier limits (as of 2025):**
- **Workers:** 100,000 requests/day
- **D1:** 5 GB total storage, 5 million rows read/day
- **Pages/Workers:** 500 builds/month (if using CI)

Enough for ~5–50 users.

---

## Quick reference (after first deploy)

| What | Value |
|------|--------|
| **Live URL** | `https://app.crimson-club.workers.dev` |
| **workers.dev subdomain** | `crimson-club` (account subdomain; set in Cloudflare Dashboard → Workers & Pages → “Your subdomain”) |
| **Worker name** | `app` (in `wrangler.toml`; first part of URL: `https://<name>.<subdomain>.workers.dev`) |
| **Deploy** | `npm run deploy` (runs `predeploy` → `opennextjs-cloudflare build` then `opennextjs-cloudflare deploy`) |
| **Redeploy** | Same: `npm run deploy` (after code or config changes) |
| **Stream live logs** | `npm run logs` (or `npx wrangler tail`) — leave running and open the app in browser to see errors |
| **Versions** | Next.js 14.2.x, @opennextjs/cloudflare 1.14.x, wrangler 4.x (see `package.json`) |

**Where to get production env values (e.g. SESSION_SECRET):** Check the email with subject **“Crimson club env”** in your inbox. That mail holds the env values (or instructions) for production. Set them in Cloudflare via **Workers & Pages → app → Settings → Variables and Secrets**, or with `npx wrangler secret put SESSION_SECRET` (and paste when prompted). Never commit those values.

**APP URL:** The deploy script sets `NEXT_PUBLIC_APP_URL=https://app.crimson-club.workers.dev` during the build so it is inlined into the server bundle (reliable on Cloudflare). To use a different URL, edit the `deploy` script in `package.json` or set that env var when running the build. `wrangler.toml` also has `[vars]` with `APP_URL` as a fallback.

---

## Fix deployment (e.g. after clearing DB)

If you’ve already deployed once and need to fix issues or **recreate tables** (e.g. you cleared the DB), do this order:

1. **Set env/secrets in Cloudflare** (so the Worker has what it needs):
   - **SESSION_SECRET** — at least 32 characters. Dashboard: Workers & Pages → **app** → Settings → Variables and Secrets → Add **SESSION_SECRET**. Or: `npx wrangler secret put SESSION_SECRET` and paste when prompted.
   - **APP_URL** — Already in `wrangler.toml` under `[vars]`. Override in Variables and Secrets only if you use a different URL (e.g. custom domain).

2. **Apply D1 migrations** (recreates tables after a cleared DB):
   ```bash
   npx wrangler d1 migrations apply crimson-club --remote
   ```

3. **Deploy** from repo root:
   ```bash
   npm run deploy
   ```

4. **Verify:** Open `https://app.crimson-club.workers.dev`, sign up or sign in, create a journey. If you still see 500 or blank, run `npm run logs` in one terminal, reproduce in the browser, and fix the error shown in the logs.

---

## Fix: “Could not load home data” / journeys empty / 404 on journey sub-pages (server data layer)

On Cloudflare Workers, **server-side `fetch()` to your own app** (e.g. layout fetching `/api/journeys`, home fetching `/api/home`, or a page fetching `/api/journeys/[id]`) can fail (wrong base URL, cookies, or subrequest limits). That caused “Could not load home data”, empty journey lists, and **404 on Log today, Goals, Leaderboard, Lessons, Insights, Weekly review** (those pages fetch journey detail and call `notFound()` when the fetch failed).

**Fix:** Use a **server data layer** instead of self-fetch. The app now has:

- **`lib/data/journeys.ts`** — `getJourneysForUser()`, `getJourneyDetail()`, `getJourneyById()` (join page; no participant check).
- **`lib/data/home.ts`** — `getHomeData()` (used by home and review pages).
- **`lib/data/daily.ts`** — `getDailyData()` (today / log-today page).
- **`lib/data/goals.ts`** — `getGoal()` (goals page).
- **`lib/data/leaderboard.ts`** — `getLeaderboard()` (leaderboard page).
- **`lib/data/lessons.ts`** — `getLessons()` (lessons page).
- **`lib/data/weekly-reviews.ts`** — `getWeeklyReviewsList()` (weekly-reviews list page).

Layout, home, review, journeys list, read-through, journey detail, and journey sub-pages (today, goals, leaderboard, lessons, insights, weekly-review, weekly-reviews, invite, join) **call these functions directly** instead of `fetch(base + '/api/...')`. The same functions are used by the API routes so behavior is unchanged for client or external callers. No self-request, so it works on Workers.

If you add new Server Components that need journey or home data, use the data layer (or add new helpers in `lib/data/`) rather than fetching your own API from the server.

**Learnings (for future changes):**

- **`getJourneyDetail()`** returns `{ journey, dimensions, visibleLabels }`, not a single journey object. In page code, store the result as `detail` (or similar) and use `detail.journey.name`, `detail.journey.visibility`, etc. Using a variable named `journey` for the full return type leads to type errors (e.g. `journey.name` when `journey` is the detail shape).
- **Today / Log today page:** Define `today = todayInTimezone(user.timezone)` and pass it to both `getDailyData(id, user.id, today)` and `<TodayForm initialDate={today} ... />`. Without a `today` variable, the form has no initial date and the build fails.
- **Join page:** Use `getJourneyById(id)` for journey name (not `getJourneyDetail`), because the user is not yet a participant. `getJourneyById` does a simple journey lookup with no participant check.
- **Insights:** The page only needs journey name from the server; chart data is loaded by the client via `fetch('/api/journeys/[id]/insights')`, which works from the browser.

---

## Prerequisites

1. **Cloudflare account** — [dash.cloudflare.com](https://dash.cloudflare.com) (free).
2. **Node.js 20+** and **npm** on your machine. The deploy command (`npm run deploy`) requires Node 20+ (wrangler/opennext dependency). Use `nvm use 20` (or `fnm use 20`) if you have multiple Node versions.
3. **Code:** The app uses `getDb()` in all API routes; on Cloudflare it uses the D1 binding from `getCloudflareContext().env.DB`, and locally it uses SQLite. No extra code changes needed to deploy.

---

## 1. Create the D1 database

In a terminal (from repo root):

```bash
npx wrangler d1 create crimson-club
```

Note the **database_id** from the output (UUID). You’ll add it to `wrangler.toml` in the next step.

---

## 2. Update Wrangler config with your D1 database ID

Open `wrangler.toml` and replace the placeholder with the **database_id** from step 1:

```toml
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"   # paste your real ID here
```

The repo already has `main`, `assets`, and the D1 block configured for OpenNext.

---

## 3. Install OpenNext Cloudflare adapter

From repo root:

```bash
npm install @opennextjs/cloudflare@latest
npm install --save-dev wrangler@latest
```

Requires **Wrangler 3.99+**.

---

## 4. Add OpenNext config and scripts

**Create `open-next.config.ts` in the repo root:**

```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig();
```

**In `package.json`, ensure you have:**

```json
"scripts": {
  "build": "next build",
  "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
  "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
  "cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"
}
```

Keep your existing `dev` script for local (`next dev`).

**Add to `.gitignore`:**

```
.open-next/
```

---

## 5. Set SESSION_SECRET for production

Do **not** commit secrets. **Source of values:** see the email with subject **“Crimson club env”** for production env values (or use a new random value as below). Set them in Cloudflare:

**Option A — Wrangler:**

```bash
npx wrangler secret put SESSION_SECRET
```

When prompted, enter a string of **at least 32 characters** (e.g. from the env email, or generate with `openssl rand -hex 32`).

**Option B — Dashboard:** Workers & Pages → **app** → Settings → Variables and Secrets → Add `SESSION_SECRET` (encrypted).

---

## 6. Apply migrations to D1

Run migrations against the **remote** D1 database:

```bash
npx wrangler d1 migrations apply crimson-club --remote
```

Use the same `database_name` as in `wrangler.toml` (e.g. `crimson-club`). Repeat after any schema change.

---

## 7. (Optional) Static asset caching

Create `public/_headers` with:

```
/_next/static/*
  Cache-Control: public,max-age=31536000,immutable
```

Improves load times for static JS/CSS.

---

## 8. Deploy

From repo root:

```bash
npm run deploy
```

This runs `opennextjs-cloudflare build` then deploys to Cloudflare. Your app will be available at:

- **\*.workers.dev:** `https://app.<YOUR_SUBDOMAIN>.workers.dev` (the worker `name` in wrangler.toml is the first part; the middle part is your account’s workers.dev subdomain).

---

## 9. Change your Worker URL

Your URL is **`https://<worker-name>.<account-subdomain>.workers.dev`**. We use worker name **`app`** (in wrangler.toml), so you get `https://app.<subdomain>.workers.dev`. The **subdomain** (e.g. `crimson-club-api`) is your account’s workers.dev name.

**To get `crimson-club` in the URL (and remove `api`):**

1. Open **[Cloudflare Dashboard](https://dash.cloudflare.com)** → **Workers & Pages**.
2. Find **“Your subdomain”** (it may show e.g. `crimson-club-api.workers.dev`).
3. Click **“Change”** next to it.
4. Enter a new subdomain, e.g. **`crimson-club`** (no “api”). Save.
5. Your app URL becomes: **`https://app.crimson-club.workers.dev`**.

You can use **`tracker`** or **`reviewer`** instead of **`app`** by changing the worker **name** in `wrangler.toml` (e.g. `name = "tracker"` → `https://tracker.crimson-club.workers.dev`). Redeploy after changing.

**Custom domain:** To use e.g. `app.crimson-club.com` or `crimson-club.app`, add the domain in **Workers & Pages** → **app** → **Settings** → **Domains & Routes** → **Add** → **Custom Domain** (you must own the domain and have it on Cloudflare).

**If you see ERR_SSL_VERSION_OR_CIPHER_MISMATCH** on `app.crimson-club.workers.dev`: after changing your workers.dev subdomain, Cloudflare can take **15 minutes to 24 hours** to issue the SSL certificate for the new subdomain. Wait and retry. If it persists after 24 hours, try a different browser/incognito, or add a [custom domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) (e.g. a domain you own) which gets its own certificate quickly.

**Debug SSL from the terminal** (to confirm it's the certificate, not your browser):

```bash
./scripts/debug-ssl.sh
# Or for another URL: ./scripts/debug-ssl.sh "https://app.crimson-club.workers.dev/"
```

What to look for:

- **`ssl/tls alert handshake failure`** and **`no peer certificate available`** → the server is not presenting a certificate for this hostname. So the cert for `*.crimson-club.workers.dev` is not ready yet (wait 15 min–24 h after subdomain change) or there is a coverage issue for multi-level subdomains on workers.dev.
- **DNS resolves** (e.g. to Cloudflare IPs) but **TLS fails** → same conclusion: certificate not active for this hostname.
- If later you see **`SSL certificate verify ok`** and **`Server certificate`** in the openssl output, SSL is working; try the browser again.

---

## 10. Debugging 500 Internal Server Error

If the deployed app returns **500**, fix the two most common causes first, then confirm with logs.

**1. Set SESSION_SECRET (required)**  
The app throws if `SESSION_SECRET` is missing or shorter than 32 characters.

- **Dashboard:** **Workers & Pages** → **app** → **Settings** → **Variables and Secrets** → Add **SESSION_SECRET** (at least 32 characters).
- **Terminal:** `npx wrangler secret put SESSION_SECRET` and enter a 32+ character value when prompted.

**2. Apply D1 migrations**  
The app needs the database tables.

```bash
npx wrangler d1 migrations apply crimson-club --remote
```

**3. See the real error in the terminal**  
Stream live logs from the Worker while you open the app in the browser:

```bash
npm run logs
# or: npx wrangler tail
```

Leave this running, then visit `https://app.crimson-club.workers.dev/` in the browser. The terminal will show the request and any exception (e.g. `SESSION_SECRET must be set`, D1 errors, or stack traces). Fix the cause, then redeploy if you changed code or config.

---

## 11. After first deploy

- **Sign up** with a real email/password and use the app.
- **Seeds:** The seed script (`npm run seed`) is for local SQLite. For production, create users via the app or run a one-off script that uses the D1 HTTP API or a deploy that injects the DB binding.

---

## Code (already done)

The app uses `getDb()` from `@/lib/db`: on Cloudflare it uses `getCloudflareContext().env.DB` with `drizzle-orm/d1`; locally it uses `better-sqlite3`. All API routes and session code call `getDb()` per request. No extra code changes are required to deploy.

<!-- Legacy section title kept for anchor -->
## Code changes for D1 (implemented)

The app previously used a single **Node SQLite** `db`. It now uses **D1** on Cloudflare via the binding.

**Required:**

1. **Use D1 when running on Cloudflare**  
   In API routes and server code that need the DB:
   - Get the D1 binding from the request/context (e.g. `getCloudflareContext()` from `@opennextjs/cloudflare` or the env passed into the Worker).
   - Build a Drizzle instance with `drizzle(env.DB)` from `drizzle-orm/d1` instead of the current `drizzle-orm/better-sqlite3`.
   - Use that instance for all queries in that request; do not rely on a global singleton for production.

2. **Keep local dev on SQLite (optional)**  
   For `next dev` you can keep using `@/lib/db` with better-sqlite3 so local dev doesn’t require D1. For production and `npm run preview`, use only D1.

3. **Drizzle schema**  
   The same Drizzle schema and migrations work for both SQLite (local) and D1 (production); only the driver and how you create the `db` instance change.

**References:**

- [Drizzle ORM – Cloudflare D1](https://orm.drizzle.team/docs/connect-cloudflare-d1)
- [OpenNext Cloudflare – Bindings](https://opennext.js.org/cloudflare/bindings)
- [Cloudflare Workers – D1](https://developers.cloudflare.com/d1/)

Once these changes are in place, the steps above (create D1, wrangler, OpenNext, secrets, migrations, deploy) will produce a working deployment on the free tier.

---

## Checklist

- [ ] Cloudflare account created
- [ ] D1 database created (`wrangler d1 create crimson-club`)
- [ ] `wrangler.toml` (or wrangler.jsonc) has correct `database_id`, OpenNext `main`/`assets` if needed
- [ ] `@opennextjs/cloudflare` and `wrangler@latest` installed
- [ ] `open-next.config.ts` added
- [ ] `package.json` has `preview` and `deploy` scripts
- [ ] `.open-next/` in `.gitignore`
- [ ] `SESSION_SECRET` set in Cloudflare (Wrangler secret or dashboard)
- [ ] DB layer uses D1 in production via `getDb()` (already implemented)
- [ ] Migrations applied: `wrangler d1 migrations apply crimson-club --remote`
- [ ] `npm run deploy` succeeds
- [ ] App loads at https://app.<subdomain>.workers.dev (or custom domain)
- [ ] If 500: SESSION_SECRET set, migrations applied, check Real-time Logs

---

_Last updated: 2025-03-15_
