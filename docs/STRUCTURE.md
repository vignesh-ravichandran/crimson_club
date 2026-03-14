# Repo structure overview

Quick reference for where everything lives. **Docs** = our reference. **Plans** = current state, tracked, so we don’t miss anything.

```
crimson_club/
├── README.md                 # Points to docs, plans, CONTRIBUTING
├── CONTRIBUTING.md           # When to update docs/plans, coding styles; links to docs/contributing/
├── .gitignore                # node_modules, .next, .env*, input/*, .wrangler, etc.
├── input/                    # Raw files for tasks (contents ignored; see input/README.md)
├── app/                      # Next.js App Router: (auth), (app), api/
├── components/               # ui/, layout/, domain/, forms/
├── hooks/                    # Shared React hooks
├── lib/                      # API client, types, utils, db (Drizzle)
├── styles/                   # globals.css, Tailwind
├── public/                   # Static assets
├── .cursor/
│   └── rules/
│       └── docs-and-plans.mdc   # Enforces: use CURRENT, update docs/plans, respect INDEX
├── docs/                     # Reference documentation only (see DOCS-MANDATE.md)
│   ├── README.md             # Doc index (start here)
│   ├── DOCS-MANDATE.md       # Enforced: every change in docs; no deviation without capture
│   ├── STRUCTURE.md          # This file
│   ├── contributing/         # Frontend and backend contributing (frontend.md, backend.md)
│   ├── product/              # PRDs, requirements, scope
│   ├── user-journey/         # Flows, personas, journey maps
│   ├── design/               # UI/UX, screens, components (captured as we build)
│   ├── tech-stack/           # Languages, frameworks, libraries, tooling
│   ├── hld/                  # High-level design: architecture, boundaries
│   ├── lld/                  # Low-level design: modules, APIs, contracts
│   ├── db/                   # DB design only (data model, ER); no schema/migrations
│   └── deployment/           # Reference: where deployed, branch→env, services & accounts per env
└── plans/                    # Current state — tracked, organised, nothing missed
    ├── README.md             # How plans work; for Cursor/tools
    ├── CURRENT.md            # Active plan (single source of truth for "now")
    ├── INDEX.md              # All plans, status (avoid reopening completed)
    └── YYYY-MM-DD-<type>-<name>.md   # Individual plans
```

**Enforcement:** Cursor rule `docs-and-plans.mdc` is always applied. CONTRIBUTING.md defines when to update docs/plans.

_Last updated: 2025-03-14_
