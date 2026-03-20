# Contributing to Crimson Club

This doc is the **single source of truth** for how to work in this repo — whether you use Cursor, another IDE, or the CLI. Following it keeps docs, plans, and code consistent and indexable.

---

## 1. Repo layout (monorepo)

- **`docs/`** — **Reference** documentation (required). **Single entry:** [docs/README.md](docs/README.md) → each area **INDEX** → files. Update on every relevant **code or design** change.
- **`plans/`** — **Work tracking**: what’s active, what’s next, history. [plans/CURRENT.md](plans/CURRENT.md) (active), [plans/INDEX.md](plans/INDEX.md) (all), [plans/README.md](plans/README.md) (how to use).
- **`input/`** — Task-only files/assets ([input/README.md](input/README.md)). **Gitignored** except that README — do not commit drops here.
- **Environment** — Real `.env` files are **never** committed. **One** sample file: [`.env.example`](.env.example) — extend it for new vars; do **not** add multiple sample env files (e.g. `.env.sample`, `.env.local.example`).
- **`docs/reuse/REPO-DOCS-AND-PLANS-SCAFFOLD.md`** — Portable **single file** for other repos ([scaffold](docs/reuse/REPO-DOCS-AND-PLANS-SCAFFOLD.md)).

Use **docs** for reference (what we're building, where things run). Use **plans** for current work, next steps, and status.

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

## 4. Coding conventions (documented and enforced)

- **Index:** [docs/contributing/INDEX.md](docs/contributing/INDEX.md) — frontend, backend, testing (add more files as needed).
- **Rules:** Conventions used in the app must live under **`docs/contributing/`** and be **followed** across the codebase. When you introduce a new pattern, **document it** in the right file the same time.
- **Naming & comments** — Prefer existing patterns; explain “why” and edge cases.
- **Commits** — Clear, scoped messages; reference plan or doc when relevant.

**Area docs:** [frontend](docs/contributing/frontend.md), [backend](docs/contributing/backend.md), [testing](docs/contributing/testing.md) — align with `docs/design/`, `docs/lld/`, `docs/db/`.

**Implementation hygiene:** When you **replace** or **refactor** behavior, **remove obsolete code** in the same change (unused modules, old routes, duplicate helpers) unless a plan explicitly defers removal.

---

## 5. Use existing libraries (avoid reinventing the wheel)

- **Prefer existing libraries** — Where something already exists (auth, validation, date handling, HTTP client, UI components, etc.), use a well-maintained library instead of writing custom code. Do **research first** before implementing.
- **Don't reinvent the wheel** — Only write custom code when there is no suitable existing solution, or when the dependency would be disproportionate (e.g. one tiny use case). Document in `docs/tech-stack/` or the plan when you add a new dependency.
- **Before coding** — Check ecosystem and docs for existing solutions; prefer established, maintained options that fit our stack and licensing.

---

## 6. Using this from any tool

- **Cursor / AI:** Read **`plans/CURRENT.md`** first (active work and next steps). Navigate docs via **`docs/README.md`** → area **INDEX**. Don’t reopen plans marked **Completed** in `plans/INDEX.md` unless the user asks. When creating a plan, update INDEX and CURRENT.
- **Other IDEs / scripts:** Same: `plans/CURRENT.md` for active work; `docs/README.md` as the **single doc entry** for all reference documentation.
- **Humans:** Before starting work, check CURRENT; when finishing, update INDEX and CURRENT so the next person (or tool) sees the right state.

---

## 7. Single source of truth

- **Reference** → `docs/` — entry [docs/README.md](docs/README.md); **mandate** [docs/DOCS-MANDATE.md](docs/DOCS-MANDATE.md).
- **Conventions** → [docs/contributing/INDEX.md](docs/contributing/INDEX.md).
- **Current work / next steps** → `plans/CURRENT.md` and linked plan file.
- **All plans** → `plans/INDEX.md`.
- **This file** → CONTRIBUTING.md.

Keeping these updated is how we enforce consistency and make the repo indexable and reliable for everyone.

---

_Last updated: 2026-03-20_
