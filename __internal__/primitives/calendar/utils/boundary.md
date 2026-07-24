# Boundary math (`boundary.ts`)

`min`/`max` boundary helpers that drive prev/next disabling, the two-state "disabled" model, and the
roving cursor's clamp. Pure and total (an absent bound ⇒ that side is unbounded).

## API

```ts
function constrainDate(date, min?, max?): CalendarDate;            // clamp into [min, max]

function lastAvailableDateFrom(                                    // derives a bound from availability
  anchor, direction: 1 | -1, isDateUnavailable, searchSpan?,
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
- `isDateOutOfRange` — a single day is strictly before `min` / after `max` (the hard, non-focusable,
  arrow-skipped state — distinct from "unavailable", which stays focusable). The exact predicate
  `constrainDate` exists to keep false for `focusedDate()`.
- The `isPrevious*`/`isNext*` pair — the view-scoped prev/next control is disabled when the *entire*
  adjacent period lies outside `[min, max]` (nothing reachable there).
- `isMonthOutOfRange`/`isYearOutOfRange` — a whole month/year lies outside `[min, max]`; **looser**
  than `isDateOutOfRange` so a period is still reachable when only part of it is in range. The calendar
  state picks the right flavor per view; don't compare raw days in year/decade.

The predicates are ported verbatim from the Angular calendar's `utils/boundary.ts`; `constrainDate` and
`lastAvailableDateFrom` are new, from React Aria.
