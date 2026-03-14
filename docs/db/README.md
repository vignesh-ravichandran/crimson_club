# Database design (reference only)

**Design documentation only** — data model, entities, relationships. No schema files or migrations here; those live in the codebase. This folder is our **reference** for what the data looks like and why.

- **Data model** — entities, relationships, cardinality
- **ER** — entity-relationship view
- **Data dictionary** — meaning of entities and key fields (design intent)

Do **not** put migration scripts or schema DDL here; this is the design reference we keep in sync when we change the model.

- **Index:** [INDEX.md](INDEX.md) — list of DB design docs for reference.

## Naming

- `data-model.md` — Overall data model / entities
- `er-diagram.md` — ER view (or link to diagram)
- `data-dictionary.md` — Field-level reference and intent
