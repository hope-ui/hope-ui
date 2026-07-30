import { type Accessor, createMemo, untrack } from "solid-js";
import {
  type CollectionItem,
  createElementRegistry,
  createItemIds,
  type IndexedItemSource,
} from "./create-collection";
import { scrollIntoView } from "./scroll-into-view";

export interface CreateDataCollectionOptions<V = unknown, G = V> {
  /**
   * The source data, reactive. Flat lists hold the **items**; with `groupToItems` set they hold the
   * **group entries** instead, and `groupToItems` flattens them. Note this is the *input* array —
   * the returned `items()` is the derived `CollectionItem` list the navigation kernel reads.
   */
  items: Accessor<readonly G[]>;
  /**
   * Maps a group entry to its own items. Its **only** job is flattening `items` into navigation
   * order: the group's *label* never reaches the kernel (a consumer renders it from its own key),
   * so there is no `groupToLabel` and no `{ label, items }` shape to conform to. Omit for a flat list.
   */
  groupToItems?: (group: G) => readonly V[];
  /**
   * Maps an item to its primitive value — the selection identity, the string a form submits, and the
   * key `indexOfValue` resolves a row by. **Not** the row's DOM id: see {@link createItemIds}.
   */
  itemToValue: (item: V) => string;
  /**
   * Maps an item to its typeahead/display text. Defaults to `itemToValue`. Unlike `createCollection`
   * there is **no `textContent` fallback**: the whole point of a data-driven source is that the text
   * is readable before — and without — mounting the row.
   */
  itemToLabel?: (item: V) => string;
  /** Whether an item is disabled. Default `false`. Spelled `is*` because it is a predicate. */
  isItemDisabled?: (item: V) => boolean;
  /** The scroll container the rows live inside — what `scrollIndexIntoView` scrolls, and nothing else. */
  scrollElement: Accessor<HTMLElement | null | undefined>;
}

export interface CreateDataCollectionReturn<V = unknown, G = V> extends IndexedItemSource<V> {
  /** Reveal the row at `index` inside `scrollElement`. Always present here — see the doc. */
  scrollIndexIntoView: (index: number) => void;
  /**
   * The index of the item whose `itemToValue` is `value`, or `-1`. Backed by a `Map` rebuilt with
   * the data, so a part can resolve its own row from the `item` it was handed — no per-row context,
   * and no `index` prop on the public API.
   */
  indexOfValue: (value: string) => number;
  /** The group entries a consumer iterates when `groupToItems` is set, else `undefined`. */
  groups: Accessor<readonly G[] | undefined>;
}

/** Dev-only. A duplicate value means two rows share one selection identity, so one is unreachable. */
function warnDuplicateValue(value: string): void {
  // `import.meta.env.DEV` is defined by the consumer's Vite (and vitest); cast locally so this
  // package needn't pull `vite/client` — and the whole asset-module surface — into
  // `compilerOptions.types`. Same shape as `createTextDirectionWarning`.
  const isDev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV;
  if (!isDev) {
    return;
  }
  console.warn(
    `[hope-ui] createDataCollection: two items resolve to the value "${value}". It is the row's ` +
      "selection identity and its form value, so the first item wins and the later one can never " +
      "be selected or resolved. Make `itemToValue` unique per item.",
  );
}

/**
 * The **data-driven item source**: `CollectionItem`s derived purely from an array, satisfying the
 * same [`ItemSource`](../create-collection/create-collection.md) seam as `createCollection` and
 * `createVirtualCollection`. It is what lets a Select's options exist while its popup is closed —
 * and therefore what makes closed-trigger typeahead, an `allowsEmptyCollection` open guard, and a
 * full server-rendered `<select>` for autofill possible without mounting a single row the user may
 * never open. A DOM-registered source cannot do any of that: it *is* the mounted elements.
 *
 * What falls out of deriving from data rather than the DOM: **`textValue` never falls back to
 * `element.textContent`.** It comes from `itemToLabel` (else `itemToValue`), which is readable
 * before the row mounts — the property offscreen typeahead needs.
 *
 * Ids do **not** come from the data. They are generated per collection and suffixed by index
 * ({@link createItemIds}), because application data makes no promise of being a legal, unique DOM
 * id. `createUniqueId()` is SSR-stable, so the `aria-activedescendant` IDREF still agrees across the
 * server → hydrate round-trip.
 *
 * A mounted row still publishes its element, by **index**, through `registerElement` — that is what
 * resolves `items()[index].element()` for the activedescendant IDREF's target and for
 * scroll-into-view. Same contract as `createVirtualCollection`; see {@link IndexedItemSource}.
 *
 * Everything here is instance-scoped — no module-level state — so two collections, or two installed
 * copies of this package, never interfere.
 */
export function createDataCollection<V = unknown, G = V>(
  options: CreateDataCollectionOptions<V, G>,
): CreateDataCollectionReturn<V, G> {
  // Mounted row elements, keyed by index — the rendered rows publish here on mount and retire on
  // unmount. Shared with `createVirtualCollection`, which registers rows the same way.
  const { elements, registerElement, unregisterElement } = createElementRegistry();

  const groups = () => (options.groupToItems ? options.items() : undefined);

  // A flat list is grouping's degenerate case: with no `groupToItems`, `G` defaults to `V` and every
  // entry is its own single-item group. The cast is what that defaulting cannot prove to the compiler.
  const itemsOfEntry = (entry: G): readonly V[] =>
    options.groupToItems?.(entry) ?? [entry as unknown as V];

  // Navigation order — the one invariant grouping has to preserve, since this is what arrow keys and
  // typeahead traverse and what every index in this file means.
  const flatItems = createMemo<readonly V[]>(() => {
    const flattened: V[] = [];
    for (const entry of options.items()) {
      flattened.push(...itemsOfEntry(entry));
    }
    return flattened;
  });

  const itemId = createItemIds();

  const items = createMemo<ReadonlyArray<CollectionItem<V>>>(() =>
    flatItems().map((item, index) => ({
      id: itemId(index),
      element: () => elements().get(index),
      disabled: () => options.isItemDisabled?.(item) ?? false,
      textValue: () => options.itemToLabel?.(item) ?? options.itemToValue(item),
      value: () => item,
    })),
  );

  const indexByValue = createMemo(() => {
    const map = new Map<string, number>();
    flatItems().forEach((item, index) => {
      const value = options.itemToValue(item);
      if (map.has(value)) {
        warnDuplicateValue(value);
        return;
      }
      map.set(value, index);
    });
    return map;
  });

  const indexOfValue = (value: string) => indexByValue().get(value) ?? -1;

  const scrollIndexIntoView = (index: number) =>
    // Deliberately untracked: an imperative DOM sync driven by a focus move, never a dependency —
    // and `createListFocus` calls it from inside its own effect, where these reads would otherwise
    // trip `[STRICT_READ_UNTRACKED]`.
    untrack(() => {
      const scrollContainer = options.scrollElement();
      const element = items()[index]?.element();
      if (!scrollContainer || !element) {
        return;
      }
      // Default `"nearest"` alignment: a no-op for an already-visible row, which is what makes
      // `createListFocus`'s unconditional activedescendant call safe on every single move.
      scrollIntoView(scrollContainer, element);
    });

  return { items, scrollIndexIntoView, registerElement, unregisterElement, indexOfValue, groups };
}
