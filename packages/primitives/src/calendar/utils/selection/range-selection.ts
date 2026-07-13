import type { CalendarDate } from "@internationalized/date";
import type { CalendarValue, DateRange, SelectionStrategy } from "./index";

/** Narrow a {@link CalendarValue} to a {@link DateRange} (or null). */
function asRange(value: CalendarValue): DateRange | null {
  return value != null && !Array.isArray(value) && "start" in value ? value : null;
}

/** Order two dates into an inclusive `{ start, end }` (start <= end). */
function order(a: CalendarDate, b: CalendarDate): DateRange {
  return a.compare(b) <= 0 ? { start: a, end: b } : { start: b, end: a };
}

/** Inclusive containment: `start <= date <= end`. */
function within(range: DateRange, date: CalendarDate): boolean {
  return date.compare(range.start) >= 0 && date.compare(range.end) <= 0;
}

/**
 * Range selection — anchor → complete, with hover preview and Shift+Arrow extension:
 *
 *  - **First activate** (no anchor): begins a range at `date` (`value = {date, date}`, `anchor =
 *    date`) — "selecting". The caller emits nothing yet (anchor is set).
 *  - **Second activate** (anchor set, `extend` false): completes — `value = order(anchor, date)`,
 *    `anchor = null`. The caller emits the committed range.
 *  - **`extend`** (Shift+Arrow): keeps the anchor and slides the moving endpoint to `date`, staying
 *    "selecting" so repeated extensions grow from the same anchor; a later non-extend activate (Enter
 *    / click) commits. With no anchor it re-anchors at the existing range's start (or `date`).
 *
 * `isSelected` covers the whole committed range (highlight); `isRange{Start,Middle,End}` refine the
 * endpoints for corner paint. `isInPreviewRange` highlights the tentative `[anchor … preview]` span
 * while selecting. Pure.
 */
export const rangeSelection: SelectionStrategy = {
  mode: "range",

  isSelected(state, date) {
    const range = asRange(state.value);
    return range !== null && within(range, date);
  },

  isRangeStart(state, date) {
    const range = asRange(state.value);
    return range !== null && date.compare(range.start) === 0;
  },

  isRangeMiddle(state, date) {
    const range = asRange(state.value);
    return range !== null && date.compare(range.start) > 0 && date.compare(range.end) < 0;
  },

  isRangeEnd(state, date) {
    const range = asRange(state.value);
    return range !== null && date.compare(range.end) === 0;
  },

  isInPreviewRange(state, date, preview) {
    if (state.anchor === null || preview === null) return false;
    return within(order(state.anchor, preview), date);
  },

  select(state, date, opts) {
    const extend = opts?.extend ?? false;

    if (state.anchor !== null) {
      // Mid-selection: a non-extend activate commits; an extend keeps selecting.
      return { value: order(state.anchor, date), anchor: extend ? state.anchor : null };
    }

    if (extend) {
      // Shift+Arrow with no in-progress anchor: re-open from the committed start (or anchor at date).
      const base = asRange(state.value)?.start ?? date;
      return { value: order(base, date), anchor: base };
    }

    // Begin a fresh range.
    return { value: { start: date, end: date }, anchor: date };
  },
};
