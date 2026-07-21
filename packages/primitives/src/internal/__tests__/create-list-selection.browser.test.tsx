import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { type Accessor, createSignal, For } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { composeEventHandlers } from "../../utils/events";
import { createKeyboardHandler } from "../../utils/keymap";
import {
  type CollectionItem,
  type CreateCollectionReturn,
  createCollection,
} from "../create-collection";
import { type CreateListFocusReturn, createListFocus } from "../create-list-focus";
import { type CreateListNavigationReturn, createListNavigation } from "../create-list-navigation";
import {
  type CreateListSelectionReturn,
  createListSelection,
  type SelectionBehavior,
  type SelectionMode,
} from "../create-list-selection";

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
  navigation: CreateListNavigationReturn;
  selection: CreateListSelectionReturn<string>;
}

function Option(props: { api: HarnessApi; value: string; mode: () => SelectionMode }) {
  const [ref, setRef] = createSignal<HTMLLIElement>();
  const item: CollectionItem<string> = props.api.collection.register({
    ref,
    value: () => props.value,
  });
  return (
    <li
      ref={setRef}
      id={item.id}
      role="option"
      aria-selected={props.api.selection.isSelected(item) ? "true" : "false"}
      tabindex={props.api.focus.getItemTabIndex(item)}
      data-value={props.value}
      onClick={() => {
        props.api.focus.focus(item);
        props.mode() === "multiple"
          ? props.api.selection.toggle(item)
          : props.api.selection.selectOne(item);
      }}
    >
      {props.value}
    </li>
  );
}

function SelectionHarness(props: {
  values: string[];
  selectionMode?: Accessor<SelectionMode>;
  selectionBehavior?: Accessor<SelectionBehavior>;
  onReady: (api: HarnessApi) => void;
}) {
  const mode = () => props.selectionMode?.() ?? "single";
  const collection = createCollection<string>();
  const [containerRef, setContainerRef] = createSignal<HTMLUListElement>();
  const focus = createListFocus<string>({ source: collection, element: containerRef });
  const navigation = createListNavigation<string>({ focus });
  const selection = createListSelection<string>({
    focus,
    selectionMode: props.selectionMode,
    selectionBehavior: props.selectionBehavior,
  });
  const api: HarnessApi = { collection, focus, navigation, selection };
  props.onReady(api);

  const selectionKeys = createKeyboardHandler<HTMLElement>()
    .on(" ", (event) => {
      event.preventDefault();
      selection.toggleActive();
    })
    .on("Enter", (event) => {
      event.preventDefault();
      selection.selectActive();
    })
    .on("mod+a", (event) => {
      event.preventDefault();
      selection.selectAll();
    })
    .on("shift+ArrowDown", (event) => {
      event.preventDefault();
      // Use the peeked target explicitly: `navigation.next()` writes the active index, but that
      // write isn't visible to a synchronous `focus.activeIndex()` read until the next flush.
      const target = navigation.peekNext();
      if (target < 0) {
        return;
      }
      selection.selectRange(target);
      focus.focusIndex(target);
    });

  return (
    <ul
      ref={setContainerRef}
      role="listbox"
      aria-label="fruits"
      aria-multiselectable={mode() === "multiple" ? "true" : undefined}
      tabindex={focus.getListTabIndex()}
      onKeyDown={composeEventHandlers(selectionKeys.onKeyDown, navigation.onKeyDown)}
    >
      <For each={props.values}>{(value) => <Option api={api} value={value} mode={mode} />}</For>
    </ul>
  );
}

const FRUITS = ["Apple", "Banana", "Cherry", "Date"];

function optionEls(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[role="option"]')];
}
function selectedValues(container: HTMLElement): string[] {
  return optionEls(container)
    .filter((element) => element.getAttribute("aria-selected") === "true")
    .map((element) => element.dataset.value as string);
}

describe("createListSelection — single", () => {
  it("selects one item and replaces on the next selection", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <SelectionHarness values={FRUITS} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(4));

    await userEvent.click(nth(optionEls(container), 1));
    await vi.waitFor(() => expect(selectedValues(container)).toEqual(["Banana"]));

    await userEvent.click(nth(optionEls(container), 3));
    await vi.waitFor(() => expect(selectedValues(container)).toEqual(["Date"]));
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <SelectionHarness values={FRUITS} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(4));
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createListSelection — multiple", () => {
  const multiple = () => "multiple" as const;

  it("toggles items with Space, accumulating a set", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <SelectionHarness values={FRUITS} selectionMode={multiple} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(4));

    api.focus.focusIndex(0);
    await userEvent.keyboard(" "); // toggle Apple on
    await userEvent.keyboard("{ArrowDown}{ArrowDown}"); // → Cherry
    await userEvent.keyboard(" "); // toggle Cherry on
    await vi.waitFor(() => expect(selectedValues(container).sort()).toEqual(["Apple", "Cherry"]));

    // Space again on Cherry toggles it off.
    await userEvent.keyboard(" ");
    await vi.waitFor(() => expect(selectedValues(container)).toEqual(["Apple"]));
    dispose();
  });

  it("selects everything with mod+a", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <SelectionHarness values={FRUITS} selectionMode={multiple} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(4));

    api.focus.focusIndex(0);
    // `mod` resolves to ⌘ on Apple platforms and Ctrl elsewhere — press the one this platform uses.
    const modKey = /mac|iphone|ipad/i.test(navigator.platform) ? "Meta" : "Control";
    await userEvent.keyboard(`{${modKey}>}a{/${modKey}}`);
    await vi.waitFor(() => expect(selectedValues(container).sort()).toEqual([...FRUITS].sort()));
    dispose();
  });

  it("extends a range from the anchor with Shift+ArrowDown", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <SelectionHarness values={FRUITS} selectionMode={multiple} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(4));

    api.focus.focusIndex(0); // anchor point
    api.selection.setAnchor(0);
    await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}"); // → 0..1
    await vi.waitFor(() => expect(selectedValues(container)).toEqual(["Apple", "Banana"]));

    await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}"); // → 0..2
    await vi.waitFor(() =>
      expect(selectedValues(container)).toEqual(["Apple", "Banana", "Cherry"]),
    );
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <SelectionHarness values={FRUITS} selectionMode={multiple} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(4));
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createListSelection — follow focus", () => {
  const follow = () => "follow" as const;

  it("selects the active item as focus moves", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <SelectionHarness values={FRUITS} selectionBehavior={follow} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(4));

    api.focus.focusIndex(0);
    await vi.waitFor(() => expect(selectedValues(container)).toEqual(["Apple"]));

    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(selectedValues(container)).toEqual(["Banana"]));
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <SelectionHarness values={FRUITS} selectionBehavior={follow} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(4));
    await expectNoA11yViolations(container);
    dispose();
  });
});

// ─── Object values ──────────────────────────────────────────────────────────────────────────────
// A value need not be a primitive or a reference-stable object: `itemToValue` maps each value to an
// identity key compared with `===`, and `isItemEqualToValue` overrides the rule entirely (the Base
// UI model, replacing the retired Angular `compareWith`).

interface Fruit {
  id: number;
  name: string;
}

interface ObjApi {
  collection: CreateCollectionReturn<Fruit>;
  focus: CreateListFocusReturn<Fruit>;
  selection: CreateListSelectionReturn<Fruit>;
}

function ObjHarness(props: {
  fruits: Fruit[];
  value?: Accessor<Fruit[]>;
  itemToValue?: (fruit: Fruit) => unknown;
  isItemEqualToValue?: (a: Fruit, b: Fruit) => boolean;
  onReady: (api: ObjApi) => void;
}) {
  const collection = createCollection<Fruit>();
  const focus = createListFocus<Fruit>({ source: collection });
  const selection = createListSelection<Fruit>({
    focus,
    selectionMode: () => "multiple",
    value: props.value,
    itemToValue: props.itemToValue,
    isItemEqualToValue: props.isItemEqualToValue,
  });
  props.onReady({ collection, focus, selection });
  return (
    <ul role="listbox" aria-label="fruits" aria-multiselectable="true">
      <For each={props.fruits}>
        {(fruit) => {
          const [ref, setRef] = createSignal<HTMLLIElement>();
          const item = collection.register({ ref, value: () => fruit });
          return (
            <li
              ref={setRef}
              id={item.id}
              role="option"
              aria-selected={selection.isSelected(item) ? "true" : "false"}
              tabindex={focus.getItemTabIndex(item)}
              data-id={fruit.id}
              onClick={() => selection.toggle(item)}
            >
              {fruit.name}
            </li>
          );
        }}
      </For>
    </ul>
  );
}

function selectedIds(container: HTMLElement): string[] {
  return [...container.querySelectorAll<HTMLElement>('[role="option"]')]
    .filter((element) => element.getAttribute("aria-selected") === "true")
    .map((element) => element.dataset.id as string);
}

describe("createListSelection — object values", () => {
  const FRUITS: Fruit[] = [
    { id: 1, name: "Apple" },
    { id: 2, name: "Banana" },
    { id: 3, name: "Cherry" },
  ];

  const byId = (fruit: Fruit) => fruit.id;

  it("selects the matching option when a controlled value maps to the same itemToValue key but a fresh reference", async () => {
    let api!: ObjApi;
    // A brand-new object, NOT the registered `Banana` reference — only the id key matches.
    const value = () => [{ id: 2, name: "Banana (from server)" }];
    const { container, dispose } = mount(() => (
      <ObjHarness fruits={FRUITS} value={value} itemToValue={byId} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    // Reference equality would miss this; the id-key `itemToValue` matches it.
    await vi.waitFor(() => expect(selectedIds(container)).toEqual(["2"]));
    dispose();
  });

  it("toggles object values through the itemToValue key", async () => {
    let api!: ObjApi;
    const { container, dispose } = mount(() => (
      <ObjHarness fruits={FRUITS} itemToValue={byId} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    await userEvent.click(container.querySelector('[data-id="1"]') as HTMLElement);
    await userEvent.click(container.querySelector('[data-id="3"]') as HTMLElement);
    await vi.waitFor(() => expect(selectedIds(container).sort()).toEqual(["1", "3"]));

    await userEvent.click(container.querySelector('[data-id="1"]') as HTMLElement);
    await vi.waitFor(() => expect(selectedIds(container)).toEqual(["3"]));
    dispose();
  });

  it("defaults to reference/=== equality when no itemToValue is given", async () => {
    let api!: ObjApi;
    // A fresh object with the same id does NOT match under the default identity `itemToValue`,
    // because the default equality is plain `===` on the value itself.
    const value = () => [{ id: 2, name: "Banana (from server)" }];
    const { container, dispose } = mount(() => (
      <ObjHarness fruits={FRUITS} value={value} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    // Nothing selected: the controlled value is a different reference than any registered fruit.
    await vi.waitFor(() => expect(selectedIds(container)).toEqual([]));
    dispose();
  });

  it("honors a custom isItemEqualToValue", async () => {
    let api!: ObjApi;
    // Compare by name instead of id: a value with a different id but matching name selects Apple.
    const value = () => [{ id: 99, name: "Apple" }];
    const isItemEqualToValue = (a: Fruit, b: Fruit) => a.name === b.name;
    const { container, dispose } = mount(() => (
      <ObjHarness
        fruits={FRUITS}
        value={value}
        isItemEqualToValue={isItemEqualToValue}
        onReady={(a) => (api = a)}
      />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    await vi.waitFor(() => expect(selectedIds(container)).toEqual(["1"]));
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let api!: ObjApi;
    const { container, dispose } = mount(() => (
      <ObjHarness fruits={FRUITS} itemToValue={byId} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));
    await expectNoA11yViolations(container);
    dispose();
  });
});
