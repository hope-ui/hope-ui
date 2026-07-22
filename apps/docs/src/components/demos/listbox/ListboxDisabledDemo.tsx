import { Listbox } from "@hope-ui/components/listbox";
import { For } from "solid-js";
import { FRUITS, FruitItem, itemToLabel, itemToValue, PANEL } from "./data";

// A disabled row (Elderberry, `disabled` in the data) is dimmed and skipped by keyboard navigation
// and typeahead — arrows jump straight over it. `skipDisabled` (default `true`) governs this; set it
// `false` to let the highlight land on disabled rows (they still can't be selected).
export function ListboxDisabledDemo() {
  return (
    <Listbox.Root
      aria-label="Choose a fruit"
      class={PANEL}
      itemToValue={itemToValue}
      itemToLabel={itemToLabel}
    >
      <For each={FRUITS}>{(fruit) => <FruitItem fruit={fruit} />}</For>
    </Listbox.Root>
  );
}
