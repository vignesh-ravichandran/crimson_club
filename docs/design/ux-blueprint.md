# Crimson Club — UX Blueprint

## 1) UX North Star

Crimson Club should feel like a **personal operating system for execution, review, and growth**.

The design must protect one rule above all:

**Daily use must stay faster and easier than skipping the app.**

The product supports three user modes:

* **Today** — act
* **Review** — reflect
* **Insights** — analyze

The app should never force all three modes into one overloaded screen.

---

## 2) Primary UX Goals

The UX should help the user do four things well:

1. **Log daily progress with very low friction**
2. **Do weekly reflection without dread or complexity**
3. **Go deep into insights only when they want to**
4. **Reconnect with the purpose of a journey whenever motivation drops**

---

## 3) Navigation Architecture

## 3.1 Bottom navigation

The app uses four main bottom tabs:

* **Home**
* **Journeys**
* **Review**
* **Profile**

### Why this is the right split

* **Home** = what matters today
* **Journeys** = browse active and archived journeys
* **Review** = cross-journey reflection and lessons
* **Profile** = account and app settings

This is simple enough for mobile and separates daily action from deeper browsing.

---

## 4) Screen-by-Screen UX Blueprint

## 4.1 Auth screens

### Screen: Sign up

#### Purpose

Create a new account with minimum friction.

#### Content

* App logo / wordmark
* Email field
* Password field
* Public display name field
* Primary CTA: **Create account**
* Secondary CTA: **Sign in**

#### UX notes

* Keep this visually minimal
* Public display name should be explained as the leaderboard name
* No social sign-in options

---

### Screen: Sign in

#### Purpose

Quick access for returning users.

#### Content

* Email
* Password
* Primary CTA: **Sign in**
* Secondary CTA: **Create account**

---

## 4.2 First-time setup flow

This is the only flow allowed to ask for more thoughtful input.
It should still feel clean and structured, not like a long form.

### Setup step 1: Welcome / positioning

#### Purpose

Orient the user to how Crimson Club works.

#### Content

* One-line product promise
* Short explanation:

  * Daily = capture
  * Weekly = review
  * Lessons = preserve learning
* CTA: **Create your first journey**

---

### Setup step 2: Journey basics

#### Purpose

Create the basic journey container.

#### Fields

* Journey name
* Emoji picker
* Description
* Visibility type:

  * Public
  * Private
* Optional end date

#### CTA

* **Continue**

#### UX notes

* Keep one screen, not multiple micro-screens
* Emoji selection should be fast and lightweight

---

### Setup step 3: Journey foundation (optional)

#### Purpose

Capture the meaning behind the journey.

#### Fields

Optional:

* Why this journey exists
* What success looks like in the future
* What matters most in this journey
* What should not distract me in this journey
* What strengths should I keep playing to

#### CTA

* **Continue**
* Secondary: **Skip for now**

#### UX notes

* Add helper text like: "This helps you stay true to the journey later."
* This screen can be more reflective because it is a one-time setup step

---

### Setup step 4: Add dimensions

#### Purpose

Define the measurable components of the journey.

#### Interaction

* Add dimension rows dynamically
* Minimum 2, maximum 8

#### Fields per dimension

* Dimension name
* Emoji
* Mandatory toggle
* Optional short description

#### CTA

* **Continue**

#### UX notes

* Keep row editing inline, not modal-heavy
* Add soft guidance text that 4–5 dimensions is often easier to manage daily, while still allowing full user control

---

### Setup step 5: Dimension meaning (optional)

#### Purpose

Capture why each dimension matters.

#### For each dimension, optional fields

* Why this dimension matters
* What good looks like here
* How this helps the journey succeed
* What strength can help here

#### CTA

* **Continue**
* Secondary: **Skip for now**

#### UX notes

* This can be an accordion per dimension to avoid visual overload
* User should not feel forced to write for every dimension

---

### Setup step 6: Weights and structure

#### Purpose

Define importance.

#### Content

* All dimensions listed with weight inputs/sliders
* Auto-filled equal weights by default
* Running total shown clearly

#### Rules displayed

* Total must equal 100
* Weight is based on importance
* Weights support 1 decimal place

#### CTA

* **Continue**

#### UX notes

* Save disabled until total = 100
* Keep this screen highly visual and simple

---

### Setup step 7: Display labels

#### Purpose

Set the visible language for the journey.

#### Default visible labels

* Missed
* Showed up
* Progressed
* Built
* Conquered

#### UX

* User can edit labels inline
* Show note that labels affect only display, not scoring

#### CTA

* **Continue**

---

### Setup step 8: Review and create

#### Purpose

Let the user confirm what they built.

#### Summary blocks

* Journey basics
* Purpose summary
* Dimensions
* Mandatory markers
* Weights
* Visible label set

#### CTA

* **Create journey**

---

### Setup step 9: Primary journey selection

#### Purpose

Set the user's main focus.

#### Content

* "Make this your primary journey?"
* Short explanation that this appears first on home

#### CTA

* **Set as primary**
* Secondary: **Maybe later**

---

## 4.3 Home screen

### Purpose

The home screen should answer:

* What matters most today?
* What still needs attention?
* Is there any pending reflection?

### Layout order

1. **Primary journey hero card**
2. **Today summary row**
3. **Other active journeys**
4. **Pending review or backfill prompts**
5. **Archived journeys entry point**

### Primary journey hero card

#### Content

* Journey emoji + name
* One-line purpose reminder
* Today status:

  * not started / in progress / done
* Today score or blank state
* Weekly goal status
* Weekly Review pending indicator if relevant
* Primary CTA: **Open journey**

#### UX notes

* This must dominate the screen visually
* The purpose reminder should be one line only by default
* Full foundation should not dump here

### Today summary row

#### Content

* number of journeys still pending today
* days pending backfill, if any
* weekly reviews pending, if any

### Other active journeys

#### Content per card

* emoji + name
* today state
* small score indicator
* tap to open

### Pending backfill prompt

#### Content

* "2 days pending"
* CTA: **Backfill**

#### Tone rule

* Never guilt-heavy
* Clear, calm, action-oriented

---

## 4.4 Journeys tab

### Purpose

Browse journeys outside the urgency of Home.

### Sections

* Primary journey
* Other active journeys
* Shared journeys
* Archived journeys

### Card content

* Journey emoji
* Journey name
* Visibility chip
* Participant count if shared
* Today completion state
* Tap to open

### CTA

* **Create journey**

---

## 4.5 Journey screen architecture

Each journey should have three internal sections:

* **Today**
* **Review**
* **Insights**

These can be implemented as segmented tabs near the top inside the journey.

### Why this matters

This prevents one long, overloaded screen and matches user intent better:

* Today = do the work
* Review = think and remember
* Insights = analyze and compare

---

## 4.6 Journey — Today view

This is the default view when opening a journey.

### Layout order

1. **Journey purpose strip**
2. **Weekly goal card**
3. **Weekly Review card**
4. **Monthly goal card**
5. **Today's dimensions list**
6. **Done state / score block**
7. **Optional daily reflection**

---

### Block 1: Journey purpose strip

#### Purpose

Reconnect the user to why this journey exists.

#### Content

* One-line purpose or success reminder
* Expand chevron to open full journey foundation

#### Example

* "Why: become sharper, stronger, and more consistent."

#### Default state

* Collapsed by default

---

### Block 2: Weekly goal card

#### Purpose

Show the user what they are attacking this week.

#### Content

* Goal title / statement
* Status: active / not completed
* Period label
* CTA: **Update later** or **View**

#### Default state

* Visible and compact

#### UX notes

* No provisional score
* No heavy detail here

---

### Block 3: Weekly Review card

#### Purpose

Make weekly synthesis visible without blocking daily action.

#### Content

* Status: pending / done
* Strongest dimension this week
* Weakest weighted dimension
* Score vs last week
* CTA: **Open review**

#### Default state

* Visible if pending or recently completed
* Compact summary form in Today view

---

### Block 4: Monthly goal card

#### Purpose

Keep month-level alignment visible but quiet.

#### Content

* Goal title / statement
* Status
* Period label
* CTA: **View**

#### UX notes

* This should be lower attention than weekly goal
* It should not compete with the daily action block

---

### Block 5: Today's dimensions list

#### Purpose

Main daily action area.

#### Row content for each dimension

* Emoji
* Name
* Weight chip
* Mandatory badge if needed
* Visible label chips/buttons

#### Interaction

* Tapping a label autosaves immediately
* Selected state updates instantly
* Score preview updates instantly

#### Default state

* Fully expanded and immediately usable

#### UX notes

* This block should take visual priority
* Chips should be large and thumb-friendly
* Avoid navigating to another screen to mark a dimension

---

### Block 6: Done state / score block

#### Purpose

Create closure and reward after logging.

#### Trigger

Appears or becomes prominent once all dimensions for the day are marked.

#### Content

* "Done for today" message
* Today's score
* One short insight

#### Example insights

* "Strong on high-weight areas."
* "One mandatory miss reduced score."
* "Better than your 7-day baseline."

#### UX notes

* This is the emotional reward moment
* Keep it crisp, not noisy

---

### Block 7: Daily reflection

#### Purpose

Allow a light review of the day.

#### Content

* Prompt: **Reflect on your day**
* Field label: **Any learning to carry forward?**
* Optional **Save** action if needed, though autosave is preferable here too

#### Default state

* Visible after or below done state
* Small footprint

#### UX notes

* Never required
* No multiple prompts
* No journaling vibe

---

## 4.7 Journey — Weekly Review screen

### Purpose

Support weekly synthesis and course-correction.

### Layout order

1. **Week header**
2. **Automatic summary block**
3. **Guidance prompts**
4. **Reflection note**
5. **Save as lesson action**
6. **Mark review done**

---

### Block 1: Week header

#### Content

* Week range
* Journey name
* Status chip

---

### Block 2: Automatic summary block

#### Content

* Strongest dimension
* Weakest weighted dimension
* Missed mandatory count
* Score vs last week
* High-weight focus callout if relevant

#### UX notes

* This block should lead the screen
* Review must start with synthesis, not blank typing

---

### Block 3: Guidance prompts

#### Content

* Are you staying prioritized on what matters most?
* Are the highest-weight dimensions getting real effort?
* Are you drifting toward lower-value effort?
* What clearly worked this week?
* What should you correct next week?

#### UX notes

* Show prompts as short cards or bullets, not a big wall of text

---

### Block 4: Reflection note

#### Content

* One optional multi-line note box

#### UX notes

* This note should feel lighter than journaling, but deeper than daily reflection

---

### Block 5: Save as lesson action

#### Content

* CTA: **Save as lesson**
* Optional dimension link selector

#### UX notes

* This should happen after note entry, not before
* Classification should stay lightweight

---

### Block 6: Mark review done

#### CTA

* **Mark Weekly Review done**

#### UX notes

* One clear end-state CTA

---

## 4.8 Journey — Monthly goal update screen

### Purpose

Let the user close out month-level intent simply.

### Layout

1. Goal statement
2. Period header
3. Visible label choices
4. Optional note
5. Save

### UX notes

* This should be much simpler than Weekly Review
* It is a goal check-in, not a reflection ritual

---

## 4.9 Journey — Review view

### Purpose

Give the user a place to revisit meaning, reflections, and lessons.

### Layout order

1. **Journey foundation**
2. **Dimension guidance**
3. **Weekly review archive**
4. **Daily reflection archive**
5. **Lessons list**

---

### Block 1: Journey foundation

#### Content

* Why this journey exists
* What success looks like
* What matters most
* What should not distract me
* Strengths to play to

#### Default state

* Expanded summary with ability to see full content

---

### Block 2: Dimension guidance

#### Content per dimension

* Why it matters
* What good looks like
* How it helps the journey succeed
* Which strength helps here

#### Default state

* Accordion list per dimension

---

### Block 3: Weekly review archive

#### Content

* Past review cards in reverse chronological order
* Each card shows week, done status, short preview, and tap to expand

---

### Block 4: Daily reflection archive

#### Content

* Date
* Score for that day
* Note preview

#### UX notes

* Keep this lightweight and scannable

---

### Block 5: Lessons list

#### Content

* Saved lesson text
* Source type
* Date
* Optional linked dimension chip
* Filter by dimension

#### UX notes

* Lessons should feel like a durable memory layer

---

## 4.10 Journey — Insights view

### Purpose

Provide deeper performance analysis without interfering with daily action.

### Layout order

1. **Insight summary chips**
2. **Key callouts**
3. **Charts section**
4. **Leaderboard section**

---

### Block 1: Insight summary chips

#### Content

* Current strength
* Current weak area
* High-weight lagging area
* Trend vs previous week
* Trend vs baseline

---

### Block 2: Key callouts

#### Content examples

* "Workout is improving and is high-weight."
* "Deep Work is important but inconsistent."
* "Communication is becoming a reliable strength."
* "Low-weight areas may be taking too much attention."

#### UX notes

* Keep these short and interpretive

---

### Block 3: Charts section

#### Included charts

* Radar chart
* Daily score trend line
* Consistency chart
* Calendar heatmap
* Dimension stacked contribution chart
* Weighted gap chart
* Goal progress rings
* Distribution chart
* Leaderboard trend chart

#### UX notes

* Prefer stacked cards, one chart per card
* Each chart card should have a one-line interpretation or takeaway

---

### Block 4: Leaderboard section

#### Content

* Rank
* Public display name
* Score percentage
* Trend

#### UX notes

* Place leaderboard after personal insights so the product stays self-management-first

---

## 4.11 Review tab (cross-journey)

### Purpose

Provide one place across the app for reflection-related items.

### Layout order

1. **Pending Weekly Reviews**
2. **Recent daily reflections**
3. **Recent lessons**

### UX notes

* This gives the user a reflection center without entering each journey separately
* Useful for users with multiple active journeys

---

## 4.12 Profile screen

### Purpose

Manage account and app settings.

### Content

* Public display name
* Email
* Primary journey selection
* Archive access
* Sign out

### Optional later settings

* score display preferences
* timezone view

---

## 5) CTA Hierarchy

The primary CTA hierarchy across the app should be:

1. **Mark today**
2. **Open Weekly Review**
3. **View / update goal**
4. **Open insights**
5. **Read old notes / lessons**

This order protects daily consistency first.

---

## 6) Collapsed vs Expanded Defaults

### Default expanded

* Primary journey hero card
* Today's dimensions
* Weekly goal card
* Pending Weekly Review card

### Default collapsed or secondary

* Full journey foundation
* Dimension meaning details
* Analytics cards below the fold
* Leaderboard deeper in the screen or in Insights
* Full lesson details

This is important to keep the daily surface area small.

---

## 7) Busy-Day UX Protection Rules

On low-motivation or busy days, the user must be able to:

1. open app
2. open primary journey
3. tap labels for all dimensions
4. see done state
5. leave

### Protection rules

* No typing required
* No modal maze
* No forced reflection
* No graphs above action
* No leaderboard before action

---

## 8) Backfill UX

### Home prompt

* "2 days pending"
* CTA: **Backfill**

### Backfill screen

* Same Today view, but for a past date
* Same dimension interactions
* Optional reflection note

### Tone

* Calm and neutral
* No guilt language

---

## 9) Shared Journey UX

The app should stay personal-first even in shared journeys.

### Shared journey principles

* Daily logging remains private to the user
* Leaderboard is visible, but not the first thing the user sees
* Joining a public journey should be instant and lightweight
* Private journeys require direct invite

---

## 10) Emotional Design Goals

### Daily mode should feel

* clear
* fast
* satisfying
* non-judgmental

### Weekly review should feel

* honest
* structured
* corrective
* useful

### Insights should feel

* sharp
* explanatory
* motivating

### Review view should feel

* grounding
* identity-reinforcing
* reflective

---

## 11) Final UX Rule

If there is ever a conflict between:

* adding more depth,
* adding more metrics,
* adding more reflection features,

and

* preserving fast daily completion,

**fast daily completion wins.**

That is the rule that protects retention and makes the rest of the system viable.
