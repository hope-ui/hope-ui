import ssrFixture from "virtual:hydration-fixture?id=listbox";
import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { For } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Listbox } from "../index";
import { Tree } from "./listbox.ssr-entry";

// The `hope` preset supplies the `listbox` recipe, so every mounted tree sits under a
// `<ThemeProvider>`. It is a zero-DOM provider (its token values live in CSS).
function Themed(props: { children: JSX.Element }): JSX.Element {
  return <ThemeProvider preset={hope}>{props.children}</ThemeProvider>;
}

interface Fruit {
  id: number;
  name: string;
}

const FRUITS: Fruit[] = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
  { id: 4, name: "Date" },
];

const itemToValue = (fruit: Fruit) => String(fruit.id);
const itemToLabel = (fruit: Fruit) => fruit.name;

const modKey = /mac|iphone|ipad/i.test(navigator.platform) ? "Meta" : "Control";

// ─── Queries ────────────────────────────────────────────────────────────────────────────────────

/** Array access that asserts presence. */
function nth<T>(list: ArrayLike<T>, index: number): T {
  const value = list[index];
  if (value == null) {
    throw new Error(`no element at index ${index}`);
  }
  return value;
}
function listbox(container: HTMLElement): HTMLElement {
  return container.querySelector('[role="listbox"]') as HTMLElement;
}
function options(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[role="option"]')];
}
function tabindexes(container: HTMLElement): string[] {
  return options(container).map((element) => element.getAttribute("tabindex") ?? "");
}
function activeValues(container: HTMLElement): string[] {
  return options(container)
    .filter((element) => element.hasAttribute("data-active"))
    .map((element) => element.dataset.value as string);
}
function selectedValues(container: HTMLElement): string[] {
  return options(container)
    .filter((element) => element.getAttribute("aria-selected") === "true")
    .map((element) => element.dataset.value as string);
}

/** Dispatch a real `pointermove` at explicit client coords — the fight-guard reads clientX/clientY. */
function pointerMoveAt(element: HTMLElement, x: number, y: number): void {
  element.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: y, bubbles: true }));
}

// ─── Harnesses ──────────────────────────────────────────────────────────────────────────────────

interface FruitListboxProps {
  selectionMode?: "single" | "multiple" | "none";
  focusMode?: "roving" | "activedescendant";
  disabledOf?: (fruit: Fruit) => boolean;
  name?: string;
  onChange?: (value: Fruit[]) => void;
}

function FruitListbox(props: FruitListboxProps): JSX.Element {
  return (
    <Themed>
      <Listbox.Root
        aria-label="fruits"
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        selectionMode={props.selectionMode}
        focusMode={props.focusMode}
        name={props.name}
        onChange={props.onChange}
      >
        <For each={FRUITS}>
          {(fruit) => (
            <Listbox.Item
              value={fruit}
              data-value={fruit.name}
              disabled={props.disabledOf?.(fruit)}
            >
              <Listbox.ItemIndicator />
              {fruit.name}
            </Listbox.Item>
          )}
        </For>
      </Listbox.Root>
    </Themed>
  );
}

// ─── Roles & ARIA ───────────────────────────────────────────────────────────────────────────────

describe("Listbox — roles & ARIA", () => {
  it("emits role=listbox named by aria-label, role=option rows, and vertical orientation", async () => {
    const { container, dispose } = mount(() => <FruitListbox />);
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    const list = listbox(container);
    expect(list.getAttribute("role")).toBe("listbox");
    expect(list.getAttribute("aria-label")).toBe("fruits");
    expect(list.getAttribute("aria-orientation")).toBe("vertical");
    expect(list.hasAttribute("aria-multiselectable")).toBe(false);
    expect(list.getAttribute("data-slot")).toBe("listbox");
    for (const option of options(container)) {
      expect(option.getAttribute("role")).toBe("option");
      expect(option.getAttribute("data-slot")).toBe("listbox-item");
    }
    await expectNoA11yViolations(container);
    dispose();
  });

  it("marks aria-multiselectable in multiple mode", async () => {
    const { container, dispose } = mount(() => <FruitListbox selectionMode="multiple" />);
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));
    expect(listbox(container).getAttribute("aria-multiselectable")).toBe("true");
    await expectNoA11yViolations(container);
    dispose();
  });
});

// ─── Roving focus mode (standalone default) ─────────────────────────────────────────────────────

describe("Listbox — roving focus mode", () => {
  it("makes the first item the tab stop, the container untabbable, and no aria-activedescendant", async () => {
    const { container, dispose } = mount(() => <FruitListbox />);
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    expect(tabindexes(container)).toEqual(["0", "-1", "-1", "-1"]);
    expect(listbox(container).getAttribute("tabindex")).toBe("-1");
    expect(listbox(container).hasAttribute("aria-activedescendant")).toBe(false);
    await expectNoA11yViolations(container);
    dispose();
  });

  it("moves real DOM focus with ArrowDown", async () => {
    const { container, dispose } = mount(() => <FruitListbox />);
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    // Click the first row to enter the list (focus + active on Apple), then arrow down.
    await userEvent.click(nth(options(container), 0));
    await expect.element(nth(options(container), 0)).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    await expect.element(nth(options(container), 1)).toHaveFocus();
    expect(activeValues(container)).toEqual(["Banana"]);
    // The tab stop follows the active item.
    expect(tabindexes(container)).toEqual(["-1", "0", "-1", "-1"]);
    dispose();
  });

  it("jumps to the ends with Home/End", async () => {
    const { container, dispose } = mount(() => <FruitListbox />);
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    await userEvent.click(nth(options(container), 1)); // enter at Banana
    await userEvent.keyboard("{End}");
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Date"]));

    await userEvent.keyboard("{Home}");
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Apple"]));
    dispose();
  });
});

// ─── Activedescendant focus mode ────────────────────────────────────────────────────────────────

describe("Listbox — activedescendant focus mode", () => {
  it("keeps the container tabbable + owns aria-activedescendant (at a mounted option), items untabbable", async () => {
    const { container, dispose } = mount(() => <FruitListbox focusMode="activedescendant" />);
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    const list = listbox(container);
    expect(list.getAttribute("tabindex")).toBe("0");
    expect(tabindexes(container)).toEqual(["-1", "-1", "-1", "-1"]);

    // Focus the container (the focus owner in AD mode) and arrow down.
    list.focus();
    await expect.element(list).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");

    await vi.waitFor(() => {
      const activeId = list.getAttribute("aria-activedescendant");
      expect(activeId).toBeTruthy();
      // The IDREF must resolve to a *mounted* option — never a dangling reference.
      const active = container.querySelector(`[id="${activeId}"]`);
      expect(active).not.toBeNull();
      expect(active?.getAttribute("role")).toBe("option");
    });
    // Focus never leaves the container; no option is ever DOM-focused in AD mode.
    await expect.element(list).toHaveFocus();
    for (const option of options(container)) {
      expect(option).not.toHaveFocus();
    }
    await expectNoA11yViolations(container);
    dispose();
  });
});

// ─── Selection ──────────────────────────────────────────────────────────────────────────────────

describe("Listbox — selection", () => {
  it("single: clicking selects one row; Enter on the active row replaces the prior selection", async () => {
    const changes: Fruit[][] = [];
    const { container, dispose } = mount(() => (
      <FruitListbox onChange={(value) => changes.push(value)} />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    await userEvent.click(nth(options(container), 1)); // Banana
    await vi.waitFor(() => expect(selectedValues(container)).toEqual(["Banana"]));

    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}"); // → Date
    await vi.waitFor(() => expect(selectedValues(container)).toEqual(["Date"]));
    // Single mode replaced, never accumulated.
    expect(selectedValues(container)).toHaveLength(1);
    // `onChange` reported the value objects; their `itemToValue` string is the submitted "4".
    expect(changes.at(-1)?.map(itemToValue)).toEqual(["4"]);
    await expectNoA11yViolations(container);
    dispose();
  });

  it("single: the selected row shows the ItemIndicator check glyph", async () => {
    const { container, dispose } = mount(() => <FruitListbox />);
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    expect(container.querySelector('[data-slot="listbox-item-indicator"]')).toBeNull();
    await userEvent.click(nth(options(container), 2)); // Cherry
    await vi.waitFor(() => {
      const indicators = container.querySelectorAll('[data-slot="listbox-item-indicator"]');
      expect(indicators).toHaveLength(1);
      // The indicator is inside the selected row and carries the built-in svg glyph.
      expect(
        nth(options(container), 2).querySelector('[data-slot="listbox-item-indicator"] svg'),
      ).not.toBeNull();
    });
    dispose();
  });

  it("multiple: Space toggles a set, mod+A selects all", async () => {
    const { container, dispose } = mount(() => <FruitListbox selectionMode="multiple" />);
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    await userEvent.click(nth(options(container), 0)); // Apple on (click toggles in multiple mode)
    await userEvent.keyboard("{ArrowDown}{ArrowDown} "); // Cherry on
    await vi.waitFor(() => expect(selectedValues(container).sort()).toEqual(["Apple", "Cherry"]));

    await userEvent.keyboard(`{${modKey}>}a{/${modKey}}`);
    await vi.waitFor(() =>
      expect(selectedValues(container).sort()).toEqual(["Apple", "Banana", "Cherry", "Date"]),
    );
    await expectNoA11yViolations(container);
    dispose();
  });

  it("none: no item is ever selected and aria-selected is omitted", async () => {
    const { container, dispose } = mount(() => <FruitListbox selectionMode="none" />);
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    await userEvent.click(nth(options(container), 0));
    await userEvent.keyboard("{Enter} ");
    expect(selectedValues(container)).toEqual([]);
    expect(nth(options(container), 0).hasAttribute("aria-selected")).toBe(false);
    await expectNoA11yViolations(container);
    dispose();
  });
});

// ─── Typeahead & disabled skip ──────────────────────────────────────────────────────────────────

describe("Listbox — typeahead & disabled", () => {
  it("moves the active item to the first match on typing", async () => {
    const { container, dispose } = mount(() => <FruitListbox />);
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    await userEvent.click(nth(options(container), 0)); // focus at Apple
    await userEvent.keyboard("c"); // → Cherry
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Cherry"]));
    await expectNoA11yViolations(container);
    dispose();
  });

  it("skips a disabled item during arrow navigation", async () => {
    const { container, dispose } = mount(() => (
      <FruitListbox disabledOf={(fruit) => fruit.name === "Banana"} />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    const banana = nth(options(container), 1);
    expect(banana.getAttribute("aria-disabled")).toBe("true");
    expect(banana.hasAttribute("data-disabled")).toBe(true);

    await userEvent.click(nth(options(container), 0)); // Apple
    await userEvent.keyboard("{ArrowDown}"); // Apple → skip Banana → Cherry
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Cherry"]));
    await expectNoA11yViolations(container);
    dispose();
  });
});

// ─── One active item: pointer + keyboard share the highlight ────────────────────────────────────

describe("Listbox — single active item (no double highlight)", () => {
  it("pointer move re-targets the single active item, and a keyboard arrow keeps it single", async () => {
    const { container, dispose } = mount(() => <FruitListbox />);
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    pointerMoveAt(nth(options(container), 0), 10, 10);
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Apple"]));

    pointerMoveAt(nth(options(container), 2), 10, 40);
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Cherry"]));
    expect(activeValues(container)).toHaveLength(1);

    // A keyboard arrow moves the same single active item — it does not add a second highlight.
    await userEvent.keyboard("{ArrowDown}"); // Cherry → Date
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Date"]));
    expect(activeValues(container)).toHaveLength(1);
    await expectNoA11yViolations(container);
    dispose();
  });

  it("a spurious pointermove at unchanged coords does not override a keyboard arrow (fight guard)", async () => {
    const { container, dispose } = mount(() => <FruitListbox />);
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    // Real hover records the pointer position over Apple.
    pointerMoveAt(nth(options(container), 0), 10, 10);
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Apple"]));

    // Keyboard moves the active item down.
    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Banana"]));

    // A pointermove fired WITHOUT motion (same coords) — e.g. the list scrolled under a still cursor
    // — must NOT yank the active item back to Apple.
    pointerMoveAt(nth(options(container), 0), 10, 10);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(activeValues(container)).toEqual(["Banana"]);
    expect(activeValues(container)).toHaveLength(1);

    // A genuine move (different coords) re-targets again.
    pointerMoveAt(nth(options(container), 0), 10, 12);
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Apple"]));
    dispose();
  });
});

// ─── Native form submission ─────────────────────────────────────────────────────────────────────

describe("Listbox — native form submission", () => {
  function FormListbox(props: { onSubmit: (data: FormData) => void }): JSX.Element {
    return (
      <Themed>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            props.onSubmit(new FormData(event.currentTarget));
          }}
        >
          <Listbox.Root
            aria-label="fruits"
            selectionMode="multiple"
            name="fruit"
            itemToValue={itemToValue}
            itemToLabel={itemToLabel}
          >
            <For each={FRUITS}>
              {(fruit) => (
                <Listbox.Item value={fruit} data-value={fruit.name}>
                  {fruit.name}
                </Listbox.Item>
              )}
            </For>
          </Listbox.Root>
          <button type="submit">Submit</button>
        </form>
      </Themed>
    );
  }

  it("submits the selected items' itemToValue strings as hidden fields", async () => {
    let submitted: FormData | undefined;
    const { container, dispose } = mount(() => (
      <FormListbox onSubmit={(data) => (submitted = data)} />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    await userEvent.click(nth(options(container), 0)); // Apple (id 1)
    await userEvent.click(nth(options(container), 2)); // Cherry (id 3)
    await vi.waitFor(() => expect(selectedValues(container).sort()).toEqual(["Apple", "Cherry"]));

    // The hidden fields are siblings of the list element, inside the <form> — never inside the listbox.
    expect(listbox(container).querySelector('input[type="hidden"]')).toBeNull();

    await userEvent.click(page.getByRole("button", { name: "Submit" }));
    await vi.waitFor(() => expect(submitted).toBeDefined());
    expect((submitted as FormData).getAll("fruit").sort()).toEqual(["1", "3"]);
    await expectNoA11yViolations(container);
    dispose();
  });
});

// ─── Hydration ──────────────────────────────────────────────────────────────────────────────────

describe("Listbox hydration", () => {
  // `ssrFixture` is genuine server output: the hydration-fixture bridge renders `Tree` through a
  // nested SSR server and `listbox.ssr.test.tsx` inline-snapshots that same render, so they agree
  // byte-for-byte. Reusing `Tree` keeps the client tree structurally identical to the server's.
  it("hydrates the server HTML in place, without a mismatch or a second render", () => {
    const { dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    dispose();
  });

  it("leaves the hydrated listbox interactive (arrow moves the active row)", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    // The default selection (Strawberry) survives hydration. The Tree's items carry no `data-value`,
    // so assert on aria-selected + text rather than the `selectedValues` helper.
    await vi.waitFor(() => {
      const selected = options(container).filter(
        (option) => option.getAttribute("aria-selected") === "true",
      );
      expect(selected).toHaveLength(1);
      expect(nth(selected, 0).textContent).toContain("Strawberry");
    });

    await userEvent.click(nth(options(container), 0)); // Orange
    await expect.element(nth(options(container), 0)).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}"); // → Lemon
    await expect.element(nth(options(container), 1)).toHaveFocus();
    dispose();
  });

  it("has no accessibility violations after hydrating", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
