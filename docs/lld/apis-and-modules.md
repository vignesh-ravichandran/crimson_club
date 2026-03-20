# Crimson Club — LLD: APIs and modules

Low-level design for **modules**, **API routes**, and **key flows**. Implements [HLD architecture](../hld/architecture.md) (Next.js on Pages + D1). **Strict request/response shapes and auth contract:** [api-contracts.md](api-contracts.md). References: [product/prd.md](../product/prd.md), [tech-stack/tech-stack.md](../tech-stack/tech-stack.md), [db/data-model.md](../db/data-model.md). Frontend: [frontend-design.md](frontend-design.md).

---

## 1. Module breakdown

All server logic lives in the same Next.js app (API routes or server actions). Logical modules map to route groups and DB tables.

| Module | Responsibility | Main DB tables |
|--------|----------------|----------------|
| **Auth** | Sign up, sign in, sign out, session validation, current user | users, sessions |
| **Users** | Profile (display name, timezone), primary journey selection | users |
| **Journeys** | CRUD journeys, list (active/archived), join/leave, invite (private) | journeys, journey_participants, journey_invites |
| **Dimensions** | Read-only after journey create; part of journey payload | dimensions, journey_visible_labels |
| **Daily** | Get/create/update daily entry; get/upsert dimension values; optional reflection | daily_entries, daily_dimension_values |
| **Goals** | Create/update weekly and monthly goals; set outcome (7-day window) | goals |
| **Weekly review** | Get/create/update weekly review; mark done; notes | weekly_reviews |
| **Lessons** | Create lesson; list/filter by journey (and dimension) | lessons |
| **Leaderboard** | Compute weekly/monthly rank for a journey (normalized score %) | daily_entries, daily_dimension_values, dimensions (read) |
| **Insights** | Derived: strongest/weakest dimension, score vs last week, etc. | daily_entries, daily_dimension_values, dimensions (read) |

No separate services; each “module” is a set of API handlers and shared helpers (e.g. Drizzle queries) in the repo.

---

## 2. API overview

Base: Next.js API routes under e.g. `/api` (or App Router route handlers). All mutations require a valid session (cookie). Request/response JSON unless noted.

### 2.1 Auth

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| POST | `/api/auth/sign-up` | Register | `{ email, password, publicDisplayName }` | `201` + set session cookie; or `4xx` |
| POST | `/api/auth/sign-in` | Login | `{ email, password }` | `200` + set session cookie; or `401` |
| POST | `/api/auth/sign-out` | Logout | — | `200` + clear cookie |
| GET | `/api/auth/me` | Current user | — | `200` `{ id, email, publicDisplayName, primaryJourneyId, timezone }` or `401` |

### 2.2 Users

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| PATCH | `/api/users/me` | Update profile | `{ publicDisplayName?, timezone? }` | `200` updated user |
| PATCH | `/api/users/me/primary-journey` | Set primary journey | `{ journeyId }` | `200` or `404` |

### 2.3 Journeys

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| GET | `/api/journeys` | List my journeys (active + archived) | query: `?archived=true` optional | `200` `{ journeys[] }` with summary (emoji, name, today state, etc.) |
| GET | `/api/journeys/[id]` | Journey detail + dimensions + visible labels | — | `200` journey + dimensions + labels; or `404` |
| POST | `/api/journeys` | Create journey (with dimensions, weights, labels) | body: journey + dimensions + visibleLabels | `201` `{ id }`; or `400` (e.g. weights ≠ 100) |
| DELETE | `/api/journeys/[id]` | Hard delete (creator only; confirm in UI) | — | `204` or `403`/`404` |
| POST | `/api/journeys/[id]/join` | Join (public: direct; private: optional token) | `{ inviteToken? }` | `200` or `400`/`404` |
| POST | `/api/journeys/[id]/leave` | Leave journey | — | `200` (set left_at) |
| POST | `/api/journeys/[id]/invite` | Create invite (private; creator) | `{ email }` | `201` `{ token, inviteUrl }` or `400` |

### 2.4 Daily entries

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| GET | `/api/journeys/[id]/daily?date=YYYY-MM-DD` | Get daily entry for user + journey + date | — | `200` `{ entry?, dimensionValues[] }` or empty |
| PUT | `/api/journeys/[id]/daily` | Upsert daily entry + dimension values | `{ date, dimensionValues: { dimensionId: canonicalScale }[], reflectionNote? }` | `200` entry; 7-day edit window enforced in app |
| GET | `/api/journeys/[id]/daily/range?from=&to=` | Entries in date range (for insights/calendar) | — | `200` `{ entries[] }` |

### 2.5 Goals

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| GET | `/api/journeys/[id]/goals?goalType=weekly|monthly&periodStart=` | Get goal for period | — | `200` goal or empty |
| POST | `/api/journeys/[id]/goals` | Create goal | `{ goalType, periodStart, periodEnd, goalStatement }` | `201` |
| PATCH | `/api/journeys/[id]/goals/[goalId]` | Update outcome (7-day window after period end) | `{ outcome: 0..5 }` | `200` |

### 2.6 Weekly reviews

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| GET | `/api/journeys/[id]/weekly-reviews?weekStart=` | Get review for week | — | `200` review or empty |
| PUT | `/api/journeys/[id]/weekly-reviews` | Upsert weekly review | `{ weekStart, done, notes? }` | `200` |
| GET | `/api/journeys/[id]/weekly-reviews/list?limit=` | List past reviews (for Review tab) | — | `200` `{ reviews[] }` |

### 2.7 Lessons

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| GET | `/api/journeys/[id]/lessons` | List lessons | query: `?dimensionId=&sourceType=` | `200` `{ lessons[] }` |
| POST | `/api/journeys/[id]/lessons` | Create lesson | `{ text, sourceDate, sourceType, dimensionId? }` | `201` `{ id }` |

### 2.8 Leaderboard

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| GET | `/api/journeys/[id]/leaderboard?period=weekly|monthly&periodStart=` | Ranked list (normalized score %); only users with ≥1 entry | — | `200` `{ rankings[] }` (rank, displayName, scorePercentage, trend, etc.) |

### 2.9 Insights (chart data)

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| GET | `/api/journeys/[id]/insights` | Chart data: last 14 days **daily total %** (sum of weight×factor; **can be negative** for missed-mandatory penalty), per-dimension **mean factor×100** (−50…100), radar/heatmap/bar use same factors as [db/data-model.md](../db/data-model.md) §1; weighted contribution stacked bar (signed stacks); last 84 days heatmaps | — | `200` `{ dailyScores, dimensionScores: { dimensionId, name, emoji, averageFactor, scorePercentage }[], heatmapDailyScores, dailyDimensionScores, stackedBarData }` or `404` |

### 2.10 Home / aggregates

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| GET | `/api/home` | Primary journey summary, today state, other journeys, pending backfill count, pending weekly reviews | — | `200` aggregated payload for Home screen |

All dates in request/response use ISO date string `YYYY-MM-DD`. Period boundaries (week = Mon–Sun, month = calendar month) are computed in the API using the **user’s timezone** from `users.timezone`.

---

## 3. Key flows (server-side)

### 3.1 Auth

1. **Sign up:** Validate email/password/displayName → hash password → insert `users` → create session → set cookie.
2. **Sign in:** Lookup user by email → verify password → create session → set cookie.
3. **Session check:** Read cookie → lookup `sessions` by token (hash) → if valid and not expired, attach `user` to request; else 401.

### 3.2 Create journey

1. Validate body: 2–8 dimensions, weights sum 100, visibility, dates.
2. Insert `journeys` (creator_id = current user).
3. Insert `dimensions` (journey_id, position, weight, is_mandatory, etc.).
4. Insert `journey_visible_labels` (default or provided labels).
5. Insert `journey_participants` (creator as first participant).
6. Return journey id.

### 3.3 Daily log (upsert)

1. Resolve user + journey + date; check 7-day edit window (date must be within 7 days in the past or today in user TZ).
2. Upsert `daily_entries` (user_id, journey_id, date, reflection_note).
3. For each dimension in journey: upsert `daily_dimension_values` (daily_entry_id, dimension_id, canonical_scale).
4. Return updated entry + dimension values. Score is computed in app or on read from dimension weights + canonical scale factors (see [db/data-model.md](../db/data-model.md) §1).

### 3.4 Weekly review

1. Get or create `weekly_reviews` row for (user_id, journey_id, week_start).
2. Update `done` and `notes`; optionally link “save as lesson” to lessons create.
3. Summary (strongest/weakest dimension, score vs last week) is computed from daily_entries for that week when serving the Weekly Review screen (can be same API or a small helper).

### 3.5 Leaderboard

1. Determine period (week = Mon–Sun, month = calendar month) from `periodStart` and user timezone.
2. For each participant with `left_at IS NULL`, compute total_score_earned and total_best_possible_score for that period (only days they have an entry).
3. Normalized % = total_score_earned / total_best_possible_score × 100. Sort by % desc, then tie-break: raw score, fewer missed mandatory, earlier join.
4. Return ordered list with rank, displayName, scorePercentage, trend (compare to previous period if needed).

---

## 4. Errors and validation

- **401** — Not authenticated (no or invalid session).
- **403** — Forbidden (e.g. not creator for delete; not participant for journey).
- **404** — Resource not found (journey, goal, etc.).
- **400** — Validation (e.g. weights ≠ 100, date outside edit window, duplicate invite).
- Use consistent JSON error body e.g. `{ error: string, code?: string }` for client handling.

---

## 5. References

| Doc | Content |
|-----|--------|
| [api-contracts.md](api-contracts.md) | Request/response shapes, error format, auth & session contract |
| [product/prd.md](../product/prd.md) | Requirements, scale, goals, 7-day rules, leaderboard formula |
| [tech-stack/tech-stack.md](../tech-stack/tech-stack.md) | Next.js, D1, Drizzle, free tier |
| [db/data-model.md](../db/data-model.md) | Tables, canonical scale, indexes |
| [hld/architecture.md](../hld/architecture.md) | Single app, Pages + D1 |
| [frontend-design.md](frontend-design.md) | Routes, state, components, conventions |

---

_Last updated: 2025-03-14_
