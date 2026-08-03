import type { JSX } from "@solidjs/web";
import { type Accessor, createSignal, For, Show } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Select, type SelectSize } from ".";

/**
 * `Select` is the trigger plus the popup, and nothing else — no `Label` part, no description, no field
 * chrome. So **every tree here names its trigger** with `aria-label` or an `aria-labelledby` pointing
 * at the consumer's own `<label>`: a nameless `role="combobox"` is an axe `aria-input-field-name`
 * violation, and the `role="listbox"` popup inherits its name from the trigger.
 *
 * **Options are data.** `Select.Root` takes the whole option set as `items`; `Select.List` iterates it
 * and its render-callback child builds one row per entry. Nothing renders until the popup opens, which
 * is what lets a *closed* Select run typeahead, refuse to open an empty list, and server-render every
 * `<option>` for browser autofill.
 *
 * DOM focus never leaves the trigger — the ARIA authoring-practices combobox pattern — so the
 * highlight is `aria-activedescendant` plus the row's `data-active`, never a focused option.
 */
const meta = {
  title: "Components/Select",
  component: Select.Root,
  // `items` is required, so Storybook's story type demands `args`. Every story renders its own tree,
  // so this only exists to satisfy that.
  args: { items: [] },
} satisfies Meta<typeof Select.Root>;

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
  // Accented on purpose: typing its plain-ASCII prefix ("acai") exercises the collator-backed
  // typeahead, which folds diacritics as well as case — `toLowerCase()` folds only case.
  { id: 7, name: "Açaí" },
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

/** Room below the trigger so the popup has somewhere to land without flipping. */
function Stage(props: { children: JSX.Element }): JSX.Element {
  return <div style={{ padding: "2rem", "min-height": "22rem" }}>{props.children}</div>;
}

function FruitItem(props: { fruit: Fruit }): JSX.Element {
  return (
    <Select.Item item={props.fruit}>
      <Select.ItemText>{props.fruit.name}</Select.ItemText>
      <Select.ItemIndicator />
    </Select.Item>
  );
}

/** The trigger → popup spine every story repeats, so each one shows only what it is about. */
function FruitPopup(): JSX.Element {
  return (
    <Select.Portal>
      <Select.Positioner>
        <Select.Content>
          <Select.List>{(fruit: Fruit) => <FruitItem fruit={fruit} />}</Select.List>
        </Select.Content>
      </Select.Positioner>
    </Select.Portal>
  );
}

/** The default — single selection, uncontrolled, placeholder until something is picked. */
export const Default: Story = {
  render: () => (
    <Stage>
      <Select.Root
        items={FRUITS}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        isItemDisabled={isItemDisabled}
      >
        <Select.Trigger aria-label="Choose a fruit">
          <Select.Value placeholder="Pick a fruit" />
          <Select.Icon />
        </Select.Trigger>
        <FruitPopup />
      </Select.Root>
    </Stage>
  ),
};

/**
 * Controlled: `value` + `onChange` in the consumer's own signal. The value is a **scalar** in single
 * mode — a single Select never hands back `[apple]`.
 */
export const Controlled: Story = {
  render: () => {
    const [fruit, setFruit] = createSignal<Fruit | null>(FRUITS[2] as Fruit);
    return (
      <Stage>
        <Select.Root
          items={FRUITS}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          isItemDisabled={isItemDisabled}
          value={fruit()}
          onChange={setFruit}
        >
          <Select.Trigger aria-label="Choose a fruit">
            <Select.Value placeholder="Pick a fruit" />
            <Select.Icon />
          </Select.Trigger>
          <FruitPopup />
        </Select.Root>
        <p style={{ "margin-block-start": "1rem" }}>
          Selected: <strong>{fruit()?.name ?? "nothing"}</strong>
        </p>
      </Stage>
    );
  },
};

/**
 * A consumer's own `<label>`, wired with `aria-labelledby`. This is the labelling story — Select ships
 * no `Label` part, and the trigger's accessible name is mandatory.
 */
export const WithExternalLabel: Story = {
  render: () => (
    <Stage>
      <label id="fruit-label" for="fruit-trigger" style={{ display: "block" }}>
        Favourite fruit
      </label>
      <Select.Root items={FRUITS} itemToValue={itemToValue} itemToLabel={itemToLabel}>
        <Select.Trigger id="fruit-trigger" aria-labelledby="fruit-label">
          <Select.Value placeholder="Pick a fruit" />
          <Select.Icon />
        </Select.Trigger>
        <FruitPopup />
      </Select.Root>
    </Stage>
  ),
};

/**
 * `selectionMode="multiple"`: the value is an **array**, the popup stays open while ticking, and
 * `Select.Value`'s render callback summarizes the selection instead of joining every label.
 */
export const Multiple: Story = {
  render: () => {
    const [fruits, setFruits] = createSignal<Fruit[]>([FRUITS[0] as Fruit, FRUITS[3] as Fruit]);
    return (
      <Stage>
        <Select.Root
          items={FRUITS}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          isItemDisabled={isItemDisabled}
          selectionMode="multiple"
          value={fruits()}
          onChange={setFruits}
        >
          <Select.Trigger aria-label="Choose fruits">
            <Select.Value placeholder="Any fruit">
              {(values: Fruit[]) =>
                values.length === 1 ? (values[0] as Fruit).name : `${values.length} fruits selected`
              }
            </Select.Value>
            <Select.Icon />
          </Select.Trigger>
          <FruitPopup />
        </Select.Root>
      </Stage>
    );
  },
};

/**
 * Grouped data, straight from an API shape: `groupToItems` flattens `items` into navigation order and
 * switches `Select.List`'s callback from per-item to **per group**. You iterate that group's own items
 * with a plain `<For>` — possible only because each `Select.Item` resolves its own row from its
 * `item`, so nesting depth is irrelevant.
 *
 * Arrow keys still traverse the flattened order, straight across the group boundary.
 */
export const Grouped: Story = {
  render: () => (
    <Stage>
      <Select.Root
        items={BASKETS}
        groupToItems={(basket) => basket.fruits}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
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
    </Stage>
  ),
};

/** The density axis — `size` scales the trigger and the popup's rows together. */
export const Sizes: Story = {
  render: () => (
    <Stage>
      <div style={{ display: "flex", "align-items": "flex-start", gap: "1rem" }}>
        <For each={["sm", "md", "lg"] as SelectSize[]}>
          {(size) => (
            <Select.Root
              items={FRUITS}
              itemToValue={itemToValue}
              itemToLabel={itemToLabel}
              size={size}
              defaultValue={FRUITS[1] as Fruit}
            >
              <Select.Trigger aria-label={`Choose a fruit (${size})`}>
                <Select.Value placeholder="Pick a fruit" />
                <Select.Icon />
              </Select.Trigger>
              <FruitPopup />
            </Select.Root>
          )}
        </For>
      </div>
    </Stage>
  ),
};

/**
 * A long option set: the popup caps itself at the measured `--available-height` and the list scrolls
 * inside the card, so the rounded corners and the border stay still while the rows move. Arrowing past
 * the fold scrolls the highlighted row into view — nothing else would, since no option ever takes DOM
 * focus.
 */
export const LongList: Story = {
  render: () => {
    const years = Array.from({ length: 60 }, (_, index) => String(2026 - index));
    const [year, setYear] = createSignal<string | null>(null);
    return (
      <Stage>
        <Select.Root items={years} value={year()} onChange={setYear}>
          <Select.Trigger aria-label="Year">
            <Select.Value placeholder="Pick a year" />
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Content>
                <Select.List>
                  {(year: string) => (
                    <Select.Item item={year}>
                      <Select.ItemText>{year}</Select.ItemText>
                      <Select.ItemIndicator />
                    </Select.Item>
                  )}
                </Select.List>
              </Select.Content>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </Stage>
    );
  },
};

/** The whole control disabled — one prop, reflected on the trigger and on the hidden native field. */
export const Disabled: Story = {
  render: () => (
    <Stage>
      <Select.Root
        items={FRUITS}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        defaultValue={FRUITS[0] as Fruit}
        disabled
      >
        <Select.Trigger aria-label="Choose a fruit">
          <Select.Value placeholder="Pick a fruit" />
          <Select.Icon />
        </Select.Trigger>
        <FruitPopup />
      </Select.Root>
    </Stage>
  ),
};

/**
 * Native form submission. `name` renders a clipped but real `<select>` carrying every `<option>`, so
 * the form submits `itemToValue(fruit)`, browser autofill has the whole set to match against,
 * `required` genuinely blocks an empty submit (and moves focus here), and a native `reset` restores
 * the default. Submit empty to see the browser's own validation bubble.
 */
export const InAForm: Story = {
  render: () => {
    const [submitted, setSubmitted] = createSignal<string | null>(null);
    return (
      <Stage>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(String(new FormData(event.currentTarget).get("fruit") ?? ""));
          }}
          style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}
        >
          <Select.Root
            items={FRUITS}
            itemToValue={itemToValue}
            itemToLabel={itemToLabel}
            isItemDisabled={isItemDisabled}
            name="fruit"
            required
          >
            <Select.Trigger aria-label="Choose a fruit">
              <Select.Value placeholder="Pick a fruit" />
              <Select.Icon />
            </Select.Trigger>
            <FruitPopup />
          </Select.Root>
          <button type="submit">Submit</button>
          <button type="reset">Reset</button>
        </form>
        <p style={{ "margin-block-start": "1rem" }}>
          Submitted value: <strong>{submitted() ?? "—"}</strong>
        </p>
      </Stage>
    );
  },
};

/**
 * `render` re-targets a part without losing anything: the computed props (the `role="combobox"`, the
 * ARIA and the whole keymap) and the internal ref both ride through. The ref is load-bearing here —
 * the popup is positioned against the trigger, and the trigger is the one element spared from being
 * made un-clickable while open — so a target that dropped function refs would break both, silently.
 */
export const PolymorphicTrigger: Story = {
  render: () => (
    <Stage>
      <Select.Root items={FRUITS} itemToValue={itemToValue} itemToLabel={itemToLabel}>
        <Select.Trigger
          aria-label="Choose a fruit"
          render={(props) => <button {...props} data-custom-trigger="" />}
        >
          <Select.Value placeholder="Pick a fruit" />
          <Select.Icon />
        </Select.Trigger>
        <FruitPopup />
      </Select.Root>
    </Stage>
  ),
};

/**
 * Per-instance styling through the two escape hatches: `slotClasses` reaches every part from the root,
 * a part's own `class` folds in last through the recipe's tailwind-merge seam.
 */
export const CustomStyling: Story = {
  render: () => (
    <Stage>
      <Select.Root
        items={FRUITS}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        slotClasses={{ content: "shadow-2xl", item: "font-mono" }}
      >
        <Select.Trigger aria-label="Choose a fruit" class="font-mono">
          <Select.Value placeholder="Pick a fruit" />
          <Select.Icon />
        </Select.Trigger>
        <FruitPopup />
      </Select.Root>
    </Stage>
  ),
};

/**
 * Two Selects side by side, one inside a scrolling, `overflow: hidden` box. The popup is portaled, so
 * it escapes the clipping ancestor rather than being cut off by it — and `flip` moves it above the
 * trigger when there is no room below.
 */
export const InsideAScrollContainer: Story = {
  render: () => (
    <Stage>
      <div
        style={{
          height: "10rem",
          overflow: "auto",
          border: "1px solid var(--color-subtle)",
          "border-radius": "0.5rem",
          padding: "0.75rem",
        }}
      >
        <p style={{ "margin-block-end": "6rem" }}>Scroll me.</p>
        <Select.Root items={FRUITS} itemToValue={itemToValue} itemToLabel={itemToLabel}>
          <Select.Trigger aria-label="Choose a fruit">
            <Select.Value placeholder="Pick a fruit" />
            <Select.Icon />
          </Select.Trigger>
          <FruitPopup />
        </Select.Root>
        <p style={{ "margin-block-start": "6rem" }}>Bottom.</p>
      </div>
    </Stage>
  ),
};
