import ssrFixture from "virtual:hydration-fixture?id=listbox";
import { I18nProvider } from "@hope-ui/i18n";
import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { definePreset, ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { For, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Listbox } from "../index";
import { Tree } from "./listbox.ssr-entry";

// Listbox reads a theme recipe, so every mounted tree needs a provider. It renders no DOM of its own
// (hope's token values live in CSS).
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

/** A recognizable stand-in glyph, tagged so a query can tell it apart from hope's built-in check. */
function CustomIcon(props: { mark: string }): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" data-custom-icon={props.mark}>
      <path d="M4 4h16v16H4z" />
    </svg>
  );
}

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

/** Explicit client coords, because the guard against spurious hover reads `clientX`/`clientY`. */
function pointerMoveAt(element: HTMLElement, x: number, y: number): void {
  element.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: y, bubbles: true }));
}

// ─── Harnesses ──────────────────────────────────────────────────────────────────────────────────

interface FruitListboxProps {
  selectionMode?: "single" | "multiple" | "none";
  focusMode?: "roving" | "activedescendant";
  disabledOf?: (fruit: Fruit) => boolean;
  name?: string;
  dir?: "ltr" | "rtl";
  onChange?: (value: Fruit[]) => void;
}

function FruitListbox(props: FruitListboxProps): JSX.Element {
  return (
    <Themed>
      <Listbox.Root
        aria-label="fruits"
        items={FRUITS}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        isItemDisabled={props.disabledOf}
        selectionMode={props.selectionMode}
        focusMode={props.focusMode}
        name={props.name}
        dir={props.dir}
        onChange={props.onChange}
      >
        {(fruit) => (
          <Listbox.Item item={fruit} data-value={fruit.name}>
            <Listbox.ItemIndicator />
            {fruit.name}
          </Listbox.Item>
        )}
      </Listbox.Root>
    </Themed>
  );
}

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

describe("Listbox — highlight follows focus", () => {
  it("highlights the entry row when focus enters, and clears it when focus leaves", async () => {
    const { container, dispose } = mount(() => <FruitListbox />);
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    // Both halves were reported bugs. First: nothing is highlighted before the list has focus.
    expect(activeValues(container)).toEqual([]);

    await userEvent.tab(); // focus enters, landing on the tab stop (Apple)
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Apple"]));

    // Second: once focus leaves, the highlight must not stay painted.
    (document.activeElement as HTMLElement).blur();
    await vi.waitFor(() => expect(activeValues(container)).toEqual([]));
    dispose();
  });
});

describe("Listbox — activedescendant focus mode", () => {
  it("keeps the container tabbable + owns aria-activedescendant (at a mounted option), items untabbable", async () => {
    const { container, dispose } = mount(() => <FruitListbox focusMode="activedescendant" />);
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    const list = listbox(container);
    expect(list.getAttribute("tabindex")).toBe("0");
    expect(tabindexes(container)).toEqual(["-1", "-1", "-1", "-1"]);

    // In this mode the container is the focus owner: it keeps DOM focus and names the highlighted
    // option through `aria-activedescendant` instead of moving focus onto it.
    list.focus();
    await expect.element(list).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");

    await vi.waitFor(() => {
      const activeId = list.getAttribute("aria-activedescendant");
      expect(activeId).toBeTruthy();
      // The id must resolve to an element that is actually in the DOM — an `aria-activedescendant`
      // pointing at nothing is invalid ARIA and announces nothing.
      const active = container.querySelector(`[id="${activeId}"]`);
      expect(active).not.toBeNull();
      expect(active?.getAttribute("role")).toBe("option");
    });
    await expect.element(list).toHaveFocus();
    for (const option of options(container)) {
      expect(option).not.toHaveFocus();
    }
    await expectNoA11yViolations(container);
    dispose();
  });
});

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
    expect(selectedValues(container)).toHaveLength(1);
    // `onChange` reports the item objects themselves; `itemToValue` is what a form would submit.
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

describe("Listbox selection glyph", () => {
  // The glyph is built into `ItemIndicator`: a bare one renders hope's check, overridable per
  // instance via `children` or app-wide via the preset's `defaultProps`. These three tests pin all
  // three layers of that chain.

  /** Selects the third row (Cherry) and returns the svg inside its now-visible indicator. */
  async function indicatorSvgAfterSelecting(container: HTMLElement): Promise<SVGElement | null> {
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));
    await userEvent.click(nth(options(container), 2));
    await vi.waitFor(() =>
      expect(container.querySelector('[data-slot="listbox-item-indicator"] svg')).not.toBeNull(),
    );
    return nth(options(container), 2).querySelector<SVGElement>(
      '[data-slot="listbox-item-indicator"] svg',
    );
  }

  it("lets a per-instance ItemIndicator child override the built-in check", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Listbox.Root
          aria-label="fruits"
          items={FRUITS}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
        >
          {(fruit) => (
            <Listbox.Item item={fruit} data-value={fruit.name}>
              <Listbox.ItemIndicator>
                <CustomIcon mark="custom" />
              </Listbox.ItemIndicator>
              {fruit.name}
            </Listbox.Item>
          )}
        </Listbox.Root>
      </Themed>
    ));

    const svg = await indicatorSvgAfterSelecting(container);
    expect(svg?.getAttribute("data-custom-icon")).toBe("custom");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("takes an app-wide check glyph from a preset's defaultProps.listbox", async () => {
    // `hope` sets no listbox `defaultProps`, so extend it. The glyph is supplied as a *factory*, not
    // an element, so every row builds its own rather than sharing one movable node.
    const withCheckIcon = definePreset(hope, {
      components: {
        listbox: { defaultProps: { checkIcon: () => <CustomIcon mark="preset" /> } },
      },
    });

    const { container, dispose } = mount(() => (
      <ThemeProvider preset={withCheckIcon}>
        <Listbox.Root
          aria-label="fruits"
          items={FRUITS}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
        >
          {(fruit) => (
            <Listbox.Item item={fruit} data-value={fruit.name}>
              <Listbox.ItemIndicator />
              {fruit.name}
            </Listbox.Item>
          )}
        </Listbox.Root>
      </ThemeProvider>
    ));

    const svg = await indicatorSvgAfterSelecting(container);
    expect(svg?.getAttribute("data-custom-icon")).toBe("preset");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("forwards native attributes onto the indicator element", async () => {
    // This part once declared `children` and nothing else, so it rendered a `<span>` no consumer
    // could reach — no `id`, `data-*`, `style` or `ref` — with a green typecheck and a green suite.
    let indicatorRef: HTMLElement | undefined;
    const { container, dispose } = mount(() => (
      <Themed>
        <Listbox.Root
          aria-label="fruits"
          items={FRUITS}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
        >
          {(fruit) => (
            <Listbox.Item item={fruit} data-value={fruit.name}>
              <Listbox.ItemIndicator
                id="chosen"
                class="ring-2"
                data-testid="indicator"
                ref={(element: HTMLElement) => {
                  indicatorRef = element;
                }}
              />
              {fruit.name}
            </Listbox.Item>
          )}
        </Listbox.Root>
      </Themed>
    ));

    await vi.waitFor(() => expect(options(container)).toHaveLength(4));
    await userEvent.click(nth(options(container), 2));

    const indicator = await vi.waitFor(() => {
      const element = container.querySelector<HTMLElement>('[data-slot="listbox-item-indicator"]');
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    expect(indicator.id).toBe("chosen");
    expect(indicator.getAttribute("data-testid")).toBe("indicator");
    expect(indicatorRef).toBe(indicator);
    // The consumer's class is folded in alongside the recipe slot, not instead of it.
    expect(indicator.className).toContain("ring-2");
    expect(indicator.className).toContain("absolute");
    // `aria-hidden` stays component-owned — the option's `aria-selected` already conveys selection.
    expect(indicator.getAttribute("aria-hidden")).toBe("true");

    await expectNoA11yViolations(container);
    dispose();
  });

  it("re-targets the list container through a consumer render prop", async () => {
    // Root's internal ref is the scroll container in virtual mode and the navigation element in
    // both, so it has to survive being re-targeted onto a consumer's element.
    let listRef: HTMLElement | undefined;
    const { container, dispose } = mount(() => (
      <Themed>
        <Listbox.Root
          aria-label="fruits"
          items={FRUITS}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          ref={(element: HTMLElement) => {
            listRef = element;
          }}
          render={(renderProps) => <div {...renderProps} data-custom-shell="" />}
        >
          {(fruit) => (
            <Listbox.Item item={fruit} data-value={fruit.name}>
              {fruit.name}
            </Listbox.Item>
          )}
        </Listbox.Root>
      </Themed>
    ));

    await vi.waitFor(() => expect(options(container)).toHaveLength(4));
    const list = container.querySelector<HTMLElement>('[data-slot="listbox"]') as HTMLElement;
    // A `<div>` target, not a `<section>`: `role="listbox"` is not an allowed role on `<section>`,
    // so that swap would fail the axe check below. The marker attribute is what proves the
    // consumer's element is the one actually rendered.
    expect(list.hasAttribute("data-custom-shell")).toBe(true);
    expect(list.getAttribute("role")).toBe("listbox");
    expect(listRef).toBe(list);

    // Still navigable — the keyboard handling rides on the computed props, not on the tag.
    nth(options(container), 0).focus();
    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(nth(options(container), 1)).toHaveAttribute("data-active"));

    await expectNoA11yViolations(container);
    dispose();
  });
});

interface Basket {
  kind: string;
  fruits: Fruit[];
}

const BASKETS: Basket[] = [
  {
    kind: "Citrus",
    fruits: [
      { id: 10, name: "Lemon" },
      { id: 11, name: "Lime" },
    ],
  },
  {
    kind: "Berries",
    fruits: [
      { id: 20, name: "Blueberry" },
      { id: 21, name: "Raspberry" },
    ],
  },
];

function GroupedListbox(): JSX.Element {
  return (
    <Themed>
      <Listbox.Root
        aria-label="fruits by kind"
        items={BASKETS}
        groupToItems={(basket) => basket.fruits}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
      >
        {(basket, index) => (
          <>
            <Show when={index() > 0}>
              <Listbox.Separator />
            </Show>
            <Listbox.Group>
              <Listbox.GroupLabel>{basket.kind}</Listbox.GroupLabel>
              <For each={basket.fruits}>
                {(fruit) => (
                  <Listbox.Item item={fruit} data-value={fruit.name}>
                    <Listbox.ItemIndicator />
                    {fruit.name}
                  </Listbox.Item>
                )}
              </For>
            </Listbox.Group>
          </>
        )}
      </Listbox.Root>
    </Themed>
  );
}

describe("Listbox — grouping", () => {
  it("invokes the callback per group and navigates the flattened items order across them", async () => {
    const { container, dispose } = mount(() => <GroupedListbox />);
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    expect(container.querySelectorAll('[data-slot="listbox-group"]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-slot="listbox-separator"]')).toHaveLength(1);
    expect(
      [...container.querySelectorAll('[data-slot="listbox-group-label"]')].map(
        (element) => element.textContent,
      ),
    ).toEqual(["Citrus", "Berries"]);

    // The options sit two levels down, inside each group's own `<For>` — and still arrow as one list.
    await userEvent.click(nth(options(container), 1)); // Lime, last of the first group
    await userEvent.keyboard("{ArrowDown}"); // → Blueberry, first of the second
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Blueberry"]));

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("Listbox.Item — DOM prop forwarding", () => {
  it("puts the native attributes it does not consume on the option element", async () => {
    // The lists of props the Item consumes rather than forwards are hand-kept, and renaming one is
    // exactly the change that starts swallowing a consumer's attributes with a green typecheck and a
    // green suite. So assert them **on the element**, never on the props type.
    let itemRef: HTMLElement | undefined;
    const { container, dispose } = mount(() => (
      <Themed>
        {/* A real target for the forwarded `aria-describedby`: pointing it at a missing id would
        trip the axe check below, and that would be this test's bug, not the part's. */}
        <span id="hint">Pick one</span>
        <Listbox.Root
          aria-label="fruits"
          items={FRUITS}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
        >
          {(fruit) => (
            <Listbox.Item
              item={fruit}
              data-value={fruit.name}
              data-testid={`row-${fruit.id}`}
              title={fruit.name}
              aria-describedby="hint"
              class="probe-item"
              style={{ color: "rgb(1, 2, 3)" }}
              ref={(element: HTMLElement) => {
                itemRef = element;
              }}
            >
              {fruit.name}
            </Listbox.Item>
          )}
        </Listbox.Root>
      </Themed>
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    const apple = nth(options(container), 0);
    expect(apple.getAttribute("data-testid")).toBe("row-1");
    expect(apple.getAttribute("title")).toBe("Apple");
    expect(apple.getAttribute("aria-describedby")).toBe("hint");
    expect(apple.style.color).toBe("rgb(1, 2, 3)");
    // The consumer's class rides the recipe's `item` slot, never instead of it.
    expect(apple.className).toContain("probe-item");
    expect(apple.className).toContain("cursor-default");
    // A consumer `ref` reaches the element even though the primitive needs its own signal accessor.
    expect(itemRef).toBe(nth(options(container), 3));
    // …while the hook keeps what it owns — `id` is what `aria-activedescendant` points at.
    expect(apple.getAttribute("role")).toBe("option");
    expect(apple.id).toBeTruthy();
    expect(apple.getAttribute("data-slot")).toBe("listbox-item");

    await expectNoA11yViolations(container);
    dispose();
  });
});

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
            items={FRUITS}
            selectionMode="multiple"
            name="fruit"
            itemToValue={itemToValue}
            itemToLabel={itemToLabel}
          >
            {(fruit) => (
              <Listbox.Item item={fruit} data-value={fruit.name}>
                {fruit.name}
              </Listbox.Item>
            )}
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

describe("Listbox hydration", () => {
  // `ssrFixture` is genuine server output, produced by rendering `Tree` through a real SSR pass;
  // `listbox.ssr.test.tsx` snapshots that same render, so the two agree byte-for-byte. Reusing one
  // `Tree` is what keeps the client structurally identical to the server, which matters because
  // Solid pairs the two by a key derived from each node's path through the component tree.
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

/**
 * This test project ships **no Tailwind stylesheet**, so the recipe's classes resolve to nothing and
 * every box would measure identically in both directions.
 *
 * These are Tailwind's own declarations for the *logical* utilities under test (`padding-inline-*`,
 * `inset-inline-*`, which mirror themselves under `dir="rtl"`), plus the two positioning ones the
 * glyph's placement needs. Declaring only the logical spellings is what keeps this honest: a
 * regression to the physical `pr-8`/`pl-1.5`/`right-1` matches no rule here, both directions collapse
 * onto identical geometry, and the assertions fail instead of quietly passing.
 */
function injectLogicalUtilities(): () => void {
  const style = document.createElement("style");
  style.textContent = `
    .relative { position: relative; }
    .absolute { position: absolute; }
    .pe-8 { padding-inline-end: 2rem; }
    .ps-1\\.5 { padding-inline-start: 0.375rem; }
    .end-1 { inset-inline-end: 0.25rem; }
  `;
  document.head.appendChild(style);
  return () => style.remove();
}

/**
 * `dir` goes to `Listbox.Root`, not to the wrapper: the component writes its resolved direction onto
 * its own element, so a wrapper would be testing the wrapper rather than the component. The wrapper
 * only fixes the width the gutter measurements depend on.
 */
function DirectionalListbox(props: { dir: "ltr" | "rtl" }): JSX.Element {
  return (
    <div style={{ width: "320px" }}>
      <FruitListbox selectionMode="single" dir={props.dir} />
    </div>
  );
}

/** Selects the first row so `Listbox.ItemIndicator` renders, and returns its box next to the row's. */
async function selectAndMeasure(container: HTMLElement) {
  await vi.waitFor(() => expect(options(container)).toHaveLength(4));
  await userEvent.click(nth(options(container), 0));

  const row = nth(options(container), 0);
  const indicator = row.querySelector<HTMLElement>('[data-slot="listbox-item-indicator"]');
  if (indicator == null) {
    throw new Error("no item indicator rendered — the row was not selected");
  }
  return { row, style: window.getComputedStyle(row), rows: row.getBoundingClientRect(), indicator };
}

describe("Listbox — RTL", () => {
  it("mirrors the indicator gutter to the LEFT edge under dir=rtl", async () => {
    const removeStyle = injectLogicalUtilities();
    const { container, dispose } = mount(() => <DirectionalListbox dir="rtl" />);

    const { style, rows, indicator } = await selectAndMeasure(container);

    // `padding-inline-end` reserves the glyph gutter where the text ENDS — the left edge of an RTL
    // row — while `padding-inline-start` insets the label from the right, where it now starts.
    expect(style.paddingLeft).toBe("32px");
    expect(style.paddingRight).toBe("6px");

    // And `inset-inline-end` puts the glyph inside that gutter, against the row's visual left edge.
    const glyph = indicator.getBoundingClientRect();
    expect(glyph.left - rows.left).toBeLessThan(rows.right - glyph.right);

    removeStyle();
    dispose();
  });

  it("keeps the same gutter on the RIGHT edge under dir=ltr", async () => {
    const removeStyle = injectLogicalUtilities();
    const { container, dispose } = mount(() => <DirectionalListbox dir="ltr" />);

    const { style, rows, indicator } = await selectAndMeasure(container);

    expect(style.paddingRight).toBe("32px");
    expect(style.paddingLeft).toBe("6px"); // the md density's leading inset

    const glyph = indicator.getBoundingClientRect();
    expect(rows.right - glyph.right).toBeLessThan(glyph.left - rows.left);

    removeStyle();
    dispose();
  });

  it("has no accessibility violations under dir=rtl", async () => {
    const { container, dispose } = mount(() => <DirectionalListbox dir="rtl" />);
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));
    await expectNoA11yViolations(container);
    dispose();
  });

  it("emits an explicit dir prop onto the list element, not only as primitive config", async () => {
    // `dir` is the one `createListbox` option that is also a real HTML attribute. The primitive reads
    // it to pick the arrow-key mapping; if it stopped there, the browser would lay a horizontal list
    // out left-to-right while the arrow keys moved right-to-left.
    const { container, dispose } = mount(() => (
      <Themed>
        <Listbox.Root
          aria-label="fruits"
          items={FRUITS}
          dir="rtl"
          orientation="horizontal"
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
        >
          {(fruit) => (
            <Listbox.Item item={fruit} data-value={fruit.name}>
              {fruit.name}
            </Listbox.Item>
          )}
        </Listbox.Root>
      </Themed>
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    const list = listbox(container);
    expect(list.getAttribute("dir")).toBe("rtl");
    expect(window.getComputedStyle(list).direction).toBe("rtl");

    await expectNoA11yViolations(container);
    dispose();
  });

  it("does NOT write a locale-derived dir, so an ancestor's direction still governs", async () => {
    // Why the component must not write its own `dir`: the locale layer never reports "no direction"
    // — with no provider it falls back to the *detected browser* direction — so writing it would
    // stamp `dir="ltr"` here and override the ancestor. Only the consumer's own `dir` prop reaches
    // the DOM. An app declares direction where the browser can see it.
    const { container, dispose } = mount(() => (
      <div dir="rtl">
        <I18nProvider locale="ar-EG">
          <FruitListbox selectionMode="single" />
        </I18nProvider>
      </div>
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    const list = listbox(container);
    expect(list.hasAttribute("dir")).toBe(false);
    expect(window.getComputedStyle(list).direction).toBe("rtl"); // inherited, not written

    dispose();
  });

  it("warns in dev when a horizontal list's keymap and layout disagree", async () => {
    // Since the component deliberately will not reconcile the two channels itself (see above), it
    // says so out loud instead. Only a HORIZONTAL list warns: a vertical one maps Up/Down, where
    // reading direction changes nothing.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { container, dispose } = mount(() => (
      // Left-to-right layout (no ancestor `dir`) against a right-to-left keymap (the provider's
      // locale) — the disagreement the warning exists for.
      <I18nProvider locale="ar-EG">
        <Themed>
          <Listbox.Root
            aria-label="fruits"
            items={FRUITS}
            orientation="horizontal"
            itemToValue={itemToValue}
            itemToLabel={itemToLabel}
          >
            {(fruit) => (
              <Listbox.Item item={fruit} data-value={fruit.name}>
                {fruit.name}
              </Listbox.Item>
            )}
          </Listbox.Root>
        </Themed>
      </I18nProvider>
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    await vi.waitFor(() =>
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("[hope-ui] Listbox")),
    );
    expect(warn.mock.calls.flat().join(" ")).toContain("document.documentElement.dir");

    warn.mockRestore();
    dispose();
  });

  it("stays quiet for a vertical list, where direction cannot change navigation", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { container, dispose } = mount(() => (
      <I18nProvider locale="ar-EG">
        <FruitListbox selectionMode="single" />
      </I18nProvider>
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    expect(warn.mock.calls.flat().join(" ")).not.toContain("[hope-ui] Listbox");

    warn.mockRestore();
    dispose();
  });

  it("stays quiet once the app declares the direction the locale implies", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { container, dispose } = mount(() => (
      <div dir="rtl">
        <I18nProvider locale="ar-EG">
          <Themed>
            <Listbox.Root
              aria-label="fruits"
              items={FRUITS}
              orientation="horizontal"
              itemToValue={itemToValue}
              itemToLabel={itemToLabel}
            >
              {(fruit) => (
                <Listbox.Item item={fruit} data-value={fruit.name}>
                  {fruit.name}
                </Listbox.Item>
              )}
            </Listbox.Root>
          </Themed>
        </I18nProvider>
      </div>
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    expect(warn.mock.calls.flat().join(" ")).not.toContain("[hope-ui] Listbox");

    warn.mockRestore();
    dispose();
  });
});
