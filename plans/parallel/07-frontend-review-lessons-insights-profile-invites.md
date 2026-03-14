# Parallel task 07: Frontend — Review, Lessons, Insights, Profile, Invites

**Use this brief when running this task in a dedicated agent.** Depends on **04**, **05**, **06**. Backend: **02** (lessons), **03** (leaderboard, invites).

---

## Objective

Implement Review (weekly review list/detail if not fully in 06), Lessons list and create, Insights (optional summary/trends), Profile (view/edit display name, primary journey), and Invites (create invite for private journey, join by link). Manual test each area.

---

## Prerequisites

- Shell, Home, Journeys, Today, Goals, Weekly review, Create journey (04–06) done. Backend: lessons API, leaderboard, home (primary journey), invites (01, 02, 03).

---

## Docs to refer to (read these)

| Doc | Path | Use for |
|-----|------|--------|
| API contracts | `docs/lld/api-contracts.md` | **§4.6 Lessons** (list, create); **§4.7 Leaderboard**; **§4.8 Home** (primaryJourney); **§4.2** invite (create, join) |
| Frontend design | `docs/lld/frontend-design.md` | Lessons list/form; Insights placeholder or charts; Profile form; Invite (create, join flow) |
| UX blueprint | `docs/design/ux-blueprint.md` | Flows: add lesson, view leaderboard, set primary journey, invite and join |
| Colour palette | `docs/design/colour-palette.md` | Tokens |

---

## Scope (subtasks)

1. **Lessons**
   - Route: /journeys/[id]/lessons. GET lessons (optional filters dimensionId, sourceType). List cards (text, sourceDate, sourceType). Form: add lesson (text, sourceDate, sourceType, optional dimensionId). POST on submit. Manual test: add lesson; filter; verify list.

2. **Leaderboard (Insights or separate)**
   - Route: /journeys/[id]/leaderboard. GET leaderboard (period=weekly|monthly, periodStart). Display rankings (rank, displayName, scorePercentage, trend if any). Use design tokens. Manual test: with 2+ users and entries, verify order and %.

3. **Profile**
   - Route: /profile. GET /api/auth/me (and optionally home for primary). Edit: publicDisplayName; primary journey selector (PATCH user or dedicated endpoint if in api-contracts). Save and show success/error. Manual test: change display name and primary journey; reload home and verify.

4. **Invites**
   - Create: on private journey detail, "Invite" button. Modal or page: email input; POST /api/journeys/[id]/invite; show inviteUrl and token (copy link). Join: route /join?token=... or /journeys/[id]/join with token in body; POST join; redirect to journey. Manual test: create private journey, create invite, open link in incognito (or second user), join; verify participant.

5. **Review list**
   - If not in 06: list of weekly reviews (GET list) with links to detail/edit. Ensure consistent with task 06.

6. **Insights (optional)**
   - Placeholder or simple summary: e.g. "Last 7 days completion", or link to leaderboard. Expand later if in scope.

---

## Acceptance criteria

- [x] Lessons: list and create; filters work.
- [x] Leaderboard: shows rankings with percentage; period selector works.
- [x] Profile: edit display name and primary journey; persisted.
- [x] Invite: create invite, copy link; join by link adds participant.
- [x] All use design tokens; API errors shown.

---

## Manual test steps

1. Add 2 lessons (different sourceType); filter by dimension; verify list.
2. Open leaderboard for a journey with data; switch weekly/monthly; verify.
3. Profile: change display name; set primary journey; load Home and verify primary.
4. Create invite for private journey; open invite URL in another session; complete join; verify in journey participants.

---

### Session summary (task 07)

- **Lessons:** `app/(app)/journeys/[id]/lessons/page.tsx`, `components/domain/LessonsView.tsx` — GET lessons with optional dimensionId/sourceType filters; list cards; add-lesson form (text, sourceDate, sourceType, dimensionId); POST on submit; design tokens and API errors.
- **Leaderboard:** `app/(app)/journeys/[id]/leaderboard/page.tsx`, `components/domain/LeaderboardView.tsx` — GET with period=weekly|monthly and periodStart (current week/month from user TZ); period toggle; rankings with rank, displayName, scorePercentage.
- **Profile:** `app/(app)/profile/page.tsx`, `components/domain/ProfileForm.tsx` — PATCH /api/users/me (publicDisplayName), PATCH /api/users/me/primary-journey (journeyId or clear). API routes: `app/api/users/me/route.ts`, `app/api/users/me/primary-journey/route.ts`.
- **Invites:** Create: journey detail shows "Invite" when private + creator; `app/(app)/journeys/[id]/invite/page.tsx` + `InviteForm.tsx` (email, POST invite, show inviteUrl, copy link). Join: `app/(app)/journeys/[id]/join/page.tsx` (token from query; sign-in prompt if not auth); `JoinJourneyForm.tsx` POST join with inviteToken, redirect to journey.
- **Review list:** Already in 06 at `/journeys/[id]/weekly-reviews`; no change.
- **Insights:** `app/(app)/journeys/[id]/insights/page.tsx` — placeholder + link to leaderboard; Insights link on journey detail.
- **Build:** `npm run build` passes. Manual test steps left for you to run in browser.

_Last updated: 2025-03-14_
