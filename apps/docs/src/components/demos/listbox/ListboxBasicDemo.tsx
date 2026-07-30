import { Listbox } from "@hope-ui/components/listbox";
import { createSignal } from "solid-js";
import { FRUITS, type Fruit, FruitItem, isItemDisabled, itemToLabel, itemToValue } from "./data";

// The default: single selection, roving focus. Controlled via a signal; the chosen row keeps a
// check glyph. Arrow keys / Home / End / type-to-search move the highlight; Enter, Space, or a
// click selects. Starts with "Cherry" selected.
export function ListboxBasicDemo() {
  const [value, setValue] = createSignal<Fruit[]>([FRUITS[2]]);

  return (
    <Listbox.Root
      aria-label="Choose a fruit"
      items={FRUITS}
      itemToValue={itemToValue}
      itemToLabel={itemToLabel}
      isItemDisabled={isItemDisabled}
      value={value()}
      onChange={setValue}
    >
      {(fruit) => <FruitItem fruit={fruit} />}
    </Listbox.Root>
  );
}
