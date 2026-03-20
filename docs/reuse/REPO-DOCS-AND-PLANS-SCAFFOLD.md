# Repo docs, plans & Cursor — **single-file scaffold** (copy this whole file)

**Purpose:** Copy **only this file** into another repository (any path). Then ask Cursor to **apply the scaffold** (Part A). This file is the **full policy + every file to create** so tooling and humans stay aligned.

**Origin:** [Crimson Club](https://github.com/vignesh-ravichandran/crimson_club) — generalized for reuse.

---

## Part A — Instructions for Cursor (read first)

When the user asks to **apply this scaffold** (or set up docs/plans from this file):

1. **Create or update** each path in **Part C** using the fenced contents. Create directories as needed.
2. **`.gitignore`:** If the repo already has `.gitignore`, **merge** the blocks from **§9** (Environment, Input, Secrets) without removing existing rules. Do not duplicate lines.
3. **Never skip** `.cursor/rules/docs-and-plans.mdc` — it encodes repo-wide rules.
4. **`docs/`** must exist and include **`docs/README.md`** as the **single documentation entry point** (indexed; see Part B §8).
5. **`input/`** is **not** tracked except **`input/README.md`** — do **not** add `input/.gitkeep` to track the folder; use README-only pattern (see §11).
6. **Env files:** Ensure `.env`, `.env.*` are ignored; **only one** committed sample: **`.env.example`** (extend this file for new vars — do **not** add multiple sample env files like `.env.sample`, `.env.local.example`, etc.).
7. After creation, tell the user to open **`docs/README.md`** and **`plans/CURRENT.md`**.

**Recommended order:** `.gitignore` (merge) → `.env.example` → `.cursor/rules/` → `docs/DOCS-MANDATE.md` → `docs/README.md` → `docs/contributing/*` → `CONTRIBUTING.md` → `plans/*` → `input/README.md`.

---

## Part B — Policies (must be followed)

### 1) `plans/` — work tracking

- **Purpose:** Track **current work**, **next steps**, **backlog of initiatives**, and **history** (completed plans stay indexed; not “active”).
- **Files:** `plans/CURRENT.md` (one active pointer), `plans/INDEX.md` (all plans + status), one markdown file per initiative (`feature-*`, `bugfix-*`, `YYYY-MM-DD-slug.md`).
- **Rule:** Do not treat **Completed** plans as current unless the user explicitly asks.

### 2) `input/` — task files and assets (gitignored)

- **Purpose:** Drop **files or assets** for a specific task (screenshots, CSVs, briefs). **Not** the long-term source of truth — merge outcomes into `docs/`, `plans/`, or code.
- **Git:** Ignore **`input/*`** except **`input/README.md`** (so the folder and policy are documented). **Do not commit** user drops under `input/`.

### 3) Environment and secrets

- **Ignore:** `.env`, `.env.*`, and any host-specific secret files (e.g. `.dev.vars` if used), except **one** allowlisted sample.
- **Single sample:** **`.env.example`** only — document all non-secret variable **names** and example values there. **Do not** add multiple sample env files; extend `.env.example` when adding vars.

### 4) `docs/` — always present; update on every change

- **`docs/`** is **mandatory** for the repo’s reference documentation.
- **Any code change** or **design change** that affects behavior, UX, contracts, data, or deployment → **update `docs/` in the same change** (same PR or immediately after). See **`docs/DOCS-MANDATE.md`**.

### 5) Implementation changes → remove old code

- When changing implementation (refactor, replacement, migration away from an approach), **delete or update obsolete code immediately** — no long-lived dead paths, duplicate modules, or “temporary” old APIs left behind unless a plan explicitly tracks removal in a follow-up (prefer same PR).

### 6) Coding conventions → `CONTRIBUTING.md` + `docs/contributing/`

- **Root `CONTRIBUTING.md`:** Docs/plans workflow, env/input rules, pointer to convention docs.
- **`docs/contributing/`:** Area-specific conventions — at minimum **INDEX** + stubs you extend (e.g. **frontend**, **backend**, **testing**). **All style and testing conventions** used in the app should be **written here** and **followed**; add files as needed (`mobile.md`, `e2e.md`, …).

### 7) Single entry for context (Cursor / humans)

- **Start at `docs/README.md`** — it must link to:
  - mandate (`DOCS-MANDATE.md`),
  - each **major doc area** (`product/`, `design/`, …) and each area’s **`INDEX.md`**,
  - **`docs/contributing/INDEX.md`** (conventions),
  - **`plans/README.md`** (how plans work),
  - optional **`input/README.md`** (policy for task drops).
- **Indexing rule:** Every substantive folder under `docs/<area>/` should have an **`INDEX.md`** listing files (tables). Cursor should use **`docs/README.md` → area INDEX → file** to load context.

### 8) Summary table

| Topic | Rule |
|-------|------|
| Plans | `CURRENT.md` + `INDEX.md` + per-initiative files; track work and next steps |
| Input | `input/*` gitignored; only `input/README.md` tracked |
| Env | Real env files ignored; **one** `.env.example` only |
| Docs | Always maintain `docs/`; update on **every** code/design change affecting reference |
| Dead code | Remove obsolete code when replacing implementation |
| Conventions | Document in `CONTRIBUTING.md` + `docs/contributing/*`; follow consistently |
| Entry | **`docs/README.md`** is the single doc entry; INDEX chains for navigation |

---

## Part C — Files to create (exact contents follow)

| # | Path |
|---|------|
| 1 | `.cursor/rules/docs-and-plans.mdc` |
| 2 | `docs/README.md` |
| 3 | `docs/DOCS-MANDATE.md` |
| 4 | `CONTRIBUTING.md` |
| 5 | `plans/README.md` |
| 6 | `plans/CURRENT.md` |
| 7 | `plans/INDEX.md` |
| 8 | `docs/contributing/INDEX.md` |
| 9 | `docs/contributing/frontend.md` |
| 10 | `docs/contributing/backend.md` |
| 11 | `docs/contributing/testing.md` |
| 12 | `input/README.md` |
| 13 | `.env.example` |
| 14 | `.gitignore` (merge §9 with existing) |

---

### 1 — `.cursor/rules/docs-and-plans.mdc`

````mdc
---
description: Docs/plans single source of truth; docs updated on every change; plans/input/env/conventions/cleanup
alwaysApply: true
---

# Docs, plans & repo rules (single source of truth)

## Plans (`plans/`)
- Read **`plans/CURRENT.md`** first for active work and next steps; follow the linked plan file. Do not reopen **Completed** plans in **`plans/INDEX.md`** unless the user explicitly asks.
- New work: add/update plan file, **`plans/INDEX.md`**, and **`plans/CURRENT.md`**. Use `- [ ]` / `- [x]` checkboxes; keep Status and Last updated at top of plan files.

## Docs (`docs/`)
- **`docs/`** is mandatory. Entry: **`docs/README.md`** → area **`INDEX.md`** → specific files.
- **Every** code or design change that affects product, UX, contracts, architecture, data, or deployment must update **`docs/`** in the **same change**. See **`docs/DOCS-MANDATE.md`**.

## Input (`input/`)
- User task files/assets may live under **`input/`** — read when the user points there. Contents are **gitignored** (except **`input/README.md`**). Never treat `input/` as long-term truth; merge into docs/plans/code.

## Environment
- Never commit real secrets. Only **one** sample env file: **`.env.example`**. Do not add multiple sample env files; extend `.env.example` for new variables.

## Implementation hygiene
- When replacing or refactoring implementation, **remove obsolete code** in the same flow (no dead duplicate modules/APIs left behind without an explicit tracked follow-up).

## Conventions
- Follow root **`CONTRIBUTING.md`** and **`docs/contributing/`** (frontend, backend, testing, …). Document new conventions there when you introduce them.

## Contributing
- Follow **`CONTRIBUTING.md`** for docs/plans updates alongside code.
````

---

### 2 — `docs/README.md`

````markdown
# Docs — Reference (single source of truth)

Product, design, and technical **reference** documentation lives here. **`docs/README.md` is the single entry point** — use the index below, then each area’s **INDEX** file, then specific documents.

**→ Mandate:** [DOCS-MANDATE.md](DOCS-MANDATE.md) — update docs on **every** relevant code or design change.

**→ Conventions:** [contributing/INDEX.md](contributing/INDEX.md) — frontend, backend, testing, …

**→ Plans:** [../plans/README.md](../plans/README.md) — current work lives under `plans/`.

---

## Index (where to find what)

| Area | Folder | Purpose |
|------|--------|---------|
| **Product** | [product/](product/) | Requirements, scope, PRD |
| **User journey** | [user-journey/](user-journey/) | Flows, journeys |
| **Design** | [design/](design/) | UX, UI, tokens |
| **Tech stack** | [tech-stack/](tech-stack/) | Languages, frameworks, tooling |
| **HLD** | [hld/](hld/) | Architecture, boundaries |
| **LLD** | [lld/](lld/) | Modules, APIs, contracts |
| **DB** | [db/](db/) | Data model, ER (design; migrations may live in code) |
| **Deployment** | [deployment/](deployment/) | Envs, branch→env, services/accounts |
| **Contributing** | [contributing/](contributing/) | Code style by area (FE, BE, tests) |

*Edit this table* to match your project.

---

## Reference index (key documents)

| Area | Index |
|------|--------|
| **Product** | [product/INDEX.md](product/INDEX.md) |
| *(add rows as you add areas)* | |

When you add a document, add a row to the relevant **INDEX** and update this table when it’s a primary reference.

---

## Rules

1. **One place** — Reference material lives under `docs/` (indexed).
2. **Update every time** — Code/design change → update docs. See [DOCS-MANDATE.md](DOCS-MANDATE.md) and [CONTRIBUTING.md](../CONTRIBUTING.md).
3. **Plans** — [plans/CURRENT.md](../plans/CURRENT.md), [plans/INDEX.md](../plans/INDEX.md).

---

_Last updated: YYYY-MM-DD_
````

---

### 3 — `docs/DOCS-MANDATE.md`

````markdown
# Docs mandate (enforced)

**Hard rule** for humans and tools (including AI).

---

## 1. Every change must be reflected in docs

- **Code or design** changes that affect behavior, UX, APIs, architecture, data, or deployment → update the relevant **`docs/`** file **in the same change** (same PR or immediately after).
- Product, design, tech stack, deployment, and **services/accounts** must stay accurate.
- If unsure where to document, check [docs/README.md](README.md) and the right area **INDEX**. Add a doc and link it if missing.

---

## 2. No silent drift

- Implementation must match docs, or docs must be updated together with the change.
- Never ship reference drift: outdated docs are a bug.

---

## 3. Implementation cleanup

- When you change how something is implemented, **remove obsolete code** (old modules, dead exports, duplicate paths) in the same effort unless a short follow-up is explicitly tracked in **`plans/`**.

---

## 4. Summary

| Rule | Meaning |
|------|--------|
| **Docs + change together** | Any meaningful code/design change updates `docs/`. |
| **No drift** | Docs match reality. |
| **Clean up** | Old implementation code removed when replacing. |

See [CONTRIBUTING.md](../CONTRIBUTING.md).

---

_Last updated: YYYY-MM-DD_
````

---

### 4 — `CONTRIBUTING.md`

````markdown
# Contributing

How we work: **docs**, **plans**, **env**, **input**, **conventions**, and **code hygiene**.

---

## 1. Repo layout

| Path | Purpose |
|------|---------|
| **`docs/`** | **Reference** — single entry [docs/README.md](docs/README.md). **Required.** Update on every relevant code/design change. |
| **`plans/`** | **Work tracking** — [plans/CURRENT.md](plans/CURRENT.md) (active), [plans/INDEX.md](plans/INDEX.md) (all), per-initiative plan files. |
| **`input/`** | Task-only files/assets — **gitignored** except [input/README.md](input/README.md). Not long-term truth. |
| **`.env.example`** | **Only** committed env sample — extend this file for new vars; do not add multiple sample env files. |

---

## 2. When to update docs (mandatory)

See [docs/DOCS-MANDATE.md](docs/DOCS-MANDATE.md).

| Change | Update |
|--------|--------|
| Product / requirements | `docs/product/` |
| User flows | `docs/user-journey/` |
| UI / design | `docs/design/` |
| Tech / dependencies | `docs/tech-stack/` |
| Architecture | `docs/hld/` |
| APIs / modules | `docs/lld/` |
| Data model (design) | `docs/db/` |
| Deployment / envs / accounts | `docs/deployment/` |

**Rule:** Same PR as the code/design change when possible.

---

## 3. Plans

| Event | Action |
|-------|--------|
| Start initiative | New file under `plans/`, row in `INDEX.md`, set `CURRENT.md` |
| Progress | Tick checkboxes; update Status / Last updated |
| Finish | Completed in file + `INDEX.md`; point `CURRENT.md` to next work |

Do not continue **Completed** plans unless explicitly asked.

---

## 4. Environment

- Real env files are **gitignored**. Never commit secrets.
- Maintain **one** [`.env.example`](.env.example) with variable names and safe examples. **Do not** add `.env.sample`, `.env.local.example`, etc.

---

## 5. Input folder

- Put task-specific files/assets under `input/`. Everything under `input/` is ignored except `input/README.md`.

---

## 6. Implementation hygiene

- When you replace or refactor behavior, **delete obsolete code** immediately (unused files, old API routes, duplicate helpers) unless a plan explicitly defers removal.

---

## 7. Coding conventions

- **Global** rules live here and in [docs/README.md](docs/README.md).
- **Area-specific** rules: [docs/contributing/INDEX.md](docs/contributing/INDEX.md) (frontend, backend, testing, …). **Document** new patterns there when you introduce them; **follow** them across the codebase.

---

## 8. Cursor / AI

- Read **`plans/CURRENT.md`** first.
- Navigate docs via **`docs/README.md`** → area **INDEX**.
- Update **docs** with every relevant code/design change.

---

_Last updated: YYYY-MM-DD_
````

---

### 5 — `plans/README.md`

````markdown
# Plans — work, next steps, and history

**Single place** to see **what we’re doing now**, **what’s next**, and **past** initiatives.

---

## Files

| File | Purpose |
|------|---------|
| **`CURRENT.md`** | **Active** plan pointer — read this first for current work and next steps. |
| **`INDEX.md`** | **All** plans with status (`Planned`, `In progress`, `Completed`, …). |
| **`<slug>.md`** | One file per initiative; steps `- [ ]` / `- [x]`; link from INDEX and CURRENT. |

---

## Workflow

1. **Start** → Create plan file → register in `INDEX.md` → point `CURRENT.md` here.
2. **During** → Tick steps; note **next items** in the plan body if helpful.
3. **Done** → Mark Completed in file + `INDEX.md` → update `CURRENT.md` to the next plan.

---

## Naming

`feature-*`, `bugfix-*`, `chore-*`, or `YYYY-MM-DD-slug.md`

---

_Last updated: YYYY-MM-DD_
````

---

### 6 — `plans/CURRENT.md`

````markdown
# Current plan (active work)

**What we’re doing right now** — read before other plans.

---

## Active plan

- **Plan:** *(set when work starts)*
- **File:** *(e.g. `plans/2026-01-01-feature-example.md`)*
- **Status:** —
- **Last updated:** YYYY-MM-DD

## Next / notes

Link the active plan file here; use the plan doc for detailed next steps.

---

_Last updated: YYYY-MM-DD_
````

---

### 7 — `plans/INDEX.md`

````markdown
# Plans index

**Current** pointer: [CURRENT.md](CURRENT.md).

| Status | Plan | Updated |
|--------|------|---------|
| *(add rows)* | | |

**Status values:** `Planned` | `In progress` | `Blocked` | `Completed` | `Cancelled`

---

_Last updated: YYYY-MM-DD_
````

---

### 8 — `docs/contributing/INDEX.md`

````markdown
# Contributing — conventions by area

Single index for **coding and testing conventions**. Root [CONTRIBUTING.md](../../CONTRIBUTING.md) covers docs, plans, env, and hygiene.

| Doc | Scope |
|-----|--------|
| [frontend.md](frontend.md) | UI, components, styling, client patterns |
| [backend.md](backend.md) | APIs, auth, data layer, server patterns |
| [testing.md](testing.md) | Unit, integration, E2E — tools, naming, where tests live |

Extend this table when you add areas (e.g. `mobile.md`, `cli.md`).

---

_Last updated: YYYY-MM-DD_
````

---

### 9 — `docs/contributing/frontend.md`

````markdown
# Frontend conventions

**Status:** Fill in as your project matures — imports, components, styling system, file layout, state, accessibility checklist.

Point to design docs under `docs/design/` and contracts under `docs/lld/`.

---

_Last updated: YYYY-MM-DD_
````

---

### 10 — `docs/contributing/backend.md`

````markdown
# Backend conventions

**Status:** Fill in — API route layout, validation, errors, DB access, logging.

Point to `docs/lld/` and `docs/db/`.

---

_Last updated: YYYY-MM-DD_
````

---

### 11 — `docs/contributing/testing.md`

````markdown
# Testing conventions

**Status:** Fill in — test runner, file naming (`*.test.ts`), colocated vs `tests/`, coverage expectations, mocks.

---

_Last updated: YYYY-MM-DD_
````

---

### 12 — `input/README.md`

````markdown
# Input (task files — not committed)

Drop **files and assets** here for a specific task (briefs, CSVs, screenshots).  

- **Git:** Contents of this folder are **ignored** — only this `README.md` is tracked.
- **Not** the source of truth — merge outcomes into `docs/`, `plans/`, or the codebase.

---

_Last updated: YYYY-MM-DD_
````

---

### 13 — `.env.example`

````bash
# Copy to .env and fill values locally. Never commit .env or secrets.
# This is the ONLY sample env file in the repo — add new variable NAMES here only.
#
# Example:
# DATABASE_URL=
# API_KEY=

````

---

### 14 — `.gitignore` (merge into existing)

Add or ensure these blocks exist (adjust for your stack — e.g. add `node_modules/`, build dirs):

```gitignore
# --- Environment & secrets (never commit) ---
.env
.env.*
!.env.example
.dev.vars

# --- Task input (local files/assets; not tracked) ---
input/*
!input/README.md

# --- Logs & OS ---
*.log
.DS_Store
```

---

## Part D — One-shot prompt (paste in a new repo)

```
I added REPO-DOCS-AND-PLANS-SCAFFOLD.md. Apply it fully:
1. Create every file in Part C with the exact contents from each section.
2. Merge §14 .gitignore blocks into any existing .gitignore.
3. Do not track input/ except input/README.md; use a single .env.example only.
4. Confirm docs/README.md is the single doc entry with INDEX chains.

Then list what was created.
```

---

## Part E — Changelog

| Date | Change |
|------|--------|
| 2026-03-20 | Single-file scaffold. |
| 2026-03-20 | Policies: plans, gitignored input, single .env.example, docs on every change, dead-code cleanup, contributing/*, indexed entry at docs/README.md. |

---

_End of scaffold — copy wholesale to another repository._
