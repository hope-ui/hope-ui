import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { type Accessor, createSignal, For } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import {
  type CollectionItem,
  type CreateCollectionReturn,
  createCollection,
} from "../create-collection";
import { type CreateListFocusReturn, createListFocus, type FocusMode } from "../create-list-focus";

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
