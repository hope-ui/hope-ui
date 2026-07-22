import { Calendar } from "@hope-ui/components/calendar";
import { createSignal } from "solid-js";
import { formatSelection, REFERENCE_DATE, type SelectionValue } from "./data";

// `selectionMode="range"`: pick a start, then an end — the days between paint as the range middle, the
// endpoints as solid caps. `onValueChange` fires only when the range *completes*, so the readout stays
// empty mid-selection. Uses the convenience API (a bare Root auto-renders the chrome + grid).
export function CalendarRangeDemo() {
  const [value, setValue] = createSignal<SelectionValue>(null);

  return (
    <div class="flex flex-col items-center gap-3">
      <Calendar.Root
        selectionMode="range"
        defaultFocusedValue={REFERENCE_DATE}
        onValueChange={setValue}
      />
      <output class="text-sm text-foreground-muted">Range: {formatSelection(value())}</output>
    </div>
  );
}
