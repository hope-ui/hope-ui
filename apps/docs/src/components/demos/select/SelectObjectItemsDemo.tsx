import { Select } from "@hope-ui/components/select";
import { FRUITS, type Fruit, FruitItem, isItemDisabled, itemToLabel, itemToValue } from "./data";

// Live demo for "Your own objects": the items are whatever your backend returned, and every question
// the widget asks about one is an accessor — `itemToValue` for the selection identity (and the string
// a form submits), `itemToLabel` for the display / typeahead text, `isItemDisabled` for the per-row
// disabled state. Elderberry is `disabled` in the data, so it is dimmed and arrow keys skip straight
// over it. All three are answered from the data, before a row has mounted — which is what lets a
// *closed* Select run typeahead over the whole set.
export function SelectObjectItemsDemo() {
  return (
    <Select.Root
      items={FRUITS}
      itemToValue={itemToValue}
      itemToLabel={itemToLabel}
      isItemDisabled={isItemDisabled}
      defaultValue={FRUITS[2]}
    >
      <Select.Trigger aria-label="Choose a fruit">
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
  );
}
