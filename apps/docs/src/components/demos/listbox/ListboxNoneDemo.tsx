import { Listbox } from "@hope-ui/components/listbox";
import { For } from "solid-js";
import { FRUITS, FruitItem, itemToLabel, itemToValue } from "./data";

// `selectionMode="none"` — a browsing list. Arrows and type-to-search move the highlight, but
// nothing is ever selected (no check glyph, no `onChange`). Useful for a command menu or a
// read-only picker of actions.
export function ListboxNoneDemo() {
  return (
    <Listbox.Root
      aria-label="Browse fruits"
      selectionMode="none"
      itemToValue={itemToValue}
      itemToLabel={itemToLabel}
    >
      <For each={FRUITS}>{(fruit) => <FruitItem fruit={fruit} />}</For>
    </Listbox.Root>
  );
}
