# Docs mandate (enforced)

**This is a hard rule.** All tools (including AI) and humans must follow it.

---

## 1. Every change must be reflected in docs

- If **anything** we build or run changes — product, design, tech stack, HLD, LLD, DB design, deployment, or which services/accounts we use — the relevant doc **must** be updated **in the same change** (same PR or immediately after).
- **Never** merge or ship a change that affects our reference without updating the doc. Consider doc update part of "done."
- If you're unsure which doc to update, check [docs/README.md](README.md). If none fits, add a new doc or section and link it from the index.

---

## 2. No work may deviate from docs without updating docs

- Work must **not** deviate from what's in the docs (product, design, tech, DB, deployment) unless the docs are updated **first or at the same time**.
- If implementation or deployment differs from the docs, that's either a bug (fix the implementation) or the docs are wrong (update the docs). Never leave docs out of date.
- **Do not** implement something that contradicts or goes beyond the docs and then leave the docs unchanged. Update the docs so they remain the single source of truth.

---

## 3. Summary

| Rule | Meaning |
|------|--------|
| **Docs updated every time** | Any change to product, design, tech, DB, deployment, or services/accounts → update the right doc. Never missed. |
| **No deviation without capture** | No work should diverge from docs without that divergence being captured in the docs. Code and deployment follow docs; docs are updated when we change direction. |

This is enforced by [CONTRIBUTING.md](../CONTRIBUTING.md) and the Cursor rule. When in doubt: update the doc.

---

_Last updated: 2025-03-14_
