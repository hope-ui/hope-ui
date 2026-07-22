import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import { Listbox } from "../index";

// The single source of truth for Listbox's SSR → hydration round-trip tree, shared by
// `listbox.ssr.test.tsx` (renders it, inline-snapshots the bytes), `listbox.browser.test.tsx`
// (passes it to `hydrateFixture`), and the hydration-fixture bridge (renders it server-side to feed
// the browser test). Reusing one tree is what enforces "structurally identical server and client" —
// hydration keys are a path through the component tree, so a component inserted before the first
// item, even one that renders nothing, would shift every following key.
//
// It exercises the **collection mode** end-to-end: two `Group`s (each with a `GroupLabel`), a
// `Separator` between them, `Item`s carrying an `ItemIndicator`, and `name` set so the hidden
// form field(s) are part of the round-trip. A `defaultValue` pre-selects one row, so the tree
// includes both a rendered `ItemIndicator` (the check glyph) and a hidden `<input>`. The whole tree
// sits under a `<ThemeProvider>` fed the `hope` preset (a zero-DOM provider — its token values live
// in CSS), which must be present identically everywhere because it shifts `_hk` keys.

interface Fruit {
  id: number;
  name: string;
}

const CITRUS: Fruit[] = [
  { id: 1, name: "Orange" },
  { id: 2, name: "Lemon" },
];
const BERRIES: Fruit[] = [
  { id: 3, name: "Strawberry" },
  { id: 4, name: "Blueberry" },
];

const itemToValue = (fruit: Fruit) => String(fruit.id);

function FruitItem(props: { fruit: Fruit }): JSX.Element {
  return (
    <Listbox.Item value={props.fruit} textValue={props.fruit.name}>
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
        itemToValue={itemToValue}
        defaultValue={[BERRIES[0] as Fruit]}
      >
        <Listbox.Group>
          <Listbox.GroupLabel>Citrus</Listbox.GroupLabel>
          <FruitItem fruit={CITRUS[0] as Fruit} />
          <FruitItem fruit={CITRUS[1] as Fruit} />
        </Listbox.Group>
        <Listbox.Separator />
        <Listbox.Group>
          <Listbox.GroupLabel>Berries</Listbox.GroupLabel>
          <FruitItem fruit={BERRIES[0] as Fruit} />
          <FruitItem fruit={BERRIES[1] as Fruit} />
        </Listbox.Group>
      </Listbox.Root>
    </ThemeProvider>
  );
}

/** The server render the hydration-fixture bridge invokes. */
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
