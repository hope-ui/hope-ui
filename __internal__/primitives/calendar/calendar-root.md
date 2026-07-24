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
`isDateDisabled`/`allowsNonContiguousRanges`/`commitBehavior`/`disabled`/`readOnly`/`selectionMode`), the
controlled/uncontrolled selection pair
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
`prev`, `next`, `drillUp`, `drillDownTo`, `setView`, `setFocusedDate`, `activate`, `highlightDate`,
plus the abandonment trio `clearAnchor` / `commitSelection` / `clearSelection`);
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

## Contiguous ranges: the bounds narrow around the anchor

```ts
allowsNonContiguousRanges?: boolean; // default false
min(): CalendarDate | undefined;     // = maxDate(options.min, availableRange?.start)
max(): CalendarDate | undefined;     // = minDate(options.max, availableRange?.end)
```

With `isDateDisabled` set, a range must not straddle an unavailable day. While a range is **anchored**,
the calendar therefore narrows its **own** bounds to `availableRange` — the run of consecutive available
days containing the anchor, derived by calling `lastAvailableDateFrom` (`utils/boundary.ts`) once per
direction. This is React Aria's model verbatim (`useRangeCalendarState`'s `getAvailableRange`, folded
into the `min`/`max` it hands its inner `useCalendarState`).

Narrowing the **bounds** rather than adding a guard at the commit is the entire point: every downstream
predicate inherits the constraint for free — `isCellOutOfRange` → `isCellDisabled` →
`isDateNonFocusable` (so the arrows skip and the cells go `aria-disabled` + `data-disabled`),
`isDateSelectable`, and the cursor clamp above, which the tentative band rides. A commit-time guard
alone would still let the arrows cross the unavailable day and paint a band with a hole in it.

Details worth knowing:

- **`min()`/`max()` report the effective bounds**, not the options as given. Either side falls back to
  the configured one when the run is unbounded there (`undefined`), and the **stricter** of the two
  always wins (`maxDate`/`minDate`).
- **The run is read through the raw `isDateDisabled`**, not `isDateUnavailable` — which reports false
  outside month view. Which days are available is a property of the days, not of the view being looked
  at, so drilling up mid-selection must not silently widen the window.
- **The search spans one month either way.** Beyond that the run reads as unbounded; see
  `utils/boundary.md`.
- **`activate` clamps into the run.** Activating past the run's edge ends the range *at* the edge
  rather than doing nothing — React Aria clamps the same way in `selectDate`. Only this narrowing is
  clamped away: with no anchored run the date is passed through untouched, so activating a genuinely
  out-of-range or unavailable day stays the outright refusal it has always been. (React Aria also runs
  its `previousAvailableDate` back-off at that point; hope-ui does not port it, because it would turn
  that documented refusal into a silent selection of a *neighbouring* day.)
- **`prev()`/`next()` disable while anchored inside a bounded run**, because `isPrevDisabled` /
  `isNextDisabled` read the same narrowed bounds. This is visible (with weekends unavailable, no run is
  longer than five days, so the month cannot be paged mid-selection) and it is correct — nothing outside
  the run is selectable, so there is nothing to page *to*. React Aria behaves identically, for the same
  reason. Where the run is unbounded on a side, the configured bound is what remains and paging works.
- **`drillUp()` stays ungated while the bounds are narrowed**, and the abandonment verbs above do not
  change that. Clearing the anchor on a drill-up was considered and rejected: with no `isDateDisabled`
  there is no narrowing at all, and drilling up to reach a far month is then a legitimate way to draw a
  range across several of them — abandoning it there would break the flow for every calendar that has
  no unavailable days. Where a run *is* narrow, the year/decade view showing mostly-inert cells is the
  bounds telling the truth: nothing outside the run is selectable, so nothing outside it should be
  reachable, in any view. Leaving the range is what `Escape` and `commitBehavior` are for.
- **`allowsNonContiguousRanges: true`** disables the narrowing entirely, restoring the plain
  `min`/`max`. The range may then span unavailable days — which the selection paint still cuts out of
  the band (see below), exactly as React Aria renders them.
- **It is gated on `mode() === "range"`, not on the anchor alone.** Nothing clears `anchorDate` when
  `selectionMode` changes, so a stale anchor from an abandoned range would otherwise keep the bounds
  clamped for good — inert cells and dead nav in a mode that has no ranges at all.
- **`availableRange` is a `createMemo`** — unlike `highlightedRange` and `formValues`, which are plain
  accessors to stay hydration-neutral. `min`/`max` are read twice per cell per predicate, and each read
  would otherwise walk up to a month of days through the consumer's `isDateDisabled`: tens of thousands
  of callbacks per pointer move once unavailable days are sparse. That earns the one reactive node, at
  the measured price of shifting every `_hk` in the SSR tree (and `headingId`) by one — which is why
  `calendar.ssr.test.tsx`'s inline snapshot was re-recorded with this change, with `hydrateFixture`
  proving the client allocates the same keys.

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

## A range abandoned mid-selection

```ts
commitBehavior?: "select" | "reset" | "clear"; // default "select"
clearAnchor(): void;      // "reset" — drop the anchor, restore the selection from before it
commitSelection(): void;  // "select" — complete the tentative range at the roving cursor
clearSelection(): void;   // "clear" — empty the selection
```

The three verbs are React Aria's (`RangeCalendarState`), and `createCalendarGroup` is what maps
`commitBehavior` onto them when the user walks away — a pointer released outside, or focus leaving.
`Escape` (on the grid) is always `clearAnchor`, never the policy. See `calendar-group.md` for both
triggers; what is decided *here* is what each verb does:

- **`clearAnchor` restores, it does not merely un-anchor.** React Aria's `setAnchorDate(null)` is
  enough for it because RA leaves `value` untouched until a range completes. hope-ui writes the
  degenerate `{ date, date }` on the first click (see below), so dropping the anchor alone would leave
  that stand-in behind as if it were a real one-day selection. A snapshot of the committed value is
  therefore taken as the range anchors, and put back here. It emits nothing: the consumer was never
  told about the in-progress value, so restoring it is not a change.
- **`commitSelection` is `activate(focusedDate())`** — so it emits `onValueChange` and announces, like
  any other completing activate. It falls back to `clearAnchor` in the two cases where there is nothing
  to commit, rather than doing nothing: this runs *because* the calendar already lost the pointer or
  the focus that would let anyone finish, so leaving a range in progress behind is the one outcome that
  is never acceptable.
  - **The cursor is on a day the calendar refuses.** (React Aria instead backs off to the previous
    available date; hope-ui does not, for the same reason `activate` doesn't — see § Contiguous
    ranges.) Reachable only with `allowsNonContiguousRanges: true`; otherwise the narrowed bounds keep
    the cursor inside the anchor's available run.
  - **The calendar has been drilled up.** `activate` *descends a view* outside month view, so
    committing there would silently drill and still leave the range anchored.
- **`clearSelection` emits `onValueChange(null)`** — or `[]` in multiple mode — **unless the consumer's
  last-known value was already empty.** Mid-selection that last-known value is the pre-anchor snapshot,
  not the degenerate one, so clearing a range merely *started* on an empty calendar emits nothing.

### The degenerate in-progress value is deliberate

The first activate of a range writes `value = { start: date, end: date }` alongside the anchor
(`utils/range-selection.ts`). React Aria never writes it — and it was worth keeping anyway: it is what
gives the anchor its solid `data-selected` pill *under* the tentative band, so the committed paint and
the preview paint are the same two layers before and after the second click. What made it a hazard was
abandonment — a range walked away from left that stand-in looking like a real selection, and
`formValues()` had to special-case it. Both are now closed: every exit resolves the anchor, and
`clearAnchor` restores what the stand-in overwrote.

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

The first and third are **independent, not exclusive**: an unavailable day that the bounds also put out
of range is both, and carries `data-disabled` *and* `data-unavailable` (struck *and* dimmed). Because a
contiguous range narrows the bounds to the anchor's available run, that is the normal state of the
unavailable day bounding the run, for as long as the range is in progress — see § Contiguous ranges.

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

### The paint excludes days the calendar cannot select

`isSelected` / `isRangeStart` / `isRangeMiddle` / `isRangeEnd` are each gated on
`!isCellDisabled(date) && !isDateUnavailable(date)` before the strategy is consulted — React Aria's
own gate (`useCalendarState`'s `isSelected` returns false for either). The committed **value** is
never touched; only the paint is. So a range committed while it was legal and later narrowed — by a
`max` that moved, or by an `isDateDisabled` day inside it — renders with those days **cut out of the
band** rather than claiming a selection the matching click would refuse, and `aria-selected` never
announces one.

Three boundaries are deliberate:

- **The guard lives in `createCalendar`, not in the strategies.** `singleSelection` /
  `rangeSelection` / `multipleSelection` stay pure, mode-only and day-based: they know nothing of
  `min`/`max`, `disabled` or availability, and their unit tests assert the raw set membership.
- **It reads `isCellDisabled`, not `isDateNonFocusable`.** The outside-scope filler days keep their
  paint, so a range straddling a month boundary still renders as one continuous band on both sides.
  (React Aria folds the visible range into its own `isCellDisabled`, but it renders no filler cells at
  all, so it has no band to keep continuous.)
- **`readOnly` does not affect the paint; `disabled` does.** Read-only refuses *changes*, so the
  current value stays fully visible. `disabled` is the first arm of `isCellDisabled`, so — matching
  React Aria — a wholly disabled calendar paints no selection at all.

### Year / decade cells paint by overlap

A cell in year view stands for a whole month, and in decade view a whole year, so membership cannot be
a test on the cell's representative date. Every date reaching a strategy predicate is first mapped
through `cellPeriod(view(), date)` (`utils/view.md`), and the predicates are overlap tests over that
period: a Jan 15 – Mar 10 range lights **January, February and March**, with the start corner on January
and the end corner on March. Tested by the month's first day alone — as it was — January stayed dark and
February took the start corner.

Month view's period is the degenerate `{date, date}`, on which every predicate collapses to the
day-level test it generalizes, so month view is bit-for-bit unchanged. The `isHighlighted*` trio reads
the same period for the same reason: a range anchored in month view survives a drill up, and its
tentative band must not skip the month its own anchor sits in.

The `paintsSelection` gate above composes *in front of* this, unchanged and still keyed on the cell's
representative date — `isCellDisabled` is already per-view (`isMonthOutOfRange` / `isYearOutOfRange`
are whole-period tests of their own).

React Aria has no year or decade view, so this generalization — and the `SelectionStrategy` signature
that carries it — is hope-ui's own. The seam is explicitly unstable (`CLAUDE.md` § Architecture).

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
