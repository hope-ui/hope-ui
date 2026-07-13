// The `createCalendar` hook family: a root state hook + one hook per part (grid / cell / heading /
// prev / next), plus the pure date-math + selection utilities. Exported as the single subpath
// `@hope-ui/primitives/calendar`. Modeled on the `dialog/` family.

export {
  type CalendarDayState,
  type CreateCalendarCellOptions,
  type CreateCalendarCellReturn,
  createCalendarCell,
} from "./cell/calendar-cell";
export { type CreateCalendarGridReturn, createCalendarGrid } from "./grid/calendar-grid";
export {
  type CreateCalendarHeadingReturn,
  createCalendarHeading,
} from "./heading/calendar-heading";
export { type CreateCalendarNextReturn, createCalendarNext } from "./next/calendar-next";
export { type CreateCalendarPrevReturn, createCalendarPrev } from "./prev/calendar-prev";
export {
  type CreateCalendarOptions,
  type CreateCalendarReturn,
  createCalendar,
  type IsDateDisabled,
} from "./root/calendar-root";

// Pure date math + view geometry (a headless consumer composing the family may need these).
export {
  isDateOutOfRange,
  isMonthOutOfRange,
  isNextDecadeDisabled,
  isNextMonthDisabled,
  isNextYearDisabled,
  isPreviousDecadeDisabled,
  isPreviousMonthDisabled,
  isPreviousYearDisabled,
  isYearOutOfRange,
} from "./utils/boundary";
export { buildDecadeCells, formatDecadeRange } from "./utils/decade-view";
export {
  buildMonthCells,
  type CalendarCellModel,
  clampDateToMonth,
  DAYS_PER_WEEK,
  formatFullDate,
  formatMonthYear,
  getWeekdays,
  type Weekday,
} from "./utils/month-view";
export {
  type ArrowDirection,
  type ArrowMove,
  arrowDelta,
  resolveArrowMove,
  resolveViewArrowMove,
} from "./utils/navigation";
export {
  type CalendarSelectionMode,
  type CalendarValue,
  type DateRange,
  firstDateOf,
  multipleSelection,
  rangeSelection,
  type SelectionState,
  type SelectionStrategy,
  type SelectOptions,
  selectionStrategyFor,
  singleSelection,
} from "./utils/selection";
export {
  type CalendarView,
  decadeStart,
  type FirstDayOfWeek,
  isInViewScope,
  normalizeFocusForView,
  VIEW_COLUMNS,
  YEARS_PER_DECADE,
} from "./utils/view";
export { buildYearCells, formatYear, MONTHS_PER_YEAR } from "./utils/year-view";
