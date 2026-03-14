# Parallel task 04: Frontend — Auth + Shell

**Use this brief when running this task in a dedicated agent.** Depends on **00-foundation-auth** (auth API and session must work). Can start after Phase 1; can run in parallel with backend tasks 01–03 if auth API is ready.

---

## Objective

Implement sign-up, sign-in, sign-out UI; session handling (redirect unauthenticated to sign-in); app shell (layout, nav, primary journey selector). No journey-specific screens yet.

---

## Prerequisites

- Auth API (sign-up, sign-in, sign-out, GET /api/auth/me) working. Optional: Home API for shell (or mock until task 05/06).

---

## Docs to refer to (read these)

| Doc | Path | Use for |
|-----|------|--------|
| API contracts | `docs/lld/api-contracts.md` | **§3 Auth & session** (request/response shapes); **§2 Error format** (show error message) |
| Frontend design | `docs/lld/frontend-design.md` | Auth screens (sign-up, sign-in), app shell, nav, primary journey selector; layout structure |
| UX blueprint | `docs/design/ux-blueprint.md` | Flows: sign-up, sign-in, sign-out; shell behaviour |
| Colour palette | `docs/design/colour-palette.md` | Tailwind tokens (brand.crimson, bg.app, text.primary, etc.) |
| Tech stack | `docs/tech-stack/tech-stack.md` | Next.js App Router, React, Tailwind |
| Contributing frontend | `docs/contributing/frontend.md` | Conventions, components/hooks structure |

---

## Scope (subtasks)

1. **Auth pages**
   - Sign-up: form (email, password, publicDisplayName). POST /api/auth/sign-up; on 201 redirect to app (e.g. /home or /). Show api-contracts error body on 4xx.
   - Sign-in: form (email, password). POST /api/auth/sign-in; on 200 redirect to app. Show error on 401.
   - Sign-out: button/link that POSTs /api/auth/sign-out then redirects to sign-in.

2. **Session and guards**
   - On app routes (under (app) group): fetch GET /api/auth/me; if 401 redirect to sign-in. Optionally use middleware or layout effect.
   - On auth routes (sign-in, sign-up): if already logged in (me returns 200), redirect to app.

3. **App shell**
   - Layout for (app): header with logo, primary journey selector (dropdown or link; can call GET /api/home for primaryJourney or GET /api/journeys until Home exists), user menu (profile link, sign-out). Per frontend-design.
   - Nav: links to Home, Journeys, Today (or as per design). Active state styling.
   - Use colour palette tokens for background, text, buttons.

4. **Placeholder app home**
   - Minimal /home (or /) that shows "Welcome" and confirms shell works. No journey content yet.

---

## Acceptance criteria

- [x] Sign-up and sign-in work; redirect to app on success.
- [x] Unauthenticated access to /home (or app root) redirects to sign-in.
- [x] Sign-out clears session and redirects to sign-in.
- [x] App shell shows nav and primary journey selector; layout uses design tokens.
- [x] Auth and app routes match frontend-design and ux-blueprint.

---

## Manual test steps

1. Open sign-up; submit valid data; verify redirect and session.
2. Sign out; verify redirect to sign-in. Try opening /home without cookie; verify redirect.
3. Sign in again; verify shell (nav, selector, sign-out). Click sign-out; verify redirect.

---

_Last updated: 2025-03-14_
