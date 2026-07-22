import { CalendarDate } from "@internationalized/date";

// A fixed anchor month shared by every Calendar demo. The calendar seeds its visible month from
// `defaultFocusedValue`; leaving it to `today()` would differ between build time (this SSG site is
// prerendered) and view time, so the server HTML and the hydrated client would disagree on the whole
// grid — a hydration mismatch. A stable date keeps the prerendered markup and the client identical.
export const REFERENCE_DATE = new CalendarDate(2026, 6, 15);

// The value union the calendar hands `onValueChange`, described structurally so the demos read it
// without importing `@hope-ui/primitives` — the themeable component is the public surface.
type DateRangeValue = { start: CalendarDate; end: CalendarDate };
export type SelectionValue = CalendarDate | DateRangeValue | CalendarDate[] | null;

/** Render any selection as ISO `YYYY-MM-DD` text for a demo's readout (`CalendarDate.toString()`). */
export function formatSelection(value: SelectionValue): string {
  if (value == null) {
    return "—";
  }
  if (Array.isArray(value)) {
    return value.length ? value.map(String).join(", ") : "—";
  }
  if ("start" in value) {
    return `${value.start} → ${value.end}`;
  }
  return String(value);
}
