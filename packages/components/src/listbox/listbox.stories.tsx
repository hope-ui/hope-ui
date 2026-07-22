import type { JSX } from "@solidjs/web";
import { createSignal, For } from "solid-js";
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
 * Highlight follows the keyboard **and** the pointer (they share one active row — hover moves the
 * highlight, it never adds a second), and the check `ItemIndicator` marks the chosen row(s).
 */
const meta = {
  title: "Components/Listbox",
  component: Listbox.Root,
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
];

const itemToValue = (fruit: Fruit) => String(fruit.id);
const itemToLabel = (fruit: Fruit) => fruit.name;

// The elevated-surface look a floating consumer (Select/popover) would layer on the standalone list.
const PANEL = "rounded-lg border border-subtle bg-surface-overlay shadow-md p-1";

function FruitItem(props: { fruit: Fruit }): JSX.Element {
  return (
    <Listbox.Item value={props.fruit} disabled={props.fruit.disabled}>
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
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          value={value()}
          onChange={setValue}
        >
          <For each={FRUITS}>{(fruit) => <FruitItem fruit={fruit} />}</For>
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
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          value={value()}
          onChange={setValue}
        >
          <For each={FRUITS}>{(fruit) => <FruitItem fruit={fruit} />}</For>
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
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
      >
        <For each={FRUITS}>{(fruit) => <FruitItem fruit={fruit} />}</For>
      </Listbox.Root>
    </div>
  ),
};

/** Grouped sections with labels and a separator between them (collection mode only). */
export const Grouped: Story = {
  render: () => {
    const citrus: Fruit[] = [
      { id: 10, name: "Orange" },
      { id: 11, name: "Lemon" },
      { id: 12, name: "Lime" },
    ];
    const berries: Fruit[] = [
      { id: 20, name: "Strawberry" },
      { id: 21, name: "Blueberry" },
      { id: 22, name: "Raspberry" },
    ];
    const [value, setValue] = createSignal<Fruit[]>([berries[0] as Fruit]);
    return (
      <div style={{ padding: "2rem" }}>
        <Listbox.Root
          aria-label="Choose a fruit"
          class={PANEL}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          value={value()}
          onChange={setValue}
        >
          <Listbox.Group>
            <Listbox.GroupLabel>Citrus</Listbox.GroupLabel>
            <For each={citrus}>{(fruit) => <FruitItem fruit={fruit} />}</For>
          </Listbox.Group>
          <Listbox.Separator />
          <Listbox.Group>
            <Listbox.GroupLabel>Berries</Listbox.GroupLabel>
            <For each={berries}>{(fruit) => <FruitItem fruit={fruit} />}</For>
          </Listbox.Group>
        </Listbox.Root>
      </div>
    );
  },
};

/** A disabled row (Elderberry) is dimmed and skipped by keyboard navigation. */
export const DisabledItems: Story = {
  render: () => (
    <div style={{ padding: "2rem" }}>
      <Listbox.Root
        aria-label="Choose a fruit"
        class={PANEL}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
      >
        <For each={FRUITS}>{(fruit) => <FruitItem fruit={fruit} />}</For>
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
              itemToValue={itemToValue}
              itemToLabel={itemToLabel}
            >
              <For each={FRUITS.slice(0, 4)}>{(fruit) => <FruitItem fruit={fruit} />}</For>
            </Listbox.Root>
          </div>
        )}
      </For>
    </div>
  ),
};

/**
 * Both focus modes side by side. **Roving** (default) moves real DOM focus onto the active `<li>` and
 * makes it the single tab stop. **Activedescendant** keeps DOM focus on the `<ul>` container and points
 * `aria-activedescendant` at the active option — the model a future Select needs (focus stays on the
 * trigger/input). Tab into each and arrow through it.
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
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
        >
          <For each={FRUITS.slice(0, 4)}>{(fruit) => <FruitItem fruit={fruit} />}</For>
        </Listbox.Root>
      </div>
      <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
        <span style={{ "font-size": "0.75rem", opacity: 0.6 }}>activedescendant</span>
        <Listbox.Root
          aria-label="Activedescendant listbox"
          class={PANEL}
          focusMode="activedescendant"
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
        >
          <For each={FRUITS.slice(0, 4)}>{(fruit) => <FruitItem fruit={fruit} />}</For>
        </Listbox.Root>
      </div>
    </div>
  ),
};

/**
 * Native form submission, opt-in via `name`: the listbox renders hidden fields (siblings of the
 * `<ul>`) valued `itemToValue(item)` for each selected row, so a plain `<form>` submit carries the
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
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          value={value()}
          onChange={setValue}
        >
          <For each={FRUITS}>{(fruit) => <FruitItem fruit={fruit} />}</For>
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
