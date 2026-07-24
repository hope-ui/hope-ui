import type { JSX } from "@solidjs/web";
import { trackFocusVisible } from "@zag-js/focus-visible";
import { collection } from "@zag-js/listbox";
import { createSignal, For } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { ZagListbox } from ".";

// ── Storybook interop shim — without it EVERY story below crashes ────────────────────────────────
//
// Storybook 10.5's `enhanceContext` loader replaces `HTMLElement.prototype.focus` with an **accessor**
// whose getter is `this.ownerDocument?.defaultView ? … : noopFocus` (storybook/dist/csf/index.js).
// `@zag-js/focus-visible`'s `setupGlobalFocusEvents` — which the listbox machine runs unconditionally
// as its `trackFocusVisible` effect — reads that property **off the prototype**:
//
//     let focus = win.HTMLElement.prototype.focus;
//
// so the getter runs with `this === HTMLElement.prototype`. `ownerDocument` is a native accessor that
// rejects a non-element receiver, so it throws `TypeError: Illegal invocation` *before* the `?.` can
// help. Zag wraps only the subsequent `defineProperty` in a `try`, not the read, so the throw escapes
// into the machine's effect and Solid halts the whole reactive system (`[REACTIVITY_HALTED]`).
// Verified in the browser: the same getter called with a real element receiver is fine.
//
// The shim is a **warm-up, not a patch**: `setupGlobalFocusEvents` is once-per-window
// (`listenerMap.get(win)` guards it), and story modules evaluate before Storybook's loaders run — so
// calling it here, while `focus` is still a plain data property, both succeeds and makes every later
// call a no-op early return. Nothing is monkey-patched by us, and Storybook's own instrumentation
// still installs correctly on top.
//
// This is a **dependency-interop defect, not a ZagListbox bug**, and it does not affect a real app
// (nothing patches `focus` there). It is a development-harness cost, which matters here because
// Storybook is this repo's only non-test feedback loop. Recorded as `B7` in
// `__internal__/spikes/zag-listbox-findings.md`. hope's own `Listbox` stories are unaffected — the
// handmade kernel reads no prototype.
trackFocusVisible({ onChange: () => {} });

/**
 * The `ZagListbox` spike, rendered through the **same** hope `listbox` recipe `Listbox` uses — put
 * the two side by side in Storybook and they should be indistinguishable. That is what keeps the
 * comparison in `__internal__/spikes/zag-listbox-findings.md` meaningful: identical pixels, different
 * behavior layer.
 *
 * The consumer-visible shape is Zag's, not hope's: a `collection` built with `collection({ items,
 * itemToValue, … })` goes in, a `<For each={collection.items}>` comes out, and selection is carried
 * as collection **keys** rather than item values. The anatomy gains a `Root` wrapper and a `Content`
 * (the `role="listbox"` element) where hope's `Listbox.Root` is a single element.
 */
interface Fruit {
  id: string;
  name: string;
  disabled?: boolean;
}

const FRUITS: Fruit[] = [
  { id: "1", name: "Apple" },
  { id: "2", name: "Banana" },
  { id: "3", name: "Cherry" },
  { id: "4", name: "Date" },
  { id: "5", name: "Elderberry", disabled: true },
  { id: "6", name: "Fig" },
];

const fruits = collection({
  items: FRUITS,
  itemToValue: (fruit: Fruit) => fruit.id,
  itemToString: (fruit: Fruit) => fruit.name,
  isItemDisabled: (fruit: Fruit) => !!fruit.disabled,
});

/** The elevated-surface look a floating consumer would layer on the chrome-free standalone list. */
const PANEL = "rounded-lg border border-subtle bg-surface-overlay shadow-md p-1";

// `collection` is a **required** prop, so it has to sit on `meta.args` for every story to typecheck —
// hope's `Listbox.Root` has no required prop at all. A small but real consequence of data-down.
const meta = {
  title: "Spikes/ZagListbox",
  component: ZagListbox.Root,
  args: { collection: fruits },
} satisfies Meta<typeof ZagListbox.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

function FruitRows(): JSX.Element {
  return (
    <For each={fruits.items}>
      {(fruit) => (
        <ZagListbox.Item item={fruit}>
          <ZagListbox.ItemText>{fruit.name}</ZagListbox.ItemText>
          <ZagListbox.ItemIndicator />
        </ZagListbox.Item>
      )}
    </For>
  );
}

/** Single selection, the default. Click the rows or drive it with the arrow keys and typeahead. */
export const Default: Story = {
  render: () => {
    const [value, setValue] = createSignal<string[]>(["3"]);
    return (
      <ZagListbox.Root
        collection={fruits}
        value={value()}
        onValueChange={(details) => setValue(details.value)}
      >
        <ZagListbox.Label class="pb-1 text-xs text-foreground-muted">Fruit</ZagListbox.Label>
        <ZagListbox.Content class={PANEL}>
          <FruitRows />
        </ZagListbox.Content>
      </ZagListbox.Root>
    );
  },
};

/** Multiple selection — `meta+a` selects all, and shift-click extends a range. */
export const Multiple: Story = {
  render: () => (
    <ZagListbox.Root collection={fruits} selectionMode="multiple" defaultValue={["1", "4"]}>
      <ZagListbox.Label class="pb-1 text-xs text-foreground-muted">Fruits</ZagListbox.Label>
      <ZagListbox.Content class={PANEL}>
        <FruitRows />
      </ZagListbox.Content>
    </ZagListbox.Root>
  ),
};

/** The density axis — the same `size` variant `Listbox` takes, resolved through the same recipe. */
export const Sizes: Story = {
  render: () => (
    <div class="flex items-start gap-6">
      <For each={["sm", "md", "lg"] as const}>
        {(size) => (
          <ZagListbox.Root collection={fruits} size={size} defaultValue={["2"]}>
            <ZagListbox.Label class="pb-1 text-xs text-foreground-muted">{size}</ZagListbox.Label>
            <ZagListbox.Content class={PANEL}>
              <FruitRows />
            </ZagListbox.Content>
          </ZagListbox.Root>
        )}
      </For>
    </div>
  ),
};

/**
 * Grouped rows. Zag links group to label by **repeating the group's key** on both parts (`id` /
 * `htmlFor`), where hope's `Listbox.GroupLabel` registers its own id onto the group. A typo here is
 * a silently dangling `aria-labelledby`; in hope's shape it cannot be spelled wrong.
 */
export const Grouped: Story = {
  render: () => {
    const berries = fruits.items.filter((fruit) => fruit.name.includes("berry"));
    const rest = fruits.items.filter((fruit) => !fruit.name.includes("berry"));
    return (
      <ZagListbox.Root collection={fruits}>
        <ZagListbox.Label class="pb-1 text-xs text-foreground-muted">Fruit</ZagListbox.Label>
        <ZagListbox.Content class={PANEL}>
          <ZagListbox.ItemGroup id="common">
            <ZagListbox.ItemGroupLabel htmlFor="common">Common</ZagListbox.ItemGroupLabel>
            <For each={rest}>
              {(fruit) => (
                <ZagListbox.Item item={fruit}>
                  <ZagListbox.ItemText>{fruit.name}</ZagListbox.ItemText>
                  <ZagListbox.ItemIndicator />
                </ZagListbox.Item>
              )}
            </For>
          </ZagListbox.ItemGroup>
          <ZagListbox.ItemGroup id="berries">
            <ZagListbox.ItemGroupLabel htmlFor="berries">Berries</ZagListbox.ItemGroupLabel>
            <For each={berries}>
              {(fruit) => (
                <ZagListbox.Item item={fruit}>
                  <ZagListbox.ItemText>{fruit.name}</ZagListbox.ItemText>
                  <ZagListbox.ItemIndicator />
                </ZagListbox.Item>
              )}
            </For>
          </ZagListbox.ItemGroup>
        </ZagListbox.Content>
      </ZagListbox.Root>
    );
  },
};

/**
 * 200 rows — the granularity case. Every keystroke rebuilds all 200 rows' prop sets, ~40 full
 * `getItemState` computations each; the DOM writes stay at a handful, so nothing *looks* wrong. Kept
 * as a story because that is the one place a human can feel it. Numbers in the findings ledger.
 */
export const TwoHundredRows: Story = {
  render: () => {
    const many = collection({
      items: Array.from({ length: 200 }, (_, index) => ({
        id: String(index),
        name: `Item ${index}`,
      })),
      itemToValue: (item: { id: string }) => item.id,
      itemToString: (item: { name: string }) => item.name,
    });
    return (
      <ZagListbox.Root collection={many}>
        <ZagListbox.Label class="pb-1 text-xs text-foreground-muted">200 rows</ZagListbox.Label>
        <ZagListbox.Content class={`${PANEL} max-h-72`}>
          <For each={many.items}>
            {(item) => (
              <ZagListbox.Item item={item}>
                <ZagListbox.ItemText>{item.name}</ZagListbox.ItemText>
                <ZagListbox.ItemIndicator />
              </ZagListbox.Item>
            )}
          </For>
        </ZagListbox.Content>
      </ZagListbox.Root>
    );
  },
};
