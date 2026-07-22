import { type CalendarDate, startOfYear } from "@internationalized/date";
import type { CalendarCellModel } from "./month-view";

/** Year grids are a fixed 4 rows x 3 cols = 12 month cells (January … December of the visible year). */
export const MONTHS_PER_YEAR = 12;
const YEAR_GRID_COLUMNS = 3;

/**
 * Build the 4x3 month grid for `visibleMonth`'s year: 12 cells, each the start of a month, labelled
 * with the locale's short month name (the full "Month yyyy" name rides the cell's `aria-label`). The
 * whole year fits, so there are no outside cells. Row-major, so a cell's index equals its month-of-year
 * — the grid's coordinate roving (ArrowRight = +1 cell = +1 month, ArrowDown = +3 = +1 quarter) lines
 * up with the date math one-for-one. Pure.
 */
export function buildYearCells(
  visibleMonth: CalendarDate,
  locale: string,
  timeZone: string,
): CalendarCellModel[][] {
  const first = startOfYear(visibleMonth);
  // Format in the date's own calendar system (see `month-view.ts` `formatMonthYear`), so the 12 cells
  // read out the visible calendar's months — a no-op for the common Gregorian case.
  const monthName = new Intl.DateTimeFormat(locale, {
    month: "short",
    timeZone,
    calendar: visibleMonth.calendar.identifier,
  });
  const rows: CalendarCellModel[][] = [];
  for (let row = 0; row < MONTHS_PER_YEAR / YEAR_GRID_COLUMNS; row++) {
    const cells: CalendarCellModel[] = [];
    for (let col = 0; col < YEAR_GRID_COLUMNS; col++) {
      const date = first.add({ months: row * YEAR_GRID_COLUMNS + col });
      cells.push({
        date,
        label: monthName.format(date.toDate(timeZone)),
        isOutside: false,
        key: date.toString(),
      });
    }
    rows.push(cells);
  }
  return rows;
}

/** Year-view heading label ("2026"), localized digits, in the date's own calendar system. */
export function formatYear(date: CalendarDate, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    timeZone,
    calendar: date.calendar.identifier,
  }).format(date.toDate(timeZone));
}
