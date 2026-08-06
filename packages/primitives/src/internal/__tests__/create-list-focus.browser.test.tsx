import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { type Accessor, createSignal, For, untrack } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import {
  type CollectionItem,
  type CreateCollectionReturn,
  createCollection,
  type ItemSource,
} from "../create-collection";
import { type CreateListFocusReturn, createListFocus, type FocusMode } from "../create-list-focus";
import { scrollIntoView } from "../scroll-into-view";

/** Array access that asserts presence — under `noUncheckedIndexedAccess`, `list[i]` is `T | undefined`. */
function nth<T>(list: ArrayLike<T>, index: number): T {
  const value = list[index];
  if (value === undefined) {
    throw new Error(`no element at index ${index}`);
  }
  return value;
}

interface HarnessApi {
  collection: CreateCollectionReturn<string>;
  focus: CreateListFocusReturn<string>;
}

function Option(props: {
  collection: CreateCollectionReturn<string>;
  focus: CreateListFocusReturn<string>;
  value: string;
  disabled?: boolean;
}) {
  const [ref, setRef] = createSignal<HTMLLIElement>();
  const item: CollectionItem<string> = props.collection.register({
    ref,
    value: () => props.value,
    disabled: () => props.disabled ?? false,
  });
  return (
    <li
      ref={setRef}
      id={item.id}
      role="option"
      aria-selected={props.focus.isActive(item) ? "true" : "false"}
      tabindex={props.focus.getItemTabIndex(item)}
      data-value={props.value}
    >
      {props.value}
    </li>
  );
}

function FocusHarness(props: {
  values: string[];
  disabledValues?: string[];
  focusMode?: Accessor<FocusMode>;
  disabled?: Accessor<boolean>;
  entryIndex?: Accessor<number>;
  onReady: (api: HarnessApi) => void;
}) {
  const collection = createCollection<string>();
  const [containerRef, setContainerRef] = createSignal<HTMLUListElement>();
  const focus = createListFocus<string>({
    source: collection,
    focusMode: props.focusMode,
    disabled: props.disabled,
    entryIndex: props.entryIndex,
    element: containerRef,
  });
  props.onReady({ collection, focus });
  return (
    <ul
      ref={setContainerRef}
      role="listbox"
      aria-label="fruits"
      tabindex={focus.getListTabIndex()}
      aria-activedescendant={focus.activeDescendant()}
    >
      <For each={props.values}>
        {(value) => (
          <Option
            collection={collection}
            focus={focus}
            value={value}
            disabled={props.disabledValues?.includes(value)}
          />
        )}
      </For>
    </ul>
  );
}

function options(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[role="option"]')];
}
function tabindexes(container: HTMLElement): string[] {
  return options(container).map((element) => element.getAttribute("tabindex") ?? "");
}
function listbox(container: HTMLElement): HTMLElement {
  return container.querySelector('[role="listbox"]') as HTMLElement;
}

describe("createListFocus — roving mode", () => {
  it("makes exactly one item tabbable (the first, before navigation) and the container untabbable", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <FocusHarness values={["a", "b", "c"]} onReady={(a) => (api = a)} />
    ));

    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));
    expect(tabindexes(container)).toEqual(["0", "-1", "-1"]);
    expect(listbox(container).getAttribute("tabindex")).toBe("-1");
    expect(listbox(container).hasAttribute("aria-activedescendant")).toBe(false);
    dispose();
  });

  it("moves the roving tab stop and real DOM focus to the active item on navigation", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <FocusHarness values={["a", "b", "c"]} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    api.focus.focusIndex(2);

    await vi.waitFor(() => expect(tabindexes(container)).toEqual(["-1", "-1", "0"]));
    await expect.element(nth(options(container), 2)).toHaveFocus();
    expect(listbox(container).hasAttribute("aria-activedescendant")).toBe(false);
    dispose();
  });

  it("skips a disabled item when choosing the initial roving tab stop", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <FocusHarness values={["a", "b", "c"]} disabledValues={["a"]} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    // "a" is disabled, so the first focusable item ("b") is the tab stop.
    expect(tabindexes(container)).toEqual(["-1", "0", "-1"]);
    expect(api.focus.isFocusable(nth(api.collection.items(), 0))).toBe(false);
    expect(api.focus.isFocusable(nth(api.collection.items(), 1))).toBe(true);
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <FocusHarness values={["a", "b", "c"]} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createListFocus — focus gate + entry item", () => {
  it("isFocused defaults to false and round-trips through setFocused", async () => {
    let api!: HarnessApi;
    const { dispose } = mount(() => (
      <FocusHarness values={["a", "b", "c"]} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    expect(api.focus.isFocused()).toBe(false);
    api.focus.setFocused(true);
    await vi.waitFor(() => expect(api.focus.isFocused()).toBe(true));
    api.focus.setFocused(false);
    await vi.waitFor(() => expect(api.focus.isFocused()).toBe(false));
    dispose();
  });

  it("makes the entry index the tab stop and what focusEntry activates", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <FocusHarness values={["a", "b", "c"]} entryIndex={() => 2} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    // Before any navigation the entry index (2) is the single tab stop — Tab lands there directly.
    expect(tabindexes(container)).toEqual(["-1", "-1", "0"]);

    api.focus.focusEntry();
    await vi.waitFor(() => expect(api.focus.activeIndex()).toBe(2));
    await expect.element(nth(options(container), 2)).toHaveFocus();
    dispose();
  });

  it("falls back to the first focusable item when the entry index is not focusable", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <FocusHarness
        values={["a", "b", "c"]}
        disabledValues={["a"]}
        entryIndex={() => 0}
        onReady={(a) => (api = a)}
      />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    // Entry index 0 is disabled, so both the tab stop and focusEntry fall back to the first focusable ("b").
    expect(tabindexes(container)).toEqual(["-1", "0", "-1"]);
    api.focus.focusEntry();
    await vi.waitFor(() => expect(api.focus.activeIndex()).toBe(1));
    dispose();
  });
});

describe("createListFocus — activedescendant mode", () => {
  const activedescendant = () => "activedescendant" as const;

  it("keeps the container tabbable + owns aria-activedescendant, with items untabbable", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <FocusHarness
        values={["a", "b", "c"]}
        focusMode={activedescendant}
        onReady={(a) => (api = a)}
      />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    api.focus.focusIndex(1);

    await vi.waitFor(() =>
      expect(listbox(container).getAttribute("aria-activedescendant")).toBe(
        nth(api.collection.items(), 1).id,
      ),
    );
    expect(listbox(container).getAttribute("tabindex")).toBe("0");
    expect(tabindexes(container)).toEqual(["-1", "-1", "-1"]);
    dispose();
  });

  it("never moves DOM focus off the container", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <FocusHarness
        values={["a", "b", "c"]}
        focusMode={activedescendant}
        onReady={(a) => (api = a)}
      />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    listbox(container).focus();
    await expect.element(listbox(container)).toHaveFocus();

    api.focus.focusIndex(2);
    await vi.waitFor(() =>
      expect(listbox(container).getAttribute("aria-activedescendant")).toBe(
        nth(api.collection.items(), 2).id,
      ),
    );
    // Focus stayed on the container — no item ever received it.
    await expect.element(listbox(container)).toHaveFocus();
    for (const option of options(container)) {
      expect(option).not.toHaveFocus();
    }
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <FocusHarness
        values={["a", "b", "c"]}
        focusMode={activedescendant}
        onReady={(a) => (api = a)}
      />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));
    await expectNoA11yViolations(container);
    dispose();
  });
});

// ─── Scrolling the active row into view ──────────────────────────────────────────────────────────

const ROW = 30;
const VIEWPORT = 90; // exactly three rows

interface ScrollHarnessApi extends HarnessApi {
  /** Every index `scrollIndexIntoView` was asked for, in order. */
  scrolledIndices: number[];
}

/**
 * A **fully mounted** list that is nevertheless clipped, over a source that implements
 * `scrollIndexIntoView` — the shape `createDataCollection` will have, and the one a Select needs:
 * activedescendant mode moves no DOM focus, so nothing but this reveals the highlighted row.
 */
function ScrollableFocusHarness(props: {
  values: string[];
  focusMode?: Accessor<FocusMode>;
  onReady: (api: ScrollHarnessApi) => void;
}) {
  const collection = createCollection<string>();
  const [containerRef, setContainerRef] = createSignal<HTMLUListElement>();
  const scrolledIndices: number[] = [];

  const source: ItemSource<string> = {
    items: collection.items,
    // Untracked on purpose: this is an imperative DOM sync called from a focus move, never a
    // dependency — and roving mode would otherwise run it inside `createListFocus`'s own effect.
    scrollIndexIntoView: (index) =>
      untrack(() => {
        scrolledIndices.push(index);
        const list = containerRef();
        const element = collection.items()[index]?.element();
        if (list && element) {
          scrollIntoView(list, element);
        }
      }),
  };

  const focus = createListFocus<string>({
    source,
    focusMode: props.focusMode ?? (() => "activedescendant"),
    element: containerRef,
  });
  props.onReady({ collection, focus, scrolledIndices });

  return (
    <ul
      ref={setContainerRef}
      role="listbox"
      aria-label="fruits"
      tabindex={focus.getListTabIndex()}
      aria-activedescendant={focus.activeDescendant()}
      style={{ height: `${VIEWPORT}px`, "overflow-y": "auto" }}
    >
      <For each={props.values}>
        {(value) => {
          const [ref, setRef] = createSignal<HTMLLIElement>();
          const item = collection.register({ ref, value: () => value });
          return (
            <li
              ref={setRef}
              id={item.id}
              role="option"
              aria-selected={focus.isActive(item) ? "true" : "false"}
              tabindex={focus.getItemTabIndex(item)}
              data-value={value}
              style={{ height: `${ROW}px` }}
            >
              {value}
            </li>
          );
        }}
      </For>
    </ul>
  );
}

const TEN_ROWS = Array.from({ length: 10 }, (_, index) => `row-${index}`);

describe("createListFocus — scrolling the active item into view", () => {
  it("scrolls a mounted but clipped row into view in activedescendant mode", async () => {
    let api!: ScrollHarnessApi;
    const { container, dispose } = mount(() => (
      <ScrollableFocusHarness values={TEN_ROWS} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(10));

    const list = listbox(container);
    expect(list.scrollTop).toBe(0);

    api.focus.focusIndex(6);

    // Row 6 spans [180, 210) in a 90px port: `"nearest"` brings it flush with the bottom edge.
    await vi.waitFor(() => expect(list.scrollTop).toBe(210 - VIEWPORT));
    expect(list.getAttribute("aria-activedescendant")).toBe(nth(api.collection.items(), 6).id);
    // Nothing took DOM focus — the row is visible because it was scrolled to, not focused.
    for (const option of options(container)) {
      expect(option).not.toHaveFocus();
    }
    await expectNoA11yViolations(container);
    dispose();
  });

  it("leaves the scroll alone when the row is already visible", async () => {
    let api!: ScrollHarnessApi;
    const { container, dispose } = mount(() => (
      <ScrollableFocusHarness values={TEN_ROWS} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(10));

    api.focus.focusIndex(1);
    await vi.waitFor(() => expect(api.focus.activeIndex()).toBe(1));
    expect(api.scrolledIndices).toEqual([1]);
    expect(listbox(container).scrollTop).toBe(0);
    dispose();
  });

  it("leaves a mounted row to the native focus scroll in roving mode", async () => {
    let api!: ScrollHarnessApi;
    const roving = () => "roving" as const;
    const { container, dispose } = mount(() => (
      <ScrollableFocusHarness values={TEN_ROWS} focusMode={roving} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(10));

    const list = listbox(container);
    api.focus.focusIndex(6);

    // The row still ends up visible — but the browser did it, as part of moving real DOM focus, and
    // it computes the offset from the true scrollport. Asking the source too would land a second,
    // coarser scroll on top of that exact one.
    await expect.element(nth(options(container), 6)).toHaveFocus();
    expect(api.scrolledIndices).toEqual([]);
    expect(list.scrollTop).toBeGreaterThan(0);
    dispose();
  });

  it("skips the scroll entirely when asked to", async () => {
    let api!: ScrollHarnessApi;
    const { container, dispose } = mount(() => (
      <ScrollableFocusHarness values={TEN_ROWS} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(10));

    api.focus.focusIndex(6, { scroll: false });
    await vi.waitFor(() => expect(api.focus.activeIndex()).toBe(6));
    expect(api.scrolledIndices).toEqual([]);
    expect(listbox(container).scrollTop).toBe(0);

    // …and `focus(item)` takes the same override.
    api.focus.focus(nth(api.collection.items(), 8), { scroll: false });
    await vi.waitFor(() => expect(api.focus.activeIndex()).toBe(8));
    expect(api.scrolledIndices).toEqual([]);
    expect(listbox(container).scrollTop).toBe(0);
    dispose();
  });
});

describe("createListFocus — disabled list", () => {
  it("makes nothing tabbable and emits no aria-activedescendant", async () => {
    let api!: HarnessApi;
    const disabled = () => true;
    const activedescendant = () => "activedescendant" as const;
    const { container, dispose } = mount(() => (
      <FocusHarness
        values={["a", "b", "c"]}
        focusMode={activedescendant}
        disabled={disabled}
        onReady={(a) => (api = a)}
      />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    expect(listbox(container).getAttribute("tabindex")).toBe("-1");
    expect(tabindexes(container)).toEqual(["-1", "-1", "-1"]);
    expect(listbox(container).hasAttribute("aria-activedescendant")).toBe(false);
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let api!: HarnessApi;
    const disabled = () => true;
    const { container, dispose } = mount(() => (
      <FocusHarness values={["a", "b"]} disabled={disabled} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(2));
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createListFocus — re-homing the active item when the collection changes", () => {
  /** Mounts the harness over a signal-backed value list, so a test can remove rows. */
  function renderRemovable(initial: string[], disabledValues?: string[]) {
    const [values, setValues] = createSignal(initial);
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <FocusHarness values={values()} disabledValues={disabledValues} onReady={(a) => (api = a)} />
    ));
    const activeValue = () => untrack(() => api.focus.activeItem()?.value());
    const remove = (...removed: string[]) =>
      setValues((current) => current.filter((value) => !removed.includes(value)));
    return { api, container, dispose, activeValue, remove, setValues };
  }

  it("keeps the highlight on the same item when an earlier one is removed", async () => {
    const { api, activeValue, remove, dispose } = renderRemovable(["a", "b", "c", "d"]);
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(4));

    api.focus.focusIndex(2);
    await vi.waitFor(() => expect(activeValue()).toBe("c"));

    remove("a");

    // The index alone is a slot number: "c" slid from 2 to 1, so trusting the raw index would hand
    // the highlight to "d" with nothing failing.
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));
    expect(activeValue()).toBe("c");
    dispose();
  });

  it("falls back to the previous item when the active — and last — item is removed", async () => {
    const { api, activeValue, remove, dispose } = renderRemovable(["a", "b", "c"]);
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    api.focus.focusIndex(2);
    await vi.waitFor(() => expect(activeValue()).toBe("c"));

    remove("c");

    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(2));
    expect(activeValue()).toBe("b");
    dispose();
  });

  it("moves to the following item when an active item mid-list is removed", async () => {
    const { api, activeValue, remove, dispose } = renderRemovable(["a", "b", "c", "d"]);
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(4));

    api.focus.focusIndex(1);
    await vi.waitFor(() => expect(activeValue()).toBe("b"));

    remove("b");

    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));
    expect(activeValue()).toBe("c");
    dispose();
  });

  it("skips a disabled row while walking for the replacement", async () => {
    const { api, activeValue, remove, dispose } = renderRemovable(["a", "b", "c", "d"], ["c"]);
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(4));

    api.focus.focusIndex(1);
    await vi.waitFor(() => expect(activeValue()).toBe("b"));

    remove("b");

    // "c" is disabled and `skipDisabled` is on by default, so the walk carries past it to "d".
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));
    expect(activeValue()).toBe("d");
    dispose();
  });

  it("clears the active index when every item is removed", async () => {
    const { api, remove, dispose } = renderRemovable(["a", "b"]);
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(2));

    api.focus.focusIndex(1);
    await vi.waitFor(() => expect(untrack(() => api.focus.activeIndex())).toBe(1));

    remove("a", "b");

    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(0));
    expect(untrack(() => api.focus.activeIndex())).toBe(-1);
    dispose();
  });

  it("leaves the active row alone when the same list arrives as a fresh array", async () => {
    // The virtualization-adjacent case, and the commoner one: a consumer passing
    // `items={fruits.filter(…)}` hands a new array identity every render, so the source's items memo
    // re-emits with every key unchanged. Re-homing must be a no-op there, not a focus move.
    const { api, activeValue, setValues, dispose } = renderRemovable(["a", "b", "c"]);
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    api.focus.focusIndex(1);
    await vi.waitFor(() => expect(activeValue()).toBe("b"));
    const focused = document.activeElement;

    setValues((current) => [...current]);

    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));
    expect(untrack(() => api.focus.activeIndex())).toBe(1);
    expect(activeValue()).toBe("b");
    expect(document.activeElement).toBe(focused);
    dispose();
  });

  it("has no baseline accessibility violations after a removal", async () => {
    const { api, container, remove, dispose } = renderRemovable(["a", "b", "c"]);
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    api.focus.focusIndex(2);
    remove("a");
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(2));

    await expectNoA11yViolations(container);
    dispose();
  });
});
