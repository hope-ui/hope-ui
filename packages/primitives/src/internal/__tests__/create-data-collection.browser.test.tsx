import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { type Accessor, createEffect, createRoot, createSignal, For, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import {
  type CreateCollectionReturn,
  createCollection,
  type IndexedItemSource,
} from "../create-collection";
import { type CreateDataCollectionReturn, createDataCollection } from "../create-data-collection";
import { type CreateListFocusReturn, createListFocus } from "../create-list-focus";

/** Array access that asserts presence — under `noUncheckedIndexedAccess`, `list[i]` is `T | undefined`. */
function nth<T>(list: ArrayLike<T>, index: number): T {
  const value = list[index];
  if (value === undefined) {
    throw new Error(`no element at index ${index}`);
  }
  return value;
}

/**
 * Publish a row's element under its index — what every row of a data-driven list does.
 *
 * Deliberately **not** `createRegisteredElement`: the index is reactive here (a row moves when the
 * data does), and reading it inside that hook's `register` callback is an untracked read of a
 * reactive value — `[STRICT_READ_UNTRACKED]`, which `mount()` fails the test on. Tracking both the
 * ref and the index in the effect's compute is what makes a row that changes position re-register
 * under its new one.
 *
 * The teardown addresses the **element**, never the index this run registered under: a reorder
 * re-runs every moved row one after another, so by then another row may already own that index, and
 * clearing it would delete their live element. See `unregisterElement`.
 */
function registerRow(
  source: IndexedItemSource,
  index: Accessor<number>,
  ref: Accessor<HTMLElement | undefined>,
): void {
  createEffect(
    () => [index(), ref()] as const,
    ([at, element]) => {
      if (!element) {
        return;
      }
      source.registerElement(at, element);
      return () => source.unregisterElement(element);
    },
  );
}

/** Straight from an API: no required key names, every data question answered by an accessor. */
interface Product {
  sku: string;
  title: string;
  outOfStock?: boolean;
}

interface Category {
  name: string;
  products: Product[];
}

const PRODUCTS: Product[] = [
  { sku: "a-1", title: "Widget" },
  { sku: "b-2", title: "Gadget", outOfStock: true },
  { sku: "c-3", title: "Doohickey" },
];

const CATEGORIES: Category[] = [
  {
    name: "Fruit",
    products: [
      { sku: "apple", title: "Apple" },
      { sku: "kiwi", title: "Kiwi" },
    ],
  },
  { name: "Vegetable", products: [{ sku: "leek", title: "Leek" }] },
];

function productSource(
  items: Accessor<readonly Product[]>,
  scrollElement: Accessor<HTMLElement | null | undefined>,
): CreateDataCollectionReturn<Product> {
  return createDataCollection<Product>({
    items,
    itemToValue: (product) => product.sku,
    itemToLabel: (product) => product.title,
    isItemDisabled: (product) => product.outOfStock ?? false,
    scrollElement,
  });
}

/** A row of a data-driven list: rendered from the data, publishing its element by index. */
function DataRow(props: {
  source: CreateDataCollectionReturn<Product>;
  index: number;
  product: Product;
}) {
  const [ref, setRef] = createSignal<HTMLLIElement>();
  registerRow(props.source, () => props.index, ref);
  return (
    <li
      ref={setRef}
      id={props.source.items()[props.index]?.id}
      role="option"
      aria-selected="false"
      aria-disabled={props.product.outOfStock ? "true" : undefined}
      data-sku={props.product.sku}
    >
      {props.product.title}
    </li>
  );
}

/** The same row, DOM-registered: the collection learns of it only because it mounted. */
function RegisteredRow(props: { collection: CreateCollectionReturn<Product>; product: Product }) {
  const [ref, setRef] = createSignal<HTMLLIElement>();
  const item = props.collection.register({
    ref,
    value: () => props.product,
    disabled: () => props.product.outOfStock ?? false,
  });
  return (
    <li
      ref={setRef}
      id={item.id}
      role="option"
      aria-selected="false"
      aria-disabled={props.product.outOfStock ? "true" : undefined}
      data-sku={props.product.sku}
    >
      {props.product.title}
    </li>
  );
}

// ─── The seam: data-driven and DOM-registered must agree ─────────────────────────────────────────

interface ParityApi {
  data: CreateDataCollectionReturn<Product>;
  collection: CreateCollectionReturn<Product>;
}

function ParityHarness(props: { onReady: (api: ParityApi) => void }) {
  const [dataListRef, setDataListRef] = createSignal<HTMLUListElement>();
  const data = productSource(() => PRODUCTS, dataListRef);
  const collection = createCollection<Product>();
  props.onReady({ data, collection });

  return (
    <>
      <ul ref={setDataListRef} role="listbox" aria-label="data products">
        <For each={PRODUCTS}>
          {(product, index) => <DataRow source={data} index={index()} product={product} />}
        </For>
      </ul>
      <ul role="listbox" aria-label="registered products">
        <For each={PRODUCTS}>
          {(product) => <RegisteredRow collection={collection} product={product} />}
        </For>
      </ul>
    </>
  );
}

function skus(items: ReadonlyArray<{ element: Accessor<HTMLElement | undefined> }>): unknown[] {
  return items.map((item) => item.element()?.dataset.sku);
}

describe("createDataCollection — parity with the DOM-registered source", () => {
  it("reports the same items, textValue, disabled state and order", async () => {
    let api!: ParityApi;
    const { container, dispose } = mount(() => <ParityHarness onReady={(a) => (api = a)} />);
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    const dataItems = api.data.items();
    const registeredItems = api.collection.items();

    expect(dataItems).toHaveLength(registeredItems.length);
    // The DOM-registered source falls back to trimmed `textContent`; the data-driven one reads
    // `itemToLabel`, before anything mounts. Same answer — the premise the seam rests on.
    expect(dataItems.map((item) => item.textValue())).toEqual(
      registeredItems.map((item) => item.textValue()),
    );
    expect(dataItems.map((item) => item.value())).toEqual(
      registeredItems.map((item) => item.value()),
    );
    expect(dataItems.map((item) => item.disabled())).toEqual(
      registeredItems.map((item) => item.disabled()),
    );
    // Ordering: both are in rendered order, and each item's element is its own row.
    expect(skus(dataItems)).toEqual(["a-1", "b-2", "c-3"]);
    expect(skus(registeredItems)).toEqual(["a-1", "b-2", "c-3"]);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("gives rows generated ids, known without the DOM and never the item's value", async () => {
    let api!: ParityApi;
    const { container, dispose } = mount(() => <ParityHarness onReady={(a) => (api = a)} />);
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    const ids = api.data.items().map((item) => item.id);
    expect(ids).not.toContain("a-1");
    expect(new Set(ids)).toHaveLength(3);
    // Each one is a real IDREF target: `aria-activedescendant` resolves to exactly that row.
    for (const [index, id] of ids.entries()) {
      expect(document.getElementById(id)?.dataset.sku).toBe(nth(PRODUCTS, index).sku);
    }
    const rendered = container.querySelectorAll<HTMLElement>(
      '[aria-label="data products"] [role="option"]',
    );
    expect([...rendered].map((element) => element.id)).toEqual(ids);
    dispose();
  });
});

describe("createDataCollection — generated ids", () => {
  it("gives a legal id even for a value that could never be one", () => {
    createRoot((dispose) => {
      // Whitespace makes an id unpointable as an IDREF, and an empty value has nothing to point at.
      const source = createDataCollection<string>({
        items: () => ["SKU 12 34", "", "a b"],
        itemToValue: (value) => value,
        scrollElement: () => null,
      });

      for (const item of source.items()) {
        expect(item.id).not.toMatch(/\s/);
        expect(item.id.length).toBeGreaterThan(0);
      }
      expect(new Set(source.items().map((item) => item.id))).toHaveLength(3);
      dispose();
    });
  });

  it("never collides with a second collection over the same data", () => {
    createRoot((dispose) => {
      // Two Selects listing the same records on one page: value-derived ids would give every row a
      // duplicate, breaking both `aria-activedescendant` IDREFs with no visible symptom.
      const first = productSource(
        () => PRODUCTS,
        () => null,
      );
      const second = productSource(
        () => PRODUCTS,
        () => null,
      );

      const ids = [...first.items(), ...second.items()].map((item) => item.id);
      expect(new Set(ids)).toHaveLength(6);
      dispose();
    });
  });
});

// ─── Element registration ────────────────────────────────────────────────────────────────────────

function LazyRowsHarness(props: {
  rendered: Accessor<number>;
  onReady: (source: CreateDataCollectionReturn<Product>) => void;
}) {
  const [listRef, setListRef] = createSignal<HTMLUListElement>();
  const source = productSource(() => PRODUCTS, listRef);
  props.onReady(source);
  return (
    <ul ref={setListRef} role="listbox" aria-label="lazy products">
      <For each={PRODUCTS.slice(0, props.rendered())}>
        {(product, index) => <DataRow source={source} index={index()} product={product} />}
      </For>
    </ul>
  );
}

describe("createDataCollection — element registration", () => {
  it("knows every item before any row mounts, and resolves element() only as rows mount", async () => {
    let source!: CreateDataCollectionReturn<Product>;
    const [rendered, setRendered] = createSignal(0);
    const { container, dispose } = mount(() => (
      <LazyRowsHarness rendered={rendered} onReady={(s) => (source = s)} />
    ));

    // The whole list exists with nothing rendered — closed-popup typeahead's precondition, and the
    // thing a DOM-registered source cannot do.
    expect(source.items()).toHaveLength(3);
    expect(source.items().map((item) => item.textValue())).toEqual([
      "Widget",
      "Gadget",
      "Doohickey",
    ]);
    expect(source.items().map((item) => item.element())).toEqual([undefined, undefined, undefined]);

    flush(() => setRendered(3));
    await vi.waitFor(() => expect(skus(source.items())).toEqual(["a-1", "b-2", "c-3"]));

    // …and unmounting a row clears its entry again, leaving the rows that stay untouched.
    flush(() => setRendered(1));
    await vi.waitFor(() => expect(nth(source.items(), 1).element()).toBeUndefined());
    expect(skus(source.items())).toEqual(["a-1", undefined, undefined]);
    expect(source.items()).toHaveLength(3);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("keeps every slot resolvable when the data reorders under the mounted rows", async () => {
    // `<For>` keys by identity, so reordering **moves** the existing rows rather than rebuilding
    // them: each one re-registers under its new index while its siblings do the same. Retiring by
    // index instead of by element loses a row here — the vacating row's teardown runs after the
    // arriving row's registration and deletes it, and nothing else notices (no error, just a
    // position `aria-activedescendant` can never point at).
    const [products, setProducts] = createSignal<readonly Product[]>(PRODUCTS);
    let source!: CreateDataCollectionReturn<Product>;
    const [listRef, setListRef] = createSignal<HTMLUListElement>();

    const { container, dispose } = mount(() => {
      source = productSource(products, listRef);
      return (
        <ul ref={setListRef} role="listbox" aria-label="reordering products">
          <For each={products()}>
            {(product, index) => <DataRow source={source} index={index()} product={product} />}
          </For>
        </ul>
      );
    });
    await vi.waitFor(() => expect(skus(source.items())).toEqual(["a-1", "b-2", "c-3"]));

    flush(() => setProducts([...PRODUCTS].reverse()));
    await vi.waitFor(() => expect(skus(source.items())).toEqual(["c-3", "b-2", "a-1"]));

    // …and a row that leaves still takes its own element with it.
    flush(() => setProducts([nth(PRODUCTS, 1)]));
    await vi.waitFor(() => expect(skus(source.items())).toEqual(["b-2"]));

    await expectNoA11yViolations(container);
    dispose();
  });
});

// ─── Resolving a row from its value ──────────────────────────────────────────────────────────────

describe("createDataCollection — indexOfValue", () => {
  it("round-trips every value and returns -1 for an unknown one", () => {
    createRoot((dispose) => {
      const source = productSource(
        () => PRODUCTS,
        () => null,
      );
      expect(source.indexOfValue("a-1")).toBe(0);
      expect(source.indexOfValue("b-2")).toBe(1);
      expect(source.indexOfValue("c-3")).toBe(2);
      expect(source.indexOfValue("no-such-sku")).toBe(-1);
      dispose();
    });
  });

  it("follows the data when it changes", () => {
    const [products, setProducts] = createSignal<readonly Product[]>(PRODUCTS);
    let source!: CreateDataCollectionReturn<Product>;
    let dispose!: () => void;
    // Built inside the root, written from the test body: a write during the root's own synchronous
    // run trips `REACTIVE_WRITE_IN_OWNED_SCOPE`. `flush` because the client build defers writes.
    createRoot((d) => {
      dispose = d;
      source = productSource(products, () => null);
    });

    expect(source.indexOfValue("c-3")).toBe(2);
    flush(() => setProducts([nth(PRODUCTS, 2), nth(PRODUCTS, 0)]));
    expect(source.indexOfValue("c-3")).toBe(0);
    expect(source.indexOfValue("b-2")).toBe(-1);
    dispose();
  });

  it("warns once on a duplicate value and lets the first item win", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    createRoot((dispose) => {
      const duplicated: Product[] = [
        { sku: "a-1", title: "First" },
        { sku: "a-1", title: "Second" },
        { sku: "b-2", title: "Other" },
      ];
      const source = productSource(
        () => duplicated,
        () => null,
      );

      expect(source.indexOfValue("a-1")).toBe(0);
      expect(source.indexOfValue("b-2")).toBe(2);
      // The map is a memo, so re-reading it does not re-warn.
      expect(source.indexOfValue("a-1")).toBe(0);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(String(warn.mock.calls[0]?.[0])).toContain('"a-1"');
      dispose();
    });
    warn.mockRestore();
  });
});

// ─── Revealing a clipped row ─────────────────────────────────────────────────────────────────────

const ROW = 30;
const VIEWPORT = 90; // exactly three rows
const TEN_ROWS = Array.from({ length: 10 }, (_, index) => `row-${index}`);

interface ScrollApi {
  source: CreateDataCollectionReturn<string>;
  focus: CreateListFocusReturn<string>;
}

/**
 * The Select shape: every row mounted, most of them clipped, and focus never leaving the container
 * — so `scrollIndexIntoView` is the only thing that can reveal the active row.
 */
function ScrollHarness(props: { onReady: (api: ScrollApi) => void }) {
  const [listRef, setListRef] = createSignal<HTMLUListElement>();
  const source = createDataCollection<string>({
    items: () => TEN_ROWS,
    itemToValue: (row) => row,
    scrollElement: listRef,
  });
  const focus = createListFocus<string>({
    source,
    focusMode: () => "activedescendant",
    element: listRef,
  });
  props.onReady({ source, focus });

  return (
    <ul
      ref={setListRef}
      role="listbox"
      aria-label="rows"
      tabindex={focus.getListTabIndex()}
      aria-activedescendant={focus.activeDescendant()}
      style={{ height: `${VIEWPORT}px`, "overflow-y": "auto" }}
    >
      <For each={TEN_ROWS}>
        {(row, index) => {
          const [ref, setRef] = createSignal<HTMLLIElement>();
          registerRow(source, index, ref);
          return (
            <li
              ref={setRef}
              id={source.items()[index()]?.id}
              role="option"
              aria-selected="false"
              data-row={row}
              style={{ height: `${ROW}px` }}
            >
              {row}
            </li>
          );
        }}
      </For>
    </ul>
  );
}

function listbox(container: HTMLElement): HTMLElement {
  return container.querySelector('[role="listbox"]') as HTMLElement;
}

describe("createDataCollection — scrollIndexIntoView", () => {
  it("reveals a mounted but clipped row in activedescendant mode", async () => {
    let api!: ScrollApi;
    const { container, dispose } = mount(() => <ScrollHarness onReady={(a) => (api = a)} />);
    await vi.waitFor(() => expect(nth(api.source.items(), 9).element()).toBeDefined());

    const list = listbox(container);
    expect(list.scrollTop).toBe(0);

    api.focus.focusIndex(6);

    // Row 6 spans [180, 210) in a 90px port: `"nearest"` brings it flush with the bottom edge.
    await vi.waitFor(() => expect(list.scrollTop).toBe(210 - VIEWPORT));
    expect(list.getAttribute("aria-activedescendant")).toBe(nth(api.source.items(), 6).id);
    // Nothing took DOM focus — the row is visible because it was scrolled to, not focused.
    for (const option of container.querySelectorAll<HTMLElement>('[role="option"]')) {
      expect(option).not.toHaveFocus();
    }

    await expectNoA11yViolations(container);
    dispose();
  });

  it("leaves the scroll alone for a row that is already visible", async () => {
    let api!: ScrollApi;
    const { container, dispose } = mount(() => <ScrollHarness onReady={(a) => (api = a)} />);
    await vi.waitFor(() => expect(nth(api.source.items(), 9).element()).toBeDefined());

    api.focus.focusIndex(1);
    await vi.waitFor(() => expect(api.focus.activeIndex()).toBe(1));
    expect(listbox(container).scrollTop).toBe(0);
    dispose();
  });

  it("does nothing when the row has not mounted", async () => {
    let source!: CreateDataCollectionReturn<Product>;
    const [rendered] = createSignal(1);
    const { container, dispose } = mount(() => (
      <LazyRowsHarness rendered={rendered} onReady={(s) => (source = s)} />
    ));
    await vi.waitFor(() => expect(nth(source.items(), 0).element()).toBeDefined());

    // No element to measure and nothing to reveal — it must not throw.
    expect(() => source.scrollIndexIntoView(2)).not.toThrow();
    expect(listbox(container).scrollTop).toBe(0);
    dispose();
  });
});

// ─── Grouped data ────────────────────────────────────────────────────────────────────────────────

function groupedSource(
  scrollElement: Accessor<HTMLElement | null | undefined>,
): CreateDataCollectionReturn<Product, Category> {
  return createDataCollection<Product, Category>({
    items: () => CATEGORIES,
    groupToItems: (category) => category.products,
    itemToValue: (product) => product.sku,
    itemToLabel: (product) => product.title,
    scrollElement,
  });
}

function GroupedRow(props: {
  source: CreateDataCollectionReturn<Product, Category>;
  index: number;
  product: Product;
}) {
  const [ref, setRef] = createSignal<HTMLDivElement>();
  registerRow(props.source, () => props.index, ref);
  return (
    <div
      ref={setRef}
      id={props.source.items()[props.index]?.id}
      role="option"
      aria-selected="false"
      data-sku={props.product.sku}
    >
      {props.product.title}
    </div>
  );
}

function GroupedHarness(props: {
  onReady: (source: CreateDataCollectionReturn<Product, Category>) => void;
}) {
  const [listRef, setListRef] = createSignal<HTMLDivElement>();
  const source = groupedSource(listRef);
  props.onReady(source);

  // The inner iteration is a plain `<For>` over the group's own items, and each row resolves its
  // position through `indexOfValue` — which is what makes nesting depth irrelevant to the kernel.
  return (
    <div ref={setListRef} role="listbox" aria-label="grouped products">
      <For each={source.groups()}>
        {(category) => (
          <div role="group" aria-label={category.name}>
            <For each={category.products}>
              {(product) => (
                <GroupedRow
                  source={source}
                  index={source.indexOfValue(product.sku)}
                  product={product}
                />
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
}

describe("createDataCollection — grouping", () => {
  it("flattens groupToItems into navigation order and hands back the entries to iterate", () => {
    createRoot((dispose) => {
      const source = groupedSource(() => null);

      expect(source.items().map((item) => item.value().sku)).toEqual(["apple", "kiwi", "leek"]);
      expect(source.items().map((item) => item.textValue())).toEqual(["Apple", "Kiwi", "Leek"]);
      expect(source.indexOfValue("leek")).toBe(2);
      // `groups()` hands back the entries themselves — the group's label never reaches the kernel.
      expect(source.groups()).toEqual(CATEGORIES);
      dispose();
    });
  });

  it("reports no groups for a flat list", () => {
    createRoot((dispose) => {
      const source = productSource(
        () => PRODUCTS,
        () => null,
      );
      expect(source.groups()).toBeUndefined();
      dispose();
    });
  });

  it("resolves a nested row's element, whatever its depth in the subtree", async () => {
    let source!: CreateDataCollectionReturn<Product, Category>;
    const { container, dispose } = mount(() => <GroupedHarness onReady={(s) => (source = s)} />);
    await vi.waitFor(() => expect(nth(source.items(), 2).element()).toBeDefined());

    expect(skus(source.items())).toEqual(["apple", "kiwi", "leek"]);
    await expectNoA11yViolations(container);
    dispose();
  });
});
