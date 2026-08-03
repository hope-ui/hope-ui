import type { CalendarDate } from "@internationalized/date";
import { multipleSelection } from "./multiple-selection";
import { rangeSelection } from "./range-selection";
import { singleSelection } from "./single-selection";

// The shared selection types live in this barrel rather than a standalone `types.ts`. The strategy
// files `import type` them from here, and a type-only import is erased at build time, so there is no
// runtime cycle even though this file also imports the strategy singletons. A real `types.ts` would
// owe its own test + doc under `pnpm check:coverage-parity`.

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
 * The internal selection snapshot a {@link SelectionStrategy} reads — pure, so the strategies
 * unit-test as plain functions.
 *
 * `anchor` is the in-progress range endpoint (range mode: non-null while "selecting", null once
 * complete; always null in single/multiple). `endpoint` is the calendar's **roving cursor**, which is
 * the range's moving end while anchored — so the band a range paints is derivable from this snapshot
 * alone, with no second argument. That mirrors React Aria, where `isSelected` reads the state
 * object's own `highlightedRange`.
 */
export interface SelectionState {
  readonly value: CalendarValue;
  readonly anchor: CalendarDate | null;
  readonly endpoint: CalendarDate | null;
}

/**
 * What a {@link SelectionStrategy.select} transition produces. Deliberately narrower than
 * {@link SelectionState}: the roving cursor is the calendar's to move, never the strategy's, so a
 * strategy cannot return one.
 */
export type SelectionResult = Pick<SelectionState, "value" | "anchor">;

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
 * The three paint predicates take the **period a cell stands for** (`cellPeriod(view, date)` — a single
 * day in month view, a whole month in year view, a whole year in decade view) rather than a bare date,
 * so a year/decade cell paints whenever the selection *overlaps* it. Month view passes the degenerate
 * `{ date, date }`, which collapses every test back to the day-level one it generalizes.
 *
 * There is deliberately **no** "middle" predicate, and the vocabulary is "selection", not "range":
 * range mode paints exactly **one** band — tentative while anchored, committed when idle — so a
 * consumer derives the middle as `isSelected && !isSelectionStart && !isSelectionEnd`. Why one band
 * rather than two: `__internal__/primitives/calendar/utils/range-selection.md` § The one-band model.
 */
export interface SelectionStrategy {
  readonly mode: CalendarSelectionMode;
  /** Does the painted band reach into `period` — drives `data-selected` + the aria-label suffix. */
  isSelected(state: SelectionState, period: DateRange): boolean;
  /** Does `period` hold the band's start endpoint (range mode only). */
  isSelectionStart(state: SelectionState, period: DateRange): boolean;
  /** Does `period` hold the band's end endpoint (range mode only). */
  isSelectionEnd(state: SelectionState, period: DateRange): boolean;
  /**
   * The band range mode paints, in React Aria's one-field-two-phases shape
   * (`RangeCalendarState.highlightedRange`): anchor → the roving `endpoint` while a selection is in
   * progress, and the committed value once it is not. The three predicates above are membership in
   * *this*. Always null in single/multiple.
   */
  highlightedRange(state: SelectionState): DateRange | null;
  /** Compute the next selection from activating `date`. Pure — the caller commits the result. */
  select(state: SelectionState, date: CalendarDate, opts?: SelectOptions): SelectionResult;
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
