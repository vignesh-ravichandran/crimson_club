Crimson Club — Final Product Requirements

1. Product Summary

Crimson Club is a mobile-first, iPhone-first PWA for:

daily execution tracking,

weekly and monthly goal check-ins,

weekly reflection,

lesson capture,

personal improvement over time.

It is not just a habit tracker. It is a performance + review system.

Core loop:

Daily = capture

Weekly = synthesize

Lessons = preserve learning

2. Product Goals

The app should help users:

stay aligned to what matters most,

track execution with very low friction,

review themselves honestly,

remember why they started,

preserve lessons learned,

compare against others and against their own baseline,

improve without daily tracking feeling like homework.

3. Platform and Theme
Platform

PWA

Mobile-first

Optimized primarily for iPhone

Installable to Home Screen

Theme

One theme only 

Crimson-red based

Clean, minimal, premium UI

Low clutter

Big touch targets

One-thumb-friendly

Visual Rules

No light theme

No photo uploads

No custom icons

No category tags

No user-controlled color system

Emoji only for journeys and dimensions

Emoji reuse is allowed

4. Authentication and Account
Authentication

Email

Password

No other auth methods.

Account Fields

Email

Password

Public display name

Primary journey selection

Account Rules

Public display name is used on leaderboards

User can change primary journey anytime

All daily, weekly, and monthly calculations use the user's timezone

5. Journey Model
Journey Definition

A Journey is the main tracking container.

Journey Fields

Name

Description

Emoji

Visibility type

Start date

Optional end date

Dimensions

Participants

Score history

Journey purpose

Success vision

Priority guidance

Strength guidance

Visibility Types

Public — anyone can join instantly

Private — direct invite only

Journey Rules

User can create multiple journeys

User can join multiple journeys

Journey can have unlimited participants

Participant can leave a journey

Leaving stops future leaderboard participation

Historical completed-period records remain

Journey Structure Rules

A journey's scoring structure is fixed after creation.

These cannot be edited after creation:

dimensions

weights

mandatory/optional flags

visibility type

If user wants to change structure:

hard delete the journey

create a new one

Hard Delete Rules

Creator can hard delete even if participants exist

Strong confirmation required

Must warn that participant history in that journey will be permanently removed

Ended Journey Behavior

If a journey reaches end date:

it freezes

no more tracking allowed

scores remain visible

it becomes view-only

it moves to archive

6. Journey Creation Metadata

Journey creation is a higher-effort one-time setup.
This is where deeper thinking is allowed.

Optional Journey Foundation Fields

Why this journey exists

What success looks like in the future

What matters most in this journey

What should not distract me in this journey

What strengths should I keep playing to

Rules

These are optional

These are editable later

These do not affect scoring

These should remain visible later inside the journey

7. Dimensions
Dimension Definition

A Dimension is a measurable area inside a journey.

Examples:

workout

deep work

reading

no smoking

finance awareness

communication

Dimension Fields

Name

Description

Emoji

Weight

Mandatory or optional flag

Dimension purpose

Success definition

Strength guidance

Optional Dimension Meaning Fields

For each dimension, user may capture:

Why this dimension matters

What good looks like here

How this helps the journey succeed

What personal strength can help me win here

Dimension Rules

Each journey must have 2 to 8 dimensions

A journey may have 0 mandatory dimensions

Dimension weights are based on importance

Total weight across all dimensions must equal 100

Weights support 1 decimal place

App auto-distributes weights equally by default

User may adjust weights before saving

Journey can be saved only when total weight = 100

8. Scale System
Internal Canonical Scale

Under the hood, the system always uses:

Missed

Low

Medium

High

Excellent

This drives:

scoring

analytics

leaderboards

goal outcomes

User-Facing Display Labels

Visible labels can be customized at the journey level.

Rules:

one label set per journey

all dimensions in that journey use the same visible label set

visible labels do not affect scoring logic

visible labels can be edited later

Default Suggested Visible Labels

For build / action-oriented journeys:

Missed

Showed up

Progressed

Built

Conquered

Mapping:

Missed → Missed

Showed up → Low

Progressed → Medium

Built → High

Conquered → Excellent

9. Daily Logging
Daily Entry Rules

One entry per day per journey

User can edit today's entry

User can edit past entries for up to 7 days

Each daily entry includes one value per dimension

Autosave happens on every tap

Unlogged Day Behavior

A day remains blank / unlogged until the 7-day edit window closes.

When the window closes:

unresolved mandatory dimensions become Missed mandatory

unresolved optional dimensions become Missed optional

10. Daily Reflection

Daily reflection must stay lightweight.

Daily Reflection UX

After user marks all dimensions, the screen should still show:

all dimensions

current selections

updated score state

done state

a small optional reflection prompt

Prompt

"Reflect on your day"

optional field: Any learning to carry forward?

Rules

typing is optional

completion never requires typing

should be doable in under a minute even on busy days

11. Scoring System
Score Factors

Missed optional = 0.00

Missed mandatory = -0.50

Low = 0.25

Medium = 0.50

High = 0.75

Excellent = 1.00

Dimension Score Formula

dimension_score = dimension_weight × score_factor

Example for Weight 20

Missed optional = 0

Missed mandatory = -10

Low = 5

Medium = 10

High = 15

Excellent = 20

Daily Journey Score

Daily journey score = sum of all dimension scores for that day

Score Range

Best possible daily score = 100

Minimum daily score = -0.50 × total mandatory weight

Examples:

all optional → minimum 0

all mandatory → minimum -50

Display Rule

Scores are shown rounded to 1 decimal place

12. Goals System
Goal Types

Weekly goal

Monthly goal

Goal Level

Goals exist only at the journey level

There are no dimension-level goals

Goal Ownership

Goals are always private

Each user creates goals only for themselves

Goals are optional

Per journey, user can have:

one weekly goal

one monthly goal

Goal Period Definitions

Week = Monday 00:00 to Sunday 23:59

Month = calendar month

based on user timezone

Goal Behavior

User creates a journey-level goal

During the active period, app only shows that the goal exists and is not completed yet

No provisional score shown during the period

At period end, user updates goal outcome using the same canonical scale

Goal outcome remains editable for 7 days after period close

If still unresolved after that, it auto-finalizes as Missed

Goal Scoring

Goal outcomes contribute to score using the same canonical factor mapping.

13. Weekly Review System

Weekly review is a ritual, not a scoring object.

Weekly Review Card

Each active journey automatically gets:

one Weekly Review card per week

shown near the top until completed

status: Not done / Done

one-tap completion

optional notes field

editable for 7 days after week close

Weekly Review Rules

Weekly Review does not create score

If not completed, it stays not completed

It does not auto-convert to score

Weekly Review Summary

Before notes, show:

strongest dimension this week

weakest weighted dimension this week

missed mandatory count

score vs last week

Weekly Review Guidance

Prompts like:

Are you staying prioritized on what matters most?

Are you spending enough effort on the highest-weight areas?

Are you doing the most rewarding and high-leverage items?

What should you continue because it is working?

What should you correct next week?

Purpose:

synthesize

detect drift

course-correct

reinforce 80/20 thinking

14. Lessons System

A Lesson is a saved insight under a journey.

Lesson Fields

Text

Source date

Source type:

Daily reflection

Weekly review

Optional linked dimension

Lesson Behavior

User can write notes without classifying immediately

Later, user can choose Save as lesson

Linking to a dimension is optional

Lessons stay accessible over time inside the journey

Purpose:

preserve real learning

avoid losing insight inside old notes

15. Review and Lessons Section

Each journey includes a Review & Lessons section containing:

Weekly review history

Daily reflection history

Saved lessons

Filter by dimension

Purpose:

revisit lessons

revisit why the journey exists

track how thinking evolves

stay true to the original purpose

16. Leaderboards
Leaderboard Periods

Weekly

Monthly

No daily leaderboard.

Inclusion Rule

Only users with at least one submitted daily entry in that period appear.

Ranking Formula

Leaderboards rank by normalized score percentage

leaderboard_score_percentage = total_score_earned ÷ total_best_possible_score × 100

Where:

total_score_earned = actual score earned in that period

total_best_possible_score = max possible score during the user's active days in that period

Late Join Handling

If user joins late:

score only counts from join date

denominator also counts only from join date

this keeps ranking fair

Tie Breakers

Higher raw total score

Fewer missed mandatory dimensions

Earlier join date

Display

Rank

Public display name

Score percentage

Trend

17. Insights and Guidance

The app should surface:

lowest-performing dimensions

most inconsistent dimensions

most improved dimensions

high-weight dimensions with weak performance

score vs previous week

score vs previous month

score vs personal baseline

whether higher-weight dimensions are improving

current strengths

Guidance Style

Insights should not only show numbers. They should guide better choices.

Examples:

Are higher-weight dimensions improving?

Are lower-weight dimensions taking too much attention?

What is currently a strength?

What strengths should be protected and sharpened?

18. Analytics Views

Included analytics:

Radar / Spider chart

Consistency chart

Daily score trend line

Calendar heatmap / streak calendar

Dimension-wise stacked bar chart

Weighted gap chart

Goal progress rings

Distribution chart

Leaderboard trend chart

Placement Rule

Graphs and deeper analytics must sit below the primary action area

Action first, analysis later.

19. Home Screen

Home should show:

the user's single biggest-priority journey most prominently

active journeys

today's status

score snapshot

progress summary

Purpose:

reduce friction

keep the most important journey front and center

20. Journey Screen Structure

Recommended order:

Journey purpose / guidance summary

Current weekly goal card

Current Weekly Review card

Current monthly goal card

Today's dimensions with logging controls

Current score preview / done state

Insights

Analytics

Leaderboard

Review & Lessons

Journey foundation and dimension guidance

This keeps it:

alignment first

action second

analysis later

21. Daily Review Flow

Nightly flow:

Open app

Open primary journey

See weekly goal

See pending Weekly Review if any

Mark today's dimensions

See done state and score

Optionally reflect

Leave

This must be:

fast

low-friction

tap-first

workable even on low-motivation days

22. Functional Summary

Crimson Club supports:

email/password auth

public display name

primary journey

public and private journeys

direct invites for private journeys

unlimited participants

journey foundation metadata

optional dimension meaning metadata

journey-level visible labels

2–8 dimensions

weights summing to 100

mandatory and optional dimensions

one daily entry

7-day edit window

autosave on every tap

weighted scoring

private daily reflection

one private weekly goal per journey

one private monthly goal per journey

Weekly Review ritual

Lessons system

review archive

weekly/monthly leaderboards

normalized ranking

personal baseline comparison

analytics suite

archived ended journeys

iPhone-first PWA experience

23. Product Positioning

Crimson Club is a disciplined performance and self-review system for people who want to:

track execution,

stay aligned to what matters,

reflect honestly,

preserve lessons,

improve over time.

It is not just a habit tracker.
It is a personal operating system for execution, review, and growth.
