import { Listbox } from "@hope-ui/components/listbox";
import { createSignal } from "solid-js";
import { FRUITS, type Fruit, FruitItem, isItemDisabled, itemToLabel, itemToValue } from "./data";

// `selectionMode="multiple"` — Space or click toggles a set, and every chosen row keeps its check
// glyph. Shift+Arrow extends the selection; Cmd/Ctrl+A selects all. Starts with two rows selected.
export function ListboxMultipleDemo() {
  const [value, setValue] = createSignal<Fruit[]>([FRUITS[0], FRUITS[3]]);

  return (
    <Listbox.Root
      aria-label="Choose fruits"
      selectionMode="multiple"
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
