# Docs — Reference (single source of truth)

All product, design, and technical **reference** documentation lives here. **`docs/README.md` is the single entry point** — follow the index below, then each area’s **INDEX.md**, then specific files (so Cursor and humans can load context in order).

**→ Mandate:** [DOCS-MANDATE.md](DOCS-MANDATE.md) — **every code or design change** that affects reference material must update `docs/` in the same change.

**→ Conventions:** [contributing/INDEX.md](contributing/INDEX.md) — frontend, backend, testing (extend as needed).

---

## Index (where to find what)

| Area | Folder | Purpose |
|------|--------|---------|
| **Product** | [product/](product/) | PRDs, requirements, scope, success criteria |
| **User journey** | [user-journey/](user-journey/) | Flows, personas, journey maps |
| **Design** | [design/](design/) | UI/UX, design decisions, screens, components (captured as we build) |
| **Tech stack** | [tech-stack/](tech-stack/) | Languages, frameworks, libraries, tooling we use |
| **HLD** | [hld/](hld/) | High-level design: architecture, boundaries, main components |
| **LLD** | [lld/](lld/) | Low-level design: modules, APIs, detailed behaviour |
| **DB** | [db/](db/) | **Design only** — data model, ER, data dictionary (no schema/migrations here) |
| **Deployment** | [deployment/](deployment/) | **Reference only** — where we’re deployed, branch→env, **services & accounts per env**, what to update |
| **Contributing** | [contributing/](contributing/) | Code style by area — [INDEX.md](contributing/INDEX.md) |
| **Reuse (portable)** | [reuse/](reuse/) | **Copy one file to other repos** — [REPO-DOCS-AND-PLANS-SCAFFOLD.md](reuse/REPO-DOCS-AND-PLANS-SCAFFOLD.md) (Cursor generates the rest) |

---

## Reference index (key documents)

Quick links to the main reference docs. Each area has an **INDEX** file listing all documents in that folder.

| Area | Index | Key documents |
|------|--------|----------------|
| **Product** | [product/INDEX.md](product/INDEX.md) | [prd.md](product/prd.md) — Final Product Requirements |
| **User journey** | [user-journey/INDEX.md](user-journey/INDEX.md) | [user-journey.md](user-journey/user-journey.md) — User Journey Design |
| **Design** | [design/INDEX.md](design/INDEX.md) | [ux-blueprint.md](design/ux-blueprint.md), [colour-palette.md](design/colour-palette.md), [logo.png](design/logo.png) |
| **LLD** | [lld/INDEX.md](lld/INDEX.md) | [apis-and-modules.md](lld/apis-and-modules.md), [api-contracts.md](lld/api-contracts.md), [frontend-design.md](lld/frontend-design.md) |
| **Tech stack** | [tech-stack/INDEX.md](tech-stack/INDEX.md) | [tech-stack.md](tech-stack/tech-stack.md) — stack + free tier + local dev |
| **HLD** | [hld/INDEX.md](hld/INDEX.md) | [architecture.md](hld/architecture.md) — single app, Pages + D1, free tier |
| **DB design** | [db/INDEX.md](db/INDEX.md) | [data-model.md](db/data-model.md), [er-diagram.md](db/er-diagram.md), [data-dictionary.md](db/data-dictionary.md) |
| **Contributing** | [contributing/INDEX.md](contributing/INDEX.md) | [frontend.md](contributing/frontend.md), [backend.md](contributing/backend.md), [testing.md](contributing/testing.md) |

When you add new docs, add a row to the relevant INDEX and keep this table in sync for the main references.

**Portable methodology:** Copy [reuse/REPO-DOCS-AND-PLANS-SCAFFOLD.md](reuse/REPO-DOCS-AND-PLANS-SCAFFOLD.md) to another repo and ask Cursor to apply it — it contains every file to create.

---

## Rules

1. **One place** — Product/design/tech/HLD/LLD/DB/deployment decisions live under `docs/`. No duplicate source of truth elsewhere.
2. **Update every time** — Any change to what we build or how we run it **must** be reflected in the relevant doc. See [DOCS-MANDATE.md](DOCS-MANDATE.md) and [CONTRIBUTING.md](../CONTRIBUTING.md).
3. **No deviation without capture** — Work must not diverge from docs without updating the docs. Docs stay the source of truth.
4. **Docs = reference** — This is our reference. **Plans** (`plans/`) are for current state and tracking so we don’t miss anything.

---

## Monorepo

Docs can reference apps/packages by path (e.g. `apps/web`, `packages/db`). App READMEs can point back here for full design and deployment reference.

---

_Last updated: 2026-03-20_
