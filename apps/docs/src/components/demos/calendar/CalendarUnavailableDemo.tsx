import { Calendar } from "@hope-ui/components/calendar";
import { REFERENCE_DATE } from "./data";

// `isDateDisabled` marks individual dates *unavailable* — here every weekend. Unavailable days differ
// from out-of-range ones: they stay focusable and are announced to screen readers, but render struck
// through and can't be selected (React Aria's "unavailable" semantics).
export function CalendarUnavailableDemo() {
  return (
    <Calendar.Root
      defaultFocusedValue={REFERENCE_DATE}
      isDateDisabled={(date) => {
        const weekday = date.toDate("UTC").getUTCDay();
        return weekday === 0 || weekday === 6;
      }}
    />
  );
}
