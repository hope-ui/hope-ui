import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { type Accessor, For, Show } from "solid-js";
import { Select } from "../index";

// The single source of truth for Select's SSR → hydration round-trip tree, shared by
// `select.ssr.test.tsx` (renders it, inline-snapshots the bytes), `select.browser.test.tsx` (hydrates
// it and drives it open), and the bridge that renders it server-side to feed that browser test.
//
// **Sharing one tree is the point.** Solid matches server and client nodes by position, walking the
// component tree to assign each one a hydration key, so inserting *any* component before
// `Select.Trigger` — even one that renders nothing — shifts the trigger's key and breaks hydration.
// Two hand-written copies of this tree would drift into exactly that. The `<ThemeProvider>` counts as
// such a component and must therefore appear identically on both sides, even though it renders no DOM.
//
// **The closed server render is the trigger plus the hidden `<select>`.** `Select.Portal` renders
// nothing server-side and the popup renders nothing while closed, so no option *row* reaches the
// server — yet every `<option>` does, because the option set is **data**. That is what browser
// autofill matches against, and what lets `required` block a submit before anything has been opened.
//
// The tree exercises the **grouped** mode end to end, sets `name` so the hidden field is part of the
// round-trip, and pre-selects a row with `defaultValue` so the output carries a `selected` `<option>`.
//
// The trigger's `aria-label` is not decoration: a nameless `role="combobox"` is an axe
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
    <Select.Item item={props.fruit}>
      <Select.ItemText>{props.fruit.name}</Select.ItemText>
      <Select.ItemIndicator />
    </Select.Item>
  );
}

/**
 * `defaultOpen` is optional so the ssr test can also exercise the *open* server render: the `Portal`'s
 * `isServer` guard must not crash `renderToStream`, and no portaled row may reach the output. The
 * hydration path uses the default — closed.
 */
export function Tree(props?: { defaultOpen?: boolean }): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <Select.Root
        items={BASKETS}
        groupToItems={(basket) => basket.fruits}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        defaultValue={STRAWBERRY}
        name="fruit"
        defaultOpen={props?.defaultOpen}
      >
        <Select.Trigger aria-label="Choose a fruit">
          <Select.Value placeholder="Pick a fruit" />
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Content>
              <Select.List>
                {(basket: Basket, index: Accessor<number>) => (
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
    </ThemeProvider>
  );
}

/** The closed server render the hydration-fixture bridge invokes. */
export async function renderFixture(): Promise<string> {
  return await renderToStream(() => <Tree />);
}
