# Crimson Club — API contracts

Strict request/response shapes and error format so frontend and backend stay aligned. Implement shared TypeScript types from this; keep this doc in sync when changing APIs (see [DOCS-MANDATE.md](../DOCS-MANDATE.md)). Route list: [apis-and-modules.md](apis-and-modules.md).

---

## 1. Common conventions

- **Content-Type:** Request `application/json`; response `application/json` unless noted.
- **Dates:** ISO date string `YYYY-MM-DD` only (no time for day/week/month boundaries).
- **IDs:** UUID strings (e.g. `"550e8400-e29b-41d4-a716-446655440000"`).
- **Auth:** All mutation endpoints require a valid session cookie. Missing or invalid session → `401` with error body.

---

## 2. Error response (all 4xx/5xx)

Every error response must use this shape:

```ts
{
  error: string;   // Human-readable message
  code?: string;   // Optional machine code for client handling (e.g. "VALIDATION", "NOT_FOUND")
}
```

Example: `{ "error": "Weights must sum to 100", "code": "VALIDATION" }`. Status code is in HTTP status; body is JSON.

---

## 3. Auth & session contract

### 3.1 Session cookie

| Property | Value |
|----------|--------|
| Name | `crimson_session` (or `session`; pick one and stick to it) |
| HttpOnly | `true` |
| Secure | `true` in production; `false` in local dev (HTTP) |
| SameSite | `Lax` |
| Path | `/` |
| Max-Age | e.g. 30 days (2592000 seconds); or use `Expires` |

Cookie value: **opaque session token** (e.g. random 32-byte hex). Server stores hash in `sessions`; lookup by token hash to get `user_id`. No user data in the cookie.

### 3.2 Password hashing

- **Algorithm:** bcrypt (or argon2 if preferred; document here).
- **Cost / params:** e.g. bcrypt cost 10–12. Store only the hash in `users.password_hash`; never return it in any API response.

### 3.3 Auth request/response bodies

**POST /api/auth/sign-up**

- Request: `{ email: string; password: string; publicDisplayName: string }`. All required; email format valid; password min length (e.g. 8).
- Response: `201` with body `{ user: { id, email, publicDisplayName, primaryJourneyId, timezone } }` and Set-Cookie. Or `400` with error body (e.g. email taken, validation).

**POST /api/auth/sign-in**

- Request: `{ email: string; password: string }`.
- Response: `200` with body `{ user: { id, email, publicDisplayName, primaryJourneyId, timezone } }` and Set-Cookie. Or `401` with error body.

**GET /api/auth/me**

- Response: `200` `{ user: { id, email, publicDisplayName, primaryJourneyId, timezone } }` or `401` with error body.

---

## 4. Request/response shapes (key endpoints)

Types below are the **contract**; implement matching interfaces in code (e.g. `lib/types/api.ts`).

### 4.1 Users

**PATCH /api/users/me**  
Request: `{ publicDisplayName?: string; timezone?: string }` (IANA, e.g. `America/New_York`).  
Response: `200` `{ user: User }` where `User = { id, email, publicDisplayName, primaryJourneyId, timezone }`.

**PATCH /api/users/me/primary-journey**  
Request: `{ journeyId: string }`.  
Response: `200` `{ user: User }` or `404`.

### 4.2 Journeys

**GET /api/journeys**  
Query: `archived?: boolean`.  
Response: `200` `{ journeys: JourneySummary[] }`.  
`JourneySummary`: `{ id, name, emoji, visibility, startDate, endDate?, isPrimary?, todayState?, participantCount? }` (and any other list fields you need).

**GET /api/journeys/[id]**  
Response: `200` `{ journey: Journey; dimensions: Dimension[]; visibleLabels: JourneyVisibleLabels }` or `404`.  
`Journey`: full row (id, creatorId, name, description, emoji, visibility, startDate, endDate, whyExists?, successVision?, …).  
`Dimension`: `{ id, journeyId, position, name, description?, emoji, weight, isMandatory, whyMatters?, … }`.  
`JourneyVisibleLabels`: `{ labelMissed, labelLow, labelMedium, labelHigh, labelExcellent }`.

**POST /api/journeys**  
Request body:

```ts
{
  name: string;
  description?: string;
  emoji: string;
  visibility: 'public' | 'private';
  startDate: string;      // YYYY-MM-DD
  endDate?: string;
  whyExists?: string;
  successVision?: string;
  whatMattersMost?: string;
  whatShouldNotDistract?: string;
  strengthsToPlayTo?: string;
  dimensions: {
    name: string;
    description?: string;
    emoji: string;
    weight: number;       // 1 decimal; total 100
    isMandatory: boolean;
    whyMatters?: string;
    whatGoodLooksLike?: string;
    howHelpsJourney?: string;
    strengthGuidance?: string;
  }[];
  visibleLabels: {
    labelMissed: string;
    labelLow: string;
    labelMedium: string;
    labelHigh: string;
    labelExcellent: string;
  };
}
```

Response: `201` `{ id: string }` or `400` (e.g. weights ≠ 100, dimensions count not 2–8).

### 4.3 Daily

**GET /api/journeys/[id]/daily?date=YYYY-MM-DD**  
Response: `200` `{ entry: DailyEntry | null; dimensionValues: { dimensionId: string; canonicalScale: number }[] }`.  
`DailyEntry`: `{ id, userId, journeyId, date, reflectionNote?, createdAt, updatedAt }`.

**PUT /api/journeys/[id]/daily**  
Request:

```ts
{
  date: string;           // YYYY-MM-DD
  dimensionValues: { dimensionId: string; canonicalScale: number }[];  // 0–5
  reflectionNote?: string;
}
```

Response: `200` `{ entry: DailyEntry; dimensionValues: { dimensionId, canonicalScale }[] }` or `400` (e.g. date outside 7-day window).

### 4.4 Goals

**GET /api/journeys/[id]/goals?goalType=weekly|monthly&periodStart=YYYY-MM-DD**  
Response: `200` `{ goal: Goal | null }`.  
`Goal`: `{ id, userId, journeyId, goalType, periodStart, periodEnd, goalStatement?, outcome?, outcomeUpdatedAt?, createdAt, updatedAt }`.

**POST /api/journeys/[id]/goals**  
Request: `{ goalType: 'weekly' | 'monthly'; periodStart: string; periodEnd: string; goalStatement?: string }`.  
Response: `201` `{ id: string }` or `400`.

**PATCH /api/journeys/[id]/goals/[goalId]**  
Request: `{ outcome: number }` (0–5 canonical scale).  
Response: `200` `{ goal: Goal }` or `400` (e.g. outside 7-day edit window) / `404`.

### 4.5 Weekly reviews

**GET /api/journeys/[id]/weekly-reviews?weekStart=YYYY-MM-DD**  
Response: `200` `{ review: WeeklyReview | null }`.  
`WeeklyReview`: `{ id, userId, journeyId, weekStart, done, notes?, createdAt, updatedAt }`.

**PUT /api/journeys/[id]/weekly-reviews**  
Request: `{ weekStart: string; done: boolean; notes?: string }`.  
Response: `200` `{ review: WeeklyReview }`.

### 4.6 Lessons

**GET /api/journeys/[id]/lessons?dimensionId=&sourceType=**  
Response: `200` `{ lessons: Lesson[] }`.  
`Lesson`: `{ id, userId, journeyId, text, sourceDate, sourceType, dimensionId?, createdAt }`.  
`sourceType`: `'daily_reflection' | 'weekly_review'`.

**POST /api/journeys/[id]/lessons**  
Request: `{ text: string; sourceDate: string; sourceType: string; dimensionId?: string }`.  
Response: `201` `{ id: string }` or `400`.

### 4.7 Leaderboard

**GET /api/journeys/[id]/leaderboard?period=weekly|monthly&periodStart=YYYY-MM-DD**  
Response: `200` `{ rankings: { rank: number; userId: string; displayName: string; scorePercentage: number; rawScore?: number; trend?: 'up' | 'down' | 'same' }[] }`.

### 4.8 Home

**GET /api/home**  
Response: `200` Aggregated payload, e.g.:

```ts
{
  primaryJourney: JourneySummary | null;
  primaryTodayState: { date: string; entry: DailyEntry | null; dimensionValues: ... } | null;
  otherJourneys: JourneySummary[];
  pendingBackfillCount: number;
  pendingWeeklyReviews: { journeyId: string; weekStart: string }[];
}
```

Exact shape can be refined in code; document any change here.

---

## 5. Summary

- **Errors:** Always `{ error: string; code?: string }`.
- **Auth:** Cookie name, HttpOnly, Secure, SameSite, Max-Age; bcrypt for passwords; session lookup by token hash.
- **Shapes above:** Single source of truth for request/response; keep TypeScript types in repo in sync with this doc.

---

_Last updated: 2025-03-14_
