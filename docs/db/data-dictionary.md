# Crimson Club — Data dictionary

Short reference for tables and key fields. Full types and rules in [data-model.md](data-model.md).

---

## Tables

| Table | Purpose |
|-------|---------|
| **users** | Account: login, display name, primary journey, timezone |
| **sessions** | Auth: session token, expiry |
| **journeys** | Journey container + optional foundation text; creator, visibility, dates |
| **journey_participants** | Membership; `left_at` = left (no leaderboard, history kept) |
| **dimensions** | Per-journey dimensions (2–8); weight, mandatory, optional meaning |
| **journey_visible_labels** | Per-journey display labels for scale (editable) |
| **daily_entries** | One per user/journey/date; optional reflection note |
| **daily_dimension_values** | Per-dimension value per entry; canonical scale 0–5 |
| **goals** | Weekly or monthly goal per user/journey; outcome in canonical scale |
| **weekly_reviews** | Per user/journey/week; done + optional notes |
| **lessons** | Saved insight; text, source type/date, optional dimension |
| **journey_invites** | Private journey invites (email + token) |

---

## Key fields (intent)

| Table.field | Intent |
|-------------|--------|
| users.email | Unique; login. |
| users.primary_journey_id | Home screen focus; user can change anytime. |
| users.timezone | IANA; all week/month/day boundaries use this. |
| journeys.visibility | `public` \| `private`; immutable after create. |
| journeys.end_date | If set, journey freezes then; view-only, archive. |
| journey_participants.left_at | When set, user left; excluded from leaderboard. |
| dimensions.weight | Sum over journey = 100; 1 decimal. |
| dimensions.is_mandatory | Affects missed penalty (-0.50 vs 0). |
| daily_entries.date | ISO date; “day” is in user timezone. |
| daily_dimension_values.canonical_scale | 0–5 → missed_optional, missed_mandatory, low, medium, high, excellent. |
| goals.outcome | Set at period end; editable 7 days after. |
| weekly_reviews.done | Ritual completion; no score. |

---

## Canonical scale (stored value → meaning)

| Value | Name | Score factor |
|-------|------|--------------|
| 0 | missed_optional | 0.00 |
| 1 | missed_mandatory | -0.50 |
| 2 | low | 0.25 |
| 3 | medium | 0.50 |
| 4 | high | 0.75 |
| 5 | excellent | 1.00 |

---

_Last updated: 2025-03-14_
