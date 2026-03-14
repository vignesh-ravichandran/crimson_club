# Crimson Club — Frontend Design Document

Single source of truth for **frontend architecture, choices, coding conventions, components, pages, and state management**. All frontend work must align with this doc. Update this doc when frontend decisions or patterns change (see [DOCS-MANDATE.md](../DOCS-MANDATE.md)).

**Related docs:** [../design/ux-blueprint.md](../design/ux-blueprint.md) (screens, flows), [../design/colour-palette.md](../design/colour-palette.md) (tokens, component colors), [../product/prd.md](../product/prd.md), [../user-journey/user-journey.md](../user-journey/user-journey.md), [../tech-stack/tech-stack.md](../tech-stack/tech-stack.md), [../hld/architecture.md](../hld/architecture.md). Backend API contracts: [apis-and-modules.md](apis-and-modules.md).

---

## 1. Purpose and scope

### 1.1 What this doc covers

- **Technology choices** — Why we use Next.js, React, TypeScript, Tailwind (and any frontend-specific libs).
- **Coding conventions** — Naming, file layout, TypeScript/React patterns, Tailwind usage.
- **Design system** — Components, tokens, patterns so UI stays consistent.
- **Pages and screens** — Route structure, layout, and mapping from [ux-blueprint](../design/ux-blueprint.md).
- **State management** — Where state lives (server vs client), patterns (hooks, context, server state).
- **Consistency rules** — UX guardrails (e.g. busy-day protection, CTA hierarchy) that frontend must enforce.

### 1.2 What this doc does not cover

- Backend API contracts → [apis-and-modules.md](apis-and-modules.md).
- Data model → [../db/](../db/).
- Deployment and envs → [../deployment/](../deployment/).

---

## 2. Design choices and rationale

### 2.1 Why this stack (frontend slice)

| Choice | Rationale |
|--------|-----------|
| **Next.js** | SSR/SSG, file-based routing, API routes; fits PWA and Cloudflare Pages. Single app serves UI and API ([../hld/architecture.md](../hld/architecture.md)). |
| **React** | Component model, hooks, broad ecosystem; matches PRD's mobile-first PWA and component-driven UI. |
| **TypeScript** | Typing across app and API; fewer runtime bugs, better refactors and editor support. |
| **Tailwind CSS** | Utility-first; fast to align with [colour-palette](../design/colour-palette.md), no separate CSS-in-JS runtime. Design tokens live in Tailwind config. |
| **One theme only (crimson, dark-on-light)** | PRD: no light/dark toggle; crimson-red base, clean minimal UI ([../product/prd.md](../product/prd.md)). |

### 2.2 UX north star (frontend responsibility)

The frontend must protect:

1. **Daily use stays faster than skipping the app** — Tap-first, minimal typing, no modal maze ([ux-blueprint §11](../design/ux-blueprint.md)).
2. **Three modes, not one overloaded screen** — **Today** (act), **Review** (reflect), **Insights** (analyze); separate views/tabs, not a single long scroll ([user-journey](../user-journey/user-journey.md)).
3. **CTA hierarchy** — 1) Mark today, 2) Open Weekly Review, 3) View/update goal, 4) Open insights, 5) Read notes/lessons ([ux-blueprint §5](../design/ux-blueprint.md)).

Any new screen or component must not break these (e.g. no graphs above primary action, no typing required for daily completion).

---

## 3. Tech stack (frontend)

| Layer | Technology | Notes |
|-------|------------|--------|
| Framework | Next.js | App Router preferred when adopted; otherwise Pages Router. SSR where needed for auth/initial data. |
| UI | React 18+ | Functional components, hooks only. No class components. |
| Language | TypeScript | Strict mode. No `any` without explicit justification and comment. |
| Styling | Tailwind CSS | Utility-first; extend with design tokens from [colour-palette](../design/colour-palette.md). No inline styles for layout/colors; use Tailwind classes. |
| PWA | Next.js PWA / workbox | Installable, mobile-first; offline for static assets as per PRD. |

Additional frontend libraries (e.g. forms, charts, date handling) must be documented in [../tech-stack/tech-stack.md](../tech-stack/tech-stack.md) when introduced.

---

## 4. Project structure and file organization

### 4.1 Recommended layout (Next.js app under e.g. `apps/web` or root)

```
apps/web/                    # or project root if single app
├── app/                      # or pages/ if using Pages Router
│   ├── (auth)/               # auth layout group: sign-in, sign-up
│   ├── (app)/                # main app layout: Home, Journeys, Review, Profile
│   │   ├── layout.tsx        # shell: bottom nav, provider
│   │   ├── page.tsx          # Home
│   │   ├── journeys/
│   │   │   ├── page.tsx      # Journeys list
│   │   │   └── [id]/         # Journey detail: Today / Review / Insights
│   │   ├── review/
│   │   └── profile/
│   └── layout.tsx            # root layout
├── components/
│   ├── ui/                   # primitives (Button, Card, Chip, Input, etc.)
│   ├── layout/               # AppShell, BottomNav, PageHeader
│   ├── domain/               # feature-specific (JourneyCard, DimensionRow, WeeklyReviewCard)
│   └── forms/                # shared form patterns if needed
├── hooks/                    # shared hooks (useSession, useJourney, etc.)
├── lib/                      # api client, utils, constants
├── styles/
│   └── globals.css           # Tailwind imports, any global overrides
└── tailwind.config.ts        # design tokens from colour-palette
```

### 4.2 Naming conventions

| Kind | Convention | Example |
|------|------------|--------|
| **React components** | PascalCase | `JourneyCard.tsx`, `DimensionRow.tsx` |
| **Files (components)** | PascalCase for components | `Button.tsx`, `PrimaryJourneyHero.tsx` |
| **Hooks** | `use` + camelCase | `useSession.ts`, `useDailyEntry.ts` |
| **Utils / lib** | camelCase | `formatScore.ts`, `apiClient.ts` |
| **Constants** | UPPER_SNAKE or camelCase per usage | `SCALE_LABELS`, `defaultVisibleLabels` |
| **Routes** | kebab-case in URL | `/journeys`, `/journeys/[id]`, `/review` |
| **CSS/Tailwind** | Use Tailwind utilities; custom classes kebab-case if needed | `text-primary`, `bg-crimson-subtle` |

---

## 5. Coding conventions

### 5.1 TypeScript

- **Strict mode** enabled. No `any` unless justified in a comment.
- **Props:** Prefer `interface` for component props; export when reused.
- **API types:** Define request/response types (or infer from Drizzle/API); keep in `lib/types` or next to API client.
- **Enums / unions:** Use string literal unions for fixed sets (e.g. scale levels, visibility types) for better DX and tree-shaking.

```ts
// Prefer
type VisibilityType = 'public' | 'private';
type ScaleLevel = 'missed' | 'low' | 'medium' | 'high' | 'excellent';

// Avoid enums unless needed for reverse mapping
```

### 5.2 React

- **Functional components only.** No class components.
- **Hooks:** Use for state, side effects, and shared logic; keep hooks focused and small.
- **Composition over prop drilling:** Use composition and (if needed) limited context for cross-cutting state (e.g. session).
- **Keys:** Stable, unique keys for lists (id, not index).
- **Accessibility:** Semantic HTML; buttons for actions, links for navigation; `aria-*` where needed (see §11).

### 5.3 Tailwind and styling

- **Design tokens:** All colors and key spacing come from [colour-palette](../design/colour-palette.md). Map tokens in `tailwind.config.ts` (e.g. `colors.brand.crimson`, `colors.text.primary`).
- **Prefer Tailwind classes** over custom CSS. Custom CSS only for things Tailwind cannot express (e.g. complex animations).
- **No arbitrary values for colors** — use token names so palette changes stay central.
- **Mobile-first:** Base styles for mobile; `sm:`, `md:` for larger screens. Touch targets ≥ 44px for primary actions ([ux-blueprint](../design/ux-blueprint.md), PRD).

Example token usage:

```ts
// tailwind.config.ts — extend theme with palette
theme: {
  extend: {
    colors: {
      brand: {
        crimson: '#B4233C',
        crimsonActive: '#C7364F',
        crimsonDeep: '#7A1E2D',
        crimsonTint: '#F8E8EB',
      },
      surface: { app: '#FAF8F5', DEFAULT: '#FFFFFF', subtle: '#F3F0EC', crimsonSubtle: '#F8E8EB' },
      // ... rest from colour-palette
    },
  },
}
```

---

## 6. Design tokens and Tailwind

### 6.1 Token set (source: colour-palette)

All tokens must be defined in Tailwind config and used via class names. Do not hardcode hex values in components.

| Category | Tokens | Usage |
|----------|--------|--------|
| **Background** | `bg-app`, `bg-surface`, `bg-subtle`, `bg-crimsonSubtle` | Screen, cards, grouped sections, selected state |
| **Text** | `text-primary`, `text-secondary`, `text-tertiary`, `text-onCrimson` | Body, labels, meta, on crimson buttons |
| **Border** | `border-default`, `border-strong`, `border-crimson` | Inputs, cards, selected/focus |
| **Brand** | `brand-crimson`, `brand-crimsonActive`, `brand-crimsonDeep`, `brand-crimsonTint` | CTAs, active state, emphasis |
| **Semantic** | `semantic-success`, `semantic-warning`, `semantic-danger`, `semantic-info` (+ Bg variants) | Success/warning/danger/info only where meaning requires it |

Rule: **Monochrome first, crimson second.** Build in white, ink, and thin borders; add crimson for brand, selection, and primary action ([colour-palette §2](../design/colour-palette.md)).

### 6.2 Spacing and typography

- Define a small set of spacing scales (e.g. 2, 3, 4, 5, 6, 8, 10, 12 in Tailwind units) and use consistently.
- Typography: one or two font families (e.g. system stack + one display font if desired). Sizes: base for body, `sm` for secondary, `xs` for tertiary; headings use `lg`/`xl`/`2xl` as per hierarchy. Document in this section when chosen.

---

## 7. Components

### 7.1 Component layers

| Layer | Purpose | Examples |
|-------|---------|----------|
| **UI (primitives)** | Reusable, token-driven, minimal logic | Button, Card, Chip, Input, Label, Tabs, Divider |
| **Layout** | Shell and structure | AppShell, BottomNav, PageHeader, Section |
| **Domain** | Feature-specific, may use API/hooks | JourneyCard, DimensionRow, WeeklyReviewCard, GoalCard, LessonItem |

New UI primitives must follow [colour-palette](../design/colour-palette.md) for states (default, selected, disabled, danger).

### 7.2 Button variants

| Variant | Use case | Style (from colour-palette) |
|---------|----------|----------------------------|
| **Primary** | Main CTA (e.g. Create journey, Mark done) | `bg-brand-crimson` + `text-onCrimson` |
| **Primary secondary** | Less pressure, still primary action | `bg-surface` + `border-crimson` + `text-brand-crimson` |
| **Secondary** | Cancel, back, low emphasis | `bg-surface` + `border-default` + `text-primary` |
| **Ghost / text** | Tertiary actions | `text-primary` or `text-secondary`, no border |

Use primary (filled crimson) sparingly so it stays meaningful.

### 7.3 Cards

- Default: `bg-surface`, `border-default`, minimal or no shadow.
- Selected / active: `bg-crimsonSubtle`, `border-crimson` ([colour-palette §3](../design/colour-palette.md)).

### 7.4 Chips and segmented controls

- **Default chip:** `bg-surface`, `border-default`, `text-secondary`.
- **Selected chip:** `bg-crimsonSubtle`, `border-crimson`, `text-brand-crimsonDeep`. Used for dimension logging labels and filters.
- Chips must be **large enough for one-thumb tap** (PRD); prefer min height 44px for primary action chips.

### 7.5 Inputs

- Background: `bg-surface`. Border: `border-default`; focus: `border-crimson`.
- Helper text: `text-secondary`. Error state: semantic danger.

### 7.6 Tabs

- Inactive: `text-tertiary`. Active: `text-primary` + indicator `brand-crimson`. Used for Journey inner tabs (Today / Review / Insights) and similar.

### 7.7 Lists and rows

- Use semantic list markup (`ul`/`ol` or role="list" where needed). Dividers: `border-default`. Row tap targets ≥ 44px for primary actions.

---

## 8. Pages and screens

### 8.1 Route map (from ux-blueprint and user-journey)

| Route | Screen | Layout / notes |
|-------|--------|----------------|
| `/` (when authenticated) | Home | Primary journey hero, today summary, other journeys, backfill prompt |
| `/sign-in` | Sign in | Auth layout, no bottom nav |
| `/sign-up` | Sign up | Auth layout |
| `/journeys` | Journeys list | Primary, active, shared, archived; CTA Create journey |
| `/journeys/[id]` | Journey detail | Inner tabs: **Today** (default), **Review**, **Insights** |
| `/journeys/[id]/review-weekly` (or modal) | Weekly Review | Summary first, then prompts, note, Save as lesson, Mark done |
| `/journeys/[id]/goal-monthly` (or modal) | Monthly goal update | Goal statement, scale choice, optional note, Save |
| `/review` | Cross-journey Review tab | Pending weekly reviews, recent reflections, recent lessons |
| `/profile` | Profile | Display name, email, primary journey, archive, Sign out |
| Setup flow | Multi-step (wizard) | Post sign-up: welcome → journey basics → foundation → dimensions → weights → labels → review → primary |

Exact paths may be adjusted (e.g. modals vs routes for weekly review); keep this table and [ux-blueprint](../design/ux-blueprint.md) in sync.

### 8.2 Layout order (critical for UX)

- **Home:** Primary journey hero → Today summary → Other active journeys → Pending/backfill → Archived entry.
- **Journey — Today view:** Purpose strip → Weekly goal card → Weekly Review card → Monthly goal card → Today's dimensions → Done state → Optional daily reflection. No graphs or leaderboard above the fold ([ux-blueprint §7](../design/ux-blueprint.md)).
- **Journey — Review view:** Journey foundation → Dimension guidance → Weekly review archive → Daily reflection archive → Lessons.
- **Journey — Insights view:** Insight chips → Callouts → Charts → Leaderboard last.

Order protects "action first, analysis later" and busy-day completion.

### 8.3 Default expanded vs collapsed

- **Expanded by default:** Primary journey hero, Today's dimensions, Weekly goal card, Pending Weekly Review card.
- **Collapsed or secondary:** Full journey foundation, dimension meaning details, analytics below fold, leaderboard in Insights.

---

## 9. State management

### 9.1 Principles

- **Server as source of truth** — All persistent data (journeys, dimensions, daily entries, goals, reviews, lessons, user) lives in D1. Frontend does not own canonical state.
- **Minimal client state** — Only what's needed for UI (e.g. open/closed accordion, form draft before submit, selected tab).
- **No global client store by default** — Prefer server state (fetch/React Query/SWR or Next.js server components) + local component state + optional small context (e.g. session).

### 9.2 Where state lives

| State type | Where | Example |
|------------|--------|--------|
| **Session / auth** | Server (cookie) + optional client context for "current user" | Session from API; React context or provider for user display |
| **Journey list, journey detail** | Server (API) + cache (e.g. React Query) | Fetch on route; invalidate after mutations |
| **Today's dimensions (daily entry)** | Server (API); optimistic UI allowed | Autosave on tap; optimistic update then confirm |
| **Form drafts (e.g. create journey)** | Client (component or wizard state) | Until submit; then server |
| **UI only** | Component state or small context | Tab index, modal open, accordion open |
| **Pending backfill count, pending reviews** | Server (API) or derived from server state | Fetched with home data or review list |

### 9.3 Data fetching and mutations

- **Fetch:** Use Next.js server components where possible for initial data; client components use a single pattern (e.g. React Query or SWR) for client fetches and cache invalidation.
- **Mutations:** After create/update/delete, invalidate relevant queries so UI reflects server. Autosave (e.g. dimension tap) should use debounced or immediate mutation + optimistic update; show loading/error only when necessary to avoid blocking the "done for today" feeling.
- **No Redux/MobX** unless a clear need emerges; document in tech-stack and here if introduced.

### 9.4 Autosave and optimistic UI

- **Daily dimension logging:** On label tap → send API request; optimistically update local display; on error, revert and show brief feedback.
- **Daily reflection note:** Optional; autosave on blur or short debounce; do not block "done" state on save.

---

## 10. Routing and navigation

### 10.1 Bottom navigation (four tabs)

- **Home** — `/` (or `/home` if needed).
- **Journeys** — `/journeys`.
- **Review** — `/review`.
- **Profile** — `/profile`.

Implement as a persistent bottom bar in the app layout; active tab indicated with `brand-crimson` per [colour-palette](../design/colour-palette.md).

### 10.2 Journey inner navigation

Inside `/journeys/[id]`: **Today** | **Review** | **Insights** as tabs or segmented control. Default tab: **Today**. URL can reflect tab (e.g. `?tab=insights`) for shareability and back button.

### 10.3 Deep linking and back behavior

- PWA: support direct open to journey or review when we add deep links. Back from journey detail should return to Journeys or Home as per user entry point.

---

## 11. Accessibility

- **Contrast:** Body text and interactive elements meet WCAG AA on white/subtle surfaces ([colour-palette §6](../design/colour-palette.md)). Crimson text only for medium-to-large labels/buttons, not long body copy.
- **Touch targets:** Minimum 44×44px for primary actions (PRD; one-thumb-friendly).
- **Semantic HTML:** Buttons for actions, links for navigation; headings hierarchy (h1 → h2 → h3).
- **Focus:** Visible focus style (e.g. `border-crimson` or ring) for keyboard users.
- **Labels:** All form inputs have associated labels; icon-only buttons have `aria-label`.
- **Screen readers:** Critical status (e.g. "Done for today", "Saved") announced via live region or role when appropriate.

When adding new components or pages, check contrast and keyboard/pointer behavior and document any exceptions here.

---

## 12. Consistency rules and UX guardrails

The frontend must enforce these; do not add features that contradict them without updating this doc and [ux-blueprint](../design/ux-blueprint.md).

1. **Busy-day path:** User can complete daily flow (open app → primary journey → tap all dimension labels → see done state) with **no typing**, **no modal maze**, **no forced reflection**, **no graphs above action**, **no leaderboard before action** ([ux-blueprint §7](../design/ux-blueprint.md)).
2. **CTA hierarchy:** Primary CTA on each screen follows: Mark today > Open Weekly Review > View/update goal > Open insights > Read notes/lessons.
3. **No light theme:** One theme only; crimson-based, no user-controlled theme ([../product/prd.md](../product/prd.md)).
4. **Backfill tone:** "X days pending" + Backfill CTA; calm, neutral, no guilt language ([ux-blueprint §8](../design/ux-blueprint.md)).
5. **Shared journeys:** Daily logging remains private; leaderboard visible but not first thing; personal-first ([ux-blueprint §9](../design/ux-blueprint.md)).

---

## 13. Summary checklist for new work

When adding or changing frontend code:

- [ ] Use design tokens from Tailwind (no hardcoded colors from palette).
- [ ] Use or extend existing UI primitives; document new primitives and add to §7 if they become part of the system.
- [ ] Follow naming and file structure in §4.
- [ ] Keep state minimal; server as source of truth; document any new client state pattern in §9.
- [ ] Preserve layout order and expanded/collapsed defaults from §8.
- [ ] Respect CTA hierarchy and busy-day rules in §12.
- [ ] Update this doc when you change a frontend decision or pattern (DOCS-MANDATE).

---

## 14. References

| Doc | Content |
|-----|--------|
| [../design/ux-blueprint.md](../design/ux-blueprint.md) | Screens, blocks, CTA hierarchy, busy-day rules |
| [../design/colour-palette.md](../design/colour-palette.md) | Tokens, component colors, charts, accessibility |
| [../product/prd.md](../product/prd.md) | Requirements, scale, goals, PWA, theme |
| [../user-journey/user-journey.md](../user-journey/user-journey.md) | Flows, daily/weekly/deep-dive, navigation |
| [../tech-stack/tech-stack.md](../tech-stack/tech-stack.md) | Stack, local dev, free tier |
| [../hld/architecture.md](../hld/architecture.md) | System shape, single app, D1 |
| [apis-and-modules.md](apis-and-modules.md) | API routes, modules, server flows |

---

_Last updated: 2025-03-14_
