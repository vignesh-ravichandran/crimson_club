# Docs mandate (enforced)

**This is a hard rule.** All tools (including AI) and humans must follow it.

---

## 1. Every change must be reflected in docs

- **Any code or design change** that affects behavior, UX, APIs, architecture, data, or deployment — the relevant doc under **`docs/`** **must** be updated **in the same change** (same PR or immediately after).
- Product, design, tech stack, HLD, LLD, DB design, deployment, and **services/accounts** must stay accurate.
- **Never** merge or ship a change that affects our reference without updating the doc. Consider doc update part of "done."
- If you're unsure which doc to update, check [docs/README.md](README.md) and the area **INDEX**. If none fits, add a new doc or section and link it from the index.

---

## 2. No work may deviate from docs without updating docs

- Work must **not** deviate from what's in the docs (product, design, tech, DB, deployment) unless the docs are updated **first or at the same time**.
- If implementation or deployment differs from the docs, that's either a bug (fix the implementation) or the docs are wrong (update the docs). Never leave docs out of date.
- **Do not** implement something that contradicts or goes beyond the docs and then leave the docs unchanged. Update the docs so they remain the single source of truth.

---

## 3. Implementation cleanup

- When you **replace or refactor** implementation, **remove obsolete code** in the same effort (old modules, dead exports, duplicate API paths) unless a plan explicitly tracks deferred removal.

---

## 4. Summary

| Rule | Meaning |
|------|--------|
| **Docs updated every time** | Code/design change → update the right doc under `docs/`. Never missed. |
| **No deviation without capture** | Code and deployment follow docs; docs change when direction changes. |
| **Clean up** | Old implementation code removed when replacing behavior. |

This is enforced by [CONTRIBUTING.md](../CONTRIBUTING.md) and the Cursor rule. When in doubt: update the doc.

---

_Last updated: 2026-03-20_
