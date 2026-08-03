import { type Accessor, createMemo, createSignal, createUniqueId } from "solid-js";
import { createRegisteredElement } from "./create-registered-element";

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

/**
 * An {@link ItemSource} whose rows publish their element **by index** instead of registering
 * themselves. `createDataCollection` and `createVirtualCollection` both build their items from an
 * array, so a mounted row has to say *which* row it is before `items()[index].element()` can
 * resolve — and that is what `aria-activedescendant` and scroll-into-view point at.
 * {@link createCollection} needs none of this (there the registrations *are* the items), hence a
 * separate interface rather than a member of `ItemSource`.
 */
export interface IndexedItemSource<V = unknown> extends ItemSource<V> {
  /** Publish a mounted row's element for `index`, or `null` to clear that slot. */
  registerElement: (index: number, element: HTMLElement | null) => void;
  /**
   * Retire a row's element from wherever it is registered — the teardown half of
   * {@link registerElement}, and the one a row that can **move** must use.
   *
   * Clearing by index is unsafe once the data reorders: sibling effects re-run one at a time, so a
   * moved row can tear down a slot another row already owns, and it cannot tell by reading — in
   * Solid a write stays invisible to a plain read until the next flush. Looking the element up
   * *inside* the functional update sees the settled map instead, so removal is order-independent.
   */
  unregisterElement: (element: HTMLElement) => void;
  /** Hand a mounted row to the source's measurer, where it has one (variable-height virtual rows). */
  measureElement?: (element: HTMLElement | null) => void;
}

/**
 * The shared element registry behind both index-registered sources ({@link IndexedItemSource}) —
 * `registerElement` publishes a mounted row by index, `unregisterElement` retires it by identity.
 *
 * `ownedWrite: true` opts the signal out of Solid's `[REACTIVE_WRITE_IN_OWNED_SCOPE]` diagnostic: a
 * row unmounts during `<For>` reconciliation — a computation — and its cleanup writes from inside
 * that scope. That is a deliberate bridge write, not the ancestor-scope mistake the diagnostic
 * guards against. Every write is **functional** because register/unregister run inside an effect,
 * where reading the map would be an untracked read of a reactive value (`[STRICT_READ_UNTRACKED]`).
 */
export function createElementRegistry(): {
  elements: Accessor<ReadonlyMap<number, HTMLElement>>;
  registerElement: (index: number, element: HTMLElement | null) => void;
  unregisterElement: (element: HTMLElement) => void;
} {
  const [elements, setElements] = createSignal(new Map<number, HTMLElement>(), {
    ownedWrite: true,
  });

  const registerElement = (index: number, element: HTMLElement | null) =>
    setElements((previous) => {
      const next = new Map(previous);
      if (element) {
        next.set(index, element);
      } else {
        next.delete(index);
      }
      return next;
    });

  const unregisterElement = (element: HTMLElement) =>
    setElements((previous) => {
      for (const [index, registered] of previous) {
        if (registered === element) {
          const next = new Map(previous);
          next.delete(index);
          return next;
        }
      }
      // Already gone — a moved row that re-registered under its new index before this ran.
      return previous;
    });

  return { elements, registerElement, unregisterElement };
}

/**
 * The ids an {@link IndexedItemSource} gives its rows: one generated prefix per collection instance
 * plus the row's index — the scheme Base UI (the headless React library this kernel borrows its API
 * shape from) uses, where a row's id is likewise not a consumer-settable prop.
 *
 * Deliberately **not** derived from the item's value: values are arbitrary, usually server-supplied
 * data, so they can contain whitespace (an id with a space can never be referenced by
 * `aria-activedescendant`), collide with a second collection rendering the same records, or not be a
 * legal id at all — each failure silent, breaking screen-reader navigation with every test green.
 *
 * `createUniqueId()` produces the same id on the server render and on the hydrating client, so the
 * reference survives the round-trip. Call it **once**, where the collection is created: every call
 * advances the id counter both halves must walk identically.
 */
export function createItemIds(): (index: number) => string {
  const prefix = createUniqueId();
  return (index) => `${prefix}-${index}`;
}

/**
 * Reactive inputs an item's part hook — the behavior hook behind a part like `Listbox.Option` —
 * passes to {@link CreateCollectionReturn.register}.
 */
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
 * Ordered, reactive registry of the items a collection component renders — the default source the
 * list behaviors in this folder read. It sits on top of `createRegisteredElement` (a one-directional
 * publisher with no ordering guarantee) and adds what that publisher deliberately lacks: **DOM
 * order**. Items register in effect-creation order, which is not the order a screen reader or an
 * ArrowDown press follows, so `items()` sorts them by `compareDocumentPosition`.
 *
 * Adapted from Angular Aria's `SortedCollection` (its reasoning and public surface, not its code).
 * All state is instance-scoped — no module-level state — so two collections, or two installed copies
 * of this package, never interfere.
 *
 * Call it **once**, at the root of a collection (a `Listbox.Root` body or a `createRoot`).
 */
export function createCollection<V = unknown>(): CreateCollectionReturn<V> {
  // Registration order, not DOM order — `items()` derives that below. `ownedWrite: true` for the
  // same reason as in `createElementRegistry`: unregister can fire while a parent `<For>`/`<Show>`
  // is reconciling, which is a write from inside a computation Solid would otherwise flag.
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
