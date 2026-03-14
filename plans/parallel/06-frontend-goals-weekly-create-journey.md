# Parallel task 06: Frontend — Goals, Weekly review, Create journey wizard

**Use this brief when running this task in a dedicated agent.** Depends on **04-frontend-auth-shell** and **05** (journey detail / today). Backend: **01** (journeys create), **02** (goals, weekly reviews).

---

## Objective

Implement Goals screen (weekly/monthly goal statement and outcome), Weekly review screen (done + notes), and Create journey wizard (steps: basics, dimensions, visibility/invite). Manual test after each.

---

## Prerequisites

- Shell and journey detail (04, 05) done. Backend: POST /api/journeys, goals API, weekly reviews API (01, 02).

---

## Docs to refer to (read these)

| Doc | Path | Use for |
|-----|------|--------|
| API contracts | `docs/lld/api-contracts.md` | **§4.2 Journeys** (create body); **§4.4 Goals** (get, create, PATCH); **§4.5 Weekly reviews** (get, PUT) |
| Frontend design | `docs/lld/frontend-design.md` | Goals UI (statement, outcome slider 0–5); Weekly review (done checkbox, notes); Create journey wizard (steps, validation) |
| UX blueprint | `docs/design/ux-blueprint.md` | Flows: set goal, do weekly review, create journey (dimensions 2–8, weights 100) |
| Product PRD | `docs/product/prd.md` | Journey creation rules (2–8 dimensions, weights sum 100, structure immutable); goal one per type per period; weekly review no score |
| Colour palette | `docs/design/colour-palette.md` | Tokens for forms, buttons |

---

## Scope (subtasks)

1. **Goals screen**
   - Route: e.g. /journeys/[id]/goals. GET goals for current week/month (periodStart). Show: goal statement (editable if no outcome yet?), outcome slider (0–5) with 7-day edit rule after period end. Create goal (POST) if none; PATCH outcome. Display period (e.g. "Week of 10 Mar 2025"). Manual test: create goal, set outcome; try editing outcome after 7 days (expect disabled or error).

2. **Weekly review screen**
   - Route: e.g. /journeys/[id]/weekly-review or ?weekStart=. GET review for week; show done checkbox and notes textarea. PUT on save. List past reviews (link from journey or home). Manual test: complete review, save; reload; list past reviews.

3. **Create journey wizard**
   - Multi-step: (1) Basics: name, description, emoji, start/end date, visibility. (2) Dimensions: add 2–8 dimensions; each has label, weight; validate weights sum 100. (3) Visible labels (which dimension labels to show in leaderboard/cards). (4) Private: optional invite email; or finish. POST /api/journeys with full body. Redirect to journey detail on 201. Validation: show errors for weight sum, dimension count. Manual test: create journey with 3 dimensions (e.g. 34, 33, 33); verify in list and detail.

---

## Acceptance criteria

- [x] Goals: create and display weekly/monthly goal; set outcome within 7-day window; beyond window disabled or error.
- [x] Weekly review: load/save done and notes; list past reviews.
- [x] Create journey: complete wizard; dimensions 2–8, weights 100; journey appears in list with correct dimensions.
- [x] All forms use design tokens; API errors displayed.

---

## Manual test steps

1. Open Goals for a journey; create goal for current week; set outcome 4; verify. Change period to one that ended 10 days ago; verify outcome not editable (or error on save).
2. Open Weekly review; check done, add notes; save. Open list of past reviews; verify entry.
3. Create new journey: name "Test Journey", 3 dimensions (34, 33, 33), visibility public. Submit; verify journey in list and dimension labels on detail.

---

### Session summary (task 06)

- **Goals:** `app/(app)/journeys/[id]/goals/page.tsx`, `components/domain/GoalsForm.tsx` — weekly/monthly goal statement, outcome 0–5, 7-day edit rule; PATCH outcome fixes weekly vs monthly state.
- **Weekly review:** `app/(app)/journeys/[id]/weekly-review/page.tsx`, `app/(app)/journeys/[id]/weekly-reviews/page.tsx`, `components/domain/WeeklyReviewForm.tsx` — GET/PUT review, done + notes; Past reviews list; journey detail link updated to `/weekly-review`.
- **Create journey wizard:** `app/(app)/journeys/new/page.tsx`, `components/domain/CreateJourneyWizard.tsx` — steps: Basics (name, description, emoji, dates, visibility), Dimensions (2–8, weights sum 100), Visible labels, optional Invite (private); POST /api/journeys, redirect on 201; optional POST invite when private + email.
- **Build:** `npm run build` passes after `rm -rf .next`. Manual test steps left for you to run in browser.

_Last updated: 2025-03-14_
