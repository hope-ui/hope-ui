import { I18nProvider } from "@hope-ui/i18n";
import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import type { CreateListboxReturn } from "../index";
import {
  activeValues,
  DataListbox,
  FRUITS,
  type Fruit,
  fruitOptions,
  GroupedListbox,
  type ListboxTestOptions,
  listbox,
  mountedIndices,
  nth,
  options,
  SelectListbox,
  selectedValues,
  tabindexes,
  VirtualListbox,
  virtualLabel,
} from "./listbox-harness";

const label = (fruit: Fruit) => fruit.name;
const modKey = /mac|iphone|ipad/i.test(navigator.platform) ? "Meta" : "Control";

// ─── rootProps container wiring ─────────────────────────────────────────────────────────────────

describe("createListbox — rootProps", () => {
  it("emits role=listbox, vertical orientation, and a stable id", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        options={fruitOptions()}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    const list = listbox(container);
    expect(list.getAttribute("role")).toBe("listbox");
    expect(list.getAttribute("aria-orientation")).toBe("vertical");
    expect(list.getAttribute("id")).toBe(state.id());
    expect(list.hasAttribute("aria-multiselectable")).toBe(false);
    await expectNoA11yViolations(container);
    dispose();
  });

  it("marks aria-multiselectable in multiple mode", async () => {
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        options={{ ...fruitOptions(), selectionMode: "multiple" }}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));
    expect(listbox(container).getAttribute("aria-multiselectable")).toBe("true");
    dispose();
  });

  it("reflects a disabled list: nothing tabbable + aria-disabled", async () => {
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        options={{ ...fruitOptions(), disabled: true }}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));
    expect(listbox(container).getAttribute("aria-disabled")).toBe("true");
    expect(listbox(container).getAttribute("tabindex")).toBe("-1");
    expect(tabindexes(container)).toEqual(["-1", "-1", "-1", "-1"]);
    dispose();
  });
});

// ─── Roving focus mode (standalone default) ───────────────────────────────────────────────────────

describe("createListbox — roving focus mode", () => {
  it("makes the first item the tab stop, the container untabbable, and no aria-activedescendant", async () => {
    const { container, dispose } = mount(() => (
      <DataListbox values={FRUITS} labelOf={label} options={fruitOptions()} />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    expect(tabindexes(container)).toEqual(["0", "-1", "-1", "-1"]);
    expect(listbox(container).getAttribute("tabindex")).toBe("-1");
    expect(listbox(container).hasAttribute("aria-activedescendant")).toBe(false);
    dispose();
  });

  it("moves real DOM focus with ArrowDown", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        options={fruitOptions()}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    state.focus.focusIndex(0);
    await expect.element(nth(options(container), 0)).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    await expect.element(nth(options(container), 1)).toHaveFocus();
    expect(activeValues(container)).toEqual(["Banana"]);
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => (
      <DataListbox values={FRUITS} labelOf={label} options={fruitOptions()} />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));
    await expectNoA11yViolations(container);
    dispose();
  });
});

// ─── Horizontal orientation and RTL ─────────────────────────────────────────────────────────────

describe("createListbox — horizontal orientation and RTL", () => {
  const horizontal = (extra: ListboxTestOptions<Fruit> = {}): ListboxTestOptions<Fruit> => ({
    ...fruitOptions(),
    orientation: "horizontal",
    ...extra,
  });

  /** Mounts a horizontal listbox with item 1 (Banana) focused, ready for one arrow press. */
  async function mountHorizontalAtBanana(options_: ListboxTestOptions<Fruit>) {
    let state!: CreateListboxReturn<Fruit>;
    const mounted = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        options={options_}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(mounted.container)).toHaveLength(4));
    state.focus.focusIndex(1);
    await expect.element(nth(options(mounted.container), 1)).toHaveFocus();
    return { ...mounted, state };
  }

  it("moves ArrowRight to the next item under LTR", async () => {
    const { container, dispose } = await mountHorizontalAtBanana(horizontal({ dir: "ltr" }));

    await userEvent.keyboard("{ArrowRight}");
    await expect.element(nth(options(container), 2)).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(nth(options(container), 1)).toHaveFocus();

    await expectNoA11yViolations(container);
    dispose();
  });

  it("swaps ArrowLeft and ArrowRight under dir=rtl", async () => {
    // The visual order is mirrored, so the key that points at the *screen* edge nearest the list's
    // start must move toward the list's start. Untreaded, this walked the list backwards for every
    // Arabic/Hebrew/Farsi reader with no test noticing.
    const { container, dispose } = await mountHorizontalAtBanana(horizontal({ dir: "rtl" }));

    await userEvent.keyboard("{ArrowRight}");
    await expect.element(nth(options(container), 0)).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(nth(options(container), 1)).toHaveFocus();

    dispose();
  });

  it("resolves the direction from the locale when no dir prop is given", async () => {
    // The `dir` prop is only the escape hatch; the default source of truth is `useLocale()`, so an
    // `I18nProvider` alone has to flip the arrows.
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <I18nProvider locale="ar-EG">
        <DataListbox
          values={FRUITS}
          labelOf={label}
          options={horizontal()}
          onReady={(s) => (state = s)}
        />
      </I18nProvider>
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));
    expect(state.direction()).toBe("rtl");

    state.focus.focusIndex(1);
    await expect.element(nth(options(container), 1)).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(nth(options(container), 0)).toHaveFocus();

    dispose();
  });

  it("leaves a vertical listbox's ArrowDown alone under rtl", async () => {
    // RTL mirrors the inline axis only. A vertical list still reads top-to-bottom.
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        options={{ ...fruitOptions(), dir: "rtl" }}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    state.focus.focusIndex(1);
    await expect.element(nth(options(container), 1)).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(nth(options(container), 2)).toHaveFocus();

    dispose();
  });
});

// ─── Highlight follows focus ──────────────────────────────────────────────────────────────────

describe("createListbox — highlight follows focus", () => {
  it("paints the entry row on focus in and clears every highlight on focus out (roving)", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        options={fruitOptions()}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));
    // Nothing highlighted before the widget has focus (the reported second bug).
    expect(activeValues(container)).toEqual([]);

    await userEvent.tab(); // enters on the roving tab stop (Apple)
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Apple"]));
    await expect.element(nth(options(container), 0)).toHaveFocus();

    // Focus leaves the list — the highlight must not linger (the reported first bug).
    (document.activeElement as HTMLElement).blur();
    await vi.waitFor(() => expect(activeValues(container)).toEqual([]));
    expect(state.focus.activeIndex()).toBe(0); // active index retained across blur
    dispose();
  });

  it("enters on the selected row (APG): the tab stop and the highlight agree", async () => {
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        options={{ ...fruitOptions(), defaultValue: [nth(FRUITS, 1)] }}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));
    // Before any navigation the selected row (Banana) is the single tab stop.
    expect(tabindexes(container)).toEqual(["-1", "0", "-1", "-1"]);

    await userEvent.tab();
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Banana"]));
    await expect.element(nth(options(container), 1)).toHaveFocus();
    dispose();
  });

  it("activates the entry row when the container itself is focused in activedescendant mode", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        options={{ ...fruitOptions(), focusMode: "activedescendant" }}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    listbox(container).focus();
    await vi.waitFor(() => {
      expect(state.focus.activeIndex()).toBe(0);
      expect(activeValues(container)).toEqual(["Apple"]);
      expect(listbox(container).getAttribute("aria-activedescendant")).toBe(
        nth(state.focus.items(), 0).id,
      );
    });
    dispose();
  });
});

// ─── Activedescendant focus mode ────────────────────────────────────────────────────────────────

describe("createListbox — activedescendant focus mode", () => {
  it("keeps the container tabbable + owns aria-activedescendant, items untabbable", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        options={{ ...fruitOptions(), focusMode: "activedescendant" }}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    state.focus.focusIndex(1);
    await vi.waitFor(() =>
      expect(listbox(container).getAttribute("aria-activedescendant")).toBe(
        nth(state.focus.items(), 1).id,
      ),
    );
    expect(listbox(container).getAttribute("tabindex")).toBe("0");
    expect(tabindexes(container)).toEqual(["-1", "-1", "-1", "-1"]);
    // No option ever takes DOM focus in activedescendant mode.
    for (const option of options(container)) {
      expect(option).not.toHaveFocus();
    }
    await expectNoA11yViolations(container);
    dispose();
  });
});

// ─── Select-ready: an external focus owner ────────────────────────────────────────────────────────

describe("createListbox — external focus owner (Select shape)", () => {
  it("drives aria-activedescendant on the combobox input, never focusing an option", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <SelectListbox
        values={FRUITS}
        labelOf={label}
        options={fruitOptions()}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    const input = container.querySelector<HTMLInputElement>(
      '[role="combobox"]',
    ) as HTMLInputElement;
    input.focus();
    await expect.element(input).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() =>
      expect(input.getAttribute("aria-activedescendant")).toBe(nth(state.focus.items(), 0).id),
    );
    // Focus stayed on the input; the option is only pointed at, never focused.
    await expect.element(input).toHaveFocus();
    for (const option of options(container)) {
      expect(option).not.toHaveFocus();
    }

    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() =>
      expect(input.getAttribute("aria-activedescendant")).toBe(nth(state.focus.items(), 1).id),
    );
    await expect.element(input).toHaveFocus();

    await expectNoA11yViolations(container);
    dispose();
  });

  it("opens the highlight gate from the input's focus without auto-highlighting an entry", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <SelectListbox
        values={FRUITS}
        labelOf={label}
        options={fruitOptions()}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));
    const input = container.querySelector<HTMLInputElement>(
      '[role="combobox"]',
    ) as HTMLInputElement;

    input.focus();
    await vi.waitFor(() => expect(state.focus.isFocused()).toBe(true));
    // Focusing the input sets the flag but does NOT run the entry rule (zag's `INPUT.FOCUS`): the
    // list opens un-highlighted until the first arrow/typeahead.
    expect(state.focus.activeIndex()).toBe(-1);
    expect(activeValues(container)).toEqual([]);

    input.blur();
    await vi.waitFor(() => expect(state.focus.isFocused()).toBe(false));
    dispose();
  });
});

// ─── Selection ────────────────────────────────────────────────────────────────────────────────

describe("createListbox — selection", () => {
  it("single: Enter selects the active item, replacing the prior selection", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        options={fruitOptions()}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    state.focus.focusIndex(1);
    await userEvent.keyboard("{Enter}");
    await vi.waitFor(() => expect(selectedValues(container)).toEqual(["Banana"]));

    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}"); // → Date
    await vi.waitFor(() => expect(selectedValues(container)).toEqual(["Date"]));
    dispose();
  });

  it("multiple: Space toggles a set, mod+A selects all", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        options={{ ...fruitOptions(), selectionMode: "multiple" }}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    state.focus.focusIndex(0);
    await userEvent.keyboard(" "); // Apple on
    await userEvent.keyboard("{ArrowDown}{ArrowDown} "); // Cherry on
    await vi.waitFor(() => expect(selectedValues(container).sort()).toEqual(["Apple", "Cherry"]));

    await userEvent.keyboard(`{${modKey}>}a{/${modKey}}`);
    await vi.waitFor(() =>
      expect(selectedValues(container).sort()).toEqual(["Apple", "Banana", "Cherry", "Date"]),
    );
    dispose();
  });

  it("none: no item is ever selected and aria-selected is omitted", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        options={{ ...fruitOptions(), selectionMode: "none" }}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    state.focus.focusIndex(0);
    await userEvent.keyboard("{Enter} ");
    expect(state.value()).toEqual([]);
    expect(nth(options(container), 0).hasAttribute("aria-selected")).toBe(false);
    dispose();
  });

  it("exposes formValues as the selected items' itemToValue strings", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        options={{ ...fruitOptions(), selectionMode: "multiple", name: "fruit" }}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    state.focus.focusIndex(0);
    await userEvent.keyboard(" ");
    await userEvent.keyboard("{ArrowDown}{ArrowDown} ");
    await vi.waitFor(() => expect(state.formValues().sort()).toEqual(["1", "3"]));
    expect(state.name()).toBe("fruit");
    dispose();
  });
});

// ─── Typeahead + disabled skip ────────────────────────────────────────────────────────────────

describe("createListbox — typeahead and disabled", () => {
  it("moves the active item to the first match on typing", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        options={fruitOptions()}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    state.focus.focusIndex(0);
    await userEvent.keyboard("c"); // → Cherry
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Cherry"]));
    dispose();
  });

  it("skips a disabled item during arrow navigation", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        disabledOf={(fruit) => fruit.name === "Banana"}
        options={fruitOptions()}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    expect(nth(options(container), 1).getAttribute("aria-disabled")).toBe("true");
    state.focus.focusIndex(0);
    await userEvent.keyboard("{ArrowDown}"); // Apple → skip Banana → Cherry
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Cherry"]));
    dispose();
  });

  it("hands a match to `onTypeaheadMatch` instead of the highlight, when one is given", async () => {
    // The seam a composed widget intercepts — `createCombobox` uses it to *select* the match while
    // its popup is shut, where there is no row to highlight. A standalone listbox never sets it.
    const onTypeaheadMatch = vi.fn();
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <DataListbox
        values={FRUITS}
        labelOf={label}
        options={{ ...fruitOptions(), onTypeaheadMatch }}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    state.focus.focusIndex(0);
    await userEvent.keyboard("c"); // → Cherry, index 2

    expect(onTypeaheadMatch).toHaveBeenCalledWith(2);
    // …and the default "move the highlight" did not also happen.
    expect(activeValues(container)).toEqual(["Apple"]);
    dispose();
  });
});

// ─── Grouped data source ────────────────────────────────────────────────────────────────────────

describe("createListbox — grouped data source", () => {
  const CITRUS: Fruit[] = [
    { id: 10, name: "Lemon" },
    { id: 11, name: "Lime" },
  ];
  const BERRIES: Fruit[] = [
    { id: 20, name: "Blueberry" },
    { id: 21, name: "Raspberry" },
  ];
  const BASKETS = [
    { label: "Citrus", values: CITRUS },
    { label: "Berries", values: BERRIES },
  ];

  it("flattens the group entries into one navigation order", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <GroupedListbox
        groups={BASKETS}
        labelOf={label}
        options={fruitOptions()}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    // `groupToItems`' only job: `items()` is the flat run arrow keys and typeahead traverse. The
    // group's *label* never reaches the kernel — it is rendered from the consumer's own key.
    expect(state.indexed.items().map((item) => item.textValue())).toEqual([
      "Lemon",
      "Lime",
      "Blueberry",
      "Raspberry",
    ]);
    dispose();
  });

  it("arrows across a group boundary, skipping the labels and the separator", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <GroupedListbox
        groups={BASKETS}
        labelOf={label}
        options={fruitOptions()}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    state.focus.focusIndex(1); // Lime, the last row of the first group
    await expect.element(nth(options(container), 1)).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}"); // → Blueberry, the first row of the second group
    await vi.waitFor(() => expect(activeValues(container)).toEqual(["Blueberry"]));
    await expect.element(nth(options(container), 2)).toHaveFocus();

    await expectNoA11yViolations(container);
    dispose();
  });

  it("resolves a row from its item regardless of how deep it sits in the tree", async () => {
    // Each option lives inside its group's own `<For>`, two levels below the listbox — and still
    // registers under the right flat index, which is what `indexOfValue` buys and what makes the
    // inner iteration a plain `<For>` rather than library chrome.
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <GroupedListbox
        groups={BASKETS}
        labelOf={label}
        options={fruitOptions()}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    expect(state.indexOfValue("20")).toBe(2); // Blueberry — third in the flattened order
    await vi.waitFor(() =>
      expect(nth(state.indexed.items(), 2).element()).toBe(nth(options(container), 2)),
    );
    dispose();
  });
});

// ─── Virtual source mode ────────────────────────────────────────────────────────────────────────

describe("createListbox — virtual source mode", () => {
  const COUNT = 5_000;

  it("exposes the full item set while mounting only a window", async () => {
    let state!: CreateListboxReturn<number>;
    const { container, dispose } = mount(() => (
      <VirtualListbox count={COUNT} onReady={(s) => (state = s)} />
    ));
    await vi.waitFor(() => expect(mountedIndices(container).length).toBeGreaterThan(0));

    expect(state.indexed.items()).toHaveLength(COUNT);
    expect(mountedIndices(container).length).toBeLessThan(30);
    const offscreen = nth(state.indexed.items(), 2500);
    expect(offscreen.element()).toBeUndefined();
    expect(offscreen.textValue()).toBe(virtualLabel(2500));
    dispose();
  });

  it("ArrowDown into an unmounted region scrolls the row in and focuses it (roving)", async () => {
    let state!: CreateListboxReturn<number>;
    const { container, dispose } = mount(() => (
      <VirtualListbox count={COUNT} onReady={(s) => (state = s)} />
    ));
    await vi.waitFor(() => expect(mountedIndices(container).length).toBeGreaterThan(0));

    expect(mountedIndices(container)).not.toContain(300);
    state.focus.focusIndex(300);
    await vi.waitFor(() => {
      expect(container.querySelector('[data-index="300"]')).not.toBeNull();
    });
    await expect
      .element(container.querySelector<HTMLElement>('[data-index="300"]') as HTMLElement)
      .toHaveFocus();
    dispose();
  });

  it("selects over the full set via the virtual item", async () => {
    let state!: CreateListboxReturn<number>;
    const { container, dispose } = mount(() => (
      <VirtualListbox
        count={COUNT}
        options={{ selectionMode: "multiple" }}
        onReady={(s) => (state = s)}
      />
    ));
    await vi.waitFor(() => expect(mountedIndices(container).length).toBeGreaterThan(0));

    state.focus.focusIndex(0);
    await userEvent.keyboard(" ");
    await vi.waitFor(() => expect(state.formValues()).toEqual(["row-0"]));
    dispose();
  });

  it("PageDown pages through the list, scrolling an offscreen row in and focusing it (roving)", async () => {
    let state!: CreateListboxReturn<number>;
    const { container, dispose } = mount(() => (
      <VirtualListbox count={COUNT} onReady={(s) => (state = s)} />
    ));
    await vi.waitFor(() => expect(mountedIndices(container).length).toBeGreaterThan(0));

    state.focus.focusIndex(0);
    await vi.waitFor(() => expect(state.focus.activeIndex()).toBe(0));

    // Default page is 10, so two PageDowns reach index 20 — offscreen for a ~10-row viewport.
    await userEvent.keyboard("{PageDown}{PageDown}");
    await vi.waitFor(() => expect(state.focus.activeIndex()).toBe(20));
    await vi.waitFor(() => expect(container.querySelector('[data-index="20"]')).not.toBeNull());
    await expect
      .element(container.querySelector<HTMLElement>('[data-index="20"]') as HTMLElement)
      .toHaveFocus();
    dispose();
  });

  it("recovers focus to the container when the roving-focused row is scrolled out of the window", async () => {
    let state!: CreateListboxReturn<number>;
    const { container, dispose } = mount(() => (
      <VirtualListbox count={COUNT} onReady={(s) => (state = s)} />
    ));
    await vi.waitFor(() => expect(mountedIndices(container).length).toBeGreaterThan(0));

    const list = listbox(container);
    state.focus.focusIndex(0);
    await expect
      .element(container.querySelector<HTMLElement>('[data-index="0"]') as HTMLElement)
      .toHaveFocus();

    // Scroll far down by hand — a wheel/scrollbar gesture, NOT keyboard nav — so the focused row 0
    // unmounts. Without recovery the browser drops focus to <body> and keyboard nav dies (the
    // container's key handler only sees events bubbling up from a focused descendant).
    list.scrollTop = 4000;
    list.dispatchEvent(new Event("scroll"));

    await vi.waitFor(() => expect(container.querySelector('[data-index="0"]')).toBeNull());
    // Focus was pulled back to the container, so keydowns keep arriving.
    await expect.element(list).toHaveFocus();

    // Keyboard nav is alive again: ArrowDown re-homes onto a mounted option.
    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(state.focus.activeIndex()).toBe(1));
    await vi.waitFor(() => expect(container.querySelector('[data-index="1"]')).not.toBeNull());
    await expect
      .element(container.querySelector<HTMLElement>('[data-index="1"]') as HTMLElement)
      .toHaveFocus();
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => <VirtualListbox count={COUNT} />);
    await vi.waitFor(() => expect(mountedIndices(container).length).toBeGreaterThan(0));
    await expectNoA11yViolations(container);
    dispose();
  });
});
