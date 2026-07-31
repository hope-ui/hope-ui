import { Select } from "@hope-ui/components/select";
import { createSignal } from "solid-js";
import { FRUITS, type Fruit, FruitItem, isItemDisabled, itemToLabel, itemToValue } from "./data";

// Live demo for "Selection modes": `selectionMode="multiple"` makes the value an **array**, and the
// popup stays open while you tick rows (`shouldCloseOnSelect` defaults to `selectionMode !==
// "multiple"`). A comma-joined list of six labels would overflow the trigger, so `Select.Value` takes
// a callback and summarizes the selection instead — it receives the selected items, an array in both
// modes, because that is the shape the underlying list holds.
export function SelectMultipleDemo() {
  const [fruits, setFruits] = createSignal<Fruit[]>([FRUITS[0], FRUITS[3]]);

  return (
    <Select.Root
      selectionMode="multiple"
      items={FRUITS}
      itemToValue={itemToValue}
      itemToLabel={itemToLabel}
      isItemDisabled={isItemDisabled}
      value={fruits()}
      onChange={setFruits}
    >
      <Select.Trigger aria-label="Choose fruits">
        <Select.Value placeholder="Any fruit">
          {(values: readonly unknown[]) =>
            values.length === 1 ? (values[0] as Fruit).name : `${values.length} fruits selected`
          }
        </Select.Value>
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
  );
}
