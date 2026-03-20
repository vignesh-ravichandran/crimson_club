# Plans — Single Source of Truth for Work & Status

This folder is the **single source of truth** for **current work**, **next steps**, **what’s coming**, and **completed** initiatives. All tools (Cursor, other IDEs, scripts) should use it the same way.

---

## How to use

| File / convention | Purpose |
|-------------------|--------|
| **`CURRENT.md`** | **Always** the one active plan. Cursor and other tools should read this first to know current status. Update this when you switch work. |
| **`INDEX.md`** | List of all plans with status. Keeps history indexed; use to avoid reopening old/completed work. |
| **`YYYY-MM-DD-feature-name.md`** | One plan per feature/fix. Steps with `- [ ]` / `- [x]`. Link from INDEX and CURRENT. |

---

## Workflow

1. **Start work** → Create or pick a plan file → Set it as current by updating `CURRENT.md` (and optionally `INDEX.md`).
2. **During work** → Tick steps in the plan file; update "Status" and "Last updated" at the top.
3. **Finish or pause** → Mark plan complete in the plan file → Update `INDEX.md` → Clear or point `CURRENT.md` to the next plan.
4. **Never** use an old plan as "current" — always keep `CURRENT.md` pointing to the active one so Cursor doesn't reopen finished work.

---

## For Cursor / AI tools

- **Default context**: Prefer `plans/CURRENT.md` and the plan file it links to. Use these for "where we are" and "what to do next."
- **Don’t** suggest reopening or continuing plans that are listed as `Completed` in `INDEX.md` unless the user explicitly asks.
- When creating a new plan, add it to `INDEX.md` and set it in `CURRENT.md`.

---

## Naming

- `feature-*` — New features (e.g. `feature-habit-streaks.md`)
- `bugfix-*` — Bug fixes (e.g. `bugfix-sql-connectivity.md`)
- `chore-*` — Refactors, tooling, docs (e.g. `chore-docs-structure.md`)

Use dates when helpful: `2025-03-14-feature-habit-streaks.md`.

---

_Last updated: 2025-03-14_
