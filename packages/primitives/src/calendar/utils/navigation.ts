import { type CalendarDate, isSameMonth } from "@internationalized/date";
import { type CalendarView, decadeStart, VIEW_COLUMNS } from "./view";

/** The four arrow directions, pre-RTL-flip (matches the grid's `up`/`down`/`left`/`right`). */
export type ArrowDirection = "up" | "down" | "left" | "right";

/**
 * Cells an arrow key steps within a grid `columns` wide: vertical moves a whole row (±columns), the
 * horizontal pair moves ±1 and flips under RTL so the cursor tracks the *visual* layout — exactly
 * mirroring the grid's own `prevColKey`/`nextColKey` flip. Pure.
 */
function gridStep(direction: ArrowDirection, isRtl: boolean, columns: number): number {
  switch (direction) {
    case "up":
      return -columns;
    case "down":
      return columns;
    case "left":
      return isRtl ? 1 : -1;
    case "right":
      return isRtl ? -1 : 1;
  }
}

/**
 * The day delta an arrow key moves the roving cursor in **month view** (a 7-wide week grid): ±7
 * vertically, ±1 horizontally (RTL-flipped). Kept as the month-scoped export the Shift+Arrow range
 * extension reuses; the view-aware {@link resolveViewArrowMove} layers the year/decade scales on top.
 * Pure.
 */
export function arrowDelta(direction: ArrowDirection, isRtl: boolean): number {
  return gridStep(direction, isRtl, VIEW_COLUMNS.month);
}

/** The result of an arrow move: where the cursor lands and whether that leaves the visible scope. */
export interface ArrowMove {
  /** The date one cell-step away from the origin (a day / month / year by view). */
  readonly target: CalendarDate;
  /** True when `target` falls outside the current view's visible scope — the scope-crossing case. */
  readonly crosses: boolean;
}

/**
 * Month-view arrow move. Because the month grid's cells are consecutive days, one cell-step equals one
 * day-step, so `focusedDate.add({ days })` reproduces the grid's roving move — and `!isSameMonth`
 * detects every cross, including a step onto a *visible* leading/trailing outside cell (which the grid
 * can't focus once `softDisabled=false`). Pure. (Retained for the month-only specs; the calendar grid
 * calls {@link resolveViewArrowMove}.)
 */
export function resolveArrowMove(
  focusedDate: CalendarDate,
  visibleMonth: CalendarDate,
  deltaDays: number,
): ArrowMove {
  const target = focusedDate.add({ days: deltaDays });
  return { target, crosses: !isSameMonth(target, visibleMonth) };
}

/**
 * Resolve an arrow keypress to a target date in **any** view, plus whether it leaves the visible scope.
 * Each view maps one cell-step to a date unit — month → days, year → months, decade → years — and a
 * cross is "left the visible month / year / decade". The calendar grid intercepts only when `crosses`
 * is true (re-targeting the cursor into the adjacent period, the view following) and lets the grid's
 * own coordinate roving handle every in-scope move. Pure.
 */
export function resolveViewArrowMove(
  view: CalendarView,
  from: CalendarDate,
  visibleMonth: CalendarDate,
  direction: ArrowDirection,
  isRtl: boolean,
): ArrowMove {
  const step = gridStep(direction, isRtl, VIEW_COLUMNS[view]);
  switch (view) {
    case "month": {
      const target = from.add({ days: step });
      return { target, crosses: !isSameMonth(target, visibleMonth) };
    }
    case "year": {
      const target = from.add({ months: step });
      return { target, crosses: target.year !== visibleMonth.year };
    }
    case "decade": {
      const target = from.add({ years: step });
      return { target, crosses: decadeStart(target.year) !== decadeStart(visibleMonth.year) };
    }
  }
}
