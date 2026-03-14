# Parallel task 02: Backend — Goals + Weekly review + Lessons

**Use this brief when running this task in a dedicated agent.** Depends on **00-foundation-auth** and **01-backend-journeys-daily** (journeys and participants must exist).

---

## Objective

Implement Goals API (weekly/monthly), Weekly reviews API, and Lessons API. Request/response shapes and errors per api-contracts.

---

## Prerequisites

- Auth (Phase 1) and Journeys + Daily (Phase 2) done. Goals, weekly_reviews, lessons tables and routes needed.

---

## Docs to refer to (read these)

| Doc | Path | Use for |
|-----|------|--------|
| API contracts | `docs/lld/api-contracts.md` | **§2 Error format**; **§4.4 Goals** (get, create, PATCH outcome); **§4.5 Weekly reviews** (get, PUT); **§4.6 Lessons** (list, create) |
| APIs and modules | `docs/lld/apis-and-modules.md` | §2.5 Goals, §2.6 Weekly reviews, §2.7 Lessons; §3.4 Weekly review flow |
| DB data model | `docs/db/data-model.md` | goals, weekly_reviews, lessons tables; canonical scale for goal outcome |
| Backend contributing | `docs/contributing/backend.md` | Conventions |
| Product PRD | `docs/product/prd.md` | Goal rules (one weekly, one monthly per journey; outcome editable 7 days after period); weekly review (no score); lesson source types |

---

## Scope (subtasks)

1. **Schema**
   - Drizzle schema for goals, weekly_reviews, lessons. Match `docs/db/data-model.md`. Migration.

2. **Goals API**
   - GET `/api/journeys/[id]/goals?goalType=weekly|monthly&periodStart=YYYY-MM-DD`: return goal for that period or null. User must be participant.
   - POST `/api/journeys/[id]/goals`: body `{ goalType, periodStart, periodEnd, goalStatement? }`. Create goal. 201 `{ id }` or 400.
   - PATCH `/api/journeys/[id]/goals/[goalId]`: body `{ outcome: number }` (0–5). Enforce 7-day edit window after periodEnd (user TZ). 200 with goal or 400/404.

3. **Weekly reviews API**
   - GET `/api/journeys/[id]/weekly-reviews?weekStart=YYYY-MM-DD`: return review for that week or null.
   - PUT `/api/journeys/[id]/weekly-reviews`: body `{ weekStart, done, notes? }`. Upsert. 200 with review.
   - GET `/api/journeys/[id]/weekly-reviews/list?limit=`: list past reviews (reverse chronological).

4. **Lessons API**
   - GET `/api/journeys/[id]/lessons?dimensionId=&sourceType=`: list lessons; optional filters. Response `{ lessons: Lesson[] }`.
   - POST `/api/journeys/[id]/lessons`: body `{ text, sourceDate, sourceType, dimensionId? }`. sourceType: daily_reflection | weekly_review. 201 `{ id }` or 400.

5. **Dates**
   - Week = Monday–Sunday; month = calendar month. Compute using user's timezone from users table.

---

## Acceptance criteria

- [x] Create weekly goal; get goal by periodStart; PATCH outcome within 7 days after period end.
- [x] Create weekly review (PUT); get by weekStart; list past reviews.
- [x] Create lesson; list lessons; filter by dimensionId/sourceType.
- [x] PATCH goal outcome after 7-day window returns 400 or is rejected.
- [x] All responses match api-contracts; errors use standard body.

---

## Manual test steps

1. Create a journey (from task 01). POST goal for current week (periodStart = Monday). GET goal; PATCH outcome (e.g. 4). Verify stored.
2. PUT weekly review for current week (done: true, notes: "Good week"). GET by weekStart; GET list.
3. POST lesson (text, sourceDate, sourceType, optional dimensionId). GET lessons; try filters.
4. Try PATCH goal outcome for a period that ended >7 days ago; expect 400.

**Helper:** `scripts/manual-test-goals-weekly-lessons.sh` runs the above (sign-in, create journey, then steps 1–4). Run with dev server up; set `PORT` if not 3002. Ensure DB has goals/weekly_reviews/lessons tables (`npm run db:push:local`).

---

_Last updated: 2025-03-14_
