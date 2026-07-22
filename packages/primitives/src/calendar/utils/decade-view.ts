import { type CalendarDate, startOfYear } from "@internationalized/date";
import type { CalendarCellModel } from "./month-view";
import { decadeStart, YEARS_PER_DECADE } from "./view";

const DECADE_GRID_COLUMNS = 3;
const DECADE_GRID_CELLS = 12;

/**
 * Build the 4x3 year grid for the decade containing `visibleMonth`'s year: the leading adjacent year,
 * the 10 in-decade years, then the trailing adjacent year (12 cells), each the start of its year
 * (Jan 1). The two adjacent years are flagged `isOutside` — greyed + inert, exactly like month view's
 * leading/trailing days, so crossing to an adjacent decade stays keyboard-only. Row-major (one cell =
 * one year), so the grid's coordinate roving matches `±1` / `±3` year date math. Pure.
 */
export function buildDecadeCells(
  visibleMonth: CalendarDate,
  locale: string,
  timeZone: string,
): CalendarCellModel[][] {
  const base = startOfYear(visibleMonth);
  const ds = decadeStart(visibleMonth.year);
  // Format in the date's own calendar system (see `month-view.ts` `formatMonthYear`) — a no-op for the
  // common Gregorian case.
  const yearLabel = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    timeZone,
    calendar: visibleMonth.calendar.identifier,
  });
  const rows: CalendarCellModel[][] = [];
  for (let row = 0; row < DECADE_GRID_CELLS / DECADE_GRID_COLUMNS; row++) {
    const cells: CalendarCellModel[] = [];
    for (let col = 0; col < DECADE_GRID_COLUMNS; col++) {
      // Offset 0 is the leading adjacent year (ds - 1); offsets 1..10 are the decade; 11 is trailing.
      const year = ds - 1 + row * DECADE_GRID_COLUMNS + col;
      const date = base.set({ year });
      cells.push({
        date,
        label: yearLabel.format(date.toDate(timeZone)),
        isOutside: year < ds || year > ds + YEARS_PER_DECADE - 1,
        key: date.toString(),
      });
    }
    rows.push(cells);
  }
  return rows;
}

/** Decade-view heading label ("2020 – 2029"), localized range separator + digits via `formatRange`. */
export function formatDecadeRange(
  visibleMonth: CalendarDate,
  locale: string,
  timeZone: string,
): string {
  const base = startOfYear(visibleMonth);
  const ds = decadeStart(visibleMonth.year);
  const start = base.set({ year: ds });
  const end = base.set({ year: ds + YEARS_PER_DECADE - 1 });
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    timeZone,
    calendar: base.calendar.identifier,
  }).formatRange(start.toDate(timeZone), end.toDate(timeZone));
}
