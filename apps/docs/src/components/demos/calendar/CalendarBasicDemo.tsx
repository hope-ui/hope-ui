import { Calendar } from "@hope-ui/components/calendar";
import { createSignal } from "solid-js";
import { formatSelection, REFERENCE_DATE, type SelectionValue } from "./data";

// The default: single selection, composed from the compound parts so the anatomy is concrete —
// Header (Prev / Heading / Next) over the month Grid. Controlled (`value`/`onValueChange`): the
// committed date is mirrored into a signal that drives both the calendar and the readout. Arrow keys /
// Home / End / PageUp/Down move the roving focus; Enter, Space, or a click selects.
export function CalendarBasicDemo() {
  const [value, setValue] = createSignal<SelectionValue>(null);

  return (
    <div class="flex flex-col items-center gap-3">
      <Calendar.Root defaultFocusedValue={REFERENCE_DATE} value={value()} onValueChange={setValue}>
        <Calendar.Header>
          <Calendar.PrevButton />
          <Calendar.Heading />
          <Calendar.NextButton />
        </Calendar.Header>
        <Calendar.Grid />
      </Calendar.Root>
      <output class="text-sm text-foreground-muted">Selected: {formatSelection(value())}</output>
    </div>
  );
}
