import { Listbox } from "@hope-ui/components/listbox";
import { createSignal, For } from "solid-js";
import { type Fruit, FruitItem, itemToLabel, itemToValue, PANEL } from "./data";

// Grouped sections, each named by a `Listbox.GroupLabel`, with a `Listbox.Separator` hairline
// between them. Grouping is collection mode only — a virtual listbox is flat. Selection and keyboard
// navigation flow across groups as one list (arrows skip the labels and the separator).
const CITRUS: Fruit[] = [
  { id: 10, name: "Orange" },
  { id: 11, name: "Lemon" },
  { id: 12, name: "Lime" },
];

const BERRIES: Fruit[] = [
  { id: 20, name: "Strawberry" },
  { id: 21, name: "Blueberry" },
  { id: 22, name: "Raspberry" },
];

export function ListboxGroupedDemo() {
  const [value, setValue] = createSignal<Fruit[]>([BERRIES[0]]);

  return (
    <Listbox.Root
      aria-label="Choose a fruit"
      class={PANEL}
      itemToValue={itemToValue}
      itemToLabel={itemToLabel}
      value={value()}
      onChange={setValue}
    >
      <Listbox.Group>
        <Listbox.GroupLabel>Citrus</Listbox.GroupLabel>
        <For each={CITRUS}>{(fruit) => <FruitItem fruit={fruit} />}</For>
      </Listbox.Group>
      <Listbox.Separator />
      <Listbox.Group>
        <Listbox.GroupLabel>Berries</Listbox.GroupLabel>
        <For each={BERRIES}>{(fruit) => <FruitItem fruit={fruit} />}</For>
      </Listbox.Group>
    </Listbox.Root>
  );
}
