import { Listbox } from "@hope-ui/components/listbox";
import { createSignal, For, Show } from "solid-js";
import { type Fruit, FruitItem, itemToLabel, itemToValue } from "./data";

// Grouped sections, each named by a `Listbox.GroupLabel`, with a `Listbox.Separator` hairline
// between them. `items` holds the **group entries** and `groupToItems` flattens them into navigation
// order — so selection and keyboard navigation flow across groups as one list (arrows skip the
// labels and the separator), while the group's name is rendered from your own key. The callback
// child then goes one level up: it is invoked per group, and the group's items are a plain `<For>`.
// Grouping is data mode only — a virtual listbox is flat.
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

export function ListboxGroupedDemo() {
  const [value, setValue] = createSignal<Fruit[]>([BASKETS[1].fruits[0]]);

  return (
    <Listbox.Root
      aria-label="Choose a fruit"
      items={BASKETS}
      groupToItems={(basket) => basket.fruits}
      itemToValue={itemToValue}
      itemToLabel={itemToLabel}
      value={value()}
      onChange={setValue}
    >
      {(basket, index) => (
        <>
          <Show when={index() > 0}>
            <Listbox.Separator />
          </Show>
          <Listbox.Group>
            <Listbox.GroupLabel>{basket.kind}</Listbox.GroupLabel>
            <For each={basket.fruits}>{(fruit) => <FruitItem fruit={fruit} />}</For>
          </Listbox.Group>
        </>
      )}
    </Listbox.Root>
  );
}
