import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { type Accessor, createSignal, For } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import {
  type CollectionItem,
  type CreateCollectionReturn,
  createCollection,
} from "../../collection/collection";
import { type CreateListFocusReturn, createListFocus } from "../../list-focus/list-focus";
import { createRegisteredElement } from "../../registered-element/registered-element";
import { createVirtualCollection } from "../../virtual-collection/virtual-collection";
import { type CreateListTypeaheadReturn, createListTypeahead } from "../list-typeahead";

/** Array access that asserts presence — under `noUncheckedIndexedAccess`, `list[i]` is `T | undefined`. */
function nth<T>(list: ArrayLike<T>, index: number): T {
  const value = list[index];
  if (value === undefined) throw new Error(`no element at index ${index}`);
  return value;
}

interface HarnessApi {
  collection: CreateCollectionReturn<string>;
  focus: CreateListFocusReturn<string>;
  typeahead: CreateListTypeaheadReturn;
}

function Option(props: {
  collection: CreateCollectionReturn<string>;
  focus: CreateListFocusReturn<string>;
  value: string;
}) {
  const [ref, setRef] = createSignal<HTMLLIElement>();
  const item: CollectionItem<string> = props.collection.register({ ref, value: () => props.value });
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

function TypeaheadHarness(props: {
  values: string[];
  delay?: Accessor<number>;
  onReady: (api: HarnessApi) => void;
}) {
  const collection = createCollection<string>();
  const [containerRef, setContainerRef] = createSignal<HTMLUListElement>();
  const focus = createListFocus<string>({ source: collection, element: containerRef });
  const typeahead = createListTypeahead<string>({ focus, delay: props.delay });
  props.onReady({ collection, focus, typeahead });
  return (
    <ul
      ref={setContainerRef}
      role="listbox"
      aria-label="fruits"
      tabindex={focus.getListTabIndex()}
      onKeyDown={typeahead.onKeyDown}
    >
      <For each={props.values}>
        {(value) => <Option collection={collection} focus={focus} value={value} />}
      </For>
    </ul>
  );
}

const FRUITS = ["Apple", "Banana", "Blueberry", "Cherry", "Cranberry"];

function optionEls(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[role="option"]')];
}

describe("createListTypeahead", () => {
  it("focuses the first item matching a typed character", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <TypeaheadHarness values={FRUITS} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(5));

    api.focus.focusIndex(0);
    await expect.element(nth(optionEls(container), 0)).toHaveFocus();

    await userEvent.keyboard("c"); // → Cherry (first starting with "c")
    await expect.element(nth(optionEls(container), 3)).toHaveFocus();
    dispose();
  });

  it("extends a multi-character query to refine the match", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <TypeaheadHarness values={FRUITS} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(5));
    api.focus.focusIndex(0);

    await userEvent.keyboard("bl"); // "b" → Banana, then "bl" → Blueberry
    await expect.element(nth(optionEls(container), 2)).toHaveFocus();
    dispose();
  });

  it("cycles through matches when the same letter is pressed repeatedly", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <TypeaheadHarness values={FRUITS} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(5));
    api.focus.focusIndex(0); // Apple

    await userEvent.keyboard("b"); // Banana
    await expect.element(nth(optionEls(container), 1)).toHaveFocus();
    await userEvent.keyboard("b"); // Blueberry
    await expect.element(nth(optionEls(container), 2)).toHaveFocus();
    await userEvent.keyboard("b"); // wraps back to Banana
    await expect.element(nth(optionEls(container), 1)).toHaveFocus();
    dispose();
  });

  it("reports isTyping while a buffer is active and clears it after the delay", async () => {
    let api!: HarnessApi;
    const delay = () => 150;
    const { dispose } = mount(() => (
      <TypeaheadHarness values={FRUITS} delay={delay} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(5));
    api.focus.focusIndex(0);

    api.typeahead.search("c");
    // The write is visible after the next flush, so poll rather than reading synchronously.
    await vi.waitFor(() => expect(api.typeahead.isTyping()).toBe(true));
    await vi.waitFor(() => expect(api.typeahead.isTyping()).toBe(false));
    dispose();
  });

  it("ignores a leading space so Space stays free for selection", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <TypeaheadHarness values={FRUITS} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(5));
    api.focus.focusIndex(2); // Blueberry

    api.typeahead.search(" ");
    expect(api.typeahead.isTyping()).toBe(false);
    // Focus unchanged — the space did not start a search.
    await expect.element(nth(optionEls(container), 2)).toHaveFocus();
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let api!: HarnessApi;
    const { container, dispose } = mount(() => (
      <TypeaheadHarness values={FRUITS} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(5));
    await expectNoA11yViolations(container);
    dispose();
  });
});

// ─── Typeahead over a virtualized collection ───────────────────────────────────────────────────
// The whole point of the item-source seam: typeahead sees offscreen rows through their `textValue`
// data, and focusing one scrolls it in.

const VCOUNT = 500;
const VROW = 30;
const ZEBRA_INDEX = 300;

interface VApi {
  focus: CreateListFocusReturn<number>;
  typeahead: CreateListTypeaheadReturn;
  collection: ReturnType<typeof createVirtualCollection<number>>;
}

function vLabel(index: number): string {
  return index === ZEBRA_INDEX ? "Zebra" : `Item ${index}`;
}

function VRow(props: { api: VApi; index: number; start: number }) {
  const [ref, setRef] = createSignal<HTMLDivElement>();
  createRegisteredElement({
    ref,
    register: (element) => props.api.collection.registerElement(props.index, element),
    unregister: () => props.api.collection.registerElement(props.index, null),
  });
  const item = () => nth(props.api.collection.items(), props.index);
  return (
    <div
      ref={setRef}
      data-index={props.index}
      id={item().id}
      role="option"
      aria-selected={props.api.focus.isActive(item()) ? "true" : "false"}
      aria-setsize={VCOUNT}
      aria-posinset={props.index + 1}
      tabindex={props.api.focus.getItemTabIndex(item())}
      style={{ position: "absolute", top: `${props.start}px`, height: `${VROW}px`, width: "100%" }}
    >
      {vLabel(props.index)}
    </div>
  );
}

function VirtualTypeaheadHarness(props: { onReady: (api: VApi) => void }) {
  const [scrollRef, setScrollRef] = createSignal<HTMLDivElement>();
  const collection = createVirtualCollection<number>({
    count: () => VCOUNT,
    scrollElement: scrollRef,
    estimateSize: () => VROW,
    getItemData: (index) => ({ id: `v-${index}`, value: index, textValue: vLabel(index) }),
    overscan: 3,
  });
  const focus = createListFocus<number>({ source: collection, element: scrollRef });
  const typeahead = createListTypeahead<number>({ focus });
  const api: VApi = { collection, focus, typeahead };
  props.onReady(api);
  return (
    <div
      ref={setScrollRef}
      role="listbox"
      aria-label="virtual"
      tabindex={focus.getListTabIndex()}
      onKeyDown={typeahead.onKeyDown}
      style={{ height: "300px", "overflow-y": "auto" }}
    >
      <div style={{ height: `${collection.totalSize()}px`, position: "relative", width: "100%" }}>
        <For each={collection.virtualItems()}>
          {(v) => <VRow api={api} index={v.index} start={v.start} />}
        </For>
      </div>
    </div>
  );
}

describe("createListTypeahead — over a virtualized collection", () => {
  it("finds and focuses an item whose row was never mounted", async () => {
    let api!: VApi;
    const { container, dispose } = mount(() => (
      <VirtualTypeaheadHarness onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.virtualItems().length).toBeGreaterThan(0));

    // The Zebra row (index 300) is far outside the initial ~13-row window.
    expect(container.querySelector(`[data-index="${ZEBRA_INDEX}"]`)).toBeNull();

    api.typeahead.search("z"); // only "Zebra" starts with z

    await vi.waitFor(() =>
      expect(container.querySelector(`[data-index="${ZEBRA_INDEX}"]`)).not.toBeNull(),
    );
    await expect
      .element(container.querySelector<HTMLElement>(`[data-index="${ZEBRA_INDEX}"]`) as HTMLElement)
      .toHaveFocus();
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let api!: VApi;
    const { container, dispose } = mount(() => (
      <VirtualTypeaheadHarness onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.virtualItems().length).toBeGreaterThan(0));
    await expectNoA11yViolations(container);
    dispose();
  });
});
