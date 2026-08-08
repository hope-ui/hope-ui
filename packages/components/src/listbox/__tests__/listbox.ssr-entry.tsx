import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { type Accessor, For, Show } from "solid-js";
import { Listbox } from "../index";

// The single source of truth for Listbox's server-render → hydration round-trip, shared by
// `listbox.ssr.test.tsx` (snapshots the bytes), `listbox.browser.test.tsx` (hydrates it), and the
// fixture bridge that renders it server-side for that browser test.
//
// Reusing one definition is what enforces "structurally identical server and client": Solid pairs
// server and client nodes by a key derived from each node's *path through the component tree*, so a
// component inserted before the first item — even one that renders nothing — shifts every following
// key. The `<ThemeProvider>` counts: it renders no DOM (hope's token values live in CSS) but it is a
// node on that path, so it must be present identically on both sides.
//
// The tree covers the **grouped data mode** end to end, and `name` + `defaultValue` pull the hidden
// form control and a rendered selection glyph into the round-trip too.

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
export async function renderFixture(): Promise<string> {
  return await renderToStream(() => <Tree />);
}
