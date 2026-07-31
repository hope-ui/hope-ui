# Boundary math (`boundary.ts`)

`min`/`max` boundary helpers that drive prev/next disabling, the two-state "disabled" model, and the
roving cursor's clamp. Pure and total (an absent bound ⇒ that side is unbounded).

## API

```ts
function constrainDate(date, min?, max?): CalendarDate;            // clamp into [min, max]

function lastAvailableDateFrom(                                    // derives a bound from availability
  anchor, direction: 1 | -1, isDateUnavailable, searchSpan?,
): CalendarDate | undefined;

function firstSelectableDateFrom(                                  // where the next usable run begins
  from, direction: 1 | -1, isSelectable, searchSpan?,
): CalendarDate | undefined;

function isDateOutOfRange(date, min?, max?): boolean;              // day-level, view-agnostic

function isPreviousMonthDisabled(visibleMonth, min?): boolean;
function isNextMonthDisabled(visibleMonth, max?): boolean;
function isPreviousYearDisabled(visibleMonth, min?): boolean;
function isNextYearDisabled(visibleMonth, max?): boolean;
function isPreviousDecadeDisabled(visibleMonth, min?): boolean;
function isNextDecadeDisabled(visibleMonth, max?): boolean;

function isMonthOutOfRange(monthStart, min?, max?): boolean;       // whole-period (year-view cell)
function isYearOutOfRange(yearStart, min?, max?): boolean;         // whole-period (decade-view cell)
```

- `constrainDate` — React Aria's `constrainValue`: the only helper here that *moves* a date rather
  than classifying one, via `@internationalized/date`'s `maxDate`/`minDate`. Idempotent, and a no-op on
  a date already inside the bounds (both bounds are inclusive). `createCalendar` applies it to the
  roving cursor on **every move** (`setFocusedDate`, the funnel for
  `navigate`/`shiftYears`/`applyView`/`activate`/`highlightDate`), on the **seed**, and **again at
  render** — see `calendar-root.md`. Note it *returns one of its operands*, so a clamped cursor adopts
  the bound's calendar system: `min`/`max` must be in the same system as the value, which is already
  what the comparison-based predicates below assume.
- `lastAvailableDateFrom` — the far end of the run of consecutive **available** days that contains
  `anchor` and extends in `direction`: the last day reachable without crossing an unavailable one.
  `undefined` means that side of the run is unbounded (no unavailable day within `searchSpan`, default
  one month either way — the calendar's visible period, matching React Aria's `visibleDuration`), so
  the caller's own bound is what remains. It is the **only** helper here that *derives* a bound instead
  of applying one, and `createCalendar` calls it once per direction to build the `availableRange` it
  folds into `min`/`max` while a range is anchored (see `calendar-root.md` § Contiguous ranges).
  This is React Aria's `nextUnavailableDate`, renamed for what it returns — RA names it for the day it
  stops *at*, then hands back the one before, which is the value every caller actually wants. One RA
  behavior is kept verbatim: the search-limit check is not repeated after the walk, so a run that
  reaches the edge of the window is still reported **bounded** when the very next day is unavailable.
  That is the safe direction to err in — reporting a bound that exists is never worse than reporting
  none.
- `firstSelectableDateFrom` — the mirror of the above: the first day at or beyond `from`, walking in
  `direction`, that `isSelectable` accepts. `lastAvailableDateFrom` reports where the run containing a
  date *ends*; this one reports where the next usable run *begins*, so a caller that stepped onto a day
  the calendar refuses can continue to the next one it would take. `createCalendarGrid` is the caller —
  `Shift`+`Arrow` steps past unavailable days with it (see `calendar-grid.md`) — and it passes the
  calendar's own `isDateSelectable`, which is why there is no second `min`/`max` argument here: the
  bounds already end the walk through that predicate. `undefined` when nothing selectable turns up
  within `searchSpan` (default one month, as above), which is also what keeps the walk finite on an
  unbounded calendar whose `isDateDisabled` refuses everything.
- `isDateOutOfRange` — a single day is strictly before `min` / after `max` (the hard, non-focusable,
  arrow-skipped state — distinct from "unavailable", which stays focusable). The exact predicate
  `constrainDate` exists to keep false for `focusedDate()`.
- The `isPrevious*`/`isNext*` pair — the view-scoped prev/next control is disabled when the *entire*
  adjacent period lies outside `[min, max]` (nothing reachable there).
- `isMonthOutOfRange`/`isYearOutOfRange` — a whole month/year lies outside `[min, max]`; **looser**
  than `isDateOutOfRange` so a period is still reachable when only part of it is in range. The calendar
  state picks the right flavor per view; don't compare raw days in year/decade.

The predicates are ported verbatim from the Angular calendar's `utils/boundary.ts`; `constrainDate` and
`lastAvailableDateFrom` are new, from React Aria. `firstSelectableDateFrom` has no React Aria
counterpart — RA has no Shift+Arrow extension to walk for.

## Rejected alternatives

### A commit-time guard on the completing activate (instead of deriving a bound)
**Why not:** it leaves the arrows and the pointer free to cross an unavailable day, so the tentative
band previews — and the second click commits — a range spanning days the calendar refuses; the paint
guard that cut those days back out only made the hole visible. Deriving the anchor's available run with
`lastAvailableDateFrom` and folding it into the calendar's *own* `min`/`max` is what makes
`isDateNonFocusable`, `isDateSelectable` and the cursor clamp inherit the constraint for free
(`calendar-root.md` § Contiguous ranges).

### An unbounded walk in the two run-finding helpers
**Why not:** `firstSelectableDateFrom` would never terminate on an unbounded calendar whose
`isDateDisabled` refuses every day, and `lastAvailableDateFrom` would walk forever when none is
unavailable. The `searchSpan` window (default one month, React Aria's `visibleDuration`) is what makes
both total; beyond it that side simply reads as unbounded and the configured bound is what remains.

### The day-level `isDateOutOfRange` for year- and decade-view cells
**Why not:** a year-view cell stands for a whole month, so testing its representative day disables all
of January the moment `min` is Jan 15 — a period that is only *partly* in range becomes unreachable.
`isMonthOutOfRange` / `isYearOutOfRange` are deliberately looser for that reason; the calendar state
picks the flavor per view.
