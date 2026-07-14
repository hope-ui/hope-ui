import { type Accessor, createMemo, createSignal, createUniqueId } from "solid-js";
import { createRegisteredElement } from "../create-registered-element/create-registered-element";

/**
 * One registered item in a collection, as the navigation behaviors see it.
 *
 * The `element` accessor is **lazy and may be `undefined`**: a DOM-backed {@link createCollection}
 * resolves it once the item mounts; a virtualized `createVirtualCollection` resolves it only while
 * the row is inside the rendered window. That "the element may not exist yet" shape is the seam
 * that lets roving focus and `aria-activedescendant` work identically over a fully-mounted list and
 * a windowed one — see `create-list-focus.md`.
 */
export interface CollectionItem<V = unknown> {
  /** Stable DOM id — the `aria-activedescendant` target. Known from registration, before mount. */
  readonly id: string;
  /** The item's element once it exists in the DOM, else `undefined`. */
  readonly element: Accessor<HTMLElement | undefined>;
  /** Whether the item is disabled. Navigation skips it unless `skipDisabled` is turned off. */
  readonly disabled: Accessor<boolean>;
  /** Text used for typeahead matching. Falls back to the element's trimmed `textContent`. */
  readonly textValue: Accessor<string>;
  /** The value this item contributes to selection. `undefined` for non-selectable collections. */
  readonly value: Accessor<V>;
}

/**
 * The abstract, ordered item source that `createListFocus` — and everything layered on it
 * (navigation, typeahead, selection) — reads. It is deliberately not `createCollection`: the two
 * shipped implementations are {@link createCollection} (default, every item mounted) and
 * `createVirtualCollection` (windowed, most items unmounted), and a behavior written against this
 * interface works over either.
 */
export interface ItemSource<V = unknown> {
  /** The full item set in navigation order — DOM order for {@link createCollection}. */
  readonly items: Accessor<ReadonlyArray<CollectionItem<V>>>;
  /**
   * Bring the item at `index` into view before focus lands on it. Present on virtualized sources,
   * omitted by fully-mounted ones. `createListFocus` calls it when an active item's `element` has
   * not resolved yet (the row is outside the window), then focuses once it mounts.
   */
  readonly scrollIndexIntoView?: (index: number) => void;
}

/** Reactive inputs a part hook passes to {@link CreateCollectionReturn.register}. */
export interface RegisterItemOptions<V = unknown> {
  /**
   * The item's element as a **real signal accessor** (not a closure over a plain `let`): the
   * element is created as a reactive consequence of the item rendering, so an untracked read would
   * catch it still `undefined`. See the identical note in `create-registered-element.ts`.
   */
  ref: Accessor<HTMLElement | null | undefined>;
  /** Explicit id. Defaults to a generated, SSR-stable `createUniqueId()`. */
  id?: string;
  /** Reactive disabled flag. Default `false`. */
  disabled?: Accessor<boolean>;
  /** Reactive typeahead text. Falls back to the element's trimmed `textContent` when omitted. */
  textValue?: Accessor<string>;
  /** The selection value for this item. */
  value?: Accessor<V>;
}

export interface CreateCollectionReturn<V = unknown> extends ItemSource<V> {
  /**
   * Register an item from **its own scope** (the `<Listbox.Option>` part hook). Returns the handle
   * navigation/selection look the item up by — `id` is usable immediately (for the element's `id`
   * attribute and `aria-activedescendant`), while `element` resolves once the item mounts. The
   * registration and its cleanup are deferred through `createRegisteredElement`, so a descendant
   * writing this ancestor-owned collection never trips `[REACTIVE_WRITE_IN_OWNED_SCOPE]`.
   */
  register: (options: RegisterItemOptions<V>) => CollectionItem<V>;
  /** The item's index within `items()`, or `-1`. */
  indexOf: (item: CollectionItem<V>) => number;
}

/**
 * Ordered, reactive registry of the items a collection component renders — the **default item
 * source** the navigation kernel reads. It sits on top of `createRegisteredElement` (a
 * one-directional publisher with no ordering guarantee) and adds the one thing that publisher
 * deliberately lacks: **DOM order**. Registration order is effect-creation order, which is not the
 * order a screen reader or an ArrowDown press should follow, so `items()` sorts every registered
 * element by `compareDocumentPosition`.
 *
 * Modeled on Angular Aria's `SortedCollection` + `private/behaviors/list` (its reasoning and public
 * surface, not its code). Everything here is instance-scoped — there is no module-level state — so
 * two collections, or two installed copies of this package, never interfere.
 *
 * Call it **once**, at the root of a collection (a `Listbox.Root` body or a `createRoot`).
 */
export function createCollection<V = unknown>(): CreateCollectionReturn<V> {
  // The registered items, in registration order. `items()` derives DOM order from this.
  // `ownedWrite` because register/unregister fire from descendant lifecycle (via
  // `createRegisteredElement`), and unregister can run while a parent `<For>`/`<Show>` is
  // reconciling — a computation — when the items are keyed off changing data. That is a
  // deliberate bridge write, not the ancestor-scope mistake the diagnostic guards against.
  const [entries, setEntries] = createSignal<CollectionItem<V>[]>([], { ownedWrite: true });

  const items = createMemo<ReadonlyArray<CollectionItem<V>>>(() =>
    // A copy, because `Array.prototype.sort` mutates in place and `entries()` must stay stable.
    // Reading each `element()` here makes the sort reactive: an item that remounts (new element)
    // re-sorts. `compareDocumentPosition` is a DOM read, which is why this is a browser concern —
    // during SSR no `createEffect` runs, so nothing registers and `items()` is empty.
    [...entries()].sort((a, b) => {
      const elementA = a.element();
      const elementB = b.element();
      if (elementA === elementB) {
        return 0;
      }
      // A not-yet-mounted item sorts last; deterministic, though a DOM collection rarely hits it.
      if (!elementA) {
        return 1;
      }
      if (!elementB) {
        return -1;
      }
      const position = elementA.compareDocumentPosition(elementB);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1;
      }
      if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        return 1;
      }
      return 0;
    }),
  );

  const register = (options: RegisterItemOptions<V>): CollectionItem<V> => {
    const id = options.id ?? createUniqueId();
    const item: CollectionItem<V> = {
      id,
      element: () => options.ref() ?? undefined,
      disabled: () => options.disabled?.() ?? false,
      textValue: () => options.textValue?.() ?? options.ref()?.textContent?.trim() ?? "",
      value: () => options.value?.() as V,
    };

    // Functional updates only: `register`/`unregister` run inside an effect where reading
    // `entries()` would be an untracked read of a reactive value (`[STRICT_READ_UNTRACKED]`).
    createRegisteredElement({
      ref: options.ref,
      register: () => setEntries((previous) => [...previous, item]),
      unregister: () => setEntries((previous) => previous.filter((entry) => entry !== item)),
    });

    return item;
  };

  const indexOf = (item: CollectionItem<V>) => items().indexOf(item);

  return { items, register, indexOf };
}
