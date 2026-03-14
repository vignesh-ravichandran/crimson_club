# Parallel task 01: Backend — Journeys + Daily

**Use this brief when running this task in a dedicated agent.** Depends on **00-foundation-auth** (auth API and session middleware must exist).

---

## Objective

Implement Journeys CRUD (list, get, create, delete), join/leave, and Daily entry API (get/upsert for a date, dimension values, reflection note). All request/response shapes and errors must match api-contracts.

---

## Prerequisites

- Phase 1 (Foundation + Auth) done: session validation helper, POST/GET auth routes, D1 + Drizzle with at least users and sessions. Journeys and daily tables can be added in this task via new migrations.

---

## Docs to refer to (read these)

| Doc | Path | Use for |
|-----|------|--------|
| API contracts | `docs/lld/api-contracts.md` | **§2 Error format**; **§4.2 Journeys** (list, get, create request body); **§4.3 Daily** (get, PUT body, response) |
| APIs and modules | `docs/lld/apis-and-modules.md` | Route list §2.3, §2.4; flows §3.2 Create journey, §3.3 Daily log |
| DB data model | `docs/db/data-model.md` | Tables: journeys, journey_participants, dimensions, journey_visible_labels, daily_entries, daily_dimension_values; canonical scale §1; indexes §4 |
| Data dictionary | `docs/db/data-dictionary.md` | Quick reference for fields |
| Backend contributing | `docs/contributing/backend.md` | Conventions, where code lives |
| Product PRD | `docs/product/prd.md` | Journey rules (2–8 dimensions, weights = 100, structure immutable); daily (one per user/journey/date, 7-day edit window) |

---

## Scope (subtasks)

1. **Schema (if not already present)**
   - Drizzle schema for: journeys, journey_participants, dimensions, journey_visible_labels, daily_entries, daily_dimension_values. Match `docs/db/data-model.md` column names and types. Add migration.

2. **Journeys API**
   - GET `/api/journeys`: list current user's journeys (via journey_participants where left_at IS NULL or include left); optional query `?archived=true`. Response `{ journeys: JourneySummary[] }` per api-contracts §4.2.
   - GET `/api/journeys/[id]`: journey detail + dimensions + visibleLabels; 404 if not found or user not participant.
   - POST `/api/journeys`: body per api-contracts §4.2 (name, description, emoji, visibility, startDate, endDate, foundation fields, dimensions array, visibleLabels). Validate: 2–8 dimensions, weights sum 100. Insert journey, dimensions, journey_visible_labels, journey_participants (creator). Return 201 `{ id }`. 400 on validation error.
   - DELETE `/api/journeys/[id]`: only creator; 204 or 403/404.
   - POST `/api/journeys/[id]/join`: body `{ inviteToken? }`. Public: add participant. Private: require valid token, mark invite used, add participant. 200 or 400/404.
   - POST `/api/journeys/[id]/leave`: set left_at for current user. 200.

3. **Daily API**
   - GET `/api/journeys/[id]/daily?date=YYYY-MM-DD`: return entry (if any) and dimensionValues for that user/journey/date. User must be participant. Response per api-contracts §4.3.
   - PUT `/api/journeys/[id]/daily`: body `{ date, dimensionValues: { dimensionId, canonicalScale }[], reflectionNote? }`. Enforce 7-day edit window (date in user TZ). Upsert daily_entries row; upsert daily_dimension_values. Return 200 with entry + dimensionValues. 400 if date out of window or dimensionIds don't match journey.

4. **Validation and errors**
   - All errors: `{ error: string; code?: string }`. 401 if no valid session. 403/404 where specified.

---

## Acceptance criteria

- [x] Create journey (POST) with 2–8 dimensions, weights 100; get journey (GET) returns journey + dimensions + labels.
- [x] List journeys (GET) returns user's journeys.
- [x] Join public journey; leave journey (left_at set).
- [x] PUT daily for today: dimension values and optional reflection saved. GET daily returns them.
- [x] PUT daily for a past date within 7 days (user TZ) works; beyond 7 days returns 400 or is rejected.
- [x] All responses match api-contracts shapes; errors use standard body.

---

## Manual test steps

1. With auth cookie: POST create journey (e.g. 3 dimensions, 33.3 each). GET journey by id; verify dimensions and labels.
2. GET /api/journeys; verify list includes created journey.
3. PUT /api/journeys/[id]/daily with date=today, dimensionValues for each dimension (canonicalScale 2–5). GET daily; verify values and optional reflectionNote.
4. Try PUT daily for date 8 days ago; expect 400 or similar.
5. (If two users) Join second user to public journey; leave; verify participant record has left_at.

---

### Session summary (backend journeys + daily complete)

- **Schema:** Added Drizzle tables: journeys, journey_participants, dimensions, journey_visible_labels, daily_entries, daily_dimension_values, journey_invites. Migration `drizzle/0001_journeys_daily.sql`.
- **Journeys API:** GET /api/journeys (list with ?archived=), GET /api/journeys/[id], POST (create with validation 2–8 dims, weights 100), DELETE (creator only), POST join, POST leave.
- **Daily API:** GET /api/journeys/[id]/daily?date=; PUT with 7-day window (user TZ) via `lib/date-utils.ts`.
- **Manual tests:** Create journey → GET journey (dims + labels) → GET list → PUT daily today → GET daily → PUT daily 8 days ago → 400.

_Last updated: 2025-03-14_
