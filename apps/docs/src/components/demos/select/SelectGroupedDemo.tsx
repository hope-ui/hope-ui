import { Select } from "@hope-ui/components/select";
import { For, Show } from "solid-js";
import { type Fruit, FruitItem, itemToLabel, itemToValue } from "./data";

// Live demo for "Groups and separators". `items` holds the **group entries** and `groupToItems`
// flattens them into navigation order, so arrows and typeahead traverse the two sections as one list
// — straight across the boundary, skipping the labels and the hairline. The callback then goes one
// level up: it is invoked per group, and the group's own items are a plain `<For>`, which works only
// because each `Select.Item` resolves its own row from its `item` and so can sit at any depth.
interface Basket {
  kind: string;
  fruits: Fruit[];
}

const BASKETS: Basket[] = [
  {
    kind: "Citrus",
    fruits: [
      { id: 10, name: "Orange" },
      { id: 11, name: "Lemon" },
      { id: 12, name: "Lime" },
    ],
  },
  {
    kind: "Berries",
    fruits: [
      { id: 20, name: "Strawberry" },
      { id: 21, name: "Blueberry" },
      { id: 22, name: "Raspberry" },
    ],
  },
];

export function SelectGroupedDemo() {
  return (
    <Select.Root
      items={BASKETS}
      groupToItems={(basket) => basket.fruits}
      itemToValue={itemToValue}
      itemToLabel={itemToLabel}
    >
      <Select.Trigger aria-label="Choose a fruit">
        <Select.Value placeholder="Pick a fruit" />
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Content>
            <Select.List>
              {(basket: Basket, index) => (
                <>
                  <Show when={index() > 0}>
                    <Select.Separator />
                  </Show>
                  <Select.Group>
                    <Select.GroupLabel>{basket.kind}</Select.GroupLabel>
                    <For each={basket.fruits}>{(fruit) => <FruitItem fruit={fruit} />}</For>
                  </Select.Group>
                </>
              )}
            </Select.List>
          </Select.Content>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
