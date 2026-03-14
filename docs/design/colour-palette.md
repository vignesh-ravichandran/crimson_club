
# Crimson Club — Color Palette

## 1. Foundation colors

### App background

* `bg.app = #FAF8F5`
  Warm paper-white. Default app background.

### Primary surface

* `bg.surface = #FFFFFF`
  Main card, sheet, modal, and input background.

### Secondary surface

* `bg.subtle = #F3F0EC`
  Used for soft containers, grouped sections, secondary cards, empty states.

### Tinted crimson surface

* `bg.crimsonSubtle = #F8E8EB`
  Used for selected chips, soft highlights, active filter background, subtle emphasis.

---

## 2. Text colors

### Primary text

* `text.primary = #171717`
  Main headings, body text, important numbers.

### Secondary text

* `text.secondary = #5F5A55`
  Supporting text, descriptions, helper copy.

### Tertiary text

* `text.tertiary = #8A837C`
  Meta labels, timestamps, inactive info.

### On-crimson text

* `text.onCrimson = #FFFFFF`
  Text/icons shown on solid crimson buttons or fills.

---

## 3. Border and divider colors

### Default border

* `border.default = #E7E1DA`
  Default input borders, card outlines, dividers.

### Strong border

* `border.strong = #D7CFC7`
  Used for selected containers, emphasized boundaries, modal edges if needed.

### Crimson border

* `border.crimson = #C7364F`
  Used only for selected states, active filters, focused journey chips, important emphasis.

---

## 4. Brand / accent colors

### Primary crimson

* `brand.crimson = #B4233C`
  Main brand color. Use for logo, active emphasis, primary brand identity.

### Active crimson

* `brand.crimsonActive = #C7364F`
  Use for selected chips, active tab state, pressed CTA, focus highlight.

### Deep crimson

* `brand.crimsonDeep = #7A1E2D`
  Use sparingly for strong emphasis, premium logo mark variation, dense text-on-light accents.

### Soft crimson tint

* `brand.crimsonTint = #F8E8EB`
  Background tint for selected / highlighted UI.

---

## 5. Semantic support colors

These should be used sparingly. Crimson remains the dominant identity color.

### Success

* `semantic.success = #2F7D61`
* `semantic.successBg = #E9F5EF`

Use for:

* positive trend
* improved vs baseline
* successful completion indicators where crimson is not appropriate

### Warning

* `semantic.warning = #B8891E`
* `semantic.warningBg = #FCF4DF`

Use for:

* pending review
* incomplete goal update
* edit-window warning
* backfill reminder

### Danger

* `semantic.danger = #A63A4B`
* `semantic.dangerBg = #FBECEE`

Use for:

* destructive actions
* hard delete
* penalty explanation
* irreversible warnings

### Info / neutral signal

* `semantic.info = #3A6EA5`
* `semantic.infoBg = #EDF4FB`

Use for:

* neutral contextual guidance
* explainers
* system information

---

# 2. Color usage rules

## Rule 1: The app should feel monochrome first, crimson second

The UI should read visually as:

* paper white
* white
* charcoal text
* thin neutral borders
* slight crimson accents

Crimson is a **signal**, not the environment.

Do not flood screens with red.

---

## Rule 2: Use crimson only for high-meaning emphasis

Crimson should be used for:

* primary brand moments
* selected states
* active chips
* primary CTA
* active tab indicator
* key score emphasis
* important highlights
* logo

Crimson should **not** be used for:

* every heading
* every icon
* every border
* full page backgrounds
* all cards on a screen
* large passive surfaces

---

## Rule 3: Surfaces should stay mostly white

Use:

* `bg.app` for screen background
* `bg.surface` for cards, sheets, inputs
* `bg.subtle` for grouped sections or low-emphasis containers
* `bg.crimsonSubtle` only for selected / highlighted states

Default experience should feel airy and clean, not tinted.

---

## Rule 4: Text should stay charcoal, not pure black

Always prefer:

* `text.primary = #171717`
  over pure black.

This keeps the product softer, more premium, and easier on the eyes.

---

## Rule 5: Red is not the danger color by default

Because crimson is the brand color, do not treat every red usage as an error.

Meaning split:

* **crimson** = brand / active / selected / focus
* **danger red tones** = destructive / risk / irreversible actions

This distinction is important.

---

## Rule 6: Semantic colors should be rare

Success, warning, danger, and info should be used only where the meaning truly needs it.

Examples:

* Use **success** for "improved vs baseline"
* Use **warning** for "weekly review pending"
* Use **danger** for "hard delete journey"
* Use **info** for "score explanation"

Do not overload charts and screens with multiple semantic colors.

---

# 3. Component-level color guidance

## App background

* Screen background: `bg.app`
* Never use crimson as page background

## Cards

* Card background: `bg.surface`
* Card border: `border.default`
* Shadow: minimal or none
* Selected card: `bg.crimsonSubtle` + `border.crimson`

## Inputs

* Input background: `bg.surface`
* Input border: `border.default`
* Focus border: `border.crimson`
* Helper text: `text.secondary`

## Primary buttons

Two acceptable styles:

### Preferred default

* Background: `brand.crimson`
* Text: `text.onCrimson`

### Secondary primary style when you want less visual pressure

* Background: `bg.surface`
* Border: `border.crimson`
* Text: `brand.crimson`

Use filled crimson buttons sparingly so they stay meaningful.

## Secondary buttons

* Background: `bg.surface`
* Border: `border.default`
* Text: `text.primary`

## Chips / segmented controls

### Default chip

* Background: `bg.surface`
* Border: `border.default`
* Text: `text.secondary`

### Selected chip

* Background: `bg.crimsonSubtle`
* Border: `border.crimson`
* Text: `brand.crimsonDeep`

This is especially important for dimension logging states.

## Tabs

* Inactive: `text.tertiary`
* Active text: `text.primary`
* Active indicator: `brand.crimson`

## Dividers

* Use `border.default`
* Keep thin and quiet

---

# 4. Chart color rules

Charts should stay mostly restrained and mostly monochrome.

## Default chart palette behavior

* axes / grid / secondary data: grayscale neutrals
* key active data series: crimson
* positive change highlight: success
* warning / pending markers: warning only if really needed

## Specific chart rules

* Use crimson for the **primary series**
* Use neutral gray for comparison series
* Do not use 5 bright colors in one chart
* Radar chart can use crimson for active fill/stroke, with muted neutral grid
* Goal rings can use crimson for current progress
* Leaderboard trend can use neutral line + crimson highlight for the current user

The app should feel analytical, not colorful.

---

# 5. State color rules

## Active / selected

* Background: `bg.crimsonSubtle`
* Border: `border.crimson`
* Text/icon: `brand.crimsonDeep`

## Hover / pressed

Since this is mobile-first, pressed states should slightly deepen the crimson or darken border subtly.

## Disabled

* Background: `bg.subtle`
* Border: `border.default`
* Text: `text.tertiary`

## Success state

* text or icon: `semantic.success`
* background: `semantic.successBg`

## Warning state

* text or icon: `semantic.warning`
* background: `semantic.warningBg`

## Destructive state

* text or icon: `semantic.danger`
* background: `semantic.dangerBg`

---

# 6. Accessibility and contrast rules

## Minimum contrast

Developers should ensure:

* body text meets accessible contrast on white and subtle surfaces
* crimson text is not used for small body copy unless contrast is sufficient
* selected chip text remains readable against tinted crimson backgrounds

## Recommended practice

* use crimson mainly for medium-to-large labels, buttons, selected chips, and visual emphasis
* keep long-form text in charcoal, not crimson

---

# 7. Brand tone rules

The UI should feel:

* calm
* premium
* precise
* reflective
* disciplined

The UI should not feel:

* flashy
* overly gamified
* loud
* "all red"
* sports-app aggressive

So when in doubt:

* choose neutral
* then add a small amount of crimson only where it matters

---

# 8. Developer summary

## Primary token set

```text
bg.app = #FAF8F5
bg.surface = #FFFFFF
bg.subtle = #F3F0EC
bg.crimsonSubtle = #F8E8EB

text.primary = #171717
text.secondary = #5F5A55
text.tertiary = #8A837C
text.onCrimson = #FFFFFF

border.default = #E7E1DA
border.strong = #D7CFC7
border.crimson = #C7364F

brand.crimson = #B4233C
brand.crimsonActive = #C7364F
brand.crimsonDeep = #7A1E2D
brand.crimsonTint = #F8E8EB

semantic.success = #2F7D61
semantic.successBg = #E9F5EF
semantic.warning = #B8891E
semantic.warningBg = #FCF4DF
semantic.danger = #A63A4B
semantic.dangerBg = #FBECEE
semantic.info = #3A6EA5
semantic.infoBg = #EDF4FB
```

## One-line rule for devs

**Build the app in white, ink, and thin borders first. Add crimson only for brand, selection, action, and meaningful emphasis.**
