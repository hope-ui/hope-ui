import {
  type CalendarDate,
  endOfMonth,
  getWeeksInMonth,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  today,
} from "@internationalized/date";
import type { FirstDayOfWeek } from "./view";

/**
 * One rendered grid cell, view-agnostic (month/year/decade reuse it). State flags
 * (`isToday`/`isSelected`/`isFocused`/…) are NOT stored here — they're computed in the cell from the
 * calendar state, so the model stays a pure, cacheable description of *what* the cell holds.
 */
export interface CalendarCellModel {
  /** The canonical date this cell represents (a day in month view; a month/year start in the others). */
  readonly date: CalendarDate;
  /** Visible short label (day number in month view). The full localized name rides `aria-label`. */
  readonly label: string;
  /** True when the date falls outside the visible scope (month view leading/trailing days). */
  readonly isOutside: boolean;
  /** Stable list track key (the ISO date string). */
  readonly key: string;
}

/** Month grids are 7 cols x a VARIABLE number of week rows (4-6) — see {@link buildMonthCells}. */
export const DAYS_PER_WEEK = 7;

/**
 * Build the month grid for `visibleMonth`. The first cell is the start of the week containing the 1st
 * (locale- and `firstDayOfWeek`-aware), then a **variable** number of week rows — only the weeks the
 * month actually spans (`getWeeksInMonth`, 4-6 rows), so a short month doesn't render trailing rows that
 * are entirely next-month days (react-day-picker / shadcn default; NOT the fixed-6 `fixedWeeks` mode).
 * Leading/trailing days of the first/last *partial* week are still flagged `isOutside`. Pure.
 */
export function buildMonthCells(
  visibleMonth: CalendarDate,
  locale: string,
  firstDayOfWeek?: FirstDayOfWeek,
): CalendarCellModel[][] {
  const first = startOfWeek(startOfMonth(visibleMonth), locale, firstDayOfWeek);
  // Only the rows the month spans (4 for a week-aligned 28-day Feb, 6 for a 31-day month starting late).
  const weeks = getWeeksInMonth(visibleMonth, locale, firstDayOfWeek);
  // Localize the day number to the locale's numbering system (Western 1-31 for en-US, Arabic-Indic
  // for ar-EG, …) so the cells match the Intl-formatted heading. One formatter, reused for all cells.
  const dayFormatter = new Intl.NumberFormat(locale);
  const rows: CalendarCellModel[][] = [];
  for (let week = 0; week < weeks; week++) {
    const row: CalendarCellModel[] = [];
    for (let day = 0; day < DAYS_PER_WEEK; day++) {
      const date = first.add({ days: week * DAYS_PER_WEEK + day });
      row.push({
        date,
        label: dayFormatter.format(date.day),
        isOutside: !isSameMonth(date, visibleMonth),
        key: date.toString(),
      });
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Move `date` into `month`, keeping the same day-of-month and clamping to the month's last day when
 * it doesn't exist there (Jan 31 -> Feb 28, or Feb 29 in a leap year). This is the focus-target math
 * behind the "next month from the 31st lands on a sensible date" case. Pure.
 */
export function clampDateToMonth(date: CalendarDate, month: CalendarDate): CalendarDate {
  const lastDay = endOfMonth(month).day;
  return month.set({ day: Math.min(date.day, lastDay) });
}

/** A localized weekday name in three widths, for the `<th>` head cells (abbrev visible, full in aria). */
export interface Weekday {
  readonly short: string;
  readonly long: string;
  readonly narrow: string;
}

/**
 * The 7 localized weekday names rotated by `firstDayOfWeek`. `@internationalized/date` doesn't format
 * names, so this uses `Intl.DateTimeFormat` over a reference week (any week — names don't vary by date).
 * No `calendar` option: the 7-day week is shared across calendar systems, so weekday names don't depend
 * on it (unlike month/year/era — see `formatMonthYear`).
 */
export function getWeekdays(
  locale: string,
  timeZone: string,
  firstDayOfWeek?: FirstDayOfWeek,
): Weekday[] {
  const ref = startOfWeek(today(timeZone), locale, firstDayOfWeek);
  const short = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone });
  const long = new Intl.DateTimeFormat(locale, { weekday: "long", timeZone });
  const narrow = new Intl.DateTimeFormat(locale, { weekday: "narrow", timeZone });
  const out: Weekday[] = [];
  for (let i = 0; i < DAYS_PER_WEEK; i++) {
    const js = ref.add({ days: i }).toDate(timeZone);
    out.push({ short: short.format(js), long: long.format(js), narrow: narrow.format(js) });
  }
  return out;
}

/**
 * Full localized day name for a cell's `aria-label` ("Thursday, January 1, 2026").
 *
 * The `calendar` is derived from the date's own calendar system (`date.calendar.identifier`), not left
 * to the locale's default — so an Islamic/Japanese/Buddhist `CalendarDate` reads out its own month/
 * year/era (matching the grid's day numbers), and a Gregorian date over a non-Gregorian-default locale
 * (e.g. `fa-IR`) still reads Gregorian. React-Aria style; a no-op for the common Gregorian case.
 */
export function formatFullDate(date: CalendarDate, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone,
    calendar: date.calendar.identifier,
  }).format(date.toDate(timeZone));
}

/** Month-view heading label ("January 2026"), in the date's own calendar system (see `formatFullDate`). */
export function formatMonthYear(date: CalendarDate, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone,
    calendar: date.calendar.identifier,
  }).format(date.toDate(timeZone));
}
