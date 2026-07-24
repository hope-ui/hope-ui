import type { CalendarDate } from "@internationalized/date";
import type { CalendarValue, DateRange, SelectionState, SelectionStrategy } from "./selection";
import { periodContains, periodsOverlap } from "./view";

/** Narrow a {@link CalendarValue} to a {@link DateRange} (or null). */
function asRange(value: CalendarValue): DateRange | null {
  return value != null && !Array.isArray(value) && "start" in value ? value : null;
}

/** Order two dates into an inclusive `{ start, end }` (start <= end). */
function order(a: CalendarDate, b: CalendarDate): DateRange {
  return a.compare(b) <= 0 ? { start: a, end: b } : { start: b, end: a };
}

/**
 * The one band range mode paints — React Aria's `RangeCalendarState.highlightedRange`, a single field
 * with two phases: **tentative** while a selection is anchored (anchor → the roving cursor), and the
 * **committed** value when it is not. Every paint predicate below is membership in this, which is why
 * there is one attribute vocabulary and no ambiguity about which band a "start" belongs to.
 *
 * The consequence, and it is intended: while a new range is being dragged, the previously committed
 * range stops painting. React Aria behaves the same way — the band always shows the selection the
 * next activate would produce.
 */
function currentRange(state: SelectionState): DateRange | null {
  if (state.anchor === null) {
    return asRange(state.value);
  }
  return state.endpoint === null ? null : order(state.anchor, state.endpoint);
}

/**
 * Range selection — anchor → complete, with hover preview and Shift+Arrow extension:
 *
 *  - **First activate** (no anchor): anchors at `date` — "selecting". `value` is **not** written; the
 *    band is derived from the anchor and the cursor. The caller emits nothing yet.
 *  - **Second activate** (anchor set, `extend` false): completes — `value = order(anchor, date)`,
 *    `anchor = null`. The caller emits the committed range.
 *  - **`extend`** (Shift+Arrow): keeps the anchor and lets the caller slide the cursor, staying
 *    "selecting" so repeated extensions grow from the same anchor; a later non-extend activate (Enter
 *    / click) commits. With no anchor it re-anchors at the existing range's start (or `date`).
 *
 * `value` is therefore written on **exactly one** transition — the completing activate. That is React
 * Aria's contract, and it is what keeps a controlled consumer from holding a value it was never told
 * about for the whole duration of a range selection.
 *
 * The three predicates read the **period a cell stands for** (`cellPeriod`), so they are overlap tests:
 * in year/decade view a month/year cell paints as soon as the band passes through it, and it carries
 * the start/end corner when it is the period that endpoint falls in. Month view's degenerate
 * `{ date, date }` period collapses each of them back to the day-level test it generalizes. Pure.
 */
export const rangeSelection: SelectionStrategy = {
  mode: "range",

  isSelected(state, period) {
    const range = currentRange(state);
    return range !== null && periodsOverlap(range, period);
  },

  isSelectionStart(state, period) {
    const range = currentRange(state);
    return range !== null && periodContains(period, range.start);
  },

  isSelectionEnd(state, period) {
    const range = currentRange(state);
    return range !== null && periodContains(period, range.end);
  },

  highlightedRange: currentRange,

  select(state, date, opts) {
    const extend = opts?.extend ?? false;

    if (state.anchor !== null) {
      // Mid-selection: a non-extend activate commits. An extend keeps selecting and leaves `value`
      // alone — the caller moves the cursor, and the band follows it from the unchanged anchor.
      return extend
        ? { value: state.value, anchor: state.anchor }
        : { value: order(state.anchor, date), anchor: null };
    }

    if (extend) {
      // Shift+Arrow with no in-progress anchor: re-open from the committed start (or anchor at date).
      return { value: state.value, anchor: asRange(state.value)?.start ?? date };
    }

    // Begin a fresh range: anchor only. The committed `value` stands until this range completes.
    return { value: state.value, anchor: date };
  },
};
