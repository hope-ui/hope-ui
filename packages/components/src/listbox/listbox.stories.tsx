import { I18nProvider } from "@hope-ui/i18n";
import { createListbox, createListboxItem } from "@hope-ui/primitives/listbox";
import { composeEventHandlers, createKeyboardHandler } from "@hope-ui/primitives/utils";
import { useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Accessor, createSignal, For, Show } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Listbox, type ListboxSize } from ".";

/**
 * `Listbox` ships its own visual identity (the hope `listbox` recipe), so these stories use the parts
 * as a consumer would. The recipe's `root` slot is deliberately **chrome-free** (a standalone list
 * sits in the page flow), so — to match the shadcn floating-panel reference — the stories add the
 * elevated surface (border, background, shadow, rounded corners, padding) themselves via a `class`
 * override on `Listbox.Root`, exactly as a `Select`/popover consumer would. The global `withHopeTheme`
 * decorator (`.storybook/preview.tsx`) provides the preset; Storybook's Tailwind build compiles the
 * recipe utilities.
 *
 * **Options are data.** `Listbox.Root` takes the whole option set as `items` and a **render callback**
 * child invoked once per entry — the single authoring mode. Nothing self-registers, which is what
 * lets a future Select know its options while its popup is closed.
 *
 * Highlight follows the keyboard **and** the pointer (they share one active row — hover moves the
 * highlight, it never adds a second), and the check `ItemIndicator` marks the chosen row(s).
 */
const meta = {
  title: "Components/Listbox",
  component: Listbox.Root,
  // `items` is a required prop, so Storybook's story type demands `args`. Every story below renders
  // its own tree, so this is only here to satisfy that requirement.
  args: { items: [] },
} satisfies Meta<typeof Listbox.Root>;

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
  // Accented, so typing its plain-ASCII prefix ("acai") in the external-focus-owner story below
  // exercises the collator-backed typeahead this step added — `toLowerCase().startsWith()` alone
  // could never match this.
  { id: 7, name: "Açaí" },
];

const itemToValue = (fruit: Fruit) => String(fruit.id);
const itemToLabel = (fruit: Fruit) => fruit.name;
const isItemDisabled = (fruit: Fruit) => fruit.disabled ?? false;

// The elevated-surface look a floating consumer (Select/popover) would layer on the standalone list.
const PANEL = "rounded-lg border border-subtle bg-surface-overlay shadow-md p-1";

function FruitItem(props: { fruit: Fruit }): JSX.Element {
  return (
    <Listbox.Item item={props.fruit}>
      <Listbox.ItemIndicator />
      {props.fruit.name}
    </Listbox.Item>
  );
}

/** The default — single selection, roving focus, an elevated panel. */
export const Default: Story = {
  render: () => {
    const [value, setValue] = createSignal<Fruit[]>([FRUITS[2] as Fruit]);
    return (
      <div style={{ padding: "2rem" }}>
        <Listbox.Root
          aria-label="Choose a fruit"
          class={PANEL}
          items={FRUITS}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          isItemDisabled={isItemDisabled}
          value={value()}
          onChange={setValue}
        >
          {(fruit) => <FruitItem fruit={fruit} />}
        </Listbox.Root>
      </div>
    );
  },
};

/** `selectionMode="multiple"` — Space/click toggles a set; every chosen row keeps its check glyph. */
export const Multiple: Story = {
  name: "selectionMode='multiple'",
  render: () => {
    const [value, setValue] = createSignal<Fruit[]>([FRUITS[0] as Fruit, FRUITS[3] as Fruit]);
    return (
      <div style={{ padding: "2rem" }}>
        <Listbox.Root
          aria-label="Choose fruits"
          class={PANEL}
          selectionMode="multiple"
          items={FRUITS}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          isItemDisabled={isItemDisabled}
          value={value()}
          onChange={setValue}
        >
          {(fruit) => <FruitItem fruit={fruit} />}
        </Listbox.Root>
      </div>
    );
  },
};

/** `selectionMode="none"` — a browsing list: arrows/typeahead move the highlight, nothing selects. */
export const None: Story = {
  name: "selectionMode='none'",
  render: () => (
    <div style={{ padding: "2rem" }}>
      <Listbox.Root
        aria-label="Browse fruits"
        class={PANEL}
        selectionMode="none"
        items={FRUITS}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        isItemDisabled={isItemDisabled}
      >
        {(fruit) => <FruitItem fruit={fruit} />}
      </Listbox.Root>
    </div>
  ),
};

interface Basket {
  kind: string;
  fruits: Fruit[];
}

const BASKETS: Basket[] = [
  {
    kind: "Citrus",
    fruits: [
      { id: 10, name: "Orange" },
      { id: 11, name: "Lemon" },
      { id: 12, name: "Lime" },
    ],
  },
  {
    kind: "Berries",
    fruits: [
      { id: 20, name: "Strawberry" },
      { id: 21, name: "Blueberry" },
      { id: 22, name: "Raspberry" },
    ],
  },
];

/**
 * Grouped sections with labels and a separator between them. `items` holds the **group entries** and
 * `groupToItems` flattens them into navigation order — the only thing the kernel needs from a group,
 * since the label is rendered from the consumer's own key. The callback then goes one level up: it is
 * invoked per group, and the group's own items are a plain `<For>`. Each `Listbox.Item` still resolves
 * its own row from its `item`, so nesting depth is irrelevant to arrow keys and typeahead.
 */
export const Grouped: Story = {
  render: () => {
    const [value, setValue] = createSignal<Fruit[]>([BASKETS[1]?.fruits[0] as Fruit]);
    return (
      <div style={{ padding: "2rem" }}>
        <Listbox.Root
          aria-label="Choose a fruit"
          class={PANEL}
          items={BASKETS}
          groupToItems={(basket) => basket.fruits}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          value={value()}
          onChange={setValue}
        >
          {(basket, index) => (
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
      </div>
    );
  },
};

/** A disabled row (Elderberry) is dimmed and skipped by keyboard navigation. Disabledness is a data
 *  question now — `isItemDisabled` on the root — so it is known before a row ever mounts. */
export const DisabledItems: Story = {
  render: () => (
    <div style={{ padding: "2rem" }}>
      <Listbox.Root
        aria-label="Choose a fruit"
        class={PANEL}
        items={FRUITS}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        isItemDisabled={isItemDisabled}
      >
        {(fruit) => <FruitItem fruit={fruit} />}
      </Listbox.Root>
    </div>
  ),
};

const SIZES: ListboxSize[] = ["sm", "md", "lg"];

/** The `size` density scale — `sm`/`md`(default)/`lg` scale the row text, padding, gap, and min width. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", "align-items": "flex-start", padding: "2rem" }}>
      <For each={SIZES}>
        {(size) => (
          <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
            <span style={{ "font-size": "0.75rem", opacity: 0.6 }}>{size}</span>
            <Listbox.Root
              aria-label={`Choose a fruit (${size})`}
              class={PANEL}
              size={size}
              items={FRUITS.slice(0, 4)}
              itemToValue={itemToValue}
              itemToLabel={itemToLabel}
            >
              {(fruit) => <FruitItem fruit={fruit} />}
            </Listbox.Root>
          </div>
        )}
      </For>
    </div>
  ),
};

/**
 * Both focus modes side by side. **Roving** (default) moves real DOM focus onto the active option and
 * makes it the single tab stop. **Activedescendant** keeps DOM focus on the listbox container and points
 * `aria-activedescendant` at the active option. Tab into each and arrow through it. The focus owner
 * still lives *inside* the component here — see "external focus owner" below for the Select shape.
 */
export const FocusModes: Story = {
  name: "focus modes (roving vs activedescendant)",
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", "align-items": "flex-start", padding: "2rem" }}>
      <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
        <span style={{ "font-size": "0.75rem", opacity: 0.6 }}>roving</span>
        <Listbox.Root
          aria-label="Roving listbox"
          class={PANEL}
          focusMode="roving"
          items={FRUITS.slice(0, 4)}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
        >
          {(fruit) => <FruitItem fruit={fruit} />}
        </Listbox.Root>
      </div>
      <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
        <span style={{ "font-size": "0.75rem", opacity: 0.6 }}>activedescendant</span>
        <Listbox.Root
          aria-label="Activedescendant listbox"
          class={PANEL}
          focusMode="activedescendant"
          items={FRUITS.slice(0, 4)}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
        >
          {(fruit) => <FruitItem fruit={fruit} />}
        </Listbox.Root>
      </div>
    </div>
  ),
};

/**
 * **The Select shape, before Select exists.** DOM focus lives on an `<input role="combobox">` outside
 * the list; the list is a passive `role="listbox"` container that no option ever focuses. The input
 * carries `aria-activedescendant`, and `navigation.onKeyDown` + `typeahead.onKeyDown` are composed
 * onto it — proof that `createListbox`'s pieces bind to an owner outside the widget, which is the
 * whole premise of the combobox kernel.
 *
 * It is written against `@hope-ui/primitives/listbox` rather than `Listbox.Root`, because `Root`
 * binds `rootProps` (the container `tabindex`, its own `onKeyDown`, its own `aria-activedescendant`)
 * onto its own element — exactly what a Select must *not* do. The recipe classes are read straight
 * off `useSlots`, so the look is the real one. `Select` is the component layer for this shape.
 *
 * Two things to try: arrow past the bottom of the panel (the active row scrolls itself into view —
 * nothing moves DOM focus, so the list would otherwise leave it offscreen), and type `f` to jump to
 * Fig. Enter selects; that keymap is the one piece an external owner has to bring, and the kernel
 * will own it.
 */
export const ExternalFocusOwner: Story = {
  name: "external focus owner (the Select shape)",
  render: () => (
    <div style={{ padding: "2rem" }}>
      <SelectShape />
    </div>
  ),
};

function SelectShape(): JSX.Element {
  const [value, setValue] = createSignal<Fruit[]>([]);

  const slots = useSlots({
    recipe: "listbox",
    variantsProps: () => ({ size: "md" as const }),
  });

  const state = createListbox<Fruit>({
    items: FRUITS,
    itemToValue,
    itemToLabel,
    isItemDisabled,
    focusMode: "activedescendant",
    get value() {
      return value();
    },
    onChange: setValue,
  });

  // `createListbox`'s selection keymap is local to `rootProps`, which a Select never spreads — so an
  // external owner rebuilds it from `selection.selectActive()`. Three lines here; the combobox kernel
  // owns it for real (and adds Space, Escape, and open/close).
  const selectKeys = createKeyboardHandler<HTMLInputElement>().on("Enter", (event) => {
    event.preventDefault();
    state.selection.selectActive();
  });

  return (
    <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem", width: "14rem" }}>
      <input
        role="combobox"
        aria-expanded="true"
        aria-controls={state.id()}
        aria-activedescendant={state.focus.activeDescendant()}
        aria-label="Choose a fruit"
        readonly
        placeholder="Arrow, or type a letter…"
        value={value()[0]?.name ?? ""}
        class="w-full rounded-md border border-subtle bg-surface px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus-halo"
        onFocus={() => state.focus.setFocused(true)}
        onBlur={() => state.focus.setFocused(false)}
        onKeyDown={composeEventHandlers(
          selectKeys.onKeyDown,
          state.navigation.onKeyDown,
          state.typeahead.onKeyDown,
        )}
      />
      <div
        ref={(element) => state.setListboxElement(element)}
        id={state.id()}
        role="listbox"
        aria-label="Fruits"
        class={slots.root(`${PANEL} max-h-32`)}
      >
        <For each={FRUITS}>
          {(fruit) => {
            const [ref, setRef] = createSignal<HTMLDivElement>();
            const item = createListboxItem<Fruit>(state, { ref, item: fruit });
            return (
              <div ref={setRef} {...item.props} class={slots.item()}>
                {fruit.name}
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
}

/**
 * Native form submission, opt-in via `name`: the listbox renders hidden fields (siblings of the
 * list element) valued `itemToValue(item)` for each selected row, so a plain `<form>` submit carries the
 * selection. Submit and watch the captured `FormData` render below.
 */
export const FormSubmission: Story = {
  name: "native form submission (name)",
  render: () => {
    const [submitted, setSubmitted] = createSignal<string[] | null>(null);
    const [value, setValue] = createSignal<Fruit[]>([FRUITS[1] as Fruit]);
    return (
      <form
        style={{ display: "flex", "flex-direction": "column", gap: "1rem", padding: "2rem" }}
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(new FormData(event.currentTarget).getAll("fruit").map(String));
        }}
      >
        <Listbox.Root
          aria-label="Choose fruits"
          class={PANEL}
          selectionMode="multiple"
          name="fruit"
          items={FRUITS}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          isItemDisabled={isItemDisabled}
          value={value()}
          onChange={setValue}
        >
          {(fruit) => <FruitItem fruit={fruit} />}
        </Listbox.Root>
        <button type="submit" style={{ "align-self": "flex-start" }}>
          Submit
        </button>
        <output style={{ "font-size": "0.875rem" }}>
          {submitted() ? `Submitted fruit=[${submitted()?.join(", ")}]` : "Not submitted yet"}
        </output>
      </form>
    );
  },
};

// The viewport a scrolling list needs: a fixed height + the recipe's own `overflow-y-auto`, plus the
// elevated `PANEL` chrome. Virtual rows are 32px, matching the `estimateSize` below.
const VIRTUAL_PANEL = `${PANEL} h-72 w-56`;

function makeRows(count: number): Fruit[] {
  return Array.from({ length: count }, (_, index) => ({ id: index, name: `Item ${index}` }));
}

/**
 * **Virtualization** — add `estimateSize` and the same callback child becomes per **windowed row**,
 * returning a `<Listbox.Item index={index}>` (a recycled row's position is the only thing it knows,
 * so it is told rather than resolving its own). The list element becomes the scroll container; only a
 * window of rows mounts, so 10,000 rows scroll and navigate smoothly (try End, or type to jump). The
 * same `createListbox` state drives selection/focus/typeahead over the **full** set. Flat lists only —
 * no groups in virtual mode.
 *
 * The virtual path requires the consumer to install `@tanstack/virtual-core` (an **optional** peer of
 * `@hope-ui/primitives`, so a non-virtualizing install stays dependency-free).
 */
export const VirtualLargeList: Story = {
  name: "virtual (10k rows)",
  render: () => {
    const items = makeRows(10_000);
    const [value, setValue] = createSignal<Fruit[]>([items[42] as Fruit]);
    return (
      <div style={{ padding: "2rem" }}>
        <Listbox.Root
          aria-label="Ten thousand rows"
          class={VIRTUAL_PANEL}
          items={items}
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
      </div>
    );
  },
};

/** Virtual mode with `selectionMode="multiple"` — every chosen row keeps its check glyph, and the
 *  selection persists across scrolling (it lives on the full-set state, not the mounted window). */
export const VirtualMultiple: Story = {
  name: "virtual multi-select",
  render: () => {
    const items = makeRows(2_000);
    const [value, setValue] = createSignal<Fruit[]>([items[1] as Fruit, items[5] as Fruit]);
    return (
      <div style={{ padding: "2rem" }}>
        <Listbox.Root
          aria-label="Choose rows"
          class={VIRTUAL_PANEL}
          selectionMode="multiple"
          items={items}
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
      </div>
    );
  },
};

/**
 * Reading direction, and the two channels it arrives on. **Left:** a `dir` prop, the per-instance
 * instruction — it reaches the element, so the check gutter mirrors to the left edge. **Right:** an
 * ancestor `dir="rtl"` box with the listbox told nothing at all — it writes no `dir` and inherits,
 * which is the case only a story makes visible, and the one a locale-derived DOM write would break.
 *
 * Neither list warns: both are vertical, where Up/Down means direction cannot change navigation. Make
 * one `orientation="horizontal"` with a locale but no `dir` and the dev console names the split.
 */
export const ReadingDirection: Story = {
  name: "reading direction (prop vs inherited)",
  render: () => {
    const [declared, setDeclared] = createSignal<Fruit[]>([FRUITS[2] as Fruit]);
    const [inherited, setInherited] = createSignal<Fruit[]>([FRUITS[2] as Fruit]);
    return (
      <div style={{ display: "flex", gap: "2rem", padding: "2rem", "align-items": "flex-start" }}>
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
          <span style={{ "font-size": "0.75rem" }}>dir="rtl" on Listbox.Root</span>
          <I18nProvider locale="ar-EG">
            <Listbox.Root
              aria-label="اختر فاكهة"
              class={PANEL}
              dir="rtl"
              items={FRUITS}
              itemToValue={itemToValue}
              itemToLabel={itemToLabel}
              isItemDisabled={isItemDisabled}
              value={declared()}
              onChange={setDeclared}
            >
              {(fruit) => <FruitItem fruit={fruit} />}
            </Listbox.Root>
          </I18nProvider>
        </div>

        <div dir="rtl" style={{ display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
          <span style={{ "font-size": "0.75rem" }}>inherited from a dir="rtl" ancestor</span>
          <Listbox.Root
            aria-label="Choose a fruit"
            class={PANEL}
            items={FRUITS}
            itemToValue={itemToValue}
            itemToLabel={itemToLabel}
            isItemDisabled={isItemDisabled}
            value={inherited()}
            onChange={setInherited}
          >
            {(fruit) => <FruitItem fruit={fruit} />}
          </Listbox.Root>
        </div>
      </div>
    );
  },
};
