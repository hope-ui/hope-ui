# `createCalendar`

The shared state kernel of a calendar — the one call at the root of the tree, modeled on
`createDialog`. It owns the view state machine (month / year / decade), the roving cursor, the
selection (via the pure `SelectionStrategy` seam), all date math + predicates, the shared navigation
kernel (`createCollection` + `createListFocus`) the grid + cell part hooks compose, and the
live-region announcer. It renders **no JSX and no host element**.

## API (abridged)

```ts
function createCalendar(options?: CreateCalendarOptions): CreateCalendarReturn;
```

`CreateCalendarOptions` — config (`locale`/`dir`/`timeZone`/`firstDayOfWeek`/`min`/`max`/
`isDateDisabled`/`disabled`/`readOnly`/`selectionMode`), the controlled/uncontrolled selection pair
(`value`/`defaultValue`/`onValueChange`), the roving-cursor pair (`focusedValue`/
`defaultFocusedValue`/`onFocusedValueChange`), a `label` (overrides the built-in `calendar.label`), and
the native-form trio (`name`/`form`/`required`) documented under **Native form** below.

All other localized strings — nav-button `aria-label`s, cell `aria-label` suffixes, and the
live-region announcements — resolve through `@hope-ui/i18n` (the `t` accessor exposed on the
return, backed by the built-in catalogs). Translate them app-wide by wrapping the tree in
`<I18nProvider locale translate messages>` — there is no per-instance `messages` prop.

`CreateCalendarReturn` — resolved config accessors (incl. the native-form `name`/`form`/`required` +
the derived `formValues`); the `t` message resolver (used by the part hooks
for their labels/announcements); state (`view`, `visibleMonth`, `focusedDate`,
`selectionValue`, `anchorDate`, `highlightedRange`, `todayDate`); computeds (`cells`, `weekdays`,
`headingLabel`, `isPrev/NextDisabled`, `canDrillUp`); `headingId`; the navigation verbs (`navigate`,
`prev`, `next`, `drillUp`, `drillDownTo`, `setView`, `setFocusedDate`, `activate`, `highlightDate`);
the per-date predicates (incl. `isCellDisabled`, `isHighlighted` and the tentative band's
`isHighlightedStart` / `isHighlightedEnd`); and the shared `collection` / `listFocus` /
`announce` the part hooks use. Range naming mirrors React Aria's `RangeCalendarState` (`anchorDate`,
`highlightedRange`, `highlightDate`).

## The roving cursor never leaves `[min, max]`

`focusedDate()` is clamped with `constrainDate` (`utils/boundary.ts` — React Aria's `constrainValue`)
at all three of the points RA clamps at:

- **On every move** — `setFocusedDate` is the funnel every other verb goes through (`navigate`,
  `shiftYears`, `applyView`, `activate`, `highlightDate`), so clamping there covers them all, and
  `onFocusedValueChange` reports the date actually focused rather than the one requested.
- **On the seed** — `visibleMonth` is derived from the seed, not from `focusedDate`. An out-of-range
  `defaultFocusedValue` would otherwise open the calendar on a month the cursor is immediately pushed
  out of; the month grid is a variable 4–6 rows, so that is a *structural* server/client disagreement,
  not a reactive one.
- **Again at render** (inside the `focusedDate` memo) — the two cursors the setter never sees: a
  controlled `focusedValue` outside the bounds, and a `min`/`max` that narrows after mount.

Order matters: **constrain, then normalize**. The clamp is day-level, so re-flooring to the view's cell
granularity afterwards is what keeps a year/decade cursor on a cell that actually renders (`min` Mar 10
in year view ⇒ cursor Mar 1, not Mar 10). The pair is a fixed point, so the render-time clamp never
moves an already-stored cursor a second time.

Without this, `prev()` from Feb 3 with `min` Jan 10 left the cursor on Jan 3: `isDateNonFocusable`
*and* `isFocused` at once — a roving tab stop stranded on a cell the arrows skip.

## The tentative range band rides the roving cursor

```ts
highlightedRange(): DateRange | null; // = strategy.highlightedRange({ value, anchor }, focusedDate())
highlightDate(date: CalendarDate): void; // = if (anchorDate() !== null) setFocusedDate(date)
```

There is **one** moving endpoint, and it is `focusedDate` — React Aria's contract
(`useRangeCalendarState`: `highlightedRange = anchorDate ? makeRange(anchorDate, focusedDate) : …`).
Hover and keyboard are therefore the same code path: `highlightDate` *is* a cursor move, so the band
can never disagree with the cell the user is on. Consequences worth knowing:

- **Anchoring alone opens a one-day band** on the anchor (the cursor is already there), so the anchor
  carries `data-highlighted` + both `data-highlighted-{start,end}` under its `data-selected` pill.
- **Arrow keys grow the band.** There is no separate hover signal to be missing, which is what used to
  make the keyboard show no preview at all.
- **The band survives the pointer leaving the grid** — it belongs to the anchor, not to a hover. The
  grid deliberately handles no `pointerleave` (see `calendar-grid.md`).
- **`highlightDate` is inert with no anchor**, in every mode. Hover therefore never steals the roving
  tab stop outside an in-progress range, and is a complete no-op in single/multiple (where `anchor` is
  always `null`, so `highlightedRange` is too).
- **Accepted RA side effect:** while anchored, hovering *does* move the roving tab stop. That is the
  price of one endpoint, and it is what keeps pointer and keyboard from painting two different bands.

`highlightDate`'s caller (`createCalendarCell`'s `onMouseEnter`) gates on RA's `isSelectable` —
`isDateNonFocusable` or `isDateUnavailable` skips it — so a day the range could not actually end on
never previews a range the matching click would refuse.

## Native form

Opt-in native `<form>` submission, mirroring the shipped Listbox pattern. The primitive renders no DOM
itself — it only exposes the state the styled component's hidden `<input>`s consume:

- **`name?: string`** — the form field name. **Opt-in**: with `name` unset, `formValues()` is `[]` and
  nothing is submitted.
- **`form?: string`** — associates the hidden field(s) with a `<form>` by id (the input's `form`
  attribute), for inputs rendered outside that form.
- **`required?: boolean`** (default `false`) — marks the field required for native validation.

`formValues(): { name: string; value: string }[]` derives one entry per hidden input from
`selectionValue()`, with each `value` an ISO `YYYY-MM-DD` string (`CalendarDate.toString()`):

- **single** → `[{ name, value }]` — empty (`[]`) when the value is `null`.
- **multiple** → one entry per selected date, all sharing `name` (sorted, as the selection is).
- **range** → `[{ name: `${name}Start`, value: startISO }, { name: `${name}End`, value: endISO }]`.
  Empty until the range **completes**: mid-selection (while `anchorDate()` is set) the value is a
  degenerate `{ start, end }`, so `formValues()` deliberately stays `[]` until the second endpoint
  commits and the anchor clears.

`formValues` is a plain accessor (not a `createMemo`) — like `highlightedRange`, the sibling
predicates, and the Listbox `formValues` — so it adds no reactive node to the render and stays
hydration-neutral.

## Calendar-aware formatting (non-Gregorian systems)

The grid **math** is already calendar-system-aware (`@internationalized/date`'s
`startOfWeek`/`getWeeksInMonth`/`add`/`isSameMonth` respect a `CalendarDate`'s calendar) and day
numbers localize to the numbering system. The `Intl.DateTimeFormat` formatters
(`utils/month-view.ts`'s `formatMonthYear`/`formatFullDate`, plus the year/decade formatters) also
derive their **`calendar` from the date itself** (`date.calendar.identifier`), React-Aria style —
they are **not** left to the locale's default calendar. This means:

- An Islamic / Japanese / Buddhist `CalendarDate` (built via `toCalendar(today(tz), …)`) reads out its
  **own** month/year/era in the heading + `aria-label` — matching the grid's day numbers — **even under
  a plain locale** without a `-u-ca-` extension (e.g. `en-US` → "Rajab 1447 AH", not "January 2026").
- A Gregorian date under a non-Gregorian-default locale (e.g. `fa-IR`, whose default is Persian) still
  reads Gregorian, matching its Gregorian day numbers.
- It is a **no-op for the common Gregorian case** (`calendar: "gregory"` ≡ omitting it for `en-US`).

`getWeekdays` takes **no** `calendar` option: the 7-day week is shared across calendar systems, so
weekday names don't depend on it (only month/year/era do). For the fully-localized experience, still
pair a non-Gregorian date with a matching `-u-ca-` locale (e.g. `ar-SA-u-ca-islamic-umalqura`) so the
numbering system and directionality line up too — but the calendar system alone no longer requires it.

## The view machine

`view` selects what `visibleMonth` is shown *as*; `cells`/`headingLabel`/boundary math/predicates all
switch on it. `drillUp` climbs month→year→decade (no-op at decade); `drillDownTo` descends; `activate`
**selects in month view but drills in year/decade**. The cursor (`focusedDate`) is kept **normalized
to the active view's cell granularity** (`normalizeFocusForView`), so `isFocused` is a plain
`isSameDay` in every view, and the visible scope **follows the cursor** when it leaves — one effect
does this for both internal roving moves and controlled `focusedValue` updates.

## Three disabled states (React Aria)

- **cell-disabled** = the whole calendar `disabled` OR a whole out-of-range period (`isCellDisabled`,
  RA's predicate of the same name) → the cell paints `data-disabled` (inert *and* dimmed).
- **non-focusable** = `isCellDisabled` OR outside the visible scope (`isDateNonFocusable`) → the cell
  registers `disabled: true` (grid skips it), holds no roving tab stop, and click/focus/hover are
  guarded. The outside-scope days are *only* here, never in `isCellDisabled`: they must stay
  arrow-skipped without being repainted dim over their own `data-outside-month` tint.
- **unavailable** = the `isDateDisabled` predicate (month view only) → stays focusable + announced,
  blocked only in `activate`.

`aria-disabled` is emitted for RA's `!isSelectable` — non-focusable **or** unavailable — so it covers
all three (see `calendar-cell.md`).

## `disabled` vs `readOnly`

Both refuse selection (`isDateSelectable` is false under either), but they are different affordances,
and hope-ui reflects each where React Aria does:

| | `disabled` | `readOnly` |
| --- | --- | --- |
| Cells | inert: `isCellDisabled`, `aria-disabled`, `data-disabled`, no tab stop | untouched — reachable, undimmed, normal paint |
| Grid | `aria-disabled="true"` + `tabindex="-1"` | `aria-readonly="true"` |
| `prev()` / `next()` / `drillUp()` | all three no-op — a disabled calendar navigates nowhere | unaffected |

`isPrevDisabled` / `isNextDisabled` therefore short-circuit on `disabled()` **before** the per-view
`min`/`max` boundary math, and the heading part folds it in alongside `canDrillUp` (see
`calendar-heading.md`). Without that, `disabled: true` rendered a calendar identical to an enabled
one: fully pageable, fully tabbable, and reporting nothing to assistive technology.

## Selection

`onValueChange` fires when the selection **commits** — every activate in single/multiple, but only on
range **completion** (not the in-progress anchor). This is why the value pair is not wired straight
through `createControllableState`'s `onChange`.

## SSR / hydration

- The month grid is **variable 4–6 weeks**, so its row count depends on `visibleMonth`. `visibleMonth`
  seeds from `constrainDate(defaultFocusedValue ?? firstDateOf(value ?? defaultValue) ??
  today(timeZone), min, max)` — clamped at the seed for exactly this reason (see above). When it
  derives from a prop it is deterministic; the bare `today()` fallback can disagree across a
  server/client midnight boundary. **For SSR, pass a stable `defaultFocusedValue`** (the fixture pins
  one). `today()`-derived attributes (`data-today`) are reactive, re-evaluated on hydrate — never
  structural.
- `headingId` is a single `createUniqueId`, SSR-stable and identical on server + client, so the grid's
  `aria-labelledby`→heading IDREF is valid in the server markup.
- The announcer only builds its live regions where a `document` exists (browser), so it is a no-op
  during SSR and in the Node `unit` project (which runs the client build without a DOM).

Ported from the Angular calendar's `CalendarContext` (419 LOC) + its root directive.
