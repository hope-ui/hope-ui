import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import { type Accessor, For, Show } from "solid-js";
import { Combobox } from "../index";

// The single source of truth for Combobox's SSR → hydration round-trip tree, shared by
// `combobox.ssr.test.tsx` (renders it, inline-snapshots the bytes), `combobox.browser.test.tsx`
// (passes it to `hydrateFixture` and drives it), and the hydration-fixture bridge (renders it
// server-side to feed the browser test). Reusing one tree is what enforces "structurally identical
// server and client" — hydration keys are a path through the component tree, so a component inserted
// before `Combobox.Input`, even one that renders nothing, would shift the input's key.
//
// **The closed server render is the control and nothing else.** `Combobox.Portal` renders nothing
// server-side and the popup renders nothing while closed, so no option row reaches the server. Unlike
// Select there is no hidden `<select>` either: `name`/`form`/`required` are `Omit`-ted from
// `ComboboxRootProps`, because a Combobox's kernel holds the *filtered* option set and a native field
// built from it would drop options as the user typed.
//
// The tree exercises the **grouped** mode end-to-end, and `defaultValue` pre-selects a row so the
// server-rendered `<input value>` carries that row's label — which is the one thing here that could
// disagree across hydration, since `createTextInput`'s value is a snapshot computed from props on
// both sides. `Combobox.Clear` is rendered too, and its `<Show>` is deliberately *true* on the server
// (something is selected) so the round-trip covers a mounted gutter button rather than an absent one.
//
// The whole tree sits under a `<ThemeProvider>` fed the `hope` preset (a zero-DOM provider — its
// token values live in CSS), which must be present identically everywhere because it shifts `_hk`.
//
// The input's `aria-label` is not decoration: a nameless `role="combobox"` is an axe
// `aria-input-field-name` violation, and the popup's `role="listbox"` inherits its name from it.

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
    <Combobox.Item item={props.fruit}>
      <Combobox.ItemText>{props.fruit.name}</Combobox.ItemText>
      <Combobox.ItemIndicator />
    </Combobox.Item>
  );
}

/**
 * `defaultOpen` is optional so the ssr test can also exercise the open server render (the `Portal`'s
 * `isServer` guard must not crash `renderToStringAsync`, and no portaled row may reach the output).
 * The hydration path uses the default — closed.
 */
export function Tree(props?: { defaultOpen?: boolean }): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <Combobox.Root
        items={BASKETS}
        groupToItems={(basket) => basket.fruits}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        defaultValue={STRAWBERRY}
        defaultOpen={props?.defaultOpen}
      >
        <Combobox.Control>
          <Combobox.Input aria-label="Choose a fruit" placeholder="Search fruit" />
          <Combobox.Clear />
          <Combobox.Trigger>
            <Combobox.Icon />
          </Combobox.Trigger>
        </Combobox.Control>
        <Combobox.Portal>
          <Combobox.Positioner>
            <Combobox.Content>
              <Combobox.List>
                {(basket: Basket, index: Accessor<number>, fruits: Accessor<Fruit[]>) => (
                  <>
                    <Show when={index() > 0}>
                      <Combobox.Separator />
                    </Show>
                    <Combobox.Group>
                      <Combobox.GroupLabel>{basket.kind}</Combobox.GroupLabel>
                      <For each={fruits()}>{(fruit) => <FruitItem fruit={fruit} />}</For>
                    </Combobox.Group>
                  </>
                )}
              </Combobox.List>
              <Combobox.Empty>No fruit matches that.</Combobox.Empty>
              <Combobox.Status />
            </Combobox.Content>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </ThemeProvider>
  );
}

/** The closed server render the hydration-fixture bridge invokes. */
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
