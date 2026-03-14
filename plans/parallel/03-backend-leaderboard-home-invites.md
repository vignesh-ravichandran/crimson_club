# Parallel task 03: Backend — Leaderboard + Home + Invites

**Use this brief when running this task in a dedicated agent.** Depends on **00-foundation-auth** and **01-backend-journeys-daily** (journeys, participants, daily entries must exist).

---

## Objective

Implement Leaderboard API (normalized score %, tie-breaks), GET /api/home (aggregated payload for Home screen), and Journey invites (create invite, join by token). Request/response per api-contracts.

---

## Prerequisites

- Auth (Phase 1) and Journeys + Daily (Phase 2) done. For leaderboard and home, daily_entries and dimension data must exist. For invites, journey_invites table and private journey flow.

---

## Docs to refer to (read these)

| Doc | Path | Use for |
|-----|------|--------|
| API contracts | `docs/lld/api-contracts.md` | **§2 Error format**; **§4.7 Leaderboard** (rankings shape); **§4.8 Home** (aggregate shape); journeys invite in §4.2 |
| APIs and modules | `docs/lld/apis-and-modules.md` | §2.8 Leaderboard, §2.9 Home; §3.5 Leaderboard formula (normalized %, tie-breaks) |
| DB data model | `docs/db/data-model.md` | journey_invites table; daily_entries, daily_dimension_values, dimensions for scoring; users.timezone, users.primary_journey_id |
| Backend contributing | `docs/contributing/backend.md` | Conventions |
| Product PRD | `docs/product/prd.md` | Leaderboard: only users with ≥1 entry; normalized %; tie-break (raw score, fewer missed mandatory, earlier join); late join handling. Home: primary journey, today state, other journeys, pending backfill, pending weekly reviews. Invites: private only; email + token. |

---

## Scope (subtasks)

1. **Leaderboard API**
   - GET `/api/journeys/[id]/leaderboard?period=weekly|monthly&periodStart=YYYY-MM-DD`: compute normalized score % per user (only participants with left_at NULL and ≥1 daily entry in period). Formula: total_score_earned / total_best_possible_score * 100; period in user TZ; late join: only days after join. Sort by % desc; tie-break: raw score desc, fewer missed mandatory, earlier joined. Response `{ rankings: { rank, userId, displayName, scorePercentage, rawScore?, trend? }[] }` per api-contracts §4.7.

2. **Home API**
   - GET `/api/home`: require session. Return: primaryJourney (summary or null), primaryTodayState (today's entry + dimension values for primary journey), otherJourneys (list), pendingBackfillCount (days with no entry in last 7 days), pendingWeeklyReviews (list of { journeyId, weekStart } for current week not done). Use user's timezone for "today" and week boundaries.

3. **Invites**
   - Schema: journey_invites (id, journey_id, email, token, created_at, used_at) if not already present. Migration.
   - POST `/api/journeys/[id]/invite`: body `{ email }`. Only creator; journey must be private. Create invite row with unique token. Return 201 `{ token, inviteUrl }` or 400/403.
   - Join flow: POST `/api/journeys/[id]/join` with body `{ inviteToken }` for private journey; validate token, set used_at, add participant. Already in task 01 — ensure it's implemented or add here.

4. **Errors**
   - All 4xx use `{ error, code? }`. 401 if no session.

---

## Acceptance criteria

- [x] Leaderboard returns ranked list; normalized % correct; tie-breaks applied.
- [x] Home returns primary journey, today state, other journeys, pending backfill count, pending weekly reviews.
- [x] Create invite for private journey; join with token adds participant and marks invite used.
- [x] All responses match api-contracts; errors use standard body.

---

## Manual test steps

1. With at least two users and some daily entries in a journey: GET leaderboard for that journey (weekly). Verify order and percentages.
2. GET /api/home; verify primary journey, today state, other journeys, pending counts.
3. Create private journey; POST invite with email; use returned token in join (second user); verify participant added and invite used.

---

## Implementation summary (2025-03-14)

- **Leaderboard:** `GET /api/journeys/[id]/leaderboard?period=weekly|monthly&periodStart=YYYY-MM-DD` — session required; normalized % from total_score_earned / total_best_possible_score × 100; tie-break: raw score desc, fewer missed mandatory, earlier join; only participants with ≥1 entry in period.
- **Home:** `GET /api/home` — session required; returns primaryJourney, primaryTodayState, otherJourneys, pendingBackfillCount, pendingWeeklyReviews (uses `weekly_reviews` table from migration 0002).
- **Invite:** `POST /api/journeys/[id]/invite` — body `{ email }`; creator only; private journey only; returns 201 `{ token, inviteUrl }`. Join with token already implemented in `POST /api/journeys/[id]/join` (body `{ inviteToken }`).
- **Helpers:** `lib/date-utils.ts` — `scoreFactorForCanonicalScale`, `periodRange`, `weekStartForDate` for leaderboard and home.
- **Types:** `lib/types/api.ts` — LeaderboardRanking, LeaderboardResponse, HomeResponse, PrimaryTodayState, PendingWeeklyReview, PostInviteBody, InviteResponse.
- Manual tests: run with server up (`npm run dev` or `npm run start`). Verified: unauthenticated GET /api/home and GET leaderboard return 401 with `{ error, code? }`.

---

_Last updated: 2025-03-14_
