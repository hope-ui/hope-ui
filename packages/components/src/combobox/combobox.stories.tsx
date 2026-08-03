import type { JSX } from "@solidjs/web";
import { type Accessor, createSignal, For, Show } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Combobox, type ComboboxSize } from ".";

/**
 * `Combobox` is `Select` with the focus owner swapped and a filter added: the `role="combobox"` moves
 * from a `<button>` onto an `<input>`, the input becomes the search affordance, and `Combobox.Root`
 * narrows `items` as you type.
 *
 * **Every tree here names its input** with `aria-label` or an `aria-labelledby` pointing at the
 * consumer's own `<label>`. There is no `Label` part, and a nameless `role="combobox"` is an axe
 * `aria-input-field-name` violation — as is the `role="listbox"` popup, which inherits its name.
 *
 * **DOM focus never leaves the input.** No option is ever focused; the highlight is
 * `aria-activedescendant` plus the row's `data-active`. `Combobox.Trigger` — the chevron — is
 * deliberately **outside the tab order**, so Tab moves past the whole widget in one press.
 *
 * **There is no typeahead.** The input *is* the search buffer, so a second jump-to-letter buffer
 * competing with it would be a bug. That is the one behavior Select has and Combobox drops.
 */
const meta = {
  title: "Components/Combobox",
  component: Combobox.Root,
  // `items` is required, so Storybook's story type demands `args`. Every story renders its own tree,
  // so this only exists to satisfy that.
  args: { items: [] },
} satisfies Meta<typeof Combobox.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

interface Fruit {
  id: number;
  name: string;
  disabled?: boolean;
}

const FRUITS: Fruit[] = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
  { id: 4, name: "Date" },
  { id: 5, name: "Elderberry", disabled: true },
  { id: 6, name: "Fig" },
  // Accented on purpose: typing its plain-ASCII spelling ("acai") exercises the collator-backed
  // filter, which folds diacritics as well as case — `toLowerCase()` folds only case.
  { id: 7, name: "Açaí" },
  { id: 8, name: "Café au lait melon" },
];

const itemToValue = (fruit: Fruit) => String(fruit.id);
const itemToLabel = (fruit: Fruit) => fruit.name;
const isItemDisabled = (fruit: Fruit) => fruit.disabled ?? false;

interface Basket {
  kind: string;
  fruits: Fruit[];
}

const BASKETS: Basket[] = [
  {
    kind: "Citrus",
    fruits: [
      { id: 11, name: "Orange" },
      { id: 12, name: "Lemon" },
      { id: 13, name: "Grapefruit" },
    ],
  },
  {
    kind: "Berries",
    fruits: [
      { id: 21, name: "Strawberry" },
      { id: 22, name: "Blueberry" },
      { id: 23, name: "Raspberry" },
    ],
  },
];

/** Room below the control so the popup has somewhere to land without flipping. */
function Stage(props: { children: JSX.Element }): JSX.Element {
  return <div style={{ padding: "2rem", "min-height": "26rem" }}>{props.children}</div>;
}

function FruitItem(props: { fruit: Fruit }): JSX.Element {
  return (
    <Combobox.Item item={props.fruit}>
      <Combobox.ItemText>{props.fruit.name}</Combobox.ItemText>
      <Combobox.ItemIndicator />
    </Combobox.Item>
  );
}

/** The control every story repeats, so each one shows only what it is about. */
function FruitControl(props: { label: string; placeholder?: string }): JSX.Element {
  return (
    <Combobox.Control>
      <Combobox.Input aria-label={props.label} placeholder={props.placeholder ?? "Search fruit…"} />
      <Combobox.Clear />
      <Combobox.Trigger>
        <Combobox.Icon />
      </Combobox.Trigger>
    </Combobox.Control>
  );
}

/** The popup spine, flat. */
function FruitPopup(): JSX.Element {
  return (
    <Combobox.Portal>
      <Combobox.Positioner>
        <Combobox.Content>
          <Combobox.List>{(fruit: Fruit) => <FruitItem fruit={fruit} />}</Combobox.List>
          <Combobox.Empty>No fruit matches that.</Combobox.Empty>
          <Combobox.Status />
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Portal>
  );
}

/** The default — single selection, uncontrolled, `contains` filtering. */
export const Default: Story = {
  render: () => (
    <Stage>
      <Combobox.Root
        items={FRUITS}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        isItemDisabled={isItemDisabled}
      >
        <FruitControl label="Choose a fruit" />
        <FruitPopup />
      </Combobox.Root>
    </Stage>
  ),
};

/**
 * The collator folds case **and** diacritics, so `cafe` matches `Café au lait melon` and `acai`
 * matches `Açaí`. `toLowerCase()` matches neither — which is why the filter is collator-backed.
 * Type either into the field.
 */
export const FoldsAccents: Story = {
  render: () => (
    <Stage>
      <Combobox.Root items={FRUITS} itemToValue={itemToValue} itemToLabel={itemToLabel}>
        <FruitControl label="Choose a fruit" placeholder="Try “cafe” or “acai”…" />
        <FruitPopup />
      </Combobox.Root>
    </Stage>
  ),
};

/** `filter="startsWith"` — only the prefix matches. Type `b` to see Banana alone. */
export const StartsWith: Story = {
  render: () => (
    <Stage>
      <Combobox.Root
        items={FRUITS}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        filter="startsWith"
      >
        <FruitControl label="Choose a fruit" placeholder="Prefix match…" />
        <FruitPopup />
      </Combobox.Root>
    </Stage>
  ),
};

/**
 * A query that matches nothing leaves the popup **open** on `Combobox.Empty` — the reason
 * `Combobox.Root` defaults `allowsEmptyCollection` to `true`. Type `zzz`.
 */
export const NoMatches: Story = {
  render: () => (
    <Stage>
      <Combobox.Root items={FRUITS} itemToValue={itemToValue} itemToLabel={itemToLabel}>
        <FruitControl label="Choose a fruit" placeholder="Try “zzz”…" />
        <FruitPopup />
      </Combobox.Root>
    </Stage>
  ),
};

/**
 * Controlled on both axes — the selection *and* the text — so the two can be read side by side.
 * Enter and Tab commit the highlighted row; Escape puts the last committed label back.
 */
export const Controlled: Story = {
  render: () => {
    const [fruit, setFruit] = createSignal<Fruit | null>(FRUITS[2] ?? null);
    const [text, setText] = createSignal(FRUITS[2]?.name ?? "");

    return (
      <Stage>
        <Combobox.Root
          items={FRUITS}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          value={fruit()}
          onChange={setFruit}
          inputValue={text()}
          onInputValueChange={setText}
        >
          <FruitControl label="Choose a fruit" />
          <FruitPopup />
        </Combobox.Root>
        <p style={{ "margin-top": "1rem", "font-size": "0.875rem" }}>
          selection: <strong>{fruit()?.name ?? "none"}</strong> · text: <strong>{text()}</strong>
        </p>
      </Stage>
    );
  },
};

/**
 * `allowsCustomValue` — text matching no option survives Enter, Tab and blur instead of reverting.
 * Type something of your own and Tab away; the field keeps it, and the selection stays untouched.
 */
export const AllowsCustomValue: Story = {
  render: () => {
    const [text, setText] = createSignal("");
    return (
      <Stage>
        <Combobox.Root
          items={FRUITS}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          allowsCustomValue
          onInputValueChange={setText}
        >
          <FruitControl label="Choose or invent a fruit" placeholder="Anything goes…" />
          <FruitPopup />
        </Combobox.Root>
        <p style={{ "margin-top": "1rem", "font-size": "0.875rem" }}>
          text: <strong>{text() || "—"}</strong>
        </p>
        <button type="button" style={{ "margin-top": "0.5rem" }}>
          Tab lands here
        </button>
      </Stage>
    );
  },
};

/**
 * Grouped. `groupToItems` flattens the data for navigation, and `Combobox.List`'s callback runs once
 * per **surviving** group — its third argument is that group's **filtered** items, which is what the
 * inner `<For>` must iterate. Type `berry` and watch Citrus disappear entirely.
 */
export const Grouped: Story = {
  render: () => (
    <Stage>
      <Combobox.Root
        items={BASKETS}
        groupToItems={(basket: Basket) => basket.fruits}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
      >
        <FruitControl label="Choose a fruit" placeholder="Try “berry”…" />
        <Combobox.Portal>
          <Combobox.Positioner>
            <Combobox.Content>
              <Combobox.List>
                {(basket: Basket, index, fruits: Accessor<Fruit[]>) => (
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
    </Stage>
  ),
};

/**
 * `selectionMode="multiple"`. The input stays the **query** rather than becoming a joined list of
 * labels, and is cleared after each pick so the next search starts fresh — so the ticks in the list
 * are the only report of what is chosen, which is why `Combobox.ItemIndicator` is not optional here.
 * The popup stays open across picks.
 */
export const Multiple: Story = {
  render: () => {
    const [fruits, setFruits] = createSignal<Fruit[]>([]);
    return (
      <Stage>
        <Combobox.Root
          items={FRUITS}
          selectionMode="multiple"
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          value={fruits()}
          onChange={setFruits}
        >
          <FruitControl label="Choose fruits" placeholder="Add fruit…" />
          <FruitPopup />
        </Combobox.Root>
        <p style={{ "margin-top": "1rem", "font-size": "0.875rem" }}>
          picked: <strong>{fruits().map(itemToLabel).join(", ") || "none"}</strong>
        </p>
      </Stage>
    );
  },
};

/**
 * `menuTrigger` decides what opens the popup on its own. `"input"` (the default) opens on typing;
 * `"focus"` opens the moment the field is focused; `"manual"` waits for the chevron or an arrow key.
 * All three leave the arrows and the chevron working.
 */
export const MenuTrigger: Story = {
  render: () => (
    <Stage>
      <div style={{ display: "flex", gap: "1rem", "flex-wrap": "wrap" }}>
        <For each={["input", "focus", "manual"] as const}>
          {(trigger) => (
            <Combobox.Root
              items={FRUITS}
              itemToValue={itemToValue}
              itemToLabel={itemToLabel}
              menuTrigger={trigger}
            >
              <FruitControl label={`Fruit (${trigger})`} placeholder={trigger} />
              <FruitPopup />
            </Combobox.Root>
          )}
        </For>
      </div>
    </Stage>
  ),
};

/** The three density sizes, on both surfaces at once — control and popup scale together. */
export const Sizes: Story = {
  render: () => (
    <Stage>
      <div style={{ display: "flex", gap: "1rem", "align-items": "flex-start" }}>
        <For each={["sm", "md", "lg"] as ComboboxSize[]}>
          {(size) => (
            <Combobox.Root
              items={FRUITS}
              itemToValue={itemToValue}
              itemToLabel={itemToLabel}
              size={size}
            >
              <FruitControl label={`Fruit (${size})`} placeholder={size} />
              <FruitPopup />
            </Combobox.Root>
          )}
        </For>
      </div>
    </Stage>
  ),
};

/** Disabled — the control dims, the input is inert, and nothing opens. */
export const Disabled: Story = {
  render: () => (
    <Stage>
      <Combobox.Root items={FRUITS} itemToValue={itemToValue} itemToLabel={itemToLabel} disabled>
        <FruitControl label="Choose a fruit" />
        <FruitPopup />
      </Combobox.Root>
    </Stage>
  ),
};

/**
 * `filter={false}` — nothing is filtered here. The consumer owns the narrowing, which is the
 * async-search shape: fetch on `onInputValueChange`, hand the results back as `items`. This story
 * fakes the fetch with a synchronous prefix match, so the list narrows without the component ever
 * running a filter of its own.
 */
export const AsyncSearch: Story = {
  render: () => {
    const [results, setResults] = createSignal<Fruit[]>(FRUITS);
    const search = (query: string) => {
      setResults(
        query === ""
          ? FRUITS
          : FRUITS.filter((fruit) => fruit.name.toLowerCase().includes(query.toLowerCase())),
      );
    };

    return (
      <Stage>
        <Combobox.Root
          items={results()}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          filter={false}
          onInputValueChange={search}
        >
          <FruitControl label="Search fruit" placeholder="Server-side…" />
          <FruitPopup />
        </Combobox.Root>
      </Stage>
    );
  },
};

/**
 * `render` re-targets an element while keeping its computed props. The chevron becomes a `<div>` —
 * `nativeButton={false}` is what swaps the native button behavior for `tabIndex`/`aria-disabled` plus
 * synthesized keyboard activation. The popup ARIA, the `aria-label` and the focus-preserving
 * pointerdown all still ride on it.
 */
export const RenderProp: Story = {
  render: () => (
    <Stage>
      <Combobox.Root items={FRUITS} itemToValue={itemToValue} itemToLabel={itemToLabel}>
        <Combobox.Control>
          <Combobox.Input aria-label="Choose a fruit" placeholder="Search fruit…" />
          <Combobox.Trigger
            nativeButton={false}
            render={(props) => <div {...(props as JSX.HTMLAttributes<HTMLDivElement>)} />}
          >
            <Combobox.Icon />
          </Combobox.Trigger>
        </Combobox.Control>
        <FruitPopup />
      </Combobox.Root>
    </Stage>
  ),
};
