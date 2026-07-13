import { type CalendarDate, isSameMonth, startOfMonth, startOfYear } from "@internationalized/date";

/** Week-start override accepted by `@internationalized/date` (`startOfWeek`, `getWeeksInMonth`). */
export type FirstDayOfWeek = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

/** The drill stack: month → year → decade. */
export type CalendarView = "month" | "year" | "decade";

/**
 * The drill stack's shared, view-agnostic geometry + cursor math — the seam that lets one grid / cell
 * render all three views (month / year / decade). Each helper switches on {@link CalendarView}; the
 * per-view *content* (cell models, labels, boundary math) lives in `month-view`/`year-view`/
 * `decade-view`/`boundary`. All pure.
 */

/** How many cells sit in a row of each view's grid (month = a 7-day week; year/decade = a 3-up grid). */
export const VIEW_COLUMNS: Record<CalendarView, number> = { month: 7, year: 3, decade: 3 };

/** Years in a decade block (the decade view shows these 10 plus one adjacent year on each side). */
export const YEARS_PER_DECADE = 10;

/** The first calendar year of the decade containing `year` (2026 → 2020, 2020 → 2020, 2029 → 2020). */
export function decadeStart(year: number): number {
  return Math.floor(year / YEARS_PER_DECADE) * YEARS_PER_DECADE;
}

/**
 * Collapse a date to the granularity of a view's cells, so the roving cursor (`focusedDate`) always
 * lines up with a rendered cell's `date` under `isSameDay`: month keeps the day, year snaps to the
 * month start, decade snaps to the year start (Jan 1). This is what lets the cell's `isFocused` and the
 * grid's focus nudge stay a plain `isSameDay` across every view. Pure.
 */
export function normalizeFocusForView(view: CalendarView, date: CalendarDate): CalendarDate {
  switch (view) {
    case "month":
      return date;
    case "year":
      return startOfMonth(date);
    case "decade":
      return startOfYear(date);
  }
}

/**
 * Is `date` inside the scope the grid currently shows? month = same calendar month; year = same
 * calendar year; decade = same 10-year block. Drives both the keyboard scope-crossing detection and
 * the outside-scope (non-focusable, greyed) flag — the generalization of month view's `isSameMonth`
 * outside-day test. Pure.
 */
export function isInViewScope(
  view: CalendarView,
  date: CalendarDate,
  visibleMonth: CalendarDate,
): boolean {
  switch (view) {
    case "month":
      return isSameMonth(date, visibleMonth);
    case "year":
      return date.year === visibleMonth.year;
    case "decade":
      return decadeStart(date.year) === decadeStart(visibleMonth.year);
  }
}
