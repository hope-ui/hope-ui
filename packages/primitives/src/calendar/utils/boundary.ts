import {
  type CalendarDate,
  type DateDuration,
  endOfMonth,
  endOfYear,
  maxDate,
  minDate,
  startOfMonth,
  startOfYear,
} from "@internationalized/date";
import { decadeStart, YEARS_PER_DECADE } from "./view";

/**
 * `min`/`max` bound the selectable + reachable range. These pure helpers drive the calendar's boundary
 * behavior; all are total (an absent bound ⇒ that side is unbounded). The day-level
 * {@link isDateOutOfRange} is view-agnostic; the prev/next pair + the whole-period out-of-range tests
 * come in one-per-view flavors (month / year / decade) selected by the calendar state.
 * {@link constrainDate} is the only non-predicate: it *moves* a date back into the bounds, and
 * {@link lastAvailableDateFrom} is the only helper that derives a bound rather than applying one.
 */

/**
 * True when `date` is strictly before `min` or after `max` — the **hard out-of-range** state: such days
 * are non-focusable, arrow-skipped, and not selectable (paired with the grid's `softDisabled=false`).
 * Distinct from "unavailable" (`isDateDisabled`), which stays focusable. Pure.
 */
export function isDateOutOfRange(
  date: CalendarDate,
  min?: CalendarDate,
  max?: CalendarDate,
): boolean {
  return (
    (min !== undefined && date.compare(min) < 0) || (max !== undefined && date.compare(max) > 0)
  );
}

/**
 * Clamp `date` into `[min, max]` — React Aria's `constrainValue`, which it applies to the roving cursor
 * on every move, on the seed, and again at render. Without it the cursor lands on a hard out-of-range
 * cell that is non-focusable and arrow-skipped, stranding the roving tab stop. Pure.
 */
export function constrainDate(
  date: CalendarDate,
  min?: CalendarDate,
  max?: CalendarDate,
): CalendarDate {
  // `maxDate`/`minDate` are typed nullable in *and* out; inside each guard both operands are present,
  // so the result is always a `CalendarDate`.
  const lowerBounded = min === undefined ? date : (maxDate(date, min) as CalendarDate);
  return max === undefined ? lowerBounded : (minDate(lowerBounded, max) as CalendarDate);
}

/**
 * The far end of the run of consecutive **available** days that contains `anchor` and extends in
 * `direction` (`1` forward, `-1` backward) — the last day reachable from the anchor without crossing an
 * unavailable one. `undefined` when no unavailable day turns up within a month of the anchor: that side
 * of the run is simply unbounded, and the caller's own `min`/`max` is what remains.
 *
 * React Aria's `nextUnavailableDate`, renamed for what it returns (RA names it for the day it stops
 * *at*, then hands back the one before). `createCalendar` calls it once per direction to derive the
 * bounds a contiguous range selection may not cross — see `calendar-root.md`. Pure.
 */
export function lastAvailableDateFrom(
  anchor: CalendarDate,
  direction: 1 | -1,
  isDateUnavailable: (date: CalendarDate) => boolean,
  searchSpan: DateDuration = { months: 1 },
): CalendarDate | undefined {
  const searchLimit = direction < 0 ? anchor.subtract(searchSpan) : anchor.add(searchSpan);
  const isWithinSearch = (date: CalendarDate) =>
    direction < 0 ? date.compare(searchLimit) >= 0 : date.compare(searchLimit) <= 0;

  let candidate = anchor.add({ days: direction });
  while (isWithinSearch(candidate) && !isDateUnavailable(candidate)) {
    candidate = candidate.add({ days: direction });
  }
  // Two ways out: `candidate` is the first unavailable day, or it stepped one past the window. React
  // Aria tests that out-of-window day as well, so a run filling the whole window is still reported
  // bounded when the very next day is unavailable — kept verbatim. The `||` short-circuits, so
  // `isDateUnavailable` (a consumer callback, with no purity contract) is never asked about the same
  // day twice.
  const stoppedOnUnavailableDay = isWithinSearch(candidate) || isDateUnavailable(candidate);
  return stoppedOnUnavailableDay ? candidate.add({ days: -direction }) : undefined;
}

/**
 * Month view: the "previous" control is disabled when the *entire* previous month lies before `min`
 * (its last day is still < `min`), so there is nothing reachable to navigate back to. Pure.
 */
export function isPreviousMonthDisabled(visibleMonth: CalendarDate, min?: CalendarDate): boolean {
  if (min === undefined) {
    return false;
  }
  return endOfMonth(visibleMonth.subtract({ months: 1 })).compare(min) < 0;
}

/**
 * Month view: the "next" control is disabled when the *entire* next month lies after `max` (its first
 * day is already > `max`). Pure.
 */
export function isNextMonthDisabled(visibleMonth: CalendarDate, max?: CalendarDate): boolean {
  if (max === undefined) {
    return false;
  }
  return startOfMonth(visibleMonth.add({ months: 1 })).compare(max) > 0;
}

/** Year view: "prev" is disabled when the whole previous year ends before `min`. Pure. */
export function isPreviousYearDisabled(visibleMonth: CalendarDate, min?: CalendarDate): boolean {
  if (min === undefined) {
    return false;
  }
  return endOfYear(visibleMonth.subtract({ years: 1 })).compare(min) < 0;
}

/** Year view: "next" is disabled when the whole next year starts after `max`. Pure. */
export function isNextYearDisabled(visibleMonth: CalendarDate, max?: CalendarDate): boolean {
  if (max === undefined) {
    return false;
  }
  return startOfYear(visibleMonth.add({ years: 1 })).compare(max) > 0;
}

/** Decade view: "prev" is disabled when the whole previous decade ends before `min`. Pure. */
export function isPreviousDecadeDisabled(visibleMonth: CalendarDate, min?: CalendarDate): boolean {
  if (min === undefined) {
    return false;
  }
  // The previous decade's last year is (decadeStart − 1); disabled if its Dec 31 is still < min.
  const prevDecadeLastYear = startOfYear(visibleMonth).set({
    year: decadeStart(visibleMonth.year) - 1,
  });
  return endOfYear(prevDecadeLastYear).compare(min) < 0;
}

/** Decade view: "next" is disabled when the whole next decade starts after `max`. Pure. */
export function isNextDecadeDisabled(visibleMonth: CalendarDate, max?: CalendarDate): boolean {
  if (max === undefined) {
    return false;
  }
  // The next decade's first year is (decadeStart + 10); disabled if its Jan 1 is already > max.
  const nextDecadeFirstYear = startOfYear(visibleMonth).set({
    year: decadeStart(visibleMonth.year) + YEARS_PER_DECADE,
  });
  return nextDecadeFirstYear.compare(max) > 0;
}

/**
 * Year-view cell (a whole month) out-of-range: the entire month lies outside `[min, max]` — its last
 * day is before `min` or its first day is after `max`. Looser than the day-level
 * {@link isDateOutOfRange} so a month is still reachable when only *part* of it is in range. Pure.
 */
export function isMonthOutOfRange(
  monthStart: CalendarDate,
  min?: CalendarDate,
  max?: CalendarDate,
): boolean {
  return (
    (min !== undefined && endOfMonth(monthStart).compare(min) < 0) ||
    (max !== undefined && startOfMonth(monthStart).compare(max) > 0)
  );
}

/**
 * Decade-view cell (a whole year) out-of-range: the entire year lies outside `[min, max]`. Same
 * whole-period logic as {@link isMonthOutOfRange}, one level up. Pure.
 */
export function isYearOutOfRange(
  yearStart: CalendarDate,
  min?: CalendarDate,
  max?: CalendarDate,
): boolean {
  return (
    (min !== undefined && endOfYear(yearStart).compare(min) < 0) ||
    (max !== undefined && startOfYear(yearStart).compare(max) > 0)
  );
}
