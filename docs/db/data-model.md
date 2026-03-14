# Crimson Club — Database design (data model)

Design reference for Cloudflare D1 (SQLite). Implement with Drizzle ORM and migrations in the repo. See [product/prd.md](../product/prd.md) for requirements; [tech-stack/tech-stack.md](../tech-stack/tech-stack.md) for D1 + Drizzle.

---

## 1. Canonical scale (internal)

All scoring uses this scale. Store as integer in DB; app maps to/from labels.

| Value | Name             | Score factor | Use |
|-------|------------------|--------------|-----|
| 0     | missed_optional  | 0.00         | Optional dimension not logged by 7-day window close |
| 1     | missed_mandatory | -0.50        | Mandatory dimension not logged by 7-day window close |
| 2     | low              | 0.25         | |
| 3     | medium           | 0.50         | |
| 4     | high             | 0.75         | |
| 5     | excellent        | 1.00         | |

User-facing labels are per journey (e.g. "Showed up", "Built") and live in `journey_visible_labels`; they do not change scoring.

---

## 2. Entities and relationships (overview)

| Entity | Purpose |
|--------|---------|
| **users** | Account: email, password hash, display name, primary journey, timezone |
| **sessions** | Auth sessions (token, expiry) |
| **journeys** | Journey container: name, emoji, visibility, dates, optional foundation text |
| **journey_participants** | User ↔ Journey membership; `left_at` = left journey (no leaderboard, history kept) |
| **dimensions** | 2–8 per journey; weight, mandatory flag, optional meaning text |
| **journey_visible_labels** | One row per journey: 5 display labels for the scale (editable later) |
| **daily_entries** | One per user per journey per calendar day; optional reflection note |
| **daily_dimension_values** | One per dimension per daily entry: canonical scale value |
| **goals** | Journey-level weekly or monthly goal; outcome in canonical scale; editable 7 days after period |
| **weekly_reviews** | One per user per journey per week; done flag + optional notes |
| **lessons** | Saved insight: text, source date/type, optional dimension link |
| **journey_invites** | Private journeys: pending invite by email + token |

**Derived (no tables):** Daily score = sum(dimension_weight × score_factor) per entry. Leaderboards = computed from daily_entries in period. Score history = query daily_entries by range.

---

## 3. Table definitions

### 3.1 users

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | text (UUID) | no | PK |
| email | text | no | Unique; used for login |
| password_hash | text | no | Bcrypt or similar |
| public_display_name | text | no | Leaderboard name |
| primary_journey_id | text | yes | FK → journeys.id; user can change anytime |
| timezone | text | no | IANA e.g. `America/New_York`; all period calculations use this |
| created_at | integer (Unix ms) | no | |
| updated_at | integer (Unix ms) | no | |

- Unique: `email`.

---

### 3.2 sessions

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | text (UUID) | no | PK |
| user_id | text | no | FK → users.id |
| token_hash | text | no | Hash of session token sent to client |
| expires_at | integer (Unix ms) | no | |
| created_at | integer (Unix ms) | no | |

- Index on `token_hash` (or token lookup column) and `expires_at` for auth checks.

---

### 3.3 journeys

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | text (UUID) | no | PK |
| creator_id | text | no | FK → users.id |
| name | text | no | |
| description | text | yes | |
| emoji | text | no | Single emoji |
| visibility | text | no | `'public'` \| `'private'`; fixed after creation |
| start_date | text (date) | no | ISO date |
| end_date | text (date) | yes | If set, journey freezes at this date; view-only, archive |
| why_exists | text | yes | Journey foundation (editable) |
| success_vision | text | yes | |
| what_matters_most | text | yes | |
| what_should_not_distract | text | yes | |
| strengths_to_play_to | text | yes | |
| created_at | integer (Unix ms) | no | |
| updated_at | integer (Unix ms) | no | |

- After creation: dimensions, weights, mandatory flags, visibility are **immutable**. To change, user must hard-delete and create a new journey.

---

### 3.4 journey_participants

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | text (UUID) | no | PK |
| journey_id | text | no | FK → journeys.id |
| user_id | text | no | FK → users.id |
| joined_at | integer (Unix ms) | no | |
| left_at | integer (Unix ms) | yes | When set, user left; no leaderboard inclusion; history remains |

- Unique: `(journey_id, user_id)`. One row per user per journey; `left_at IS NULL` ⇒ active participant.
- Creator is also a participant (insert on journey create).

---

### 3.5 dimensions

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | text (UUID) | no | PK |
| journey_id | text | no | FK → journeys.id |
| position | integer | no | Display order (0-based) |
| name | text | no | |
| description | text | yes | |
| emoji | text | no | |
| weight | real | no | Importance; sum over journey = 100; 1 decimal |
| is_mandatory | integer (0/1) | no | 1 = mandatory |
| why_matters | text | yes | Optional meaning |
| what_good_looks_like | text | yes | |
| how_helps_journey | text | yes | |
| strength_guidance | text | yes | |
| created_at | integer (Unix ms) | no | |

- Constraint: 2–8 dimensions per journey; sum(weight) = 100. Enforce in app on journey create/update (dimensions immutable after journey is created in practice; PRD says structure is fixed).

---

### 3.6 journey_visible_labels

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| journey_id | text | no | PK, FK → journeys.id |
| label_missed | text | no | Display for Missed |
| label_low | text | no | e.g. "Showed up" |
| label_medium | text | no | e.g. "Progressed" |
| label_high | text | no | e.g. "Built" |
| label_excellent | text | no | e.g. "Conquered" |
| updated_at | integer (Unix ms) | no | |

- One row per journey. Editable later; does not affect scoring.

---

### 3.7 daily_entries

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | text (UUID) | no | PK |
| user_id | text | no | FK → users.id |
| journey_id | text | no | FK → journeys.id |
| date | text (date) | no | ISO date (user’s timezone for “day”) |
| reflection_note | text | yes | Optional "any learning to carry forward?" |
| created_at | integer (Unix ms) | no | |
| updated_at | integer (Unix ms) | no | |

- Unique: `(user_id, journey_id, date)`. One entry per user per journey per day.
- Editable (and backfill) for 7 days after `date`; after that, unlogged dimensions are treated as missed (app logic).

---

### 3.8 daily_dimension_values

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | text (UUID) | no | PK |
| daily_entry_id | text | no | FK → daily_entries.id |
| dimension_id | text | no | FK → dimensions.id |
| canonical_scale | integer | no | 0–5 per §1 |

- Unique: `(daily_entry_id, dimension_id)`. One value per dimension per daily entry.
- When a dimension is not logged before the 7-day window closes, app may write a row with `canonical_scale` 0 or 1 (missed_optional / missed_mandatory) or compute on read; design choice (storing final state avoids recomputation).

---

### 3.9 goals

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | text (UUID) | no | PK |
| user_id | text | no | FK → users.id |
| journey_id | text | no | FK → journeys.id |
| goal_type | text | no | `'weekly'` \| `'monthly'` |
| period_start | text (date) | no | Monday for weekly; first day of month for monthly |
| period_end | text (date) | no | Sunday for weekly; last day of month for monthly |
| goal_statement | text | yes | User’s goal text |
| outcome | integer | yes | Canonical scale 0–5; nullable until user sets; editable 7 days after period_end |
| outcome_updated_at | integer (Unix ms) | yes | |
| created_at | integer (Unix ms) | no | |
| updated_at | integer (Unix ms) | no | |

- One weekly and one monthly goal per user per journey: app enforces “current” weekly/monthly; multiple rows for past periods.
- Unique: `(user_id, journey_id, goal_type, period_start)`.

---

### 3.10 weekly_reviews

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | text (UUID) | no | PK |
| user_id | text | no | FK → users.id |
| journey_id | text | no | FK → journeys.id |
| week_start | text (date) | no | Monday ISO date |
| done | integer (0/1) | no | 1 = completed |
| notes | text | yes | Optional reflection |
| created_at | integer (Unix ms) | no | |
| updated_at | integer (Unix ms) | no | |

- Unique: `(user_id, journey_id, week_start)`. One per user per journey per week.
- Editable 7 days after week end (app logic). Does not create score.

---

### 3.11 lessons

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | text (UUID) | no | PK |
| user_id | text | no | FK → users.id |
| journey_id | text | no | FK → journeys.id |
| text | text | no | Lesson content |
| source_date | text (date) | no | When the insight originated |
| source_type | text | no | `'daily_reflection'` \| `'weekly_review'` |
| dimension_id | text | yes | FK → dimensions.id; optional link |
| created_at | integer (Unix ms) | no | |

- Filter by dimension and source type in app.

---

### 3.12 journey_invites

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | text (UUID) | no | PK |
| journey_id | text | no | FK → journeys.id |
| email | text | no | Invitee email |
| token | text | no | Unique token for accept link |
| created_at | integer (Unix ms) | no | |
| used_at | integer (Unix ms) | yes | When invite was used (user joined) |

- For private journeys only. When user accepts, create `journey_participants` row and set `used_at`.

---

## 4. Indexes (recommended)

- **sessions:** `token_hash`, `expires_at` (for lookup and cleanup).
- **journey_participants:** `(journey_id, user_id)`, `(user_id)` (list journeys for user; list participants).
- **daily_entries:** `(user_id, journey_id, date)`, `(journey_id, date)` (leaderboard and trends).
- **daily_dimension_values:** `daily_entry_id`, `dimension_id`.
- **goals:** `(user_id, journey_id, goal_type, period_start)`.
- **weekly_reviews:** `(user_id, journey_id, week_start)`.
- **lessons:** `(journey_id, user_id)`, `dimension_id`.
- **journey_invites:** `token` (unique), `(journey_id, email)`.

---

## 5. Tech notes (D1 + Drizzle)

- **IDs:** UUIDs as text (SQLite no native UUID).
- **Timestamps:** Unix ms integer; or SQLite `datetime('now')` if preferred — keep consistent.
- **Booleans:** SQLite 0/1 integer.
- **Dates:** ISO date string `YYYY-MM-DD`; week/month boundaries computed in app using user timezone.
- **Migrations:** Drizzle migrations in repo; apply with `wrangler d1 migrations apply` (local and remote). Schema and migrations live in codebase, not in this doc (this is design reference only).

---

_Last updated: 2025-03-14_
