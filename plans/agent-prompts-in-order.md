# Agent prompts in order

Copy-paste the prompt for each step. Run in this order; where it says "parallel", you can run those prompts in separate agents at the same time.

---

## Step 1 — Run first (single agent)

**Prompt:**

```
Read and execute the task brief at plans/parallel/00-foundation-auth.md.

- Read all "Docs to refer to" listed in that brief before coding.
- Complete every subtask in Scope and satisfy all Acceptance criteria.
- Run the Manual test steps at the end and fix any failures.
- Do not skip steps or manual testing.
```

---

## Step 2 — After Step 1 (single agent)

**Prompt:**

```
Read and execute the task brief at plans/parallel/01-backend-journeys-daily.md.

- Read all "Docs to refer to" listed in that brief before coding.
- Complete every subtask in Scope and satisfy all Acceptance criteria.
- Run the Manual test steps at the end and fix any failures.
- Do not skip steps or manual testing.
```

---

## Step 3 — Parallel (two agents; both after Step 2)

**Agent A — Prompt:**

```
Read and execute the task brief at plans/parallel/02-backend-goals-weekly-lessons.md.

- Read all "Docs to refer to" listed in that brief before coding.
- Complete every subtask in Scope and satisfy all Acceptance criteria.
- Run the Manual test steps at the end and fix any failures.
- Do not skip steps or manual testing.
```

**Agent B — Prompt:**

```
Read and execute the task brief at plans/parallel/03-backend-leaderboard-home-invites.md.

- Read all "Docs to refer to" listed in that brief before coding.
- Complete every subtask in Scope and satisfy all Acceptance criteria.
- Run the Manual test steps at the end and fix any failures.
- Do not skip steps or manual testing.
```

---

## Step 4 — After Step 1 (can run in parallel with Step 2 if you prefer)

**Prompt:**

```
Read and execute the task brief at plans/parallel/04-frontend-auth-shell.md.

- Read all "Docs to refer to" listed in that brief before coding.
- Complete every subtask in Scope and satisfy all Acceptance criteria.
- Run the Manual test steps at the end and fix any failures.
- Do not skip steps or manual testing.
```

---

## Step 5 — After Steps 2, 3, and 4 (single agent)

**Prompt:**

```
Read and execute the task brief at plans/parallel/05-frontend-home-journeys-today.md.

- Read all "Docs to refer to" listed in that brief before coding.
- Complete every subtask in Scope and satisfy all Acceptance criteria.
- Run the Manual test steps at the end and fix any failures.
- Do not skip steps or manual testing.
```

---

## Step 6 — After Steps 2, 3, and 5 (single agent)

**Prompt:**

```
Read and execute the task brief at plans/parallel/06-frontend-goals-weekly-create-journey.md.

- Read all "Docs to refer to" listed in that brief before coding.
- Complete every subtask in Scope and satisfy all Acceptance criteria.
- Run the Manual test steps at the end and fix any failures.
- Do not skip steps or manual testing.
```

---

## Step 7 — After Steps 5 and 6 (single agent)

**Prompt:**

```
Read and execute the task brief at plans/parallel/07-frontend-review-lessons-insights-profile-invites.md.

- Read all "Docs to refer to" listed in that brief before coding.
- Complete every subtask in Scope and satisfy all Acceptance criteria.
- Run the Manual test steps at the end and fix any failures.
- Do not skip steps or manual testing.
```

---

## Step 8 — Final (single agent; no brief)

**Prompt:**

```
We are on Phase 9: Integration and manual E2E. Use the master plan at plans/2025-03-14-feature-app-to-completion.md, section "Phase 9: Integration + manual E2E".

- Run the full flow: sign up → create journey (wizard) → set primary → log today → weekly review → save lesson → view insights/leaderboard.
- Test backfill: log a past day within 7 days; verify score and edit window.
- Test private journey: create private → invite → join with second user → leaderboard.
- Fix any bugs found; update docs if behaviour changed.
```

---

## Order summary

| Step | Brief / Phase | When to run | Parallel? |
|------|----------------|-------------|-----------|
| 1 | 00-foundation-auth | First | No |
| 2 | 01-backend-journeys-daily | After 1 | No |
| 3 | 02 + 03 (goals/weekly/lessons + leaderboard/home/invites) | After 2 | **Yes — 2 agents** |
| 4 | 04-frontend-auth-shell | After 1 (or with 2) | Optional parallel with 2 |
| 5 | 05-frontend-home-journeys-today | After 2, 3, 4 | No |
| 6 | 06-frontend-goals-weekly-create-journey | After 2, 3, 5 | No |
| 7 | 07-frontend-review-lessons-insights-profile-invites | After 5, 6 | No |
| 8 | Phase 9 E2E | After 7 | No |

---

_Last updated: 2025-03-14_
