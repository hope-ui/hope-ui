import { Listbox } from "@hope-ui/components/listbox";
import { type Accessor, createSignal } from "solid-js";
import { type Fruit, itemToLabel, itemToValue, PANEL } from "./data";

// **Virtualization** — pass `items` (the full array) + `estimateSize`, and give `Listbox.Root` a
// render-prop child `(item, index) => <Listbox.Item index={index}>…`. The list element becomes the
// scroll container; only a window of rows mounts, so 10,000 rows scroll and navigate smoothly (try
// End, or type to jump to a row). The same state drives selection / focus / typeahead over the
// **full** set. Flat lists only — no groups in virtual mode.
//
// The virtual path requires the consumer to install `@tanstack/virtual-core` (an optional peer of
// `@hope-ui/primitives`, so a non-virtualizing install stays dependency-free).
const ITEMS: Fruit[] = Array.from({ length: 10_000 }, (_, index) => ({
  id: index,
  name: `Item ${index}`,
}));

// A fixed height + width turns the chrome-free list into a scrolling viewport; rows are 32px,
// matching `estimateSize`.
const VIRTUAL_PANEL = `${PANEL} h-72 w-56`;

export function ListboxVirtualDemo() {
  const [value, setValue] = createSignal<Fruit[]>([ITEMS[42]]);

  return (
    <Listbox.Root
      aria-label="Ten thousand rows"
      class={VIRTUAL_PANEL}
      items={ITEMS}
      estimateSize={() => 32}
      itemToValue={itemToValue}
      itemToLabel={itemToLabel}
      value={value()}
      onChange={setValue}
    >
      {(item: Fruit, index: Accessor<number>) => (
        <Listbox.Item index={index} style={{ height: "2rem" }}>
          <Listbox.ItemIndicator />
          {item.name}
        </Listbox.Item>
      )}
    </Listbox.Root>
  );
}
