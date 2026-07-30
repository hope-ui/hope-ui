import { Listbox, type ListboxSize } from "@hope-ui/components/listbox";
import { For } from "solid-js";
import { FRUITS, FruitItem, itemToLabel, itemToValue } from "./data";

// The `size` density scale — `sm` / `md` (default) / `lg` scale the row text, padding, gap, and the
// list's min width together. Shown side by side over the first four fruits.
const SIZES: ListboxSize[] = ["sm", "md", "lg"];

export function ListboxSizesDemo() {
  return (
    <For each={SIZES}>
      {(size) => (
        <div class="flex flex-col gap-2">
          <span class="text-xs font-medium text-foreground-muted">{size}</span>
          <Listbox.Root
            aria-label={`Choose a fruit (${size})`}
            size={size}
            items={FRUITS.slice(0, 4)}
            itemToValue={itemToValue}
            itemToLabel={itemToLabel}
          >
            {(fruit) => <FruitItem fruit={fruit} />}
          </Listbox.Root>
        </div>
      )}
    </For>
  );
}
