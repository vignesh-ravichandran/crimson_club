# Contributing to Crimson Club

This doc is the **single source of truth** for how to work in this repo — whether you use Cursor, another IDE, or the CLI. Following it keeps docs, plans, and code consistent and indexable.

---

## 1. Repo layout (monorepo)

- **`docs/`** — **Reference** documentation: product, design, HLD, LLD, DB design, deployment (where we're deployed, branch→env, what to update). Start at [docs/README.md](docs/README.md).
- **`plans/`** — **Current state**: work planning and status so we stay tracked and don't miss anything. **Current** work is in [plans/CURRENT.md](plans/CURRENT.md); full list in [plans/INDEX.md](plans/INDEX.md).
- **`plans/README.md`** — How plans work and how tools should use CURRENT vs INDEX.

Use **docs** for our reference (what we're building, where things run). Use **plans** for current state and step-by-step progress.

---

## 2. When to update docs (mandatory — never miss)

**Enforced rule:** Any change to what we build or how we run it **must** be reflected in the relevant doc. No work may deviate from the docs without updating the docs. See [docs/DOCS-MANDATE.md](docs/DOCS-MANDATE.md).

| When | Where to update |
|------|------------------|
| New or changed product scope / requirements | `docs/product/` |
| New or changed user flows / journeys | `docs/user-journey/` |
| New or changed UI/screens/components (as you build) | `docs/design/` |
| New or changed tech (languages, frameworks, libs, tooling) | `docs/tech-stack/` |
| New or changed architecture / boundaries | `docs/hld/` |
| New or changed modules / APIs / detailed behaviour | `docs/lld/` |
| New or changed data model (design only; no migrations here) | `docs/db/` |
| New or changed deployment, envs, **services/accounts per env**, branch→env | `docs/deployment/` |

**Rules:**
- Update the doc **in the same PR** (or immediately after). Consider doc update part of "done."
- **Never** merge or ship a change that affects our reference without updating the doc.
- If implementation or deployment differs from the docs, either fix the implementation or update the docs — never leave docs out of date.

---

## 3. When to update plans

| When | What to do |
|------|------------|
| Starting a new piece of work | Add a plan file in `plans/` (see naming in plans/README.md), add it to `plans/INDEX.md`, set it in `plans/CURRENT.md`. |
| Working through steps | Tick off steps in the plan file; keep "Status" and "Last updated" at the top of the file current. |
| Finishing or pausing | Mark the plan complete (or Blocked) in the file and in `plans/INDEX.md`. Set `plans/CURRENT.md` to the next active plan (or clear it). |
| Switching work | Update `CURRENT.md` to point to the plan you’re now working on; update `INDEX.md` status. |

**Rule:** Only one plan is “current.” Keep `CURRENT.md` pointing at that plan so tools (e.g. Cursor) don’t reopen old or completed work.

---

## 4. Coding style and consistency

- **Language/framework** — Follow the style of the part of the monorepo you’re in (e.g. app-specific lint/format config). If the repo adds a root style guide later, it will live here or under `docs/` and be linked from this section.
- **Naming** — Use the conventions in each area (e.g. `docs/` and `plans/` READMEs). For code, prefer existing patterns in the codebase.
- **Comments** — Explain “why” and edge cases; avoid restating the code.
- **Commits** — Prefer clear, scoped messages; reference plan or doc when relevant (e.g. “Implement habit streak (plans/2025-03-14-feature-habit-streaks)”).

**Frontend vs backend:** For area-specific conventions and checklists, see [docs/contributing/](docs/contributing/): [frontend](docs/contributing/frontend.md) (components, pages, hooks, styling) and [backend](docs/contributing/backend.md) (API routes, auth, DB, errors). Both align with the design and contract docs in `docs/lld/` and `docs/db/`.

When we add a formal style guide (e.g. ESLint/Prettier config, language-specific rules), we’ll document it under `docs/` and reference it here so consistency is enforced.

---

## 5. Use existing libraries (avoid reinventing the wheel)

- **Prefer existing libraries** — Where something already exists (auth, validation, date handling, HTTP client, UI components, etc.), use a well-maintained library instead of writing custom code. Do **research first** before implementing.
- **Don't reinvent the wheel** — Only write custom code when there is no suitable existing solution, or when the dependency would be disproportionate (e.g. one tiny use case). Document in `docs/tech-stack/` or the plan when you add a new dependency.
- **Before coding** — Check ecosystem and docs for existing solutions; prefer established, maintained options that fit our stack and licensing.

---

## 6. Using this from any tool

- **Cursor / AI:** Prefer `plans/CURRENT.md` and its linked plan file for “current status” and “next steps.” Don’t reopen plans marked Completed in `plans/INDEX.md` unless the user asks. When creating a plan, update INDEX and CURRENT.
- **Other IDEs / scripts:** Same idea: read `plans/CURRENT.md` for active work; use `plans/INDEX.md` to see all plans and avoid treating completed ones as current. Use `docs/README.md` as the entry point for all documentation.
- **Humans:** Before starting work, check CURRENT; when finishing, update INDEX and CURRENT so the next person (or tool) sees the right state.

---

## 7. Single source of truth

- **Reference (product, design, tech stack, HLD, LLD, DB design, deployment, services/accounts)** → `docs/` (indexed in docs/README.md). **Mandate:** every change reflected in docs; no work may deviate from docs without updating them — see docs/DOCS-MANDATE.md.
- **Current work and status** → `plans/CURRENT.md` and the plan file it links to.
- **All plans** → `plans/INDEX.md`.
- **How to contribute** → This file (CONTRIBUTING.md).

Keeping these updated is how we enforce consistency and make the repo indexable and reliable for everyone.

---

_Last updated: 2025-03-14_
