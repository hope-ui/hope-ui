import { Calendar } from "@hope-ui/components/calendar";
import { REFERENCE_DATE } from "./data";

// The week-start override. By default the first column follows the locale (`en-US` → Sunday,
// `fr-FR` → Monday); `firstDayOfWeek` forces it explicitly. Same month, two week starts — note how the
// weekday header and the day columns shift by one.
export function CalendarFirstDayOfWeekDemo() {
  return (
    <div class="flex flex-wrap items-start justify-center gap-8">
      <div class="flex flex-col items-center gap-2">
        <span class="text-xs font-medium text-foreground-subtle">firstDayOfWeek="sun"</span>
        <Calendar.Root firstDayOfWeek="sun" defaultFocusedValue={REFERENCE_DATE} />
      </div>

      <div class="flex flex-col items-center gap-2">
        <span class="text-xs font-medium text-foreground-subtle">firstDayOfWeek="mon"</span>
        <Calendar.Root firstDayOfWeek="mon" defaultFocusedValue={REFERENCE_DATE} />
      </div>
    </div>
  );
}
