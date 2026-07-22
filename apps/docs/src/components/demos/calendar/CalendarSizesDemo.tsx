import { Calendar, type CalendarSize } from "@hope-ui/components/calendar";
import { For } from "solid-js";
import { REFERENCE_DATE } from "./data";

// The `size` density axis (`sm` / `md` / `lg`) side by side — one scale drives the cell box, text,
// padding, and the nav-button + glyph sizing. No color axis; the calendar paints selection with the
// primary/selected tokens regardless of size.
const SIZES: CalendarSize[] = ["sm", "md", "lg"];

export function CalendarSizesDemo() {
  return (
    <div class="flex flex-wrap items-start justify-center gap-8">
      <For each={SIZES}>
        {(size) => (
          <div class="flex flex-col items-center gap-2">
            <span class="text-xs font-medium text-foreground-subtle">{size}</span>
            <Calendar.Root size={size} defaultFocusedValue={REFERENCE_DATE} />
          </div>
        )}
      </For>
    </div>
  );
}
