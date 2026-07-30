import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import { type Accessor, For, Show } from "solid-js";
import { Listbox } from "../index";

// The single source of truth for Listbox's SSR → hydration round-trip tree, shared by
// `listbox.ssr.test.tsx` (renders it, inline-snapshots the bytes), `listbox.browser.test.tsx`
// (passes it to `hydrateFixture`), and the hydration-fixture bridge (renders it server-side to feed
// the browser test). Reusing one tree is what enforces "structurally identical server and client" —
// hydration keys are a path through the component tree, so a component inserted before the first
// item, even one that renders nothing, would shift every following key.
//
// It exercises the **grouped data mode** end-to-end: `items` holds the group entries, `groupToItems`
// flattens them into navigation order, and the per-entry `children` callback renders a `Group` (with
// its `GroupLabel` and a nested `<For>` of the group's own items) plus a `Separator` between groups.
// `name` is set so the hidden form field(s) are part of the round-trip, and a `defaultValue`
// pre-selects one row, so the tree includes both a rendered `ItemIndicator` (the check glyph) and a
// hidden `<input>`. The whole tree sits under a `<ThemeProvider>` fed the `hope` preset (a zero-DOM
// provider — its token values live in CSS), which must be present identically everywhere because it
// shifts `_hk` keys.

interface Fruit {
  id: number;
  name: string;
}

interface Basket {
  kind: string;
  fruits: Fruit[];
}

const BASKETS: Basket[] = [
  {
    kind: "Citrus",
    fruits: [
      { id: 1, name: "Orange" },
      { id: 2, name: "Lemon" },
    ],
  },
  {
    kind: "Berries",
    fruits: [
      { id: 3, name: "Strawberry" },
      { id: 4, name: "Blueberry" },
    ],
  },
];

const STRAWBERRY = BASKETS[1]?.fruits[0] as Fruit;

const itemToValue = (fruit: Fruit) => String(fruit.id);
const itemToLabel = (fruit: Fruit) => fruit.name;

function FruitItem(props: { fruit: Fruit }): JSX.Element {
  return (
    <Listbox.Item item={props.fruit}>
      <Listbox.ItemIndicator />
      {props.fruit.name}
    </Listbox.Item>
  );
}

export function Tree(): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <Listbox.Root
        aria-label="Choose a fruit"
        name="fruit"
        items={BASKETS}
        groupToItems={(basket) => basket.fruits}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        defaultValue={[STRAWBERRY]}
      >
        {(basket: Basket, index: Accessor<number>) => (
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
    </ThemeProvider>
  );
}

/** The server render the hydration-fixture bridge invokes. */
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
