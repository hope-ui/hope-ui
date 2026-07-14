import { type CalendarDate, isSameDay } from "@internationalized/date";
import type { CalendarValue, SelectionStrategy } from "./index";

/** Narrow a {@link CalendarValue} to the single mode's `CalendarDate | null`. */
function asSingle(value: CalendarValue): CalendarDate | null {
  return value != null && !Array.isArray(value) && !("start" in value) ? value : null;
}

/**
 * Single-date selection: activating a day replaces the selection with it. There is no range, no
 * anchor, and no hover highlight — every range predicate is false and `highlightedRange` is null.
 * `extend` is ignored.
 */
export const singleSelection: SelectionStrategy = {
  mode: "single",

  isSelected(state, date) {
    const selected = asSingle(state.value);
    return selected !== null && isSameDay(date, selected);
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
