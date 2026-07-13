import {
  measureElement as coreMeasureElement,
  elementScroll,
  observeElementOffset,
  observeElementRect,
  type VirtualItem,
  Virtualizer,
  type VirtualizerOptions,
} from "@tanstack/virtual-core";
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  untrack,
} from "solid-js";
import type { CollectionItem, ItemSource } from "../collection/collection";

/** `@tanstack/virtual-core`'s scroll alignment — declared locally; the core doesn't export it. */
type ScrollAlignment = "start" | "center" | "end" | "auto";

/** The per-index metadata a virtualized collection needs, since offscreen rows have no element. */
export interface VirtualItemData<V = unknown> {
  /** Stable DOM id for the row at this index — the `aria-activedescendant` target. */
  id: string;
  /** The selection value at this index. */
  value?: V;
  /** Typeahead text at this index. **Required for offscreen typeahead** — an unmounted row has no
   *  `textContent` to fall back to. */
  textValue?: string;
  /** Whether the row at this index is disabled. */
  disabled?: boolean;
}

export interface CreateVirtualCollectionOptions<V = unknown> {
  /** Total item count — the **full** data length, not the windowed slice. Reactive. */
  count: Accessor<number>;
  /** The scroll container element, as a signal accessor. */
  scrollElement: Accessor<HTMLElement | null | undefined>;
  /** Estimated row size in px, by index. Exact sizes come from `measureElement` once rows mount. */
  estimateSize: (index: number) => number;
  /** Per-index metadata. Called lazily, so it may read signals for reactive rows. */
  getItemData: (index: number) => VirtualItemData<V>;
  /** Overscan rows rendered beyond the visible window. Default `5`. */
  overscan?: number;
  /** Horizontal orientation. Default `false` (vertical). */
  horizontal?: boolean;
}

export interface CreateVirtualCollectionReturn<V = unknown> extends ItemSource<V> {
  /** The windowed items to actually render (`index`, `start`, `size`, …). */
  virtualItems: Accessor<VirtualItem[]>;
  /** Total scroll size in px, for the sizing spacer. */
  totalSize: Accessor<number>;
  /** Publish a mounted row's element for `index` (or `null` on unmount) so `items()[index].element()`
   *  resolves for the window. */
  registerElement: (index: number, element: HTMLElement | null) => void;
  /** Hand a mounted row to the virtualizer for exact measurement (needs a `data-index` attribute). */
  measureElement: (element: HTMLElement | null) => void;
  /** The underlying virtualizer — escape hatch for anything this binding doesn't surface. */
  virtualizer: Virtualizer<HTMLElement, HTMLElement>;
}

/**
 * The **virtualized item source**: a thin SolidJS reactive binding over
 * [`@tanstack/virtual-core`](https://tanstack.com/virtual), satisfying the same
 * [`ItemSource`](../collection/collection.md) seam as `createCollection`. It is what makes a 10k-row
 * listbox navigable: `items()` reflects the **full** data set (so navigation, typeahead and
 * `aria-setsize`/`aria-posinset` see every row), while each item's `element` accessor resolves only
 * for the mounted window, and `scrollIndexIntoView` maps to the virtualizer's `scrollToIndex`.
 * `createListFocus` reads exactly those two things, so roving focus over unmounted rows "just works"
 * — it scrolls the target in, then focuses once it mounts.
 *
 * We adopt `@tanstack/virtual-core` (framework-agnostic, no Solid version coupling) and write this
 * binding by hand, rather than depending on `@tanstack/solid-virtual` (compiled for Solid 1.x). The
 * core is an **optional** peerDependency, so a consumer who never virtualizes keeps a zero-dep
 * `@hope-ui/primitives` install. Reference: react-aria's virtualizer + TanStack Virtual's own
 * framework adapters.
 *
 * Client-only: it measures the DOM, so it does nothing meaningful during SSR (no effects run, no
 * scroll element resolves), and hydration is not a concern for the virtualized path.
 */
export function createVirtualCollection<V = unknown>(
  options: CreateVirtualCollectionOptions<V>,
): CreateVirtualCollectionReturn<V> {
  // Mounted row elements, keyed by index. The window's rows publish here on mount and clear on
  // unmount, so `items()[index].element()` is defined exactly for the rendered slice. `ownedWrite`
  // for the same reason as `rendered` below: a row unmounts during `<For>` reconciliation (a
  // computation), and its cleanup clears its entry from within that scope.
  const [elements, setElements] = createSignal(new Map<number, HTMLElement>(), {
    ownedWrite: true,
  });
  const registerElement = (index: number, element: HTMLElement | null) =>
    setElements((previous) => {
      const next = new Map(previous);
      if (element) next.set(index, element);
      else next.delete(index);
      return next;
    });

  // The rendered window, held as plain state the virtualizer's `onChange` writes into. `onChange`
  // fires re-entrantly from deep inside the virtualizer's own memoized graph (`getVirtualItems` →
  // `maybeNotify` → `onChange`), which can land while a Solid computation is on the stack — a write
  // there trips `[REACTIVE_WRITE_IN_OWNED_SCOPE]`. `ownedWrite: true` is the framework-sanctioned
  // marker for a signal deliberately bridged from an external imperative library's callbacks (the
  // runtime uses it for its own bridge signals); `equals: false` because the window object is
  // rebuilt in place on every scroll.
  const [rendered, setRendered] = createSignal<{ items: VirtualItem[]; total: number }>(
    { items: [], total: 0 },
    { equals: false, ownedWrite: true },
  );
  const sync = () =>
    setRendered({ items: virtualizer.getVirtualItems(), total: virtualizer.getTotalSize() });

  const resolveOptions = (): VirtualizerOptions<HTMLElement, HTMLElement> => ({
    count: options.count(),
    getScrollElement: () => options.scrollElement() ?? null,
    estimateSize: options.estimateSize,
    scrollToFn: elementScroll,
    observeElementRect,
    observeElementOffset,
    measureElement: coreMeasureElement,
    overscan: options.overscan ?? 5,
    horizontal: options.horizontal ?? false,
    indexAttribute: "data-index",
    onChange: () => sync(),
  });

  // The initial read is deliberately untracked — the effect below owns reactivity. Constructing the
  // virtualizer touches no DOM (it observes lazily in `_willUpdate`), so this is SSR-safe.
  const virtualizer = new Virtualizer(untrack(resolveOptions));
  onCleanup(virtualizer._didMount());

  // Re-push options whenever `count`/`scrollElement` change. Both are tracked in the compute
  // (a bare `resolveOptions()` there would read `count` but *not* `scrollElement`, whose access is
  // buried in a `getScrollElement` closure). `_willUpdate` is where the core attaches its
  // scroll/resize observers once the scroll element first exists (and re-attaches if it swaps), so
  // this effect is also what starts the virtualizer observing.
  createEffect(
    () => [options.count(), options.scrollElement()] as const,
    () =>
      // The whole body is a deliberate untracked read: `count`/`scrollElement` are already tracked
      // in the compute above, and the virtualizer's own methods (`_willUpdate` calls the
      // `getScrollElement` closure) would otherwise re-read them untracked inside this effect.
      untrack(() => {
        virtualizer.setOptions(resolveOptions());
        virtualizer._willUpdate();
        sync();
      }),
  );

  const items = createMemo<ReadonlyArray<CollectionItem<V>>>(() => {
    const total = options.count();
    const list: CollectionItem<V>[] = [];
    for (let index = 0; index < total; index++) {
      const at = index;
      const data = () => options.getItemData(at);
      list.push({
        id: options.getItemData(at).id,
        element: () => elements().get(at),
        disabled: () => data().disabled ?? false,
        textValue: () => data().textValue ?? elements().get(at)?.textContent?.trim() ?? "",
        value: () => data().value as V,
      });
    }
    return list;
  });

  const scrollIndexIntoView = (index: number, align: ScrollAlignment = "auto") => {
    virtualizer.scrollToIndex(index, { align });
    virtualizer._willUpdate();
    sync();
  };

  return {
    items,
    scrollIndexIntoView,
    virtualItems: () => rendered().items,
    totalSize: () => rendered().total,
    registerElement,
    measureElement: (element) => virtualizer.measureElement(element),
    virtualizer,
  };
}
