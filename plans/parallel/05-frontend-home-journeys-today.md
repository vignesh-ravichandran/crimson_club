# Parallel task 05: Frontend — Home, Journeys list, Today

**Use this brief when running this task in a dedicated agent.** Depends on **04-frontend-auth-shell** and backend **01** (journeys + daily) and **03** (home API). Integrate with GET /api/home and journey/daily APIs.

---

## Objective

Implement Home screen (primary journey, today state, other journeys, pending backfill, pending weekly reviews), Journeys list and detail views, and Today screen (daily log for selected journey with dimension sliders and reflection). Manual test after each screen.

---

## Prerequisites

- Auth + shell (task 04) done. Backend: journeys list/get, daily get/put, home API (task 01 and 03).

---

## Docs to refer to (read these)

| Doc | Path | Use for |
|-----|------|--------|
| API contracts | `docs/lld/api-contracts.md` | **§4.2 Journeys** (list, get); **§4.3 Daily** (get, PUT); **§4.8 Home** (response shape) |
| Frontend design | `docs/lld/frontend-design.md` | Home screen layout, Journeys list/detail, Today screen (dimension inputs, reflection, 7-day rule) |
| UX blueprint | `docs/design/ux-blueprint.md` | User flows: Home, list journeys, open journey, log today |
| Colour palette | `docs/design/colour-palette.md` | Tokens for cards, buttons, sliders |
| Data dictionary | `docs/db/data-dictionary.md` | Dimension labels, canonical scale (2–5) for sliders |

---

## Scope (subtasks)

1. **Home screen**
   - GET /api/home. Display: primary journey summary (name, emoji, link); primary today state (has entry today? link to Today); other journeys list; pending backfill count (e.g. "3 days to log"); pending weekly reviews (list with links to review screen). Use design tokens. Empty states when no primary or no data.

2. **Journeys list**
   - GET /api/journeys. List cards (name, emoji, description snippet, link to journey detail). Optional: archived filter. Link "Create journey" to create flow (task 06).

3. **Journey detail**
   - GET /api/journeys/[id]. Show name, description, dimensions (labels), visible labels, participants (if allowed). Actions: "Log today", "Weekly review", "Goals", "Leaderboard", "Lessons" (links; some may be placeholders). Join/Leave if applicable.

4. **Today screen**
   - Route: e.g. /today or /journeys/[id]/today. GET /api/journeys/[id]/daily?date=today. Show one row per dimension: label + slider (canonical scale 2–5) or inputs. Optional reflection note textarea. Save: PUT /api/journeys/[id]/daily with date, dimensionValues, reflectionNote. Show 7-day rule (e.g. "You can edit entries for the last 7 days"). Disable or hide save for dates outside window. Manual test: log today, reload, edit; try past date within 7 days.

---

## Acceptance criteria

- [x] Home shows primary journey, today state, other journeys, pending backfill and weekly reviews.
- [x] Journeys list shows user's journeys; journey detail shows dimensions and actions.
- [x] Today: load today's entry; change sliders/reflection; save; reload and verify. Past date within 7 days editable; beyond 7 days not (or disabled — date picker only offers 7-day window).
- [x] All screens use design tokens; errors from API shown to user.

---

## Manual test steps

1. Set primary journey (if API supports it). Load Home; verify primary, today state, other journeys, pending counts.
2. Open Journeys; open a journey; verify detail. Open "Log today"; enter dimensions and reflection; save; reload Today and verify data.
3. Change date picker to 3 days ago; edit and save. Change to 10 days ago; verify save disabled or 400 handled.

---

### Session summary (frontend home, journeys, today complete)

- **Home:** `(app)/page.tsx` — fetches GET /api/home; shows primary journey card (link + Log today), today state, other journeys list, pending backfill count, pending weekly reviews. Empty states when no primary / no data. Uses design tokens (bg-surface, border-border-default, brand-crimson, etc.).
- **Journeys list:** `(app)/journeys/page.tsx` — fetches GET /api/journeys; cards with name, emoji, visibility, participant count; link to detail and to Create journey (/journeys/new placeholder).
- **Journey detail:** `(app)/journeys/[id]/page.tsx` — fetches GET /api/journeys/[id]; name, description, dimensions (read-only), visible labels; actions: Log today, Weekly review, Goals, Leaderboard, Lessons (links).
- **Today screen:** `(app)/journeys/[id]/today/page.tsx` — server fetches journey + daily for today (user TZ); client `TodayForm` (dimension chips: Missed + Low–Excellent / canonical 0–5, reflection textarea, date picker for 7-day window, Save). PUT /api/journeys/[id]/daily on save; 7-day rule message; errors shown.
- **Manual test:** Home API returns 200 with otherJourneys; home/journeys/today routes build and run.

_Last updated: 2025-03-14_
