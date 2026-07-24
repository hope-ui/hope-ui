import type { CalendarDate } from "@internationalized/date";
import { multipleSelection } from "./multiple-selection";
import { rangeSelection } from "./range-selection";
import { singleSelection } from "./single-selection";

// The shared selection types live here (the barrel) rather than a standalone `types.ts`: the strategy
// files `import type` them from `./index`, which is erased at runtime, so there is no import cycle even
// though this file also imports the strategy singletons. This keeps the type surface in one place
// without a type-only source file (which the coverage-parity guard would require its own test + doc for).

/** The three selection modes (the `selectionMode` prop on `<Calendar>`). */
export type CalendarSelectionMode = "single" | "range" | "multiple";

/** An inclusive committed date range (`start <= end`). The range mode's value shape. */
export interface DateRange {
  readonly start: CalendarDate;
  readonly end: CalendarDate;
}

/**
 * The public selection value, a **discriminated union keyed by `mode`**:
 *  - `single`   → `CalendarDate | null`
 *  - `range`    → `DateRange | null`
 *  - `multiple` → `CalendarDate[]`
 *
 * `null` is the empty single/range value; `[]` is the empty multiple value. This is what
 * `<Calendar>`'s `value`/`defaultValue` accept and `onValueChange` emits.
 */
export type CalendarValue = CalendarDate | DateRange | CalendarDate[] | null;

/**
 * The internal selection snapshot a {@link SelectionStrategy} reads and returns — pure, so the
 * strategies unit-test as plain functions. `anchor` is the in-progress range endpoint (range mode:
 * non-null while "selecting", null once complete; always null in single/multiple).
 */
export interface SelectionState {
  readonly value: CalendarValue;
  readonly anchor: CalendarDate | null;
}

/** `select` options. `extend` = the Shift+Arrow keyboard extension (range mode only). */
export interface SelectOptions {
  readonly extend?: boolean;
}

/**
 * The one seam the datepicker extends. Cells / nav **never branch on `mode`** — they call this stable
 * interface, which the active mode implements (`singleSelection` / `rangeSelection` /
 * `multipleSelection`). Every method is **pure**: predicates read a {@link SelectionState} snapshot,
 * and `select` returns the next snapshot (the strategy decides the transition). `isRange*` are all
 * false outside range mode; `highlightedRange` is null unless range mode is mid-selection.
 *
 * The four paint predicates take the **period a cell stands for** (`cellPeriod(view, date)` — a single
 * day in month view, a whole month in year view, a whole year in decade view) rather than a bare date,
 * so a year/decade cell paints whenever the selection *overlaps* it. Month view passes the degenerate
 * `{ date, date }`, which collapses every test back to the day-level one it generalizes.
 */
export interface SelectionStrategy {
  readonly mode: CalendarSelectionMode;
  /** Does the selection reach into `period` — drives `data-selected` + the aria-label suffix. */
  isSelected(state: SelectionState, period: DateRange): boolean;
  /** Does `period` hold the range's start endpoint (range mode only). */
  isRangeStart(state: SelectionState, period: DateRange): boolean;
  /** Does `period` sit strictly inside the range, holding neither endpoint (range mode only). */
  isRangeMiddle(state: SelectionState, period: DateRange): boolean;
  /** Does `period` hold the range's end endpoint (range mode only). */
  isRangeEnd(state: SelectionState, period: DateRange): boolean;
  /**
   * The tentative highlight range while a range selection is in progress — from the anchor to
   * `endpoint`, the range's moving end (ordered). The calendar passes its **roving cursor**, so the
   * band is the same for hover and keyboard, as in React Aria's `RangeCalendarState.highlightedRange`.
   * Null in single/multiple, or in range mode when not mid-selecting or with no `endpoint`.
   */
  highlightedRange(state: SelectionState, endpoint: CalendarDate | null): DateRange | null;
  /** Compute the next selection from activating `date`. Pure — the caller commits the result. */
  select(state: SelectionState, date: CalendarDate, opts?: SelectOptions): SelectionState;
}

export { multipleSelection } from "./multiple-selection";
export { rangeSelection } from "./range-selection";
export { singleSelection } from "./single-selection";

/** The strategy singleton for a given mode (each is pure + stateless, so a shared instance is safe). */
export function selectionStrategyFor(mode: CalendarSelectionMode): SelectionStrategy {
  switch (mode) {
    case "range":
      return rangeSelection;
    case "multiple":
      return multipleSelection;
    case "single":
      return singleSelection;
  }
}

/**
 * A representative `CalendarDate` for a selection value, used only to seed the roving cursor / visible
 * month when the calendar mounts with a value but no explicit `focusedValue`: single → the date,
 * range → its start, multiple → the first selected day. Null when nothing is selected.
 */
export function firstDateOf(value: CalendarValue): CalendarDate | null {
  if (value == null) {
    return null;
  }
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  if ("start" in value) {
    return value.start;
  }
  return value;
}
