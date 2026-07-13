import { type CalendarDate, isSameDay } from "@internationalized/date";
import type { CalendarValue, SelectionStrategy } from "./index";

/** Narrow a {@link CalendarValue} to the multiple mode's `CalendarDate[]` (empty for null/non-array). */
function asMultiple(value: CalendarValue): readonly CalendarDate[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Multiple selection: each activate toggles `date` in/out of a set. No range, no anchor, no preview —
 * the range/preview predicates are all false and `extend` is ignored. The toggled set stays sorted so
 * `onValueChange` payloads are deterministic.
 */
export const multipleSelection: SelectionStrategy = {
  mode: "multiple",

  isSelected(state, date) {
    return asMultiple(state.value).some((d) => isSameDay(d, date));
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
  isInPreviewRange() {
    return false;
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
