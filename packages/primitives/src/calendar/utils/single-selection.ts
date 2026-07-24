import type { CalendarDate } from "@internationalized/date";
import type { CalendarValue, SelectionStrategy } from "./selection";
import { periodContains } from "./view";

/** Narrow a {@link CalendarValue} to the single mode's `CalendarDate | null`. */
function asSingle(value: CalendarValue): CalendarDate | null {
  return value != null && !Array.isArray(value) && !("start" in value) ? value : null;
}

/**
 * Single-date selection: activating a day replaces the selection with it. There is no range, no
 * anchor, and no hover highlight — every range predicate is false and `highlightedRange` is null.
 * `extend` is ignored.
 *
 * `isSelected` asks whether the selected day falls in the cell's period (`cellPeriod`), so the year
 * cell holding it lights up in year view. In month view the period is the degenerate `{ date, date }`,
 * i.e. the same-day test this replaced.
 */
export const singleSelection: SelectionStrategy = {
  mode: "single",

  isSelected(state, period) {
    const selected = asSingle(state.value);
    return selected !== null && periodContains(period, selected);
  },

  isRangeStart() {
    return false;
  },
  isRangeMiddle() {
    return false;
  },
  isRangeEnd() {
    return false;
  },
  highlightedRange() {
    return null;
  },

  select(_state, date) {
    return { value: date, anchor: null };
  },
};
