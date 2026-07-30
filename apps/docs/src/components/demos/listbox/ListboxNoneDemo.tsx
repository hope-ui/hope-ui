import { Listbox } from "@hope-ui/components/listbox";
import { FRUITS, FruitItem, isItemDisabled, itemToLabel, itemToValue } from "./data";

// `selectionMode="none"` — a browsing list. Arrows and type-to-search move the highlight, but
// nothing is ever selected (no check glyph, no `onChange`). Useful for a command menu or a
// read-only picker of actions.
export function ListboxNoneDemo() {
  return (
    <Listbox.Root
      aria-label="Browse fruits"
      selectionMode="none"
      items={FRUITS}
      itemToValue={itemToValue}
      itemToLabel={itemToLabel}
      isItemDisabled={isItemDisabled}
    >
      {(fruit) => <FruitItem fruit={fruit} />}
    </Listbox.Root>
  );
}
