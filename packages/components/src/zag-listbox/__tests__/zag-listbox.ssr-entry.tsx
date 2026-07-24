import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import { collection } from "@zag-js/listbox";
import { For } from "solid-js";
import { ZagListbox } from "../index";

// The single source of truth for ZagListbox's SSR → hydration round-trip tree, shared by
// `zag-listbox.ssr.test.tsx` (renders it, inline-snapshots the bytes) and
// `zag-listbox.browser.test.tsx` (hydrates it via the fixture bridge).
//
// The interesting question a listbox adds over ZagDialog: `_hk` stability across **N items**. The
// tree is a `<For>` over a collection built at module scope, so the same N rows render on both
// sides; if the machine's `createUniqueId()` or the per-item `renderElement` allocated keys
// differently at any index, hydration would reuse the wrong node.

export interface Fruit {
  value: string;
  label: string;
  disabled?: boolean;
}

// `date` is last *and* disabled on purpose: Zag's `getNextValue` and its typeahead both skip
// disabled items, so a disabled row in the middle would silently swallow arrow navigation past it.
export const FRUITS: Fruit[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date", disabled: true },
];

export const fruitCollection = collection({
  items: FRUITS,
  itemToValue: (item: Fruit) => item.value,
  itemToString: (item: Fruit) => item.label,
  isItemDisabled: (item: Fruit) => !!item.disabled,
});

export function Tree(): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <ZagListbox.Root collection={fruitCollection} defaultValue={["banana"]}>
        <ZagListbox.Label>Fruits</ZagListbox.Label>
        <ZagListbox.Content>
          <For each={fruitCollection.items}>
            {(item) => (
              <ZagListbox.Item item={item}>
                <ZagListbox.ItemText>{item.label}</ZagListbox.ItemText>
                <ZagListbox.ItemIndicator />
              </ZagListbox.Item>
            )}
          </For>
        </ZagListbox.Content>
      </ZagListbox.Root>
    </ThemeProvider>
  );
}

/** The server render the hydration-fixture bridge invokes. */
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
