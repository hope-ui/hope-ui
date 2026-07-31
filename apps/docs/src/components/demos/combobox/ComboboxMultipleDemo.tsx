import { Combobox } from "@hope-ui/components/combobox";
import { createSignal } from "solid-js";
import { FRUITS, type Fruit, FruitControl, FruitPopup, itemToLabel, itemToValue } from "./data";

// Live demo for "Selection modes": `selectionMode="multiple"` makes the value an **array**, and the
// popup stays open while you tick rows (`shouldCloseOnSelect` defaults to `selectionMode !==
// "multiple"`).
//
// The input stays the **query** rather than becoming a joined list of labels — there is no one label
// to show for several picks — and it is emptied after each one so the next search starts fresh. That
// makes the checks in the list the only report of what is chosen, which is why `Combobox.ItemIndicator`
// is not optional in a multi-select tree. The readout below is this demo's own, from `onChange`.
export function ComboboxMultipleDemo() {
  const [fruits, setFruits] = createSignal<Fruit[]>([FRUITS[0], FRUITS[3]]);

  return (
    <div class="flex flex-col gap-2">
      <Combobox.Root
        items={FRUITS}
        selectionMode="multiple"
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        value={fruits()}
        onChange={setFruits}
      >
        <FruitControl label="Choose fruits" placeholder="Add fruit…" />
        <FruitPopup />
      </Combobox.Root>

      <output class="text-foreground-muted text-sm">
        picked: <code>{fruits().map(itemToLabel).join(", ") || "none"}</code>
      </output>
    </div>
  );
}
