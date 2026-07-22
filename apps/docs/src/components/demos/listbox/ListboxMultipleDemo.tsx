import { Listbox } from "@hope-ui/components/listbox";
import { createSignal, For } from "solid-js";
import { FRUITS, type Fruit, FruitItem, itemToLabel, itemToValue, PANEL } from "./data";

// `selectionMode="multiple"` — Space or click toggles a set, and every chosen row keeps its check
// glyph. Shift+Arrow extends the selection; Cmd/Ctrl+A selects all. Starts with two rows selected.
export function ListboxMultipleDemo() {
  const [value, setValue] = createSignal<Fruit[]>([FRUITS[0], FRUITS[3]]);

  return (
    <Listbox.Root
      aria-label="Choose fruits"
      class={PANEL}
      selectionMode="multiple"
      itemToValue={itemToValue}
      itemToLabel={itemToLabel}
      value={value()}
      onChange={setValue}
    >
      <For each={FRUITS}>{(fruit) => <FruitItem fruit={fruit} />}</For>
    </Listbox.Root>
  );
}
