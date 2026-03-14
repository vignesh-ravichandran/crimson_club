# Crimson Club — Entity-relationship view

High-level ER for the data model. Full field definitions in [data-model.md](data-model.md).

---

## Diagram (Mermaid)

```mermaid
erDiagram
    users ||--o{ sessions : "has"
    users ||--o{ journey_participants : "participates"
    users ||--o{ journeys : "creates"
    users }o--|| journeys : "primary_journey"
    users ||--o{ daily_entries : "logs"
    users ||--o{ goals : "sets"
    users ||--o{ weekly_reviews : "completes"
    users ||--o{ lessons : "saves"

    journeys ||--o{ journey_participants : "has"
    journeys ||--o{ dimensions : "has"
    journeys ||--o| journey_visible_labels : "has"
    journeys ||--o{ daily_entries : "contains"
    journeys ||--o{ goals : "scoped to"
    journeys ||--o{ weekly_reviews : "scoped to"
    journeys ||--o{ lessons : "scoped to"
    journeys ||--o{ journey_invites : "has"

    daily_entries ||--o{ daily_dimension_values : "has"
    dimensions ||--o{ daily_dimension_values : "value for"
    dimensions ||--o{ lessons : "optional link"

    users {
        text id PK
        text email UK
        text password_hash
        text public_display_name
        text primary_journey_id FK
        text timezone
    }

    journeys {
        text id PK
        text creator_id FK
        text name
        text emoji
        text visibility
        text start_date
        text end_date
    }

    dimensions {
        text id PK
        text journey_id FK
        int position
        real weight
        int is_mandatory
    }

    daily_entries {
        text id PK
        text user_id FK
        text journey_id FK
        text date
    }

    daily_dimension_values {
        text id PK
        text daily_entry_id FK
        text dimension_id FK
        int canonical_scale
    }
```

---

## Relationship summary

| From | To | Cardinality | Description |
|------|-----|-------------|-------------|
| users | sessions | 1 : n | One user, many sessions |
| users | journeys | 1 : n | Creator; also primary_journey_id points to one journey |
| users | journey_participants | 1 : n | User in many journeys |
| journeys | journey_participants | 1 : n | Journey has many participants |
| journeys | dimensions | 1 : n | 2–8 dimensions per journey |
| journeys | journey_visible_labels | 1 : 1 | One label set per journey |
| users + journeys | daily_entries | 1 : n (per journey) | One entry per user per journey per day |
| daily_entries | daily_dimension_values | 1 : n | One value per dimension per entry |
| users + journeys | goals | 1 : n | Many goal rows (weekly/monthly, per period) |
| users + journeys | weekly_reviews | 1 : n | One per week per journey |
| users + journeys | lessons | 1 : n | Many lessons per journey |
| journeys | journey_invites | 1 : n | Pending invites for private journeys |

---

_Last updated: 2025-03-14_
