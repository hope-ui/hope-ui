import { Select, type SelectSize } from "@hope-ui/components/select";
import { For } from "solid-js";
import { FRUITS, type Fruit, FruitItem, itemToLabel, itemToValue } from "./data";

// Live demo for "Sizes". One `size` on `Select.Root` scales the trigger **and** the popup together —
// they have to agree, or a `lg` control opens an `md` list. Open each to see the row density follow
// the control it belongs to.
const SIZES: SelectSize[] = ["sm", "md", "lg"];

export function SelectSizesDemo() {
  return (
    <div class="flex flex-wrap items-start justify-center gap-6">
      <For each={SIZES}>
        {(size) => (
          <div class="flex flex-col gap-2">
            <span class="text-xs font-medium text-foreground-muted">{size}</span>
            <Select.Root
              size={size}
              items={FRUITS}
              itemToValue={itemToValue}
              itemToLabel={itemToLabel}
              defaultValue={FRUITS[1]}
            >
              <Select.Trigger aria-label={`Choose a fruit (${size})`}>
                <Select.Value placeholder="Pick a fruit" />
                <Select.Icon />
              </Select.Trigger>
              <Select.Portal>
                <Select.Positioner>
                  <Select.Content>
                    <Select.List>{(fruit: Fruit) => <FruitItem fruit={fruit} />}</Select.List>
                  </Select.Content>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          </div>
        )}
      </For>
    </div>
  );
}
