import { Calendar } from "@hope-ui/components/calendar";
import { createSignal } from "solid-js";
import { formatSelection, REFERENCE_DATE, type SelectionValue } from "./data";

// `selectionMode="multiple"`: each day toggles independently — click or press Space to add and remove.
// `onValueChange` receives the full array of selected dates on every change; the readout lists them as
// ISO strings.
export function CalendarMultipleDemo() {
  const [value, setValue] = createSignal<SelectionValue>([]);

  return (
    <div class="flex flex-col items-center gap-3">
      <Calendar.Root
        selectionMode="multiple"
        defaultFocusedValue={REFERENCE_DATE}
        onValueChange={setValue}
      />
      <output class="text-sm text-foreground-muted">Selected: {formatSelection(value())}</output>
    </div>
  );
}
