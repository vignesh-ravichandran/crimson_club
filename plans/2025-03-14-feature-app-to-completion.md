# Plan: App to completion (with manual testing)

- **Status:** In progress
- **Started:** 2025-03-14
- **Parallel briefs:** All 8 briefs in `plans/parallel/` (00–07) created; use them for agent handoff.
- **Goal:** Take Crimson Club from current state (docs + structure) to a working app; manual testing after each phase to avoid bug pile-up.

---

## Principles

1. **Manual test as we go** — After each phase (or parallel batch), run through the affected flows manually; fix bugs before moving on.
2. **Subtasks** — Each phase has concrete subtasks; tick them and update "Last updated" in this file.
3. **Parallel work** — Where possible, tasks are split so multiple agents can work in parallel; each parallel task has a full brief in `plans/parallel/` with doc references.

---

## Phase 1: Foundation + Auth (sequential — do first)

**No parallel.** One agent or sequential work. Blocks all other work.

### 1.1 Foundation

- [ ] Init Next.js (App Router), TypeScript, Tailwind; align with [docs/tech-stack/tech-stack.md](docs/tech-stack/tech-stack.md).
- [ ] Add Drizzle + D1: wrangler config, D1 binding; schema from [docs/db/data-model.md](docs/db/data-model.md); migrations in repo.
- [ ] Apply migrations (local): `wrangler d1 migrations apply` (or equivalent). Verify DB has tables.
- [ ] Env: [docs/deployment/env-and-config.md](docs/deployment/env-and-config.md). Add `.env.example` (no secrets); use SESSION_SECRET and D1 in app.
- [ ] Root layout and minimal app shell (no auth yet): `app/layout.tsx`, basic styles from [docs/design/colour-palette.md](docs/design/colour-palette.md) in Tailwind config.

**Manual test:** `npm run dev` (or wrangler dev) runs; can open app; DB has tables (e.g. via Drizzle Studio or a quick query).

### 1.2 Auth backend

- [ ] Session store: create session on login/sign-up, lookup by token hash; cookie per [docs/lld/api-contracts.md](docs/lld/api-contracts.md) §2, §3.
- [ ] POST /api/auth/sign-up, POST /api/auth/sign-in, POST /api/auth/sign-out, GET /api/auth/me. Request/response per api-contracts.
- [ ] Password hashing (bcrypt); store hash in `users`; never return password. Auth helper: validate session middleware for protected routes.

**Manual test:** Sign up (e.g. via curl or Postman); sign in; get /api/auth/me with cookie; sign out; me returns 401 without cookie.

---

## Phase 2: Backend — Journeys + Daily (sequential after Phase 1)

**Brief:** [plans/parallel/01-backend-journeys-daily.md](parallel/01-backend-journeys-daily.md)

- [ ] Journeys CRUD API (list, get, create, delete); dimensions + journey_visible_labels on create; journey_participants (creator on create).
- [ ] Join/leave journey API.
- [ ] Daily entry: GET/PUT for one date; daily_dimension_values; 7-day edit window; reflection note.
- [ ] Types and validation per api-contracts; errors per api-contracts §2.

**Manual test:** Create journey (2–8 dimensions, weights 100); get journey; add daily entry for today; edit within 7 days; join/leave (if multi-user).

---

## Phase 3: Backend — Goals, Weekly review, Lessons (parallel with Phase 4)

**Brief:** [plans/parallel/02-backend-goals-weekly-lessons.md](parallel/02-backend-goals-weekly-lessons.md)

- [ ] Goals API: create, get by period, PATCH outcome (7-day window after period end).
- [ ] Weekly reviews API: get, upsert (done, notes).
- [ ] Lessons API: list (filter by dimension, sourceType), create.

**Manual test:** Create weekly goal; complete weekly review; save a lesson; list lessons.

---

## Phase 4: Backend — Leaderboard, Home, Invites (parallel with Phase 3)

**Brief:** [plans/parallel/03-backend-leaderboard-home-invites.md](parallel/03-backend-leaderboard-home-invites.md)

- [ ] Leaderboard API: normalized score %, tie-breaks; weekly/monthly.
- [ ] GET /api/home: primary journey, today state, other journeys, pending backfill count, pending weekly reviews.
- [ ] Journey invites: create invite (private), join by token; use invite in participants flow.

**Manual test:** Home returns correct payload; leaderboard ranks correctly; invite link joins user to private journey.

---

## Phase 5: Frontend — Auth UI + App shell (after Phase 1)

**Brief:** [plans/parallel/04-frontend-auth-shell.md](parallel/04-frontend-auth-shell.md)

- [ ] Sign-in, sign-up pages (layout, no bottom nav); form → API; set cookie; redirect to app.
- [ ] Session provider / context; protected app layout: if no session, redirect to sign-in.
- [ ] App layout: bottom nav (Home, Journeys, Review, Profile); active state per [docs/design/colour-palette.md](docs/design/colour-palette.md).
- [ ] Root layout, Tailwind tokens from colour-palette.

**Manual test:** Sign up in browser; sign in; see app shell with nav; sign out; redirected to sign-in.

---

## Phase 6: Frontend — Home, Journeys list, Journey detail, Today view (after Phase 2 + 5)

**Brief:** [plans/parallel/05-frontend-home-journeys-today.md](parallel/05-frontend-home-journeys-today.md)

- [ ] Home: primary journey hero card, today status, other journeys list; fetch from /api/home and journeys.
- [ ] Journeys list page; journey cards; create journey CTA (can link to wizard stub).
- [ ] Journey detail: tabs Today / Review / Insights; Today view: purpose strip, weekly goal card, Weekly Review card, monthly goal card, today's dimensions (chips), done state, optional reflection. Autosave dimension values per frontend-design.

**Manual test:** Log in; see home with primary journey; open journey; mark today's dimensions; see done state; optional reflection saves.

---

## Phase 7: Frontend — Goals UI, Weekly Review UI, Create journey wizard (after Phase 3 + 5)

**Brief:** [plans/parallel/06-frontend-goals-weekly-create-journey.md](parallel/06-frontend-goals-weekly-create-journey.md)

- [ ] Goal cards (weekly, monthly) on Today view; goal update flow (outcome in 7-day window).
- [ ] Weekly Review screen: summary, prompts, notes, Save as lesson, Mark done.
- [ ] Create journey wizard: steps per [docs/design/ux-blueprint.md](docs/design/ux-blueprint.md) (basics, foundation, dimensions, weights, labels, review, primary). Validate weights = 100; submit to POST /api/journeys.

**Manual test:** Create journey via wizard; set weekly goal; complete weekly review; update goal outcome.

---

## Phase 8: Frontend — Review tab, Lessons, Insights, Leaderboard, Profile, Invites (after Phase 3 + 4 + 5)

**Brief:** [plans/parallel/07-frontend-review-lessons-insights-profile-invites.md](parallel/07-frontend-review-lessons-insights-profile-invites.md)

- [ ] Review tab: pending weekly reviews, recent reflections, recent lessons (cross-journey).
- [ ] Journey Review view: foundation, dimension guidance, weekly review archive, daily reflection archive, lessons list (filter).
- [ ] Insights view: summary chips, callouts, charts (radar, trend, etc.), leaderboard section last.
- [ ] Profile: display name, email, primary journey selector, sign out.
- [ ] Invite flow: create invite (private journey), copy link; join via token.

**Manual test:** Review tab shows data; journey Review shows foundation and lessons; Insights shows charts and leaderboard; profile updates primary journey; invite link works.

---

## Phase 9: Integration + manual E2E

- [ ] Full flow: sign up → create journey (wizard) → set primary → log today → weekly review → save lesson → view insights/leaderboard.
- [ ] Backfill: log a past day (within 7 days); verify score and window.
- [ ] Private journey: create private → invite → join with second user → leaderboard.
- [x] Fix any bugs found; update docs if behaviour changed.

### Phase 9 integration fixes (2025-03-14)

- **Home:** Pending weekly reviews link corrected from `/journeys/[id]/review?weekStart=` to `/journeys/[id]/weekly-review?weekStart=` so it matches the actual route.
- **Review tab:** Replaced placeholder with real content: fetches `/api/home`, shows pending weekly reviews with links to `/journeys/[id]/weekly-review?weekStart=`, plus "Browse journeys" link.
- **Build:** `npm run build` passes.
- **E2E API script:** `scripts/e2e-api-flow.sh` — with dev server up, run `BASE_URL=http://localhost:3000 ./scripts/e2e-api-flow.sh` (use actual port). Covers sign up → create journey → set primary → log today (using server "today" from home) → weekly review → lesson → leaderboard. Run completed successfully.

### Manual test steps (run in browser)

1. **Full flow:** Sign up (new email) → Journeys → Create journey (wizard: name, 3 dims 34/33/33, public) → Profile → set primary journey → Home (see primary) → Log today (dimension chips, Save) → Weekly review (done + notes, Save) → Lessons (add lesson) → Insights / Leaderboard.
2. **Backfill:** On a journey’s Today page, pick a past date within the 7-day strip; set values and Save; confirm score/entry and that edit window is respected.
3. **Private + invite:** Create private journey → Invite (email, copy link) → open link in incognito or second browser → sign in (or sign up) → Join → confirm on journey; check leaderboard with both users.

---

## Parallelism summary

| Order | What | Parallel? |
|-------|------|-----------|
| 1 | Phase 1: Foundation + Auth | No (first) |
| 2 | Phase 2: Backend Journeys + Daily | No (needed for 3–4) |
| 3 | Phase 5: Frontend Auth + Shell | Can start after Phase 1 |
| 4 | Phase 3 (Goals/Weekly/Lessons) and Phase 4 (Leaderboard/Home/Invites) | **Yes — two agents** |
| 5 | Phase 6 (Home/Journeys/Today) | After 2 + 5 |
| 6 | Phase 7 (Goals/Weekly/Create wizard) and Phase 8 (Review/Insights/Profile/Invites) | **Yes — two agents** (after Phase 3, 4, 5) |
| 7 | Phase 9: E2E | No (final) |

**Parallel task briefs** (full details + doc refs for agents): [plans/parallel/](parallel/).

---

## Linked files

- [plans/parallel/00-foundation-auth.md](parallel/00-foundation-auth.md) — Phase 1 (do first)
- [plans/parallel/01-backend-journeys-daily.md](parallel/01-backend-journeys-daily.md) — Phase 2
- [plans/parallel/02-backend-goals-weekly-lessons.md](parallel/02-backend-goals-weekly-lessons.md) — Phase 3
- [plans/parallel/03-backend-leaderboard-home-invites.md](parallel/03-backend-leaderboard-home-invites.md) — Phase 4
- [plans/parallel/04-frontend-auth-shell.md](parallel/04-frontend-auth-shell.md) — Phase 5
- [plans/parallel/05-frontend-home-journeys-today.md](parallel/05-frontend-home-journeys-today.md) — Phase 6
- [plans/parallel/06-frontend-goals-weekly-create-journey.md](parallel/06-frontend-goals-weekly-create-journey.md) — Phase 7
- [plans/parallel/07-frontend-review-lessons-insights-profile-invites.md](parallel/07-frontend-review-lessons-insights-profile-invites.md) — Phase 8

---

_Last updated: 2025-03-14_
