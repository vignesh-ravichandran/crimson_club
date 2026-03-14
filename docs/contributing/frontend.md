# Contributing — Frontend

Conventions and checklist for **UI, components, pages, and client-side code**. Full design: [../lld/frontend-design.md](../lld/frontend-design.md). Main contributing rules: [../../CONTRIBUTING.md](../../CONTRIBUTING.md).

---

## 1. Where code lives

| Area | Folder | Notes |
|------|--------|--------|
| Routes and pages | `app/(auth)/`, `app/(app)/` | Next.js App Router; route map in frontend-design §8 |
| API handlers | `app/api/` | Backend; see [backend.md](backend.md) |
| UI primitives | `components/ui/` | Button, Card, Chip, Input, etc. |
| Layout | `components/layout/` | AppShell, BottomNav, PageHeader |
| Domain components | `components/domain/` | JourneyCard, DimensionRow, WeeklyReviewCard |
| Forms | `components/forms/` | Shared form patterns |
| Hooks | `hooks/` | useSession, useDailyEntry, etc. |
| API client, types, utils | `lib/` | Types match [api-contracts](../lld/api-contracts.md) |
| Global styles | `styles/globals.css` | Tailwind; tokens in tailwind.config.ts |

---

## 2. Conventions

- **Components:** PascalCase; functional only; props via `interface`. File name matches component (e.g. `JourneyCard.tsx`).
- **Hooks:** `use` + camelCase. One primary responsibility per hook.
- **Styling:** Tailwind only; use design tokens from [colour-palette](../design/colour-palette.md). No hardcoded hex for palette colors.
- **State:** Server as source of truth; minimal client state; use React Query/SWR or server components for data. Optimistic UI for daily dimension tap; invalidate after mutations.
- **Routes:** kebab-case in URL. Bottom nav: Home, Journeys, Review, Profile. Journey inner tabs: Today, Review, Insights.

---

## 3. Before you submit

- [ ] New components use tokens (no raw palette values).
- [ ] Layout order follows frontend-design §8 (action first, no graphs above daily action).
- [ ] CTA hierarchy and busy-day path respected (§12): no typing required for daily completion, no modal maze.
- [ ] Touch targets ≥ 44px for primary actions.
- [ ] If you changed a frontend pattern or convention, update [frontend-design.md](../lld/frontend-design.md) per DOCS-MANDATE.

---

## 4. References

- [docs/lld/frontend-design.md](../lld/frontend-design.md) — Full frontend design
- [docs/design/colour-palette.md](../design/colour-palette.md) — Tokens and usage
- [docs/design/ux-blueprint.md](../design/ux-blueprint.md) — Screens and blocks
- [docs/lld/api-contracts.md](../lld/api-contracts.md) — API request/response types

---

_Last updated: 2025-03-14_
