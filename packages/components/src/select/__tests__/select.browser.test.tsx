import ssrFixture from "virtual:hydration-fixture?id=select";
import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Accessor, createSignal, For, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Select } from "../index";
import { Tree } from "./select.ssr-entry";

// Every tree needs a `<ThemeProvider>` — `Select.Root` reads a recipe. It renders no DOM (the hope
// preset's token values live in CSS), so it changes nothing the assertions look at *except* the
// hydration keys Solid assigns by walking the component tree, which is why the hydration tree below
// has to carry it identically.
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

/** Diacritics on purpose: the collator folds them, which is what makes typing `cafe` match `Café`. */
const DRINKS = ["Café", "Cortado", "Espresso"];

interface Basket {
  kind: string;
  fruits: Fruit[];
}

const BASKETS: Basket[] = [
  {
    kind: "Citrus",
    fruits: [
      { id: 1, name: "Orange" },
      { id: 2, name: "Lemon" },
    ],
  },
  {
    kind: "Berries",
    fruits: [
      { id: 3, name: "Strawberry" },
      { id: 4, name: "Blueberry" },
    ],
  },
];

const itemToValue = (fruit: Fruit) => String(fruit.id);
const itemToLabel = (fruit: Fruit) => fruit.name;

/**
 * The trigger is `position: fixed` and clear of every viewport edge, so neither `flip` nor `shift`
 * has anything to react to and the measured assertions mean what they say. **The browser project
 * compiles no Tailwind**, so every recipe class is an inert string here: an unstyled trigger would
 * otherwise be an `inline-flex` box of whatever width its text happens to need.
 */
const TRIGGER_STYLE: JSX.CSSProperties = {
  position: "fixed",
  top: "120px",
  left: "40px",
  width: "180px",
};

// ─── Mounting ───────────────────────────────────────────────────────────────────────────────────

/**
 * Mounts a tree **inside landmarks**, hands it a landmark to portal the popup into, and returns
 * queries scoped to that one mount. Two problems, one helper.
 *
 * **Landmarks.** An open Select has to be axe-checked over the whole document: the trigger's
 * `aria-activedescendant` points into the portaled popup and the popup's `aria-labelledby` points back
 * at the trigger, so a subtree-scoped run would report both IDREFs as invalid. But running over
 * `document.body` also makes axe judge this *harness page's* landmark structure — its `region` rule
 * flags a bare `<body>` child — which is a fact about the harness, not about Select. Giving the tree
 * the landmarks a real page has takes the surrounding page out of the picture.
 *
 * **Scoped queries.** `mount()` only removes its container on `dispose()`, so one failing test leaves
 * a whole live Select in the document, and a document-wide `querySelector` in the *next* test resolves
 * to that corpse and fails for an unrelated reason. Binding every query to this mount's own container
 * and portal host keeps a failure a single failure.
 */
function mountSelect(tree: (portalMount: HTMLElement) => JSX.Element) {
  const portalMount = document.createElement("main");
  document.body.appendChild(portalMount);
  const mounted = mount(() => (
    <div role="region" aria-label="Select harness">
      {tree(portalMount)}
    </div>
  ));
  return {
    container: mounted.container,
    portalMount,
    ...queries(mounted.container, portalMount),
    dispose: () => {
      mounted.dispose();
      portalMount.remove();
    },
  };
}

/**
 * The queries, bound to one mount. `trigger`/`value` live in the mount container; everything from the
 * positioner down lives in the portal host, which is why the two roots are separate rather than one
 * `document` lookup.
 */
function queries(container: HTMLElement, popupRoot: ParentNode) {
  const inContainer = (slot: string) =>
    container.querySelector<HTMLElement>(`[data-slot="select-${slot}"]`);
  const inPopup = (slot: string) =>
    popupRoot.querySelector<HTMLElement>(`[data-slot="select-${slot}"]`);

  const trigger = () => inContainer("trigger") as HTMLElement;
  const options = () => [...popupRoot.querySelectorAll<HTMLElement>('[role="option"]')];

  /**
   * The highlighted row, resolved through the trigger's `aria-activedescendant` — what a screen reader
   * follows, and the only channel that is unconditional.
   *
   * Deliberately **not** `[data-active]`, which is the *paint* gate and additionally requires the
   * widget to hold focus: an open Select nobody has focused yet has an active index and no
   * `data-active` anywhere. That pairing is correct — it is what stops a highlight lingering after
   * focus leaves — and it is pinned on its own below.
   */
  const activeOption = () => {
    const id = trigger().getAttribute("aria-activedescendant");
    return id == null ? null : document.getElementById(id);
  };

  /**
   * Waits for the popup's first measurement: until it lands the positioner is `visibility: hidden` and
   * parked at 0,0, and only afterwards does a real `translate()` appear. Axe and every geometry
   * assertion must wait, or they inspect the un-positioned layer inside a hidden subtree.
   */
  async function waitForPositioned(): Promise<HTMLElement> {
    let positioner: HTMLElement | null = null;
    await vi.waitFor(() => {
      positioner = inPopup("positioner");
      expect(positioner).not.toBeNull();
      expect(positioner?.style.visibility).not.toBe("hidden");
      expect(positioner?.style.transform ?? "").toContain("translate(");
    });
    return positioner as unknown as HTMLElement;
  }

  return {
    inContainer,
    inPopup,
    trigger,
    options,
    activeOption,
    waitForPositioned,
    listbox: () => popupRoot.querySelector<HTMLElement>('[role="listbox"]'),
    selectedOptions: () =>
      options().filter((option) => option.getAttribute("aria-selected") === "true"),
    paintedOption: () => popupRoot.querySelector<HTMLElement>("[data-active]"),
  };
}

/**
 * Axe reports `aria-valid-attr-value` as *incomplete* for **any** element carrying both
 * `aria-haspopup` and `aria-controls`, without ever resolving the IDREF — undecidable by construction,
 * not a markup problem. The closed-state assertions below still run strict, and the IDREF is pinned by
 * its own test.
 */
const AXE_OPTIONS = { allowIncomplete: ["aria-valid-attr-value"] };

/** Array access that asserts presence. */
function nth<T>(list: ArrayLike<T>, index: number): T {
  const value = list[index];
  if (value == null) {
    throw new Error(`no element at index ${index}`);
  }
  return value;
}

// ─── Harnesses ──────────────────────────────────────────────────────────────────────────────────

interface FruitSelectProps {
  portalMount?: Element;
  selectionMode?: "single" | "multiple" | "none";
  defaultOpen?: boolean;
  defaultValue?: Fruit | Fruit[] | null;
  disabledOf?: (fruit: Fruit) => boolean;
  modal?: boolean;
  name?: string;
  required?: boolean;
  onChange?: (value: Fruit | Fruit[] | null) => void;
}

/** The canonical consumer tree: flat items, one row per item, the trigger named with `aria-label`. */
function FruitSelect(props: FruitSelectProps): JSX.Element {
  return (
    <Themed>
      <Select.Root
        items={FRUITS}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        isItemDisabled={props.disabledOf}
        // The harness is deliberately mode-agnostic: it hands the same three props to a
        // scalar-valued and an array-valued Select, which is exactly what `M` discriminates.
        // biome-ignore lint/suspicious/noExplicitAny: see above.
        selectionMode={props.selectionMode as any}
        // biome-ignore lint/suspicious/noExplicitAny: see above.
        defaultValue={props.defaultValue as any}
        // biome-ignore lint/suspicious/noExplicitAny: see above.
        onChange={props.onChange as any}
        defaultOpen={props.defaultOpen}
        modal={props.modal}
        name={props.name}
        required={props.required}
      >
        <Select.Trigger aria-label="Fruit" style={TRIGGER_STYLE}>
          <Select.Value placeholder="Pick a fruit" />
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal mount={props.portalMount}>
          <Select.Positioner>
            <Select.Content>
              <Select.List>
                {(fruit: Fruit) => (
                  <Select.Item item={fruit} data-value={fruit.name}>
                    <Select.ItemText>{fruit.name}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                )}
              </Select.List>
            </Select.Content>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </Themed>
  );
}

// ─── Roles & ARIA ───────────────────────────────────────────────────────────────────────────────

describe("Select — roles & ARIA", () => {
  it("names the trigger a combobox and leaves the popup unmounted while closed", async () => {
    const { container, trigger, options, listbox, dispose } = mountSelect((host) => (
      <FruitSelect portalMount={host} />
    ));

    await vi.waitFor(() => expect(trigger()).not.toBeNull());
    expect(trigger().getAttribute("role")).toBe("combobox");
    expect(trigger().getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    // Nothing renders until open — the whole reason a form with ten Selects mounts zero option lists.
    expect(listbox()).toBeNull();
    expect(options()).toHaveLength(0);
    // An `aria-controls` naming an unmounted element would be an invalid IDREF on every closed Select.
    expect(trigger().hasAttribute("aria-controls")).toBe(false);
    expect(trigger().hasAttribute("aria-activedescendant")).toBe(false);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("points aria-controls at the listbox and aria-activedescendant at the active row once open", async () => {
    const { trigger, listbox, activeOption, waitForPositioned, dispose } = mountSelect((host) => (
      <FruitSelect portalMount={host} defaultOpen />
    ));

    await waitForPositioned();
    const list = listbox() as HTMLElement;
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(trigger().getAttribute("aria-controls")).toBe(list.id);
    // The popup inherits the trigger's name, so naming the trigger names both.
    expect(list.getAttribute("aria-labelledby")).toBe(trigger().id);

    // Nothing is selected, so the entry strategy falls back to the first focusable row.
    await vi.waitFor(() => expect(activeOption()?.dataset.value).toBe("Apple"));

    await expectNoA11yViolations(document.body, AXE_OPTIONS);
    dispose();
  });

  it("gates the data-active paint hook on the widget actually holding focus", async () => {
    const { trigger, activeOption, paintedOption, waitForPositioned, dispose } = mountSelect(
      (host) => <FruitSelect portalMount={host} defaultOpen />,
    );
    await waitForPositioned();

    // Open and highlighted in ARIA, and deliberately not painted, because focus has not arrived. A
    // highlight lingering while focus is elsewhere is the bug this pairing prevents; it is also why
    // the recipe styles the row on `data-active:` alone and never on `hover:`.
    await vi.waitFor(() => expect(activeOption()).not.toBeNull());
    expect(paintedOption()).toBeNull();

    trigger().focus();
    await vi.waitFor(() => expect(paintedOption()?.dataset.value).toBe("Apple"));

    dispose();
  });

  it("keeps DOM focus on the trigger — no option is ever focused", async () => {
    const { trigger, options, waitForPositioned, dispose } = mountSelect((host) => (
      <FruitSelect portalMount={host} />
    ));

    await vi.waitFor(() => expect(trigger()).not.toBeNull());
    await userEvent.click(trigger());
    await waitForPositioned();
    await expect.element(trigger()).toHaveFocus();

    // Clicking a row must not move focus either: the list's `mousedown` guard is what stops it, and
    // without it the highlight's paint gate would drop the moment a row was hit.
    await userEvent.click(nth(options(), 1));
    await expect.element(trigger()).toHaveFocus();

    dispose();
  });
});

// ─── Open / close ───────────────────────────────────────────────────────────────────────────────

describe("Select — open and close", () => {
  it("toggles on trigger click", async () => {
    const { trigger, options, waitForPositioned, dispose } = mountSelect((host) => (
      <FruitSelect portalMount={host} />
    ));
    await vi.waitFor(() => expect(trigger()).not.toBeNull());

    await userEvent.click(trigger());
    await waitForPositioned();
    expect(options()).toHaveLength(4);

    // Unless the trigger is spared from outside-click dismissal, its own pointerdown closes the popup
    // in the capture phase and its click immediately reopens it — never closable by what opened it.
    await userEvent.click(trigger());
    await vi.waitFor(() => expect(options()).toHaveLength(0));

    dispose();
  });

  it("closes on Escape, leaving focus on the trigger", async () => {
    const { trigger, options, waitForPositioned, dispose } = mountSelect((host) => (
      <FruitSelect portalMount={host} />
    ));
    await vi.waitFor(() => expect(trigger()).not.toBeNull());

    await userEvent.click(trigger());
    await waitForPositioned();
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(options()).toHaveLength(0));
    await expect.element(trigger()).toHaveFocus();

    dispose();
  });

  it("hides and inerts outside content while open, and restores it on close", async () => {
    const { trigger, waitForPositioned, options, dispose } = mountSelect((host) => (
      <>
        <FruitSelect portalMount={host} />
        <button type="button" data-testid="outside" style={{ position: "fixed", top: "400px" }}>
          outside
        </button>
      </>
    ));
    await vi.waitFor(() => expect(trigger()).not.toBeNull());
    const outside = document.querySelector('[data-testid="outside"]') as HTMLElement;

    await userEvent.click(trigger());
    await waitForPositioned();
    // Modality needs both attributes: `aria-hidden` takes the background out of the accessibility
    // tree, and `inert` takes it out of the focus order and out of hit testing. Neither substitutes
    // for the other — ARIA tooling still finds an `inert` element. There is deliberately no focus trap
    // and no backdrop: focus never leaves the trigger, and a backdrop would cover it.
    await vi.waitFor(() => {
      expect(outside.hasAttribute("inert")).toBe(true);
      expect(outside.getAttribute("aria-hidden")).toBe("true");
    });

    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(options()).toHaveLength(0));
    await vi.waitFor(() => {
      expect(outside.hasAttribute("inert")).toBe(false);
      expect(outside.hasAttribute("aria-hidden")).toBe(false);
    });

    dispose();
  });

  it("closes on an outside pointerdown once modality is off", async () => {
    // Under the default `modal` the outside content is `inert` and cannot be clicked at all (the
    // assertion above), so `modal={false}` — the mode Combobox uses — is the only one where an outside
    // pointerdown is a reachable gesture.
    const { trigger, options, waitForPositioned, dispose } = mountSelect((host) => (
      <>
        <FruitSelect portalMount={host} modal={false} />
        <button type="button" data-testid="outside" style={{ position: "fixed", top: "400px" }}>
          outside
        </button>
      </>
    ));
    await vi.waitFor(() => expect(trigger()).not.toBeNull());

    await userEvent.click(trigger());
    await waitForPositioned();
    await userEvent.click(page.getByTestId("outside"));
    await vi.waitFor(() => expect(options()).toHaveLength(0));

    dispose();
  });

  it("refuses to open an empty collection", async () => {
    const { container, trigger, listbox, dispose } = mountSelect((host) => (
      <Themed>
        <Select.Root items={[] as Fruit[]} itemToValue={itemToValue}>
          <Select.Trigger aria-label="Fruit" style={TRIGGER_STYLE}>
            <Select.Value placeholder="Pick a fruit" />
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal mount={host}>
            <Select.Positioner>
              <Select.Content>
                <Select.List>{() => null}</Select.List>
              </Select.Content>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </Themed>
    ));
    await vi.waitFor(() => expect(trigger()).not.toBeNull());

    await userEvent.click(trigger());
    // The guard is only *meaningful* because the option set is data: a list built from mounted rows is
    // always empty before opening, so it could never tell "no options" from "not opened yet".
    await vi.waitFor(() => expect(trigger().getAttribute("aria-expanded")).toBe("false"));
    expect(listbox()).toBeNull();

    await expectNoA11yViolations(container);
    dispose();
  });
});

// ─── Keyboard ───────────────────────────────────────────────────────────────────────────────────

describe("Select — keyboard", () => {
  it("opens on the first option with ArrowDown and on the last with ArrowUp", async () => {
    const { trigger, options, activeOption, waitForPositioned, dispose } = mountSelect((host) => (
      <FruitSelect portalMount={host} />
    ));
    await vi.waitFor(() => expect(trigger()).not.toBeNull());

    trigger().focus();
    await userEvent.keyboard("{ArrowDown}");
    await waitForPositioned();
    await vi.waitFor(() => expect(activeOption()?.dataset.value).toBe("Apple"));

    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(options()).toHaveLength(0));

    await userEvent.keyboard("{ArrowUp}");
    await waitForPositioned();
    await vi.waitFor(() => expect(activeOption()?.dataset.value).toBe("Date"));

    dispose();
  });

  it("moves the highlight with the arrows and selects with Enter, closing the popup", async () => {
    const onChange = vi.fn();
    const { trigger, options, activeOption, inContainer, waitForPositioned, dispose } = mountSelect(
      (host) => <FruitSelect portalMount={host} onChange={onChange} />,
    );
    await vi.waitFor(() => expect(trigger()).not.toBeNull());

    trigger().focus();
    await userEvent.keyboard("{ArrowDown}"); // open on Apple
    await waitForPositioned();
    await userEvent.keyboard("{ArrowDown}"); // → Banana
    await vi.waitFor(() => expect(activeOption()?.dataset.value).toBe("Banana"));

    await userEvent.keyboard("{Enter}");
    await vi.waitFor(() => expect(options()).toHaveLength(0));
    expect(onChange).toHaveBeenCalledWith(FRUITS[1]);
    // Single mode hands back a scalar, never `[banana]`.
    expect(onChange.mock.calls[0]?.[0]).not.toBeInstanceOf(Array);
    expect(inContainer("value")?.textContent).toBe("Banana");

    dispose();
  });

  it("jumps to the ends with Home and End", async () => {
    const { trigger, activeOption, waitForPositioned, dispose } = mountSelect((host) => (
      <FruitSelect portalMount={host} defaultOpen />
    ));
    await waitForPositioned();

    trigger().focus();
    await userEvent.keyboard("{End}");
    await vi.waitFor(() => expect(activeOption()?.dataset.value).toBe("Date"));
    await userEvent.keyboard("{Home}");
    await vi.waitFor(() => expect(activeOption()?.dataset.value).toBe("Apple"));

    await expectNoA11yViolations(document.body, AXE_OPTIONS);
    dispose();
  });
});

// ─── Typeahead ──────────────────────────────────────────────────────────────────────────────────

describe("Select — typeahead", () => {
  it("selects outright while closed, without ever opening the popup", async () => {
    const onChange = vi.fn();
    const { container, trigger, listbox, inContainer, dispose } = mountSelect((host) => (
      <FruitSelect portalMount={host} onChange={onChange} />
    ));
    await vi.waitFor(() => expect(trigger()).not.toBeNull());

    trigger().focus();
    await userEvent.keyboard("b");

    // Native `<select>` behavior, and only possible because the option set is data: with the popup
    // shut there is no row to highlight, so a match selects.
    await vi.waitFor(() => expect(inContainer("value")?.textContent).toBe("Banana"));
    expect(onChange).toHaveBeenCalledWith(FRUITS[1]);
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(listbox()).toBeNull();

    await expectNoA11yViolations(container);
    dispose();
  });

  it("highlights instead of selecting while open", async () => {
    const onChange = vi.fn();
    const { trigger, activeOption, waitForPositioned, dispose } = mountSelect((host) => (
      <FruitSelect portalMount={host} defaultOpen onChange={onChange} />
    ));
    await waitForPositioned();

    trigger().focus();
    await userEvent.keyboard("c");
    await vi.waitFor(() => expect(activeOption()?.dataset.value).toBe("Cherry"));
    expect(onChange).not.toHaveBeenCalled();

    dispose();
  });

  it("folds diacritics through the collator — typing `cafe` matches `Café`", async () => {
    const [value, setValue] = createSignal<string | null>(null);
    const { container, trigger, dispose } = mountSelect((host) => (
      <Themed>
        <Select.Root items={DRINKS} value={value()} onChange={setValue}>
          <Select.Trigger aria-label="Drink" style={TRIGGER_STYLE}>
            <Select.Value placeholder="Pick a drink" />
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal mount={host}>
            <Select.Positioner>
              <Select.Content>
                <Select.List>
                  {(drink: string) => (
                    <Select.Item item={drink} data-value={drink}>
                      <Select.ItemText>{drink}</Select.ItemText>
                      <Select.ItemIndicator />
                    </Select.Item>
                  )}
                </Select.List>
              </Select.Content>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </Themed>
    ));
    await vi.waitFor(() => expect(trigger()).not.toBeNull());

    trigger().focus();
    await userEvent.keyboard("cafe");

    // The collator folds diacritics *and* case, which `toLowerCase()` cannot do: without it, "cafe"
    // never prefixes "Café" and matches nothing at all.
    await vi.waitFor(() => expect(value()).toBe("Café"));

    await expectNoA11yViolations(container);
    dispose();
  });
});

// ─── Selection & the value ──────────────────────────────────────────────────────────────────────

describe("Select — selection and the value", () => {
  it("shows the placeholder while empty and marks it with data-placeholder", async () => {
    const { container, trigger, options, inContainer, waitForPositioned, dispose } = mountSelect(
      (host) => <FruitSelect portalMount={host} />,
    );
    await vi.waitFor(() => expect(inContainer("value")).not.toBeNull());

    expect(inContainer("value")?.textContent).toBe("Pick a fruit");
    // The empty state is an attribute on the value, not a slot or a part of its own.
    expect(inContainer("value")?.hasAttribute("data-placeholder")).toBe(true);

    await userEvent.click(trigger());
    await waitForPositioned();
    await userEvent.click(nth(options(), 0));

    await vi.waitFor(() => expect(inContainer("value")?.textContent).toBe("Apple"));
    expect(inContainer("value")?.hasAttribute("data-placeholder")).toBe(false);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("announces the value before the label, via the trigger's aria-labelledby", async () => {
    const { trigger, inContainer, dispose } = mountSelect((host) => (
      <FruitSelect portalMount={host} defaultValue={FRUITS[0]} />
    ));
    await vi.waitFor(() => expect(inContainer("value")?.id).toBeTruthy());

    // The current selection first, the field's label after. The trigger names *itself* second because
    // `aria-labelledby` outranks `aria-label` when a name is computed — without the self-reference the
    // consumer's own label would simply vanish.
    await vi.waitFor(() => {
      const labelledBy = trigger().getAttribute("aria-labelledby") ?? "";
      expect(labelledBy.split(" ")).toEqual([inContainer("value")?.id, trigger().id]);
    });

    dispose();
  });

  it("keeps the popup open and toggles rows in multiple mode", async () => {
    const onChange = vi.fn();
    const { trigger, options, selectedOptions, listbox, waitForPositioned, dispose } = mountSelect(
      (host) => (
        <FruitSelect
          portalMount={host}
          selectionMode="multiple"
          defaultValue={[]}
          onChange={onChange}
        />
      ),
    );
    await vi.waitFor(() => expect(trigger()).not.toBeNull());

    await userEvent.click(trigger());
    await waitForPositioned();

    await userEvent.click(nth(options(), 0));
    await userEvent.click(nth(options(), 2));
    // Ticking several values is not finished business, so multiple mode defaults to staying open.
    await vi.waitFor(() => expect(selectedOptions()).toHaveLength(2));
    expect(onChange).toHaveBeenLastCalledWith([FRUITS[0], FRUITS[2]]);
    expect(listbox()?.getAttribute("aria-multiselectable")).toBe("true");

    await userEvent.click(nth(options(), 0));
    await vi.waitFor(() => expect(selectedOptions()).toHaveLength(1));

    await expectNoA11yViolations(document.body, AXE_OPTIONS);
    dispose();
  });

  it("lets Select.Value render a summary from the selected items", async () => {
    const { container, inContainer, dispose } = mountSelect((host) => (
      <Themed>
        <Select.Root
          items={FRUITS}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          selectionMode="multiple"
          defaultValue={[FRUITS[0] as Fruit, FRUITS[2] as Fruit]}
        >
          <Select.Trigger aria-label="Fruit" style={TRIGGER_STYLE}>
            <Select.Value placeholder="Any fruit">
              {(values: Fruit[]) => `${values.length} selected`}
            </Select.Value>
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal mount={host}>
            <Select.Positioner>
              <Select.Content>
                <Select.List>
                  {(fruit: Fruit) => (
                    <Select.Item item={fruit}>
                      <Select.ItemText>{fruit.name}</Select.ItemText>
                    </Select.Item>
                  )}
                </Select.List>
              </Select.Content>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </Themed>
    ));

    await vi.waitFor(() => expect(inContainer("value")?.textContent).toBe("2 selected"));
    await expectNoA11yViolations(container);
    dispose();
  });

  it("skips disabled rows and refuses to select them", async () => {
    const { trigger, options, activeOption, waitForPositioned, dispose } = mountSelect((host) => (
      <FruitSelect portalMount={host} defaultOpen disabledOf={(fruit) => fruit.name === "Banana"} />
    ));
    await waitForPositioned();

    expect(nth(options(), 1).getAttribute("aria-disabled")).toBe("true");
    trigger().focus();
    await userEvent.keyboard("{Home}");
    await vi.waitFor(() => expect(activeOption()?.dataset.value).toBe("Apple"));
    await userEvent.keyboard("{ArrowDown}");
    // Banana is skipped, not merely un-selectable.
    await vi.waitFor(() => expect(activeOption()?.dataset.value).toBe("Cherry"));

    await expectNoA11yViolations(document.body, AXE_OPTIONS);
    dispose();
  });
});

// ─── Grouping ───────────────────────────────────────────────────────────────────────────────────

describe("Select — grouping", () => {
  function GroupedSelect(props: { portalMount: Element }): JSX.Element {
    return (
      <Themed>
        <Select.Root
          items={BASKETS}
          groupToItems={(basket) => basket.fruits}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          defaultOpen
        >
          <Select.Trigger aria-label="Fruit" style={TRIGGER_STYLE}>
            <Select.Value placeholder="Pick a fruit" />
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal mount={props.portalMount}>
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
                        <For each={basket.fruits}>
                          {(fruit) => (
                            <Select.Item item={fruit} data-value={fruit.name}>
                              <Select.ItemText>{fruit.name}</Select.ItemText>
                              <Select.ItemIndicator />
                            </Select.Item>
                          )}
                        </For>
                      </Select.Group>
                    </>
                  )}
                </Select.List>
              </Select.Content>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </Themed>
    );
  }

  it("renders each group with its label and a separator between them", async () => {
    const { portalMount, waitForPositioned, dispose } = mountSelect((host) => (
      <GroupedSelect portalMount={host} />
    ));
    await waitForPositioned();

    const groups = [...portalMount.querySelectorAll<HTMLElement>('[role="group"]')];
    expect(groups).toHaveLength(2);
    // The label registers its id onto the group's `aria-labelledby`: the wiring is what gets
    // registered, never the text, which is why there is no `groupToLabel` prop.
    for (const group of groups) {
      const labelId = group.getAttribute("aria-labelledby");
      expect(labelId).toBeTruthy();
      expect(document.getElementById(labelId as string)?.dataset.slot).toBe("select-group-label");
    }
    expect(portalMount.querySelectorAll('[data-slot="select-separator"]')).toHaveLength(1);

    await expectNoA11yViolations(document.body, AXE_OPTIONS);
    dispose();
  });

  it("navigates in flattened items order, straight across the group boundary", async () => {
    const { trigger, options, activeOption, waitForPositioned, dispose } = mountSelect((host) => (
      <GroupedSelect portalMount={host} />
    ));
    await waitForPositioned();

    // The invariant: rendered order matches the flattened `items` order, because arrow keys traverse
    // that array and not the DOM. Crossing Lemon → Strawberry is the boundary case.
    expect(options().map((option) => option.dataset.value)).toEqual([
      "Orange",
      "Lemon",
      "Strawberry",
      "Blueberry",
    ]);

    trigger().focus();
    await userEvent.keyboard("{Home}");
    await vi.waitFor(() => expect(activeOption()?.dataset.value).toBe("Orange"));
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await vi.waitFor(() => expect(activeOption()?.dataset.value).toBe("Strawberry"));

    dispose();
  });
});

// ─── The recipe reaching the DOM ────────────────────────────────────────────────────────────────

/**
 * **The browser test project compiles no Tailwind**, so the recipe's `w-(--anchor-width)` class is an
 * inert string here. Injecting Tailwind's own declaration for that one utility is what makes the
 * measurement below mean something: a missing or malformed custom property leaves the declaration
 * invalid and the width unchanged.
 */
function injectAnchorWidthUtility(): () => void {
  const style = document.createElement("style");
  style.textContent = `[data-slot="select-positioner"] { width: var(--anchor-width); }`;
  document.head.appendChild(style);
  return () => style.remove();
}

describe("Select — the recipe actually paints", () => {
  it("publishes --anchor-width on the positioner, and a declaration spending it matches the trigger", async () => {
    const removeStyle = injectAnchorWidthUtility();
    const { trigger, inPopup, waitForPositioned, dispose } = mountSelect((host) => (
      <FruitSelect portalMount={host} defaultOpen />
    ));

    const positioner = await waitForPositioned();
    // Nothing is published before the first measurement — an absent property is what keeps the server
    // render and the first client render identical — so this is asserted only after it lands.
    expect(positioner.style.getPropertyValue("--anchor-width")).toMatch(/^\d/);
    expect(positioner.style.getPropertyValue("--available-height")).toMatch(/^\d/);

    const triggerWidth = trigger().getBoundingClientRect().width;
    expect(positioner.getBoundingClientRect().width).toBeCloseTo(triggerWidth, 1);

    // The recipe wiring reaching the DOM, and the absence half: Select emits exactly one width class,
    // so tailwind-merge is never left resolving two competing ones.
    expect(positioner.className).toContain("w-(--anchor-width)");
    expect(positioner.className).not.toContain("w-max");
    expect(inPopup("content")?.className).toContain("max-h-(--available-height)");

    dispose();
    removeStyle();
  });

  it("carries the presence and placement hooks the transition keys on", async () => {
    const { inPopup, waitForPositioned, dispose } = mountSelect((host) => (
      <FruitSelect portalMount={host} defaultOpen />
    ));
    const positioner = await waitForPositioned();

    expect(positioner.getAttribute("data-side")).toBeTruthy();
    expect(positioner.getAttribute("data-align")).toBeTruthy();
    await vi.waitFor(() =>
      expect(inPopup("content")?.getAttribute("data-presence")).toBe("entered"),
    );

    dispose();
  });
});

// ─── `render` re-targeting ──────────────────────────────────────────────────────────────────────

describe("Select — render re-targets a part without losing anything", () => {
  it("keeps the trigger's computed props and its internal ref through a custom target", async () => {
    // A component target, not a bare tag: it is the case that actually drops things, because it has to
    // spread the props and honour the function ref itself.
    const FancyButton = (props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button {...props} data-fancy="" />
    );

    const { trigger, options, waitForPositioned, dispose } = mountSelect((host) => (
      <Themed>
        <Select.Root items={FRUITS} itemToValue={itemToValue} itemToLabel={itemToLabel}>
          <Select.Trigger
            aria-label="Fruit"
            style={TRIGGER_STYLE}
            render={(props) => <FancyButton {...props} />}
          >
            <Select.Value placeholder="Pick a fruit" />
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal mount={host}>
            <Select.Positioner>
              <Select.Content>
                <Select.List>
                  {(fruit: Fruit) => (
                    <Select.Item item={fruit} data-value={fruit.name}>
                      <Select.ItemText>{fruit.name}</Select.ItemText>
                    </Select.Item>
                  )}
                </Select.List>
              </Select.Content>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </Themed>
    ));
    await vi.waitFor(() => expect(trigger()).not.toBeNull());

    // The computed props survive the swap — assert the behavior they carry, not just the tag.
    expect(trigger().hasAttribute("data-fancy")).toBe(true);
    expect(trigger().getAttribute("role")).toBe("combobox");

    trigger().focus();
    await userEvent.keyboard("{ArrowDown}");
    const positioner = await waitForPositioned();
    // And the internal ref survives it: the popup is positioned against the trigger element, so an
    // unpositioned layer is exactly what a dropped function ref looks like.
    expect(positioner.style.transform).toContain("translate(");
    // The trigger is also the element spared from dismissal — a dropped ref makes it un-toggleable.
    await userEvent.click(trigger());
    await vi.waitFor(() => expect(options()).toHaveLength(0));

    dispose();
  });

  it("keeps the list's computed props and its scroll-container ref through a custom target", async () => {
    const scrollContainers: HTMLElement[] = [];
    const FancyList = (props: JSX.HTMLAttributes<HTMLDivElement>) => (
      <div {...props} data-fancy-list="" />
    );

    const { trigger, inPopup, waitForPositioned, dispose } = mountSelect((host) => (
      <Themed>
        <Select.Root items={FRUITS} itemToValue={itemToValue} itemToLabel={itemToLabel} defaultOpen>
          <Select.Trigger aria-label="Fruit" style={TRIGGER_STYLE}>
            <Select.Value placeholder="Pick a fruit" />
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal mount={host}>
            <Select.Positioner>
              <Select.Content>
                <Select.List
                  ref={(element: HTMLDivElement) => scrollContainers.push(element)}
                  render={(props) => <FancyList {...props} />}
                >
                  {(fruit: Fruit) => (
                    <Select.Item item={fruit} data-value={fruit.name}>
                      <Select.ItemText>{fruit.name}</Select.ItemText>
                    </Select.Item>
                  )}
                </Select.List>
              </Select.Content>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </Themed>
    ));
    await waitForPositioned();

    const list = inPopup("list") as HTMLElement;
    expect(list.hasAttribute("data-fancy-list")).toBe(true);
    // `role="listbox"` and the id the trigger's `aria-controls` names both ride the computed props.
    expect(list.getAttribute("role")).toBe("listbox");
    expect(trigger().getAttribute("aria-controls")).toBe(list.id);
    // The internal and consumer refs are collapsed into one callback, so both land.
    expect(scrollContainers).toContain(list);

    await expectNoA11yViolations(document.body, AXE_OPTIONS);
    dispose();
  });
});

// ─── Native form submission ─────────────────────────────────────────────────────────────────────

describe("Select — native form submission", () => {
  function FormSelect(props: {
    portalMount: Element;
    onSubmit?: (data: FormData) => void;
    required?: boolean;
    defaultValue?: Fruit | null;
  }): JSX.Element {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          props.onSubmit?.(new FormData(event.currentTarget));
        }}
      >
        <FruitSelect
          portalMount={props.portalMount}
          name="fruit"
          required={props.required}
          defaultValue={props.defaultValue}
        />
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </form>
    );
  }

  it("submits the selected item's itemToValue string", async () => {
    let submitted: FormData | undefined;
    const { container, trigger, options, inContainer, waitForPositioned, dispose } = mountSelect(
      (host) => <FormSelect portalMount={host} onSubmit={(data) => (submitted = data)} />,
    );
    await vi.waitFor(() => expect(trigger()).not.toBeNull());

    await userEvent.click(trigger());
    await waitForPositioned();
    await userEvent.click(nth(options(), 2)); // Cherry (id 3)
    await vi.waitFor(() => expect(inContainer("value")?.textContent).toBe("Cherry"));

    const submit = container.querySelector('button[type="submit"]') as HTMLElement;
    await userEvent.click(submit);
    await vi.waitFor(() => expect(submitted).toBeDefined());
    expect((submitted as FormData).get("fruit")).toBe("3");

    dispose();
  });

  it("restores the default selection on a native form reset", async () => {
    const { container, trigger, options, inContainer, waitForPositioned, dispose } = mountSelect(
      (host) => <FormSelect portalMount={host} defaultValue={FRUITS[0]} />,
    );
    await vi.waitFor(() => expect(inContainer("value")?.textContent).toBe("Apple"));

    await userEvent.click(trigger());
    await waitForPositioned();
    await userEvent.click(nth(options(), 3)); // Date
    await vi.waitFor(() => expect(inContainer("value")?.textContent).toBe("Date"));

    const reset = container.querySelector('button[type="reset"]') as HTMLElement;
    await userEvent.click(reset);
    await vi.waitFor(() => expect(inContainer("value")?.textContent).toBe("Apple"));

    dispose();
  });

  it("blocks an empty required submit and moves focus to the trigger", async () => {
    const onSubmit = vi.fn();
    const { container, trigger, dispose } = mountSelect((host) => (
      <FormSelect portalMount={host} required onSubmit={onSubmit} />
    ));
    await vi.waitFor(() => expect(trigger()).not.toBeNull());

    // Constraint validation skips `<input type="hidden">` entirely, so `required` on one is silently
    // ignored — which is why the hidden field is a real, merely clipped, `<select>`.
    const submit = container.querySelector('button[type="submit"]') as HTMLElement;
    await userEvent.click(submit);
    await vi.waitFor(() => expect(trigger()).toHaveFocus());
    expect(onSubmit).not.toHaveBeenCalled();

    dispose();
  });
});

// ─── Hydration ──────────────────────────────────────────────────────────────────────────────────

describe("Select hydration", () => {
  // `ssrFixture` is genuine server output: a bridge renders `Tree` through a nested SSR server, and
  // `select.ssr.test.tsx` inline-snapshots that same render, so the two agree byte-for-byte. Reusing
  // `Tree` here keeps the client tree structurally identical to the server's.
  //
  // This `Tree` portals to `document.body` (no `mount` prop, the shape a consumer writes), so these
  // queries are document-scoped rather than bound to a portal host of their own.
  it("hydrates the server HTML in place, without a mismatch or a second render", () => {
    const { dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    dispose();
  });

  it("leaves the hydrated Select interactive — it opens, and the server-rendered value survives", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    const scope = queries(container, document);
    await vi.waitFor(() => expect(scope.trigger()).not.toBeNull());

    // The server render read the label straight off the data — no row was ever mounted for it.
    expect(scope.inContainer("value")?.textContent).toBe("Strawberry");

    await userEvent.click(scope.trigger());
    await scope.waitForPositioned();
    // The hydrated tree is grouped, so this doubles as the grouped tree's client half.
    expect(scope.options()).toHaveLength(4);
    expect(scope.selectedOptions().map((option) => option.textContent)).toEqual(["Strawberry"]);

    dispose();
  });

  it("has no accessibility violations after hydrating", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
