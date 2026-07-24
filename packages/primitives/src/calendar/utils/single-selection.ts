import type { CalendarDate } from "@internationalized/date";
import type { CalendarValue, DateRange, SelectionState, SelectionStrategy } from "./selection";
import { periodContains } from "./view";

/** Narrow a {@link CalendarValue} to the single mode's `CalendarDate | null`. */
function asSingle(value: CalendarValue): CalendarDate | null {
  return value != null && !Array.isArray(value) && !("start" in value) ? value : null;
}

function holdsSelection(state: SelectionState, period: DateRange): boolean {
  const selected = asSingle(state.value);
  return selected !== null && periodContains(period, selected);
}

/**
 * Single-date selection: activating a day replaces the selection with it. There is no band, no
 * anchor, and no hover preview — both endpoint predicates are false and `highlightedRange` is null.
 * `extend` is ignored.
 *
 * `isSelected` asks whether the selected day falls in the cell's period (`cellPeriod`), so the year
 * cell holding it lights up in year view. In month view the period is the degenerate `{ date, date }`,
 * i.e. the same-day test this replaced.
 */
export const singleSelection: SelectionStrategy = {
  mode: "single",

  isSelected: holdsSelection,

  // A single selection is a degenerate one-day band, so the selected day caps **both** ends. That is
  // what keeps the derived middle — `isSelected && !isSelectionStart && !isSelectionEnd`, which is how
  // both a consumer and the preset's `data-selection-middle` variant compute it — empty in this mode.
  // Reporting no endpoints here would make every single-mode selection read as band interior and lose
  // its endpoint paint.
  isSelectionStart: holdsSelection,
  isSelectionEnd: holdsSelection,
  highlightedRange() {
    return null;
  },

  select(_state, date) {
    return { value: date, anchor: null };
  },
};
