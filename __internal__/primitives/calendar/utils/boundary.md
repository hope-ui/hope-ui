# Boundary math (`boundary.ts`)

`min`/`max` boundary helpers that drive prev/next disabling, the two-state "disabled" model, and the
roving cursor's clamp. Pure and total (an absent bound ⇒ that side is unbounded).

## API

```ts
function constrainDate(date, min?, max?): CalendarDate;            // clamp into [min, max]

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
- `isDateOutOfRange` — a single day is strictly before `min` / after `max` (the hard, non-focusable,
  arrow-skipped state — distinct from "unavailable", which stays focusable). The exact predicate
  `constrainDate` exists to keep false for `focusedDate()`.
- The `isPrevious*`/`isNext*` pair — the view-scoped prev/next control is disabled when the *entire*
  adjacent period lies outside `[min, max]` (nothing reachable there).
- `isMonthOutOfRange`/`isYearOutOfRange` — a whole month/year lies outside `[min, max]`; **looser**
  than `isDateOutOfRange` so a period is still reachable when only part of it is in range. The calendar
  state picks the right flavor per view; don't compare raw days in year/decade.

The predicates are ported verbatim from the Angular calendar's `utils/boundary.ts`; `constrainDate` is
new, from React Aria.
