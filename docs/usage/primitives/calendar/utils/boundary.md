# Boundary math (`boundary.ts`)

`min`/`max` boundary predicates that drive prev/next disabling and the two-state "disabled" model.
Pure and total (an absent bound ⇒ that side is unbounded).

## API

```ts
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

- `isDateOutOfRange` — a single day is strictly before `min` / after `max` (the hard, non-focusable,
  arrow-skipped state — distinct from "unavailable", which stays focusable).
- The `isPrevious*`/`isNext*` pair — the view-scoped prev/next control is disabled when the *entire*
  adjacent period lies outside `[min, max]` (nothing reachable there).
- `isMonthOutOfRange`/`isYearOutOfRange` — a whole month/year lies outside `[min, max]`; **looser**
  than `isDateOutOfRange` so a period is still reachable when only part of it is in range. The calendar
  state picks the right flavor per view; don't compare raw days in year/decade.

Ported verbatim from the Angular calendar's `utils/boundary.ts`.
