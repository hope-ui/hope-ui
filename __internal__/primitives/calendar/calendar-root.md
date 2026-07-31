# `createCalendar`

The shared state kernel — one call at the root of the tree, modeled on `createDialog`. Owns the view
machine (month / year / decade), the roving cursor, the selection (via the pure `SelectionStrategy`
seam), all date math + predicates, the shared navigation kernel (`createCollection` +
`createListFocus`) the grid + cell part hooks compose, and the live-region announcer. Renders **no JSX
and no host element**.

## API (abridged)

```ts
function createCalendar(options?: CreateCalendarOptions): CreateCalendarReturn;
```

`CreateCalendarOptions` — config (`locale`/`dir`/`timeZone`/`firstDayOfWeek`/`min`/`max`/
`isDateDisabled`/`allowsNonContiguousRanges`/`commitBehavior`/`disabled`/`readOnly`/`selectionMode`),
the controlled/uncontrolled selection pair (`value`/`defaultValue`/`onValueChange`), the roving-cursor
pair (`focusedValue`/`defaultFocusedValue`/`onFocusedValueChange`), a `label` (overrides the built-in
`calendar.label`), and the native-form trio (`name`/`form`/`required`, § Native form).

Every other localized string — nav-button `aria-label`s, cell `aria-label` suffixes, live-region
announcements — resolves through `@hope-ui/i18n` (the `t` accessor on the return, backed by the
built-in catalogs). Translate app-wide by wrapping the tree in `<I18nProvider locale translate
messages>`; there is no per-instance `messages` prop.

`CreateCalendarReturn`:

- resolved config accessors, incl. the native-form `name`/`form`/`required` + the derived `formValues`
- `t`, the message resolver the part hooks use for their labels/announcements
- state — `view`, `visibleMonth`, `focusedDate`, `selectionValue`, `anchorDate`, `highlightedRange`,
  `todayDate`
- computeds — `cells`, `weekdays`, `headingLabel`, `isPrev/NextDisabled`, `canDrillUp`
- `headingId`
- navigation verbs — `navigate`, `prev`, `next`, `drillUp`, `drillDownTo`, `setView`, `setFocusedDate`,
  `activate`, `focusNearestAvailableDate`, `highlightDate`, plus the abandonment trio `clearAnchor` /
  `commitSelection` / `clearSelection`
- per-date predicates, incl. `isCellDisabled`, `isSelected`, and the band endpoints `isSelectionStart` /
  `isSelectionEnd`
- the shared `collection` / `listFocus` / `announce`, plus the deferred-cursor-focus flag
  `pendingCursorFocus` / `setPendingCursorFocus`
- `direction` and `setGroupElement` (see below)

Range naming mirrors React Aria's `RangeCalendarState` (`anchorDate`, `highlightedRange`,
`highlightDate`).

## Reading direction

`direction()` resolves the consumer's `dir` prop, else `useLocale().direction()`. It is read by
`calendar-grid.ts` for its `arrowDelta` flip and threaded into `createGridNavigation` as
`textDirection`.

**It drives behavior only and is never written to the DOM.** The grid's column order and the recipe's
logical utilities (`rounded-s-*`, `rtl:[&_svg]:rotate-180`) mirror from the cascade instead, so a `dir`
on an ancestor (or the document root) reaches the calendar on its own. `Calendar.Root` writes the
consumer's `dir` *prop* onto the group element — that one is a real HTML attribute and a per-instance
instruction, and before it did, `<Calendar.Root dir="rtl">` navigated right-to-left across a grid still
laid out left-to-right with Sunday on the left — but never the locale-derived value. React Aria's
`useCalendarGrid` draws the identical line: `useLocale().direction` for the arrow flip, no `dir` in
`gridProps`. Full comparison in
`__internal__/primitives/internal/create-text-direction-warning.md`.

`setGroupElement` (fed by `createCalendarGroup`'s `setRef`) exists for the dev direction warning: it
compares `direction()` against the direction the browser applies to the group, and the root hook has
no other handle on that element. A calendar always checks — a 2D grid means Left/Right always matter,
unlike a vertical listbox. Pinned by `calendar.browser.test.tsx` § "Calendar — RTL".

## The roving cursor never leaves `[min, max]`

`focusedDate()` is clamped with `constrainDate` (`utils/boundary.ts` — React Aria's `constrainValue`)
at all three of the points RA clamps at:

- **Every move** — `setFocusedDate` is the funnel every other verb goes through (`navigate`,
  `shiftYears`, `applyView`, `activate`, `highlightDate`), so clamping there covers them all, and
  `onFocusedValueChange` reports the date actually focused rather than the one requested.
- **The seed** — `visibleMonth` derives from the seed, not from `focusedDate`. An out-of-range
  `defaultFocusedValue` would open the calendar on a month the cursor is immediately pushed out of;
  the month grid is a variable 4–6 rows, so that is a *structural* server/client disagreement, not a
  reactive one.
- **Render** (inside the `focusedDate` memo) — the two cursors the setter never sees: a controlled
  `focusedValue` outside the bounds, and a `min`/`max` that narrows after mount.

**Constrain, then normalize.** The clamp is day-level, so re-flooring to the view's cell granularity
afterwards is what keeps a year/decade cursor on a cell that actually renders (`min` Mar 10 in year
view ⇒ cursor Mar 1, not Mar 10). The pair is a fixed point, so the render-time clamp never moves an
already-stored cursor a second time.

Repro: `prev()` from Feb 3 with `min` Jan 10 leaves the cursor on Jan 3 — `isDateNonFocusable` *and*
`isFocused` at once, a roving tab stop stranded on a cell the arrows skip.

## Contiguous ranges: the bounds narrow around the anchor

```ts
allowsNonContiguousRanges?: boolean; // default false
min(): CalendarDate | undefined;     // = maxDate(options.min, availableRange?.start)
max(): CalendarDate | undefined;     // = minDate(options.max, availableRange?.end)
```

With `isDateDisabled` set, a range must not straddle an unavailable day. While a range is
**anchored**, the calendar narrows its **own** bounds to `availableRange` — the run of consecutive
available days containing the anchor, derived by calling `lastAvailableDateFrom`
(`utils/boundary.ts`) once per direction. React Aria's model verbatim
(`useRangeCalendarState`'s `getAvailableRange`, folded into the `min`/`max` it hands its inner
`useCalendarState`).

Narrowing the **bounds** rather than guarding at the commit is the whole point: every downstream
predicate inherits the constraint for free — `isCellOutOfRange` → `isCellDisabled` →
`isDateNonFocusable` (arrows skip, cells go `aria-disabled` + `data-disabled`), `isDateSelectable`,
and the cursor clamp the tentative band rides. A commit-time guard alone would still let the arrows
cross the unavailable day and paint a band with a hole in it.

- **`min()`/`max()` report the effective bounds**, not the options as given. Either side falls back to
  the configured one where the run is unbounded (`undefined`), and the **stricter** of the two wins
  (`maxDate`/`minDate`).
- **The run reads the raw `isDateDisabled`**, not `isDateUnavailable` — which reports false outside
  month view. Availability is a property of the days, not of the view, so drilling up mid-selection
  must not silently widen the window.
- **The search spans one month either way.** Beyond that the run reads as unbounded;
  `utils/boundary.md`.
- **`activate` clamps into the run** — activating past the run's edge ends the range *at* the edge,
  as RA's `selectDate` does. Only this narrowing is clamped away: with no anchored run the date passes
  through untouched, so activating a genuinely out-of-range or unavailable day stays an outright
  refusal. RA's `previousAvailableDate` back-off is deliberately not ported — it would turn that
  refusal into a silent selection of a *neighbouring* day.
- **`prev()`/`next()` disable while anchored inside a bounded run**, since `isPrevDisabled` /
  `isNextDisabled` read the same narrowed bounds. Visible (with weekends unavailable no run exceeds
  five days, so the month cannot be paged mid-selection) and correct — nothing outside the run is
  selectable, so there is nothing to page *to*. RA behaves identically. Where the run is unbounded on
  a side, the configured bound remains and paging works.
- **`drillUp()` stays ungated while the bounds are narrowed**, and the abandonment verbs don't change
  that. With no `isDateDisabled` there is no narrowing at all, and drilling up to reach a far month is
  a legitimate way to draw a range across several — gating it would break the flow for every calendar
  with no unavailable days. Where a run *is* narrow, the year/decade view's mostly-inert cells are the
  bounds telling the truth: nothing outside the run is selectable, so nothing outside it should be
  reachable, in any view. Leaving the range is what `Escape` and `commitBehavior` are for.
- **`allowsNonContiguousRanges: true`** disables the narrowing entirely, restoring the plain
  `min`/`max`. The range may then span unavailable days, which the selection paint still cuts out of
  the band (below), as RA renders them. The resolved option is on the **return** too, because it also
  tells the grid whether `Shift`+`Arrow` may step past an unavailable day or must stop at it
  (`calendar-grid.md`).
- **Gated on `mode() === "range"`, not on the anchor alone.** Nothing clears `anchorDate` when
  `selectionMode` changes, so a stale anchor would keep the bounds clamped for good — inert cells and
  dead nav in a mode that has no ranges.
- **`availableRange` is a `createMemo`** — unlike `highlightedRange` and `formValues`, which stay
  plain accessors to remain hydration-neutral. `min`/`max` are read twice per cell per predicate, and
  each read would otherwise walk up to a month of days through the consumer's `isDateDisabled`: tens
  of thousands of callbacks per pointer move once unavailable days are sparse. That earns the one
  reactive node, at the measured price of shifting every `_hk` in the SSR tree (and `headingId`) by
  one — hence `calendar.ssr.test.tsx`'s re-recorded inline snapshot, with `hydrateFixture` proving the
  client allocates the same keys.

## `highlightedRange`: one field, two phases

```ts
highlightedRange(): DateRange | null; // = strategy.highlightedRange({ value, anchor, endpoint: focusedDate() })
highlightDate(date: CalendarDate): void; // = if (anchorDate() !== null) setFocusedDate(date)
```

`highlightedRange` is the **one** band range mode paints, in React Aria's one-field-two-phases shape
(`useRangeCalendarState`: `highlightedRange = anchorDate ? makeRange(anchorDate, focusedDate) : (value && …)`):

- **Tentative** while a range is anchored — `anchorDate` → the roving cursor.
- **The committed value** when it is not, so once the range completes (or before any range starts) the
  band simply *is* the committed selection.
- **Null** outside range mode, and while range mode has nothing selected.

The three paint predicates (`isSelected` / `isSelectionStart` / `isSelectionEnd`) are membership in
*this* single band, which is why there is **one** attribute vocabulary (`data-selected` +
`data-selection-{start,end}`, middle derived — `calendar-cell.md`). The strategy derives the whole band
from a `SelectionState` snapshot alone — `{ value, anchor, endpoint }`, where **`endpoint` is the
roving cursor** (`focusedDate`), the range's moving end while anchored — so no predicate takes a second
argument, exactly as RA's `isSelected` reads its own state object's `highlightedRange`.
`utils/range-selection.md`.

**The decided trade-off:** while a new range is being dragged, the previously committed range **stops
painting** — the band always shows the selection the next activate would produce. RA behaves
identically. Dropping the anchor without completing (`clearAnchor` / `Escape`) brings the committed
range straight back, since `highlightedRange` falls back to `value` the moment `anchor` is `null`.

There is **one** moving endpoint and it is `focusedDate`, so hover and keyboard share a code path:
`highlightDate` *is* a cursor move, and the band can never disagree with the cell the user is on.
Consequences:

- **Anchoring alone opens a one-day band** on the anchor (the cursor is already there), so the anchor
  carries both `data-selection-{start,end}` under its `data-selected` pill until the cursor moves.
- **Arrow keys grow the band.** The keyboard auto-advance (`focusNearestAvailableDate`, below) steps
  the cursor off the anchor the instant a keyboard press anchors, so the band reads as two days even
  before an arrow.
- **The band survives the pointer leaving the grid** — it belongs to the anchor, not to a hover. The
  grid deliberately handles no `pointerleave` (`calendar-grid.md`).
- **`highlightDate` is inert with no anchor**, in every mode. Hover never steals the roving tab stop
  outside an in-progress range, and is a complete no-op in single/multiple, where `anchor` is always
  `null` and those strategies' `highlightedRange` is always `null` (their paint reads `value`
  directly, not the band).
- **Accepted RA side effect:** while anchored, hovering *does* move the roving tab stop. That is the
  price of one endpoint, and what keeps pointer and keyboard from painting two different bands.

`highlightDate`'s caller (`createCalendarCell`'s `onMouseEnter`) gates on RA's `isSelectable` —
`isDateNonFocusable` or `isDateUnavailable` skips it — so a day the range could not end on never
previews a range the matching click would refuse.

## Keyboard range auto-advance

```ts
activate(date, opts?): boolean;                    // returns whether it *began a range*
focusNearestAvailableDate(anchor: CalendarDate): void;
pendingCursorFocus(): boolean;
setPendingCursorFocus(pending: boolean): void;
```

`activate` returns **whether it began a range** — no anchor before, one after. The cell hook needs that
fact to gate the keyboard-only auto-advance and cannot recover it by re-reading `anchorDate`: under
solid-js 2.0's client build a signal write is invisible to a plain read until the next flush, so the
anchor still reads `null` immediately after `activate` returns. The bit is `false` for a
single/multiple selection, a refused day, and a year/decade drill.

`focusNearestAvailableDate` is React Aria's affordance (`useRangeCalendarState`): after a **keyboard**
press anchors a range, step the cursor one day past the anchor (+1, falling back to −1, staying put
when neither is selectable) so the band reads as "range in progress" rather than a committed single
date. A pointer gets that signal from hover, so `createCalendarCell` calls this only for a keyboard
press — never for a screen reader's virtual click. RA's two-term available-run test collapses to one
`isDateSelectable` call here, because the run's edge *is* the first unavailable day in each direction
for a one-day step (§ Contiguous ranges), and `order()` in the strategy normalizes the backwards case
where stepping to −1 makes the anchor the range's *end*.

`pendingCursorFocus` is the deferred-cursor-focus flag — "bring DOM focus to wherever the cursor
settles". It lives on the **root state**, not the grid, because both the grid's own
arrow/page/drill navigation *and* `focusNearestAvailableDate` (which a cell calls, and a cell has no
reference to the grid hook) must arm it. The **grid** consumes it: it owns the effect that waits for
the target cell to mount, moves DOM focus, and clears the flag (`calendar-grid.md`). It is a
plain-value `createSignal`, so it consumes no hydration id and does not shift `_hk`.

## A range abandoned mid-selection

```ts
commitBehavior?: "select" | "reset" | "clear"; // default "select"
clearAnchor(): void;      // "reset" — drop the anchor
commitSelection(): void;  // "select" — complete the tentative range at the roving cursor
clearSelection(): void;   // "clear" — empty the selection
```

The three verbs are React Aria's (`RangeCalendarState`); `createCalendarGroup` maps `commitBehavior`
onto them when the user walks away — a pointer released outside, or focus leaving. `Escape` (on the
grid) is always `clearAnchor`, never the policy. Both triggers: `calendar-group.md`. What is decided
*here* is what each verb does:

- **`clearAnchor` just drops the anchor** — RA's `setAnchorDate(null)`, verbatim. It needs nothing more
  because `value` is never written while a range is in progress (below): the selection committed
  before the range began is still in `value`, so the moment `anchor` goes `null`, `highlightedRange`
  falls back to it and it resumes painting on its own.
- **`commitSelection` is `activate(focusedDate())`** — so it emits `onValueChange` and announces, like
  any other completing activate. It falls back to `clearAnchor` in the two cases where there is
  nothing to commit, rather than doing nothing: this runs *because* the calendar already lost the
  pointer or the focus that would let anyone finish, so leaving a range in progress behind is never
  acceptable.
  - **The cursor is on a day the calendar refuses.** Reachable only with
    `allowsNonContiguousRanges: true`; otherwise the narrowed bounds keep the cursor inside the
    anchor's available run. (RA backs off to the previous available date; hope-ui doesn't, for the
    same reason `activate` doesn't — § Contiguous ranges.)
  - **The calendar has been drilled up.** `activate` *descends a view* outside month view, so
    committing there would silently drill and still leave the range anchored.
- **`clearSelection` emits `onValueChange(null)`** — or `[]` in multiple mode — **unless the
  consumer's last-known value was already empty.** Because `value` is never written mid-selection, it
  *is* the consumer's last-known value in every phase, so clearing a range merely *started* on an
  empty calendar emits nothing.

### Extending a range (`activate(date, { extend: true })`)

The `Shift`+`Arrow` path (`calendar-grid.md`). It keeps the anchor and slides the moving endpoint, so
repeated presses grow one range and a later plain activate commits it. What it does with **no anchor**
depends on what is already committed:

- **A range is committed** → the strategy's own no-anchor branch re-opens **that** range, anchoring at
  its `start` (`utils/range-selection.md`). The days already selected stay inside the range being
  grown.
- **Nothing is selected** → `activate` seeds a fresh range at `focusedDate()`, then extends it. The
  strategy cannot do this itself: it sees only a value and an anchor, never the cursor.

### `value` is written on exactly one transition

Range mode writes `value` **only** on the completing activate — the second click, or the plain
`Enter`/click after a `Shift`+`Arrow` extension. The first activate anchors and leaves `value`
untouched; the band derives from the anchor and the roving cursor through `highlightedRange`, not from
`value`. React Aria's contract (`utils/range-selection.md`).

Three things fall out, each of which would otherwise need its own workaround: a **controlled** consumer
never holds a value its owner was not told about; `clearAnchor` has nothing to restore (above); and
`formValues()` needs no mid-selection guard (below).

## Native form

Opt-in native `<form>` submission, mirroring the shipped Listbox pattern. The primitive renders no DOM
— it exposes the state the styled component's hidden `<input>`s consume:

- **`name?: string`** — the field name. **Opt-in**: with `name` unset, `formValues()` is `[]` and
  nothing is submitted.
- **`form?: string`** — associates the hidden field(s) with a `<form>` by id (the input's `form`
  attribute), for inputs rendered outside that form.
- **`required?: boolean`** (default `false`) — marks the field required for native validation.

`formValues(): { name: string; value: string }[]` derives one entry per hidden input from
`selectionValue()`, each `value` an ISO `YYYY-MM-DD` string (`CalendarDate.toString()`):

- **single** → `[{ name, value }]`; `[]` when the value is `null`.
- **multiple** → one entry per selected date, all sharing `name` (sorted, as the selection is).
- **range** → `[{ name: `${name}Start`, value: startISO }, { name: `${name}End`, value: endISO }]`, or
  `[]` when no range is committed. No mid-selection guard is needed: `value` is never written while a
  range is in progress (above), so whatever is in `value` is always a genuinely committed range —
  during a *new* in-progress range the still-committed previous range submits, and withholding it
  would drop a real value from the form for as long as the user drags a new one.

`formValues` is a plain accessor, not a `createMemo` — like `highlightedRange`, the sibling predicates,
and the Listbox `formValues` — so it adds no reactive node and stays hydration-neutral.

## Calendar-aware formatting (non-Gregorian systems)

The grid **math** is already calendar-system-aware (`@internationalized/date`'s
`startOfWeek`/`getWeeksInMonth`/`add`/`isSameMonth` respect a `CalendarDate`'s calendar) and day
numbers localize to the numbering system. The `Intl.DateTimeFormat` formatters
(`utils/month-view.ts`'s `formatMonthYear`/`formatFullDate`, plus the year/decade formatters) derive
their **`calendar` from the date itself** (`date.calendar.identifier`), React-Aria style, rather than
from the locale's default calendar:

- An Islamic / Japanese / Buddhist `CalendarDate` (built via `toCalendar(today(tz), …)`) reads out its
  **own** month/year/era in the heading + `aria-label` — matching the grid's day numbers — **even
  under a plain locale** without a `-u-ca-` extension (`en-US` → "Rajab 1447 AH", not "January 2026").
- A Gregorian date under a non-Gregorian-default locale (`fa-IR`, default Persian) still reads
  Gregorian, matching its Gregorian day numbers.
- A **no-op for the common Gregorian case** (`calendar: "gregory"` ≡ omitting it for `en-US`).

`getWeekdays` takes **no** `calendar` option: the 7-day week is shared across calendar systems, so
weekday names don't depend on it (only month/year/era do). For the fully-localized experience, still
pair a non-Gregorian date with a matching `-u-ca-` locale (`ar-SA-u-ca-islamic-umalqura`) so the
numbering system and directionality line up too.

## The view machine

`view` selects what `visibleMonth` is shown *as*; `cells`/`headingLabel`/boundary math/predicates all
switch on it. `drillUp` climbs month→year→decade (no-op at decade); `drillDownTo` descends; `activate`
**selects in month view but drills in year/decade**. The cursor (`focusedDate`) is kept **normalized to
the active view's cell granularity** (`normalizeFocusForView`), so `isFocused` is a plain `isSameDay`
in every view, and the visible scope **follows the cursor** when it leaves — one effect does this for
both internal roving moves and controlled `focusedValue` updates.

## Three disabled states (React Aria)

- **cell-disabled** = the whole calendar `disabled` OR a whole out-of-range period (`isCellDisabled`,
  RA's predicate of the same name) → the cell paints `data-disabled` (inert *and* dimmed).
- **non-focusable** = `isCellDisabled` OR outside the visible scope (`isDateNonFocusable`) → the cell
  registers `disabled: true` (grid skips it), holds no roving tab stop, and click/focus/hover are
  guarded. Outside-scope days are *only* here, never in `isCellDisabled`: they must stay arrow-skipped
  without being repainted dim over their own `data-outside-month` tint.
- **unavailable** = the `isDateDisabled` predicate (month view only) → stays focusable + announced,
  blocked only in `activate`.

The first and third are **independent, not exclusive**: an unavailable day the bounds also put out of
range is both, carrying `data-disabled` *and* `data-unavailable` (struck *and* dimmed). Because a
contiguous range narrows the bounds to the anchor's available run, that is the normal state of the
unavailable day bounding the run for as long as the range is in progress — § Contiguous ranges.

`aria-disabled` is emitted for RA's `!isSelectable` — non-focusable **or** unavailable — so it covers
all three (`calendar-cell.md`).

## `disabled` vs `readOnly`

Both refuse selection (`isDateSelectable` is false under either), but they are different affordances,
and hope-ui reflects each where React Aria does:

| | `disabled` | `readOnly` |
| --- | --- | --- |
| Cells | inert: `isCellDisabled`, `aria-disabled`, `data-disabled`, no tab stop | untouched — reachable, undimmed, normal paint |
| Grid | `aria-disabled="true"` + `tabindex="-1"` | `aria-readonly="true"` |
| `prev()` / `next()` / `drillUp()` | all three no-op — a disabled calendar navigates nowhere | unaffected |

`isPrevDisabled` / `isNextDisabled` short-circuit on `disabled()` **before** the per-view `min`/`max`
boundary math, and the heading part folds it in alongside `canDrillUp` (`calendar-heading.md`) —
otherwise a `disabled` calendar stays fully pageable, fully tabbable, and reports nothing to assistive
technology.

## Selection

`onValueChange` fires when the selection **commits** — every activate in single/multiple, but only on
range **completion**, not the in-progress anchor. Hence the value pair is not wired straight through
`createControllableState`'s `onChange`.

### The paint excludes days the calendar cannot select

`isSelected` / `isSelectionStart` / `isSelectionEnd` are each gated on
`!isCellDisabled(date) && !isDateUnavailable(date)` before the strategy is consulted — React Aria's own
gate (`useCalendarState`'s `isSelected` returns false for either). The committed **value** is never
touched; only the paint is. So a range committed while it was legal and later narrowed — by a `max`
that moved, or by an `isDateDisabled` day inside it — renders with those days **cut out of the band**
rather than claiming a selection the matching click would refuse, and `aria-selected` never announces
one.

Three boundaries are deliberate:

- **The guard lives in `createCalendar`, not in the strategies.** `singleSelection` / `rangeSelection`
  / `multipleSelection` stay pure, mode-only and day-based: they know nothing of `min`/`max`,
  `disabled` or availability, and their unit tests assert the raw set membership.
- **It reads `isCellDisabled`, not `isDateNonFocusable`.** The outside-scope filler days keep their
  paint, so a range straddling a month boundary still renders as one continuous band on both sides.
  (RA folds the visible range into its own `isCellDisabled`, but renders no filler cells at all, so it
  has no band to keep continuous.)
- **`readOnly` does not affect the paint; `disabled` does.** Read-only refuses *changes*, so the
  current value stays fully visible. `disabled` is the first arm of `isCellDisabled`, so — matching
  RA — a wholly disabled calendar paints no selection at all.

### Year / decade cells paint by overlap

A cell in year view stands for a whole month, in decade view a whole year, so membership cannot be a
test on the cell's representative date. Every date reaching a strategy predicate is first mapped
through `cellPeriod(view(), date)` (`utils/view.md`), and the predicates are overlap tests over that
period: a Jan 15 – Mar 10 range lights **January, February and March**, with the start corner on
January and the end corner on March.

Month view's period is the degenerate `{date, date}`, on which every predicate collapses to the
day-level test it generalizes, so month view is bit-for-bit unchanged. The band predicates
(`isSelected` / `isSelectionStart` / `isSelectionEnd`) read the same period for the same reason: a
range anchored in month view survives a drill up, and its tentative band must not skip the month its
own anchor sits in.

The `paintsSelection` gate above composes *in front of* this, still keyed on the cell's representative
date — `isCellDisabled` is already per-view (`isMonthOutOfRange` / `isYearOutOfRange` are whole-period
tests of their own).

React Aria has no year or decade view, so this generalization — and the `SelectionStrategy` signature
that carries it — is hope-ui's own. The seam is explicitly unstable (`CLAUDE.md` § Architecture).

## SSR / hydration

- The month grid is **variable 4–6 weeks**, so its row count depends on `visibleMonth`, which seeds
  from `constrainDate(defaultFocusedValue ?? firstDateOf(value ?? defaultValue) ?? today(timeZone),
  min, max)` — clamped at the seed for exactly this reason (above). Seeded from a prop it is
  deterministic; the bare `today()` fallback can disagree across a server/client midnight boundary.
  **For SSR, pass a stable `defaultFocusedValue`** (the fixture pins one). `today()`-derived
  attributes (`data-today`) are reactive, re-evaluated on hydrate — never structural.
- `headingId` is a single `createUniqueId`, SSR-stable and identical on server + client, so the grid's
  `aria-labelledby`→heading IDREF is valid in the server markup.
- The announcer only builds its live regions where a `document` exists (browser), so it is a no-op
  during SSR and in the Node `unit` project (which runs the client build without a DOM).

Ported from the Angular calendar's `CalendarContext` (419 LOC) + its root directive.

## Rejected alternatives

### `@solid-primitives/date` as the date substrate
**Why not:** it is `Date`-based and mutable, where every pure util in `utils/` needs the immutable,
date-only, calendar-system-aware `CalendarDate` that `@internationalized/date` provides (React Aria's
own substrate, which is what let those utils port verbatim). As a `node_modules` reactive primitive it
would also carry the transform-boundary hydration hazard for no benefit. Verdict recorded in
`__internal__/solid-primitives-eval.md`.

### An in-repo `createLiveRegion` primitive
**Why not:** `@solid-primitives/a11y`'s `createAnnounce` already is one — effect-only (no render-body
signal or memo), `isServer`-guarded, appending its live regions to `document.body` outside the
component tree — and it exports the `AnnouncePoliteness` polite/assertive split that was the whole of
what the roadmap row asked for. It cleared the calendar hydration round-trip byte-for-byte, so roadmap
#2 is retired in place rather than built.

### A per-instance `messages` prop (the `CalendarMessages` dictionary)
**Why not:** it existed only to keep `@solid-primitives/i18n`'s **memoizing** `translator` out of the
calendar's render path — a compute-form signal there is the transform-boundary hydration hazard this
repo tracks. Once `@hope-ui/i18n`'s `t()` landed (a plain function reading the locale accessor per
call, never a `createMemo`), the dictionary was a second per-instance copy of a catalog the provider
already owns, and translating one calendar said nothing about the next. Parts call
`state.t("calendar.*")` instead.

### Writing the resolved, locale-derived reading direction to the DOM
**Why not:** `useLocale().direction()` never reports "nothing" — with no provider it reports the
*detected browser* direction — so a calendar nobody had configured stamped `dir="ltr"` on itself and
overrode the `dir="rtl"` it was rendered into, stopping an ancestor's direction from cascading at all.
This shipped and was reverted; only the consumer's `dir` **prop** is written now. Both references draw
the same line (`useCalendarGrid` puts no `dir` in `gridProps`) — see *Reading direction* above, and
`__internal__/primitives/internal/create-text-direction-warning.md` for the dev warning that covers
the under-declared-app case instead.

### A commit-time guard for contiguous ranges
**Why not:** it stops the *second click* from committing across an unavailable day but leaves the
arrows free to cross one, so the tentative band previews a range with a hole punched in it — the paint
guard cuts those days out, which makes the hole visible rather than preventing it. Narrowing the
calendar's own `min`/`max` around the anchor instead means every downstream predicate (`isCellDisabled`
→ `isDateNonFocusable`, `isDateSelectable`, the cursor clamp) inherits the constraint for free. See
*Contiguous ranges* above.

### React Aria's `previousAvailableDate` back-off in `activate`
**Why not:** it turns the refusal of an out-of-range or unavailable day into a silent selection of a
*neighbouring* day. Only the anchored-run narrowing is clamped away here; with no anchored run the
date passes through untouched and activating a day the calendar refuses stays an outright refusal.

### Narrowing the bounds on `anchorDate` alone
**Why not:** nothing clears `anchorDate` when `selectionMode` changes, so a stale anchor would keep the
bounds clamped for good — inert cells and dead `prev`/`next` in a mode that has no ranges at all. The
narrowing is gated on `mode() === "range"`.

### The degenerate `{date, date}` write on the first activate
**Why not:** a controlled consumer then holds a value its owner was never told about, for the whole
duration of a range selection. It was kept for a while because it gave the anchor its solid pill under
the tentative band; the band now derives that from `highlightedRange`'s one-day phase, and dropping the
write collapsed `valueBeforeAnchor`, `clearAnchor`'s restore, `clearSelection`'s `lastEmitted` dance
and `formValues`' mid-selection guard along with it. See *`value` is written on exactly one
transition* above.

### `availableRange` as a plain accessor
**Why not:** `min`/`max` are read twice per cell per predicate, and each read walks up to a month of
days through the consumer's `isDateDisabled` — tens of thousands of callbacks per pointer move once
unavailable days are sparse. It is the one `createMemo` among these accessors, at the measured price of
shifting every `_hk` in the SSR tree by one (hence the re-recorded inline snapshot). Its neighbours
`highlightedRange` and `formValues` do no such walking and stay plain, hydration-neutral accessors.
