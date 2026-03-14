# Crimson Club — User Journey Design

## 1. Core UX principle

Every open of the app should answer, in this order:

1. **What matters most right now?**
2. **What do I need to do today?**
3. **Am I improving or drifting?**

That means:

* home should point to the **primary journey**
* journey screen should prioritize **alignment + action**
* deeper reflection and analytics should be available, but never block the daily flow

---

## 2. Overall user journey map

### A. Setup journey

Used rarely. Allowed to be thoughtful.

### B. Daily journey

Used every day. Must be extremely low friction.

### C. Weekly reflection journey

Used once a week. Slightly slower, more thoughtful.

### D. Deep-dive journey

Used when user wants to inspect trends, lessons, strengths, weak spots.

### E. Re-alignment journey

Used when motivation dips and user wants to reconnect with why the journey exists.

That's the full system.

---

# 3. First-time setup journey

This is the only place where the app can ask for more thought.

## 3.1 Entry

User signs up with:

* email
* password
* public display name

Then lands on:

* **Create your first journey**

## 3.2 Create journey basics

User enters:

* journey name
* emoji
* public/private
* optional end date

This should feel quick and concrete.

## 3.3 Optional journey foundation

This is the meaning layer.

User may fill:

* Why this journey exists
* What success looks like in the future
* What matters most here
* What should not distract me
* What strengths should I keep playing to

This should be optional, but encouraged with guidance like:

* "This helps you stay true to the journey later."

## 3.4 Add dimensions

User adds 2–8 dimensions.

For each dimension:

* name
* emoji
* mandatory/optional
* optional description

## 3.5 Optional dimension meaning

For each dimension, optionally capture:

* Why this matters
* What good looks like
* How this helps the journey succeed
* What strength can help here

This is important because the user can later revisit the meaning of each dimension, not just its score.

## 3.6 Set weights

App auto-splits weights equally.
User can adjust manually.

Rules:

* total must equal 100
* show a clear weight editor
* save only when total = 100

## 3.7 Visible labels

User sees suggested journey-level visible labels:

* Missed
* Showed up
* Progressed
* Built
* Conquered

User can edit them if wanted.

## 3.8 Review summary

Before final save, show a compact summary:

* journey purpose
* dimensions
* weights
* mandatory items
* visible labels

## 3.9 Mark as primary journey

Prompt:

* "Make this your primary journey?"

This is important because the home screen should immediately feel useful.

---

# 4. Daily user journey

This is the make-or-break experience.

The daily journey must feel like:
**open → orient → tap → done**

## 4.1 Home screen experience

When user opens the app, they should see:

### Top focus card

**Primary Journey Card**
This is the most prominent object.

It should show:

* journey emoji + name
* tiny one-line purpose reminder
* today's completion status
* today's score state or not-yet-logged state
* weekly goal status
* weekly review pending status if relevant

The emotional job of this card:

* remind user what matters
* reduce choice overload
* make action obvious

### Below primary card

* other active journeys
* small progress summary
* archived journeys hidden behind separate access

## 4.2 Tap primary journey

This should open directly into **Today view**, not a dashboard wall.

---

# 5. Journey-level navigation

Inside a journey, I recommend **3 top sections/tabs**:

* **Today**
* **Review**
* **Insights**

This is the cleanest structure.

## Why this matters

Because the user has different intents:

* "I just want to mark today."
* "I want to reflect and revisit lessons."
* "I want to inspect charts and performance."

If all of that sits on one long scroll, the product gets mentally expensive.

---

# 6. Today view design

This is the default view inside a journey.

Order should be:

## 6.1 Journey purpose strip

A small strip at the top:

* one-line purpose or success reminder
* tap to expand full journey foundation

Example:

* "Why: build a sharper, stronger version of myself."

This reconnects the user without creating reading fatigue.

## 6.2 Weekly goal card

Show current weekly journey goal if it exists.

Card should show:

* title or short statement
* status: active / not completed
* due timing
* quick open

Do not show provisional scoring.

## 6.3 Weekly Review card

If pending, show right below weekly goal.

Card should show:

* "Weekly Review pending"
* strongest dimension this week
* weakest weighted dimension
* score vs last week
* open CTA

This is important, but should not interrupt daily marking.

## 6.4 Monthly goal card

Same idea:

* visible
* compact
* no provisional score

## 6.5 Today's dimensions

This is the main action block.

Each dimension row should show:

* emoji
* dimension name
* small weight chip
* visible label choices as tap chips/buttons

Example:
`🏋️ Workout   25`
Missed / Showed up / Progressed / Built / Conquered

Taps should:

* autosave immediately
* update score immediately
* visually confirm selection

## 6.6 Done state

Once all dimensions are marked, show a satisfying closure block:

* "Done for today"
* today's score
* one short insight

Examples:

* "Done for today — 76.5"
* "Strong on high-weight areas"
* "One mandatory miss reduced score"
* "You improved versus your 7-day baseline"

This is critical. The user must feel closure and reward right away.

## 6.7 Daily reflection

Below done state:

* "Reflect on your day"
* optional field: "Any learning to carry forward?"

Important:

* never required
* visually small
* stays on same screen
* should feel like "worth noting anything?" not "now journal"

---

# 7. Weekly reflection journey

This is where real synthesis happens.

## 7.1 Trigger

A Weekly Review card appears automatically every week for every active journey.

It sits near the top until completed.

## 7.2 Open weekly review

User taps Weekly Review card.

Screen should start with **automatic synthesis**, not a blank note field.

## 7.3 Weekly review structure

### Section 1: Summary

Show:

* strongest dimension this week
* weakest weighted dimension
* missed mandatory count
* weekly score vs last week
* whether high-weight dimensions improved or slipped

### Section 2: Guidance prompts

Short prompts:

* Are you staying focused on what matters most?
* Are the highest-weight areas getting real effort?
* Are you drifting into lower-value effort?
* What worked clearly this week?
* What should you correct next week?

### Section 3: Optional note

A short text field for reflection.

### Section 4: Save as lesson

After writing, allow:

* keep as review note
* save as lesson
* optionally link lesson to dimension

This is powerful because it preserves learning without forcing classification upfront.

## 7.4 Weekly review feeling

It should feel:

* reflective
* structured
* fast enough to do in a few minutes
* useful even when user is tired

Not like therapy. Not like paperwork.
More like a personal performance review.

---

# 8. Monthly journey

Monthly goal should be quieter than weekly.

It should:

* stay visible in Today view
* be checkable at month-end
* not demand daily attention

User journey:

* sees monthly goal card near top
* ignores it most days
* updates it at month-end
* optionally adds a short note

So monthly is a background alignment layer, not a daily interaction layer.

---

# 9. Review view design

This is where the user goes to revisit meaning and learning.

Inside a journey, **Review** should contain:

## 9.1 Journey foundation

Show:

* why this journey exists
* success vision
* what matters most
* what should not distract me
* strengths to play to

This is the "remind me why I started" area.

## 9.2 Dimension guidance

For each dimension:

* why it matters
* what good looks like
* how it supports the journey
* strength guidance

This helps re-align the user to the meaning of their system.

## 9.3 Weekly review archive

List past weekly reviews in reverse chronological order.

Each item should show:

* week label
* done / not done
* small summary
* note preview if exists

## 9.4 Daily reflection archive

Small, scrollable log of past daily reflections.

## 9.5 Lessons

A dedicated lessons list:

* newest first
* optionally filter by dimension
* optionally filter by source type

This is where the app becomes more than tracking.

---

# 10. Insights view design

This is the deep-dive area.

It should be there when wanted, invisible when not.

## 10.1 Top summary

Show quick insight chips:

* current strength
* current weak area
* high-weight lagging area
* trend vs previous week
* trend vs personal baseline

## 10.2 Charts block

Include:

* radar chart
* daily score trend
* consistency chart
* calendar heatmap
* stacked dimension chart
* weighted gap chart
* goal rings
* distribution chart
* leaderboard trend

## 10.3 Callouts

Every chart section should have tiny interpretation help:

* "Workout is improving and is high-weight"
* "Deep Work has high importance but inconsistent scores"
* "Communication is becoming a reliable strength"
* "Low-weight areas may be taking too much attention"

This keeps analytics actionable, not decorative.

## 10.4 Leaderboard section

Public or shared private journeys can show:

* rank
* score percentage
* trend
* compare to peers

Should stay below personal insights so the user sees self-management first.

---

# 11. Re-alignment journey

This is important for low-motivation days.

Sometimes user opens the app not to log, but to remember:

* why this matters
* what they're building
* where they're already strong

So the design should support a quiet re-alignment loop:

### Re-alignment path

Home → Primary Journey → Review → Journey Foundation / Lessons

This allows the user to:

* revisit purpose
* revisit success vision
* read old lessons
* reconnect before acting

This is a strong retention mechanic without using notifications.

---

# 12. Busy-day journey

The app must work even when user is tired, rushed, or low on motivation.

The busy-day ideal flow should be:

1. Open app
2. Tap primary journey
3. See weekly goal + today's dimensions
4. Tap visible labels for each dimension
5. See "Done for today"
6. Leave

Target feeling:

* under a minute
* no typing required
* no back-and-forth screens
* no punishment-heavy tone

That's the real benchmark.

---

# 13. Missed-day and backfill journey

If user misses days, the app should handle it gently.

## 13.1 Home behavior

Show:

* "2 days pending"
* not guilt-heavy language
* clear backfill CTA

## 13.2 Backfill flow

User taps a pending date and gets the same Today layout for that date:

* dimensions
* mark values
* optional note

## 13.3 Finalization behavior

If 7-day window closes:

* mandatory unresolved → missed mandatory
* optional unresolved → missed optional

UI should explain this clearly, but not harshly.

---

# 14. Social/shared journey journey

For public/private shared journeys, the daily personal flow should still stay personal-first.

User flow:

* join journey
* add it to active journeys
* optionally mark it primary
* log privately for self
* later inspect leaderboard if wanted

The leaderboard should feel like:

* motivation
* comparison
* context

Not the main daily screen.

That's important because Crimson Club is not supposed to feel like a social app first.

---

# 15. Navigation design

## Bottom navigation

I'd recommend:

* **Home**
* **Journeys**
* **Review**
* **Profile**

## What each does

### Home

Primary journey and today's main attention items

### Journeys

All journeys:

* active
* shared
* archived

### Review

Cross-journey review center:

* pending weekly reviews
* recent daily reflections
* saved lessons

### Profile

Account, settings, primary journey, preferences

This is simple and enough.

---

# 16. Ideal emotional experience by mode

## Daily

Should feel:

* clear
* fast
* satisfying
* not heavy

## Weekly review

Should feel:

* honest
* thoughtful
* structured
* corrective

## Insights

Should feel:

* sharp
* useful
* pattern-revealing

## Review / foundation

Should feel:

* grounding
* identity-reinforcing
* meaningful

That emotional clarity matters a lot.

---

# 17. Final recommended user journey structure

## Daily path

Home → Primary Journey Today → Weekly goal → Today's dimensions → Done state → Optional reflection

## Weekly path

Home or Journey → Weekly Review card → Summary → Prompts → Optional note → Save as lesson

## Deep-dive path

Journey → Insights → Metrics / strengths / weak areas / leaderboard

## Re-alignment path

Journey → Review → Foundation / dimension meaning / lessons

## Backfill path

Home → Pending day → Mark dimensions → Optional note → Done

---

# 18. The design rule to protect above all

If there is ever a conflict between:

* more depth
* more metrics
* more reflection features

and

* faster daily completion

**faster daily completion should win.**

Because if daily use breaks, the whole system dies.

But if daily use stays easy, then weekly review, insights, and lessons can compound into something genuinely powerful.
