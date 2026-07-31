import ssrFixture from "virtual:hydration-fixture?id=combobox";
import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Accessor, For, Show } from "solid-js";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { Combobox, type ComboboxFilter } from "../index";
import { Tree } from "./combobox.ssr-entry";

// Every tree sits under a `<ThemeProvider>` fed the `hope` preset — `Combobox.Root` reads a recipe.
// It is a zero-DOM provider (its token values live in CSS), so it changes nothing the assertions look
// at except `_hk` keys, which is why the hydration tree carries it identically.
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
  { id: 3, name: "Blueberry" },
  { id: 4, name: "Cherry" },
];

/** Diacritics on purpose: `sensitivity: "base"` is what makes typing `cafe` match `Café`. */
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
 * The control is `position: fixed` and clear of every viewport edge, so neither `flip` nor `shift`
 * has anything to react to and the measured assertions mean what they say. **The browser project
 * compiles no Tailwind**, so every recipe class is an inert string here: an unstyled control would
 * otherwise be an `inline-flex` box of whatever width its contents happen to need.
 */
const CONTROL_STYLE: JSX.CSSProperties = {
  position: "fixed",
  top: "120px",
  left: "40px",
  width: "220px",
};

// ─── Mounting ───────────────────────────────────────────────────────────────────────────────────

/**
 * Mounts a tree **inside landmarks**, hands it a landmark to portal the popup into, and returns
 * queries scoped to that one mount. The shape `select.browser.test.tsx` established, for the same two
 * reasons.
 *
 * **Landmarks.** An open Combobox is the shape whose axe run has to cover the whole document: the
 * input's `aria-activedescendant` points into the portaled popup, and the popup's `aria-labelledby`
 * points back at the input, so a subtree-scoped run would report both IDREFs as invalid. Running over
 * `document.body` then makes axe judge this **document's** landmark structure as well — its `region`
 * rule flags a bare `<body>` child — which is a fact about the harness page, not about Combobox. So
 * the harness gives it the landmarks a real page has.
 *
 * **Scoped queries.** `mount()` only removes its container on `dispose()`, so one failing test leaves
 * a whole live Combobox in the document — and a document-wide `querySelector('[data-slot=…]')` in the
 * *next* test then resolves to that corpse and fails for a reason that has nothing to do with it.
 *
 * **Teardown is registered, not just returned.** The explicit `dispose()` at the end of each test is
 * skipped whenever an assertion throws, and this harness's portal host is a `<main>` — so a single
 * real failure leaves a second `<main>` in the document and every later `expectNoA11yViolations`
 * over `document.body` fails with `landmark-no-duplicate-main`, burying the one failure that
 * mattered. `onTestFinished` runs either way; `dispose()` stays returned (and idempotent) so a test
 * that wants to tear down early still can.
 */
function mountCombobox(tree: (portalMount: HTMLElement) => JSX.Element) {
  const portalMount = document.createElement("main");
  document.body.appendChild(portalMount);
  const mounted = mount(() => (
    <div role="region" aria-label="Combobox harness">
      {tree(portalMount)}
    </div>
  ));

  let disposed = false;
  const dispose = () => {
    if (disposed) {
      return;
    }
    disposed = true;
    mounted.dispose();
    portalMount.remove();
  };
  onTestFinished(dispose);

  return {
    container: mounted.container,
    portalMount,
    ...queries(mounted.container, portalMount),
    dispose,
  };
}

/**
 * The queries, bound to one mount. The control and its gutter buttons live in the mount container;
 * everything from the positioner down lives in the portal host, which is why the two roots are
 * separate rather than one `document` lookup.
 */
function queries(container: HTMLElement, popupRoot: ParentNode) {
  const inContainer = (slot: string) =>
    container.querySelector<HTMLElement>(`[data-slot="combobox-${slot}"]`);
  const inPopup = (slot: string) =>
    popupRoot.querySelector<HTMLElement>(`[data-slot="combobox-${slot}"]`);

  const input = () => inContainer("input") as HTMLInputElement;
  const options = () => [...popupRoot.querySelectorAll<HTMLElement>('[role="option"]')];
  const optionLabels = () => options().map((option) => option.textContent);

  /**
   * The highlighted row, resolved through the input's `aria-activedescendant` — the ARIA channel,
   * which is what a screen reader follows and the only one that is unconditional.
   *
   * Deliberately **not** `[data-active]`: that attribute is the *paint* gate, additionally gated on
   * `focus.isFocused()`, so an open Combobox nobody has focused yet has an active index and no
   * `data-active` anywhere. That pairing is pinned on its own below.
   */
  const activeOption = () => {
    const id = input().getAttribute("aria-activedescendant");
    return id == null ? null : document.getElementById(id);
  };

  /**
   * The component-layer stand-in for `floating.isPositioned()`: `floatingStyles()` is the
   * `visibility: hidden` pre-positioned branch until the first measurement lands, after which a real
   * `translate()` appears. Axe and every geometry assertion must wait for it.
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

  /**
   * Types into the field the way a user does, but **in one tick**: a `value` write through the native
   * setter plus one `input` event. `userEvent.type` is fine for a character or two and slow enough
   * that a multi-character query arrives as several independent renders, which makes the
   * filter-narrowing assertions read as a sequence rather than a result. Both paths are exercised —
   * the per-keystroke one is pinned separately.
   */
  function type(text: string): void {
    const element = input();
    element.focus();
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set as (
      this: HTMLInputElement,
      value: string,
    ) => void;
    setter.call(element, text);
    element.dispatchEvent(new InputEvent("input", { bubbles: true }));
  }

  return {
    inContainer,
    inPopup,
    input,
    options,
    optionLabels,
    activeOption,
    waitForPositioned,
    type,
    trigger: () => inContainer("trigger") as HTMLButtonElement,
    clear: () => inContainer("clear"),
    listbox: () => popupRoot.querySelector<HTMLElement>('[role="listbox"]'),
    status: () => inPopup("status"),
    empty: () => inPopup("empty"),
    selectedOptions: () =>
      options().filter((option) => option.getAttribute("aria-selected") === "true"),
    paintedOption: () => popupRoot.querySelector<HTMLElement>("[data-active]"),
  };
}

/**
 * Axe returns `aria-valid-attr-value` as *incomplete* for **any** element carrying both
 * `aria-haspopup` and `aria-controls`, without ever resolving the IDREF
 * (`ariaValidAttrValueEvaluate`'s `controlsWithinPopup` pre-check) — undecidable by construction,
 * not a markup problem. Combobox's chevron carries exactly that pair while open. The closed
 * assertions below run strict, and the IDREFs themselves are pinned.
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

interface FruitComboboxProps {
  portalMount?: Element;
  selectionMode?: "single" | "multiple" | "none";
  defaultOpen?: boolean;
  defaultValue?: Fruit | Fruit[] | null;
  defaultInputValue?: string;
  filter?: ComboboxFilter<Fruit>;
  allowsCustomValue?: boolean;
  menuTrigger?: "input" | "focus" | "manual";
  items?: Fruit[];
  disabled?: boolean;
  onChange?: (value: Fruit | Fruit[] | null) => void;
  onInputValueChange?: (value: string) => void;
  withOutsideButton?: boolean;
}

/** The canonical consumer tree: flat items, one row per item, the input named with `aria-label`. */
function FruitCombobox(props: FruitComboboxProps): JSX.Element {
  return (
    <Themed>
      <Combobox.Root
        items={props.items ?? FRUITS}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        // The harness is deliberately mode-agnostic: it hands the same props to a scalar-valued and
        // an array-valued Combobox, which is exactly what `M` discriminates.
        // biome-ignore lint/suspicious/noExplicitAny: see above.
        selectionMode={props.selectionMode as any}
        // biome-ignore lint/suspicious/noExplicitAny: see above.
        defaultValue={props.defaultValue as any}
        // biome-ignore lint/suspicious/noExplicitAny: see above.
        onChange={props.onChange as any}
        defaultInputValue={props.defaultInputValue}
        onInputValueChange={props.onInputValueChange}
        filter={props.filter}
        allowsCustomValue={props.allowsCustomValue}
        menuTrigger={props.menuTrigger}
        defaultOpen={props.defaultOpen}
        disabled={props.disabled}
      >
        <Combobox.Control style={CONTROL_STYLE}>
          <Combobox.Input aria-label="Fruit" placeholder="Search fruit" />
          <Combobox.Clear />
          <Combobox.Trigger>
            <Combobox.Icon />
          </Combobox.Trigger>
        </Combobox.Control>
        <Combobox.Portal mount={props.portalMount}>
          <Combobox.Positioner>
            <Combobox.Content>
              <Combobox.List>
                {(fruit: Fruit) => (
                  <Combobox.Item item={fruit} data-value={fruit.name}>
                    <Combobox.ItemText>{fruit.name}</Combobox.ItemText>
                    <Combobox.ItemIndicator />
                  </Combobox.Item>
                )}
              </Combobox.List>
              <Combobox.Empty>Nothing found.</Combobox.Empty>
              <Combobox.Status />
            </Combobox.Content>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
      {props.withOutsideButton ? (
        <button type="button" data-testid="outside">
          outside
        </button>
      ) : null}
    </Themed>
  );
}

/** A string-item tree, so the collator's diacritic folding is testable with no `itemToLabel`. */
function DrinkCombobox(props: { portalMount?: Element; filter?: ComboboxFilter<string> }) {
  return (
    <Themed>
      <Combobox.Root items={DRINKS} filter={props.filter}>
        <Combobox.Control style={CONTROL_STYLE}>
          <Combobox.Input aria-label="Drink" />
          <Combobox.Trigger>
            <Combobox.Icon />
          </Combobox.Trigger>
        </Combobox.Control>
        <Combobox.Portal mount={props.portalMount}>
          <Combobox.Positioner>
            <Combobox.Content>
              <Combobox.List>
                {(drink: string) => (
                  <Combobox.Item item={drink} data-value={drink}>
                    <Combobox.ItemText>{drink}</Combobox.ItemText>
                  </Combobox.Item>
                )}
              </Combobox.List>
              <Combobox.Empty>Nothing found.</Combobox.Empty>
            </Combobox.Content>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </Themed>
  );
}

/** The grouped tree, whose `List` callback iterates the **third argument** rather than its own data. */
function BasketCombobox(props: { portalMount?: Element }) {
  return (
    <Themed>
      <Combobox.Root
        items={BASKETS}
        groupToItems={(basket) => basket.fruits}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
      >
        <Combobox.Control style={CONTROL_STYLE}>
          <Combobox.Input aria-label="Fruit" />
          <Combobox.Trigger>
            <Combobox.Icon />
          </Combobox.Trigger>
        </Combobox.Control>
        <Combobox.Portal mount={props.portalMount}>
          <Combobox.Positioner>
            <Combobox.Content>
              <Combobox.List>
                {(basket: Basket, index: Accessor<number>, fruits: Accessor<Fruit[]>) => (
                  <>
                    <Show when={index() > 0}>
                      <Combobox.Separator />
                    </Show>
                    <Combobox.Group>
                      <Combobox.GroupLabel>{basket.kind}</Combobox.GroupLabel>
                      <For each={fruits()}>
                        {(fruit) => (
                          <Combobox.Item item={fruit} data-value={fruit.name}>
                            <Combobox.ItemText>{fruit.name}</Combobox.ItemText>
                          </Combobox.Item>
                        )}
                      </For>
                    </Combobox.Group>
                  </>
                )}
              </Combobox.List>
              <Combobox.Empty>Nothing found.</Combobox.Empty>
            </Combobox.Content>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </Themed>
  );
}

// ─── The input is the focus owner ───────────────────────────────────────────────────────────────

describe("Combobox — the input is the focus owner", () => {
  it("puts the combobox ARIA on the input, not on a button", async () => {
    const scope = mountCombobox((mount) => <FruitCombobox portalMount={mount} />);

    expect(scope.input().tagName).toBe("INPUT");
    expect(scope.input().getAttribute("role")).toBe("combobox");
    expect(scope.input().getAttribute("aria-autocomplete")).toBe("list");
    expect(scope.input().getAttribute("aria-expanded")).toBe("false");
    // `role="combobox"` implies `aria-haspopup="listbox"` in ARIA 1.2; only the plain `<button>`
    // needs to say it.
    expect(scope.input().hasAttribute("aria-haspopup")).toBe(false);
    expect(scope.trigger().getAttribute("aria-haspopup")).toBe("listbox");
    // The chevron is not a second combobox.
    expect(scope.trigger().getAttribute("role")).not.toBe("combobox");

    await expectNoA11yViolations(scope.container);
    scope.dispose();
  });

  it("keeps DOM focus on the input the whole time, and focuses no option", async () => {
    const scope = mountCombobox((mount) => <FruitCombobox portalMount={mount} />);

    await userEvent.click(scope.input());
    await userEvent.click(scope.trigger());
    await scope.waitForPositioned();
    expect(document.activeElement).toBe(scope.input());

    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement).toBe(scope.input());
    // The highlight is `aria-activedescendant`, never DOM focus. A pointer open enters on the
    // selected row — nothing is selected here, so on the first focusable one (Apple) — and the two
    // presses move from there.
    expect(scope.activeOption()?.dataset.value).toBe("Blueberry");
    for (const option of scope.options()) {
      expect(option).not.toBe(document.activeElement);
      expect(option.getAttribute("tabindex")).toBe("-1");
    }

    await userEvent.click(nth(scope.options(), 3));
    expect(document.activeElement).toBe(scope.input());

    scope.dispose();
  });

  it("excludes the chevron and the clear button from the tab order", async () => {
    const scope = mountCombobox((mount) => (
      <FruitCombobox portalMount={mount} defaultInputValue="Ban" withOutsideButton />
    ));

    expect(scope.trigger().tabIndex).toBe(-1);
    expect(scope.clear()?.tabIndex).toBe(-1);

    scope.input().focus();
    await userEvent.tab();
    // One press crosses the whole widget: neither gutter button is a stop.
    expect(document.activeElement).toBe(scope.container.querySelector('[data-testid="outside"]'));

    scope.dispose();
  });

  it("switches off the browser's own suggestion machinery", async () => {
    const scope = mountCombobox((mount) => <FruitCombobox portalMount={mount} />);

    expect(scope.input().getAttribute("autocomplete")).toBe("off");
    expect(scope.input().getAttribute("autocorrect")).toBe("off");
    expect(scope.input().getAttribute("autocapitalize")).toBe("none");
    // The *effective* property, not just the attribute: `spellcheck` is enumerated, so a JS `false`
    // would serialize to an absent attribute that inherits back on.
    expect(scope.input().getAttribute("spellcheck")).toBe("false");
    expect(scope.input().spellcheck).toBe(false);

    scope.dispose();
  });

  it("paints `data-active` only while the widget actually holds focus", async () => {
    const scope = mountCombobox((mount) => (
      <FruitCombobox portalMount={mount} defaultOpen withOutsideButton />
    ));
    await scope.waitForPositioned();

    // Opened without focus ever arriving: there is an active index (`aria-activedescendant` names a
    // row) and no highlight painted anywhere. That pairing is the point — a highlight that lingered
    // after focus left the widget is the bug it prevents.
    expect(scope.activeOption()).not.toBeNull();
    expect(scope.paintedOption()).toBeNull();

    scope.input().focus();
    await vi.waitFor(() => expect(scope.paintedOption()).not.toBeNull());
    expect(scope.paintedOption()).toBe(scope.activeOption());

    scope.dispose();
  });
});

// ─── The filter seam ────────────────────────────────────────────────────────────────────────────

describe("Combobox — the filter", () => {
  it("narrows the list as you type, and opens the popup doing it", async () => {
    const scope = mountCombobox((mount) => <FruitCombobox portalMount={mount} />);

    expect(scope.listbox()).toBeNull();
    scope.type("b");
    await scope.waitForPositioned();
    expect(scope.optionLabels()).toEqual(["Banana", "Blueberry"]);

    scope.type("bl");
    await vi.waitFor(() => expect(scope.optionLabels()).toEqual(["Blueberry"]));

    await expectNoA11yViolations(document.body, AXE_OPTIONS);
    scope.dispose();
  });

  it("narrows per keystroke through real typing too", async () => {
    const scope = mountCombobox((mount) => <FruitCombobox portalMount={mount} />);

    // The one-tick `type()` helper elsewhere is a convenience, not a different code path; this pins
    // the real per-character sequence, where each keystroke re-runs the memo on its own.
    await userEvent.click(scope.input());
    await userEvent.keyboard("ch");
    await vi.waitFor(() => expect(scope.optionLabels()).toEqual(["Cherry"]));

    scope.dispose();
  });

  it("folds case and diacritics — `cafe` matches `Café`", async () => {
    const scope = mountCombobox((mount) => <DrinkCombobox portalMount={mount} />);

    scope.type("cafe");
    await scope.waitForPositioned();
    // `toLowerCase().includes()` matches neither direction of this; the collator does.
    expect(scope.optionLabels()).toEqual(["Café"]);

    scope.dispose();
  });

  it("honors `startsWith`", async () => {
    const scope = mountCombobox((mount) => (
      <FruitCombobox portalMount={mount} filter="startsWith" />
    ));

    scope.type("berry");
    await vi.waitFor(() => expect(scope.optionLabels()).toEqual([]));
    scope.type("blue");
    await vi.waitFor(() => expect(scope.optionLabels()).toEqual(["Blueberry"]));

    scope.dispose();
  });

  it("honors a custom predicate", async () => {
    const scope = mountCombobox((mount) => (
      <FruitCombobox portalMount={mount} filter={(fruit, query) => fruit.id === query.length} />
    ));

    scope.type("xx");
    await scope.waitForPositioned();
    expect(scope.optionLabels()).toEqual(["Banana"]);

    scope.dispose();
  });

  it("leaves `items` untouched under `filter={false}`", async () => {
    const scope = mountCombobox((mount) => <FruitCombobox portalMount={mount} filter={false} />);

    scope.type("zzz");
    await scope.waitForPositioned();
    // The consumer owns the narrowing in this mode — the component must not have removed anything.
    expect(scope.optionLabels()).toEqual(["Apple", "Banana", "Blueberry", "Cherry"]);
    expect(scope.empty()).toBeNull();

    scope.dispose();
  });

  it("keeps the popup open when the filter empties the list, and shows `Empty`", async () => {
    const scope = mountCombobox((mount) => <FruitCombobox portalMount={mount} />);

    scope.type("zzz");
    await scope.waitForPositioned();
    // `Combobox.Root` flips the kernel's `allowsEmptyCollection` default to `true` precisely so this
    // stays open — closing would take the part whose job is saying "nothing matched" off screen.
    expect(scope.input().getAttribute("aria-expanded")).toBe("true");
    expect(scope.options()).toHaveLength(0);
    expect(scope.empty()?.textContent).toBe("Nothing found.");

    await expectNoA11yViolations(document.body, {
      ...AXE_OPTIONS,
      // An empty `role="listbox"` is the state under test. Axe returns `aria-required-children` as
      // *incomplete* for a container with no owned children, because "populated later" is legitimate
      // and indistinguishable from "malformed" — undecidable, not a defect. The message itself lives
      // beside the listbox rather than inside it, because `listbox` may only contain options and
      // groups.
      allowIncomplete: [...AXE_OPTIONS.allowIncomplete, "aria-required-children"],
    });

    scope.type("b");
    await vi.waitFor(() => expect(scope.empty()).toBeNull());

    scope.dispose();
  });

  it("shows every option again when the chevron opens a committed field", async () => {
    const scope = mountCombobox((mount) => (
      <FruitCombobox portalMount={mount} defaultValue={nth(FRUITS, 0)} />
    ));

    // The field reads "Apple". Filtering by it would leave a one-row list, so a pointer open resets
    // to the full set — react-aria's `showAllItems`.
    expect(scope.input().value).toBe("Apple");
    await userEvent.click(scope.trigger());
    await scope.waitForPositioned();
    expect(scope.optionLabels()).toEqual(["Apple", "Banana", "Blueberry", "Cherry"]);

    scope.dispose();
  });

  it("filters within groups and drops the ones left empty", async () => {
    const scope = mountCombobox((mount) => <BasketCombobox portalMount={mount} />);

    scope.type("berry");
    await scope.waitForPositioned();
    expect(scope.optionLabels()).toEqual(["Strawberry", "Blueberry"]);
    // Citrus lost every row, so its heading went with it — and the separator between two groups has
    // nothing left to separate.
    const groups = [...scope.portalMount.querySelectorAll('[role="group"]')];
    expect(groups).toHaveLength(1);
    expect(scope.inPopup("group-label")?.textContent).toBe("Berries");
    expect(scope.inPopup("separator")).toBeNull();

    await expectNoA11yViolations(document.body, AXE_OPTIONS);
    scope.dispose();
  });

  it("swaps one surviving group for another, repeatedly", async () => {
    const scope = mountCombobox((mount) => <BasketCombobox portalMount={mount} />);

    // Three things at once, and each has its own failure mode.
    //
    // **The group swap.** `<For>` disposes the outgoing group's row *inside its own memo*, and the
    // `Combobox.GroupLabel` in it unregisters its id from the group on teardown — an ancestor-signal
    // write from an owned scope, which Solid 2.0 refuses. That does not merely fail the group: it
    // **halts the whole reactive system**, so every later assertion here would be reading a frozen
    // page. `createListboxGroup`'s label-id signal is `ownedWrite` for exactly this, and `mount()`
    // fails the test on the diagnostic, which is what makes this the load-bearing pin.
    //
    // **The reused group.** `berry` → `straw` keeps `Berries` (same reference), so `<For>` reuses the
    // row and never re-invokes the callback — the group's rows can only follow if the callback's
    // third argument is read as an accessor inside the inner `<For>`.
    //
    // Nothing before Combobox exercised either: Select's `items` never change after mount.
    for (const [query, group, options] of [
      ["or", "Citrus", ["Orange"]],
      ["blue", "Berries", ["Blueberry"]],
      ["lem", "Citrus", ["Lemon"]],
      ["berry", "Berries", ["Strawberry", "Blueberry"]],
      ["straw", "Berries", ["Strawberry"]],
    ] as const) {
      scope.type(query);
      await vi.waitFor(() => expect(scope.optionLabels()).toEqual([...options]));
      expect(scope.inPopup("group-label")?.textContent).toBe(group);
      expect([...scope.portalMount.querySelectorAll('[role="group"]')]).toHaveLength(1);
    }

    scope.type("");
    await vi.waitFor(() => expect(scope.optionLabels()).toHaveLength(4));

    scope.dispose();
  });

  it("re-anchors the highlight when the filter changes the list under it", async () => {
    const scope = mountCombobox((mount) => <FruitCombobox portalMount={mount} />);

    scope.type("b");
    await scope.waitForPositioned();
    await userEvent.keyboard("{ArrowDown}");
    expect(scope.activeOption()?.dataset.value).toBe("Blueberry");

    // The active index pointed at row 1 of the old array. Narrowing to one row must not leave
    // `aria-activedescendant` naming nothing — a popup that still looks navigable and is not.
    scope.type("ban");
    await vi.waitFor(() => expect(scope.optionLabels()).toEqual(["Banana"]));
    expect(scope.activeOption()?.dataset.value).toBe("Banana");

    scope.dispose();
  });
});

// ─── Commit and revert ──────────────────────────────────────────────────────────────────────────

describe("Combobox — commit and revert", () => {
  it("commits the highlighted option on Enter and closes", async () => {
    const onChange = vi.fn();
    const scope = mountCombobox((mount) => (
      <FruitCombobox portalMount={mount} onChange={onChange} />
    ));

    scope.type("b");
    await scope.waitForPositioned();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(scope.activeOption()?.dataset.value).toBe("Blueberry");

    await userEvent.keyboard("{Enter}");
    await vi.waitFor(() => expect(scope.input().getAttribute("aria-expanded")).toBe("false"));
    expect(scope.input().value).toBe("Blueberry");
    expect(onChange).toHaveBeenCalledWith(nth(FRUITS, 2));

    scope.dispose();
  });

  it("leaves Enter alone while closed, so a form still submits", async () => {
    const submitted = vi.fn();
    const scope = mountCombobox((mount) => (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted();
        }}
      >
        <FruitCombobox portalMount={mount} menuTrigger="manual" />
      </form>
    ));

    scope.input().focus();
    await userEvent.keyboard("{Enter}");
    // The button trigger must always `preventDefault()` Enter (a native button synthesizes a click);
    // the input must not, or a combobox in a form swallows submission.
    expect(submitted).toHaveBeenCalledTimes(1);

    scope.dispose();
  });

  it("commits on Tab and lets focus leave", async () => {
    const scope = mountCombobox((mount) => <FruitCombobox portalMount={mount} withOutsideButton />);

    scope.type("che");
    await scope.waitForPositioned();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.tab();

    await vi.waitFor(() => expect(scope.input().value).toBe("Cherry"));
    expect(document.activeElement).toBe(scope.container.querySelector('[data-testid="outside"]'));

    scope.dispose();
  });

  it("reverts to the last committed value on Escape", async () => {
    const scope = mountCombobox((mount) => (
      <FruitCombobox portalMount={mount} defaultValue={nth(FRUITS, 3)} />
    ));

    expect(scope.input().value).toBe("Cherry");
    scope.type("app");
    await scope.waitForPositioned();

    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(scope.input().getAttribute("aria-expanded")).toBe("false"));
    expect(scope.input().value).toBe("Cherry");

    scope.dispose();
  });

  it("reverts on blur when nothing is highlighted and custom values are off", async () => {
    const scope = mountCombobox((mount) => (
      <FruitCombobox portalMount={mount} defaultValue={nth(FRUITS, 0)} withOutsideButton />
    ));

    scope.type("nonsense");
    await scope.waitForPositioned();
    await userEvent.click(scope.container.querySelector('[data-testid="outside"]') as HTMLElement);

    // A picker reporting `Apple` while showing `nonsense` is the mismatch `allowsCustomValue` exists
    // to make deliberate.
    await vi.waitFor(() => expect(scope.input().value).toBe("Apple"));

    scope.dispose();
  });

  it("keeps free text under `allowsCustomValue`", async () => {
    const scope = mountCombobox((mount) => (
      <FruitCombobox portalMount={mount} allowsCustomValue withOutsideButton />
    ));

    scope.type("Durian");
    await scope.waitForPositioned();
    await userEvent.click(scope.container.querySelector('[data-testid="outside"]') as HTMLElement);

    await vi.waitFor(() => expect(scope.input().getAttribute("aria-expanded")).toBe("false"));
    expect(scope.input().value).toBe("Durian");

    scope.dispose();
  });

  it("follows the selection when an option is clicked", async () => {
    const scope = mountCombobox((mount) => <FruitCombobox portalMount={mount} />);

    await userEvent.click(scope.trigger());
    await scope.waitForPositioned();
    await userEvent.click(nth(scope.options(), 1));

    await vi.waitFor(() => expect(scope.input().value).toBe("Banana"));
    expect(scope.input().getAttribute("aria-expanded")).toBe("false");

    scope.dispose();
  });

  it("clears both the text and the selection", async () => {
    const onChange = vi.fn();
    const scope = mountCombobox((mount) => (
      <FruitCombobox portalMount={mount} defaultValue={nth(FRUITS, 0)} onChange={onChange} />
    ));

    expect(scope.input().value).toBe("Apple");
    await userEvent.click(scope.clear() as HTMLElement);

    await vi.waitFor(() => expect(scope.input().value).toBe(""));
    // Both halves, never just the text: a field showing nothing while still reporting `Apple` is the
    // same mismatch as above.
    expect(onChange).toHaveBeenCalledWith(null);
    expect(document.activeElement).toBe(scope.input());
    // Nothing left to clear, so the button goes away.
    expect(scope.clear()).toBeNull();

    scope.dispose();
  });

  it("keeps the query and empties the field after each pick in multiple mode", async () => {
    const onChange = vi.fn();
    const scope = mountCombobox((mount) => (
      <FruitCombobox portalMount={mount} selectionMode="multiple" onChange={onChange} />
    ));

    scope.type("b");
    await scope.waitForPositioned();
    await userEvent.click(nth(scope.options(), 0));

    // The popup stays open (`shouldCloseOnSelect` derives from the mode) and the field becomes the
    // next query rather than a joined list of labels.
    expect(scope.input().getAttribute("aria-expanded")).toBe("true");
    await vi.waitFor(() => expect(scope.input().value).toBe(""));
    expect(onChange).toHaveBeenCalledWith([nth(FRUITS, 1)]);
    // The ticks in the list are the only report of what is chosen in this mode.
    expect(scope.selectedOptions().map((option) => option.dataset.value)).toEqual(["Banana"]);

    scope.dispose();
  });
});

// ─── menuTrigger ────────────────────────────────────────────────────────────────────────────────

describe("Combobox — menuTrigger", () => {
  it("opens on focus under `focus`, and not under the others", async () => {
    for (const trigger of ["input", "focus", "manual"] as const) {
      const scope = mountCombobox((mount) => (
        <FruitCombobox portalMount={mount} menuTrigger={trigger} />
      ));
      scope.input().focus();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      expect(scope.input().getAttribute("aria-expanded")).toBe(
        trigger === "focus" ? "true" : "false",
      );
      scope.dispose();
    }
  });

  it("does not open on typing under `manual`, but the chevron still does", async () => {
    const scope = mountCombobox((mount) => (
      <FruitCombobox portalMount={mount} menuTrigger="manual" />
    ));

    scope.type("b");
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(scope.input().getAttribute("aria-expanded")).toBe("false");

    await userEvent.click(scope.trigger());
    await scope.waitForPositioned();
    expect(scope.input().getAttribute("aria-expanded")).toBe("true");

    scope.dispose();
  });
});

// ─── The chevron ────────────────────────────────────────────────────────────────────────────────

describe("Combobox — the chevron", () => {
  it("toggles the popup rather than reopening what it just closed", async () => {
    const scope = mountCombobox((mount) => <FruitCombobox portalMount={mount} />);

    await userEvent.click(scope.trigger());
    await scope.waitForPositioned();
    expect(scope.input().getAttribute("aria-expanded")).toBe("true");

    // The regression this pins: the chevron sits inside `Combobox.Control`, and without that shell
    // registered as the kernel's anchor it falls outside `sparedElements` — so the capture-phase
    // pointerdown dismisses and this very click reopens, forever.
    await userEvent.click(scope.trigger());
    await vi.waitFor(() => expect(scope.input().getAttribute("aria-expanded")).toBe("false"));

    scope.dispose();
  });

  it("carries a localized name and keeps focus in the input", async () => {
    const scope = mountCombobox((mount) => <FruitCombobox portalMount={mount} />);

    // A bare chevron is an axe `button-name` violation, and the label comes from the i18n catalog
    // rather than from the consumer.
    expect(scope.trigger().getAttribute("aria-label")).toBe("Show suggestions");

    await userEvent.click(scope.trigger());
    await scope.waitForPositioned();
    expect(document.activeElement).toBe(scope.input());

    await expectNoA11yViolations(document.body, AXE_OPTIONS);
    scope.dispose();
  });

  it("matches the popup's width to the control, not to the bare input", async () => {
    // **This project compiles no Tailwind**, so the recipe's `w-(--anchor-width)` is an inert string
    // here. The property is spent through an inline `width` instead — the shape
    // `popover.browser.test.tsx` established — which is what makes this a test of the *measurement*
    // rather than of a class name.
    const scope = mountCombobox((mount) => (
      <Themed>
        <Combobox.Root items={FRUITS} itemToValue={itemToValue} itemToLabel={itemToLabel}>
          <Combobox.Control style={CONTROL_STYLE}>
            <Combobox.Input aria-label="Fruit" />
            <Combobox.Trigger>
              <Combobox.Icon />
            </Combobox.Trigger>
          </Combobox.Control>
          <Combobox.Portal mount={mount}>
            <Combobox.Positioner style={{ width: "var(--anchor-width)" }}>
              <Combobox.Content>
                <Combobox.List>
                  {(fruit: Fruit) => (
                    <Combobox.Item item={fruit}>
                      <Combobox.ItemText>{fruit.name}</Combobox.ItemText>
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Content>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      </Themed>
    ));

    await userEvent.click(scope.trigger());
    const positioner = await scope.waitForPositioned();
    const control = scope.inContainer("control") as HTMLElement;

    // `--anchor-width` is measured off the registered **anchor**, which `Combobox.Control` claims.
    // Left to the kernel's default the anchor is the focus owner — the bare `<input>` — and the popup
    // stops short of the two gutter buttons.
    expect(Math.round(positioner.getBoundingClientRect().width)).toBe(
      Math.round(control.getBoundingClientRect().width),
    );
    expect(scope.input().getBoundingClientRect().width).toBeLessThan(
      control.getBoundingClientRect().width,
    );

    scope.dispose();
  });
});

// ─── The announcer ──────────────────────────────────────────────────────────────────────────────

describe("Combobox — Status", () => {
  it("reports the filtered count through a live region", async () => {
    const scope = mountCombobox((mount) => <FruitCombobox portalMount={mount} />);

    await userEvent.click(scope.trigger());
    await scope.waitForPositioned();

    const status = scope.status() as HTMLElement;
    expect(status.getAttribute("role")).toBe("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.getAttribute("aria-atomic")).toBe("true");
    expect(status.textContent).toBe("4 options available");

    // The region is already mounted, so a later count change is announced by the region itself —
    // which is the half `createAnnounce` deliberately does not cover.
    scope.type("b");
    await vi.waitFor(() => expect(status.textContent).toBe("2 options available"));

    scope.dispose();
  });

  it("uses the singular when one option survives", async () => {
    const scope = mountCombobox((mount) => <FruitCombobox portalMount={mount} />);

    scope.type("ban");
    await scope.waitForPositioned();
    await vi.waitFor(() => expect(scope.status()?.textContent).toBe("1 option available"));

    scope.dispose();
  });

  it("announces into a body-level live region when the popup opens", async () => {
    const scope = mountCombobox((mount) => <FruitCombobox portalMount={mount} />);

    await userEvent.click(scope.trigger());
    await scope.waitForPositioned();

    // The rendered region mounts *with* its text, which most screen readers do not announce — so
    // `createAnnounce`'s own region, which lives on `document.body` and outlives every popup, is what
    // covers the open. Its node is outside both this mount's container and the portal host.
    await vi.waitFor(() => {
      const announced = [...document.querySelectorAll("[aria-live]")]
        .filter((node) => !scope.portalMount.contains(node) && !scope.container.contains(node))
        .map((node) => node.textContent);
      expect(announced.join(" ")).toContain("4 options available");
    });

    scope.dispose();
  });

  it("lets a consumer replace the message", async () => {
    const scope = mountCombobox((mount) => (
      <Themed>
        <Combobox.Root
          items={FRUITS}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          defaultOpen
        >
          <Combobox.Control style={CONTROL_STYLE}>
            <Combobox.Input aria-label="Fruit" />
          </Combobox.Control>
          <Combobox.Portal mount={mount}>
            <Combobox.Positioner>
              <Combobox.Content>
                <Combobox.List>
                  {(fruit: Fruit) => (
                    <Combobox.Item item={fruit}>
                      <Combobox.ItemText>{fruit.name}</Combobox.ItemText>
                    </Combobox.Item>
                  )}
                </Combobox.List>
                <Combobox.Status>{(count) => `${count} fruits`}</Combobox.Status>
              </Combobox.Content>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      </Themed>
    ));

    await scope.waitForPositioned();
    expect(scope.status()?.textContent).toBe("4 fruits");

    scope.dispose();
  });
});

// ─── IME composition ────────────────────────────────────────────────────────────────────────────

describe("Combobox — IME composition", () => {
  it("holds the filter while a composition is in progress", async () => {
    const scope = mountCombobox((mount) => <FruitCombobox portalMount={mount} />);
    const input = scope.input();

    scope.type("b");
    await scope.waitForPositioned();
    expect(scope.optionLabels()).toEqual(["Banana", "Blueberry"]);

    // A half-typed CJK word matches nothing, so filtering on it would empty the list and flash
    // `Combobox.Empty` on every keystroke of a multi-key character. The policy is Combobox's —
    // `createTextInput` exposes `isComposing()` precisely so it can be made here.
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    scope.type("bこ");
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(scope.optionLabels()).toEqual(["Banana", "Blueberry"]);
    expect(scope.empty()).toBeNull();

    // `compositionend` re-reads the element and commits, so the filter runs exactly once.
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set as (
      this: HTMLInputElement,
      value: string,
    ) => void;
    setter.call(input, "blue");
    input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "blue" }));
    await vi.waitFor(() => expect(scope.optionLabels()).toEqual(["Blueberry"]));

    scope.dispose();
  });
});

// ─── Disabled ───────────────────────────────────────────────────────────────────────────────────

describe("Combobox — disabled", () => {
  it("dims the shell, disables the input, and refuses to open", async () => {
    const scope = mountCombobox((mount) => <FruitCombobox portalMount={mount} disabled />);

    expect(scope.inContainer("control")?.hasAttribute("data-disabled")).toBe(true);
    expect(scope.input().disabled).toBe(true);
    expect((scope.trigger() as HTMLButtonElement).disabled).toBe(true);

    // `.click()` rather than `userEvent.click`: the latter waits for the element to become enabled
    // and times out. A native disabled `<button>` swallows the dispatched click, which is precisely
    // the assertion — nothing opens.
    scope.trigger().click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(scope.listbox()).toBeNull();

    await expectNoA11yViolations(scope.container);
    scope.dispose();
  });
});

// ─── Hydration ──────────────────────────────────────────────────────────────────────────────────

describe("Combobox hydration", () => {
  it("hydrates the server render without a mismatch", () => {
    const { dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    dispose();
  });

  it("leaves the hydrated Combobox interactive — it opens, and the server-rendered value survives", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    const scope = queries(container, document);
    await vi.waitFor(() => expect(scope.inContainer("input")).not.toBeNull());

    // The server render read the label straight off the data — no row was ever mounted for it, and
    // `createTextInput`'s untracked value snapshot is what makes the two agree.
    expect(scope.input().value).toBe("Strawberry");

    await userEvent.click(scope.trigger());
    await scope.waitForPositioned();
    // The popup is grouped, so this is also the grouped tree's client half.
    expect(scope.options()).toHaveLength(4);
    expect(scope.selectedOptions().map((option) => option.textContent)).toEqual(["Strawberry"]);

    dispose();
  });

  it("filters after hydrating", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    const scope = queries(container, document);
    await vi.waitFor(() => expect(scope.inContainer("input")).not.toBeNull());

    scope.type("lem");
    await scope.waitForPositioned();
    expect(scope.optionLabels()).toEqual(["Lemon"]);

    dispose();
  });

  it("has no accessibility violations after hydrating", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    await vi.waitFor(() =>
      expect(container.querySelector('[data-slot="combobox-input"]')).not.toBeNull(),
    );
    await expectNoA11yViolations(container);
    dispose();
  });
});
