import { Calendar } from "@hope-ui/components/calendar";
import { CalendarDate } from "@internationalized/date";
import { REFERENCE_DATE } from "./data";

// `min` / `max` bound the selectable and reachable range (inclusive). Days outside the window are
// disabled — dimmed, not focusable, never selectable — and navigation that would leave the window is
// blocked (the Prev/Next arrows disable at the edges).
export function CalendarBoundedDemo() {
  return (
    <Calendar.Root
      defaultFocusedValue={REFERENCE_DATE}
      min={new CalendarDate(2026, 6, 5)}
      max={new CalendarDate(2026, 6, 24)}
    />
  );
}
