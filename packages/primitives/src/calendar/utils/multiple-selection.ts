import { type CalendarDate, isSameDay } from "@internationalized/date";
import type { CalendarValue, SelectionStrategy } from "./selection";
import { periodContains } from "./view";

/** Narrow a {@link CalendarValue} to the multiple mode's `CalendarDate[]` (empty for null/non-array). */
function asMultiple(value: CalendarValue): readonly CalendarDate[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Multiple selection: each activate toggles `date` in/out of a set. No range, no anchor, no highlight —
 * the range predicates are all false, `highlightedRange` is null, and `extend` is ignored. The toggled
 * set stays sorted so `onValueChange` payloads are deterministic.
 *
 * `isSelected` asks whether *any* selected day falls in the cell's period (`cellPeriod`), so a year
 * cell lights up for every month holding a selected day. In month view the period is the degenerate
 * `{ date, date }`, i.e. the same-day membership test this replaced.
 */
export const multipleSelection: SelectionStrategy = {
  mode: "multiple",

  isSelected(state, period) {
    return asMultiple(state.value).some((date) => periodContains(period, date));
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

  select(state, date) {
    const current = asMultiple(state.value);
    const without = current.filter((d) => !isSameDay(d, date));
    const next =
      without.length === current.length
        ? [...current, date].sort((a, b) => a.compare(b)) // not present → add (kept sorted)
        : without; // present → remove
    return { value: next, anchor: null };
  },
};
