import { Combobox, type ComboboxSize } from "@hope-ui/components/combobox";
import { For } from "solid-js";
import { FRUITS, FruitControl, FruitPopup, itemToLabel, itemToValue } from "./data";

// Live demo for "Sizes". One `size` on `Combobox.Root` scales the control **and** the popup together
// — they have to agree, or a `lg` field opens an `md` list. Open each to see the row density follow
// the field it belongs to.
const SIZES: ComboboxSize[] = ["sm", "md", "lg"];

export function ComboboxSizesDemo() {
  return (
    <div class="flex flex-col items-start justify-center gap-6">
      <For each={SIZES}>
        {(size) => (
          <div class="flex flex-col gap-2">
            <span class="font-medium text-foreground-muted text-xs">{size}</span>
            <Combobox.Root
              size={size}
              items={FRUITS}
              itemToValue={itemToValue}
              itemToLabel={itemToLabel}
              defaultValue={FRUITS[1]}
            >
              <FruitControl label={`Choose a fruit (${size})`} />
              <FruitPopup />
            </Combobox.Root>
          </div>
        )}
      </For>
    </div>
  );
}
