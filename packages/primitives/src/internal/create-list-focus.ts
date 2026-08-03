import { type Accessor, createEffect, createMemo, createSignal, untrack } from "solid-js";
import type { CollectionItem, ItemSource } from "./create-collection";
import { createControllableState } from "./create-controllable-state";

/** How the list surfaces the active item to assistive technology and the tab order. */
export type FocusMode = "roving" | "activedescendant";

/** Per-call overrides for a focus move. */
export interface FocusMoveOptions {
  /**
   * Whether to bring the target row into view via `source.scrollIndexIntoView`. Default `true`.
   * A pointer-driven move passes `false`: the row is already under the cursor, so scrolling would
   * slide the list and hand the highlight to whatever ends up beneath the pointer.
   */
  scroll?: boolean;
}

export interface CreateListFocusOptions<V = unknown> {
  /**
   * The abstract item source — `createCollection` (default) or `createVirtualCollection`. This is
   * the seam: everything here works over either, because it only ever reads `source.items()` and
   * calls the optional `source.scrollIndexIntoView`.
   */
  source: ItemSource<V>;
  /**
   * Focus strategy, reactive. Default `"roving"`.
   * - `"roving"`: exactly one item is in the tab order (`tabindex=0`) and holds real DOM focus.
   * - `"activedescendant"`: the container stays focused (`tabindex=0`, `aria-activedescendant`
   *   naming the active item); items are never in the tab order and never take DOM focus.
   */
  focusMode?: Accessor<FocusMode>;
  /** Whether the whole list is disabled: nothing focusable, container `tabindex=-1`. Default `false`. */
  disabled?: Accessor<boolean>;
  /**
   * Whether disabled items are skipped by focus/navigation. Default `true`. Set `false` for menus:
   * the ARIA Authoring Practices Guide (APG) keeps a disabled menu item focusable, so a screen
   * reader can still read it, while it stays non-actionable.
   */
  skipDisabled?: Accessor<boolean>;
  /** The container element, as a signal accessor. Used to restore DOM focus in activedescendant mode. */
  element?: Accessor<HTMLElement | null | undefined>;
  /**
   * The index the widget should enter on when focus arrives with nothing active — APG: "if an option
   * is selected before the listbox receives focus, focus is set on the selected option". `createListbox`
   * feeds the first selected row here. Ignored when it does not resolve to a focusable item (a
   * selected-but-disabled row), which falls back to the first focusable item. Default `-1`.
   */
  entryIndex?: Accessor<number>;
  /** Controlled active index into `source.items()`. Omit for uncontrolled use. `-1` means none. */
  activeIndex?: Accessor<number | undefined>;
  /** Initial active index, uncontrolled. Default `-1` (nothing active). */
  defaultActiveIndex?: number;
  /** Called whenever the active index changes. */
  onActiveChange?: (index: number) => void;
}

export interface CreateListFocusReturn<V = unknown> {
  /** The source's items, re-exposed so behaviors layered on focus need only the focus instance. */
  items: Accessor<ReadonlyArray<CollectionItem<V>>>;
  /** The active item's index within `items()`, or `-1`. */
  activeIndex: Accessor<number>;
  /** The active item, or `undefined`. */
  activeItem: Accessor<CollectionItem<V> | undefined>;
  /** Whether the whole list is disabled. */
  disabled: Accessor<boolean>;
  /** Whether disabled items are skipped by focus/navigation. */
  skipDisabled: Accessor<boolean>;
  /** The current focus mode. */
  focusMode: Accessor<FocusMode>;
  /**
   * Whether the widget currently holds focus. This is the **paint gate**, not a focus mover: it never
   * moves DOM focus, it only records whether the widget is focused so the highlight can be shown only
   * while it is. `createListbox` drives it from the container's focus-in/out, and a Select whose focus
   * owner is its own input drives it directly. Two other accessibility libraries spell the same flag
   * `manager.isFocused` (React Aria) and `focused` (Zag).
   */
  isFocused: Accessor<boolean>;
  /** Set the focused flag. See {@link isFocused} — the caller owns focus tracking; this only records it. */
  setFocused(value: boolean): void;

  /**
   * Make the item at `index` active and bring it into view (`options.scroll`, default `true`).
   * Roving mode also moves real DOM focus there, deferred until the item's element exists so a row
   * that mounts only once scrolled to (virtualization) still gets focused. Which rows get scrolled
   * differs per mode for a non-obvious reason — see `__internal__/primitives/internal/create-list-focus.md`.
   */
  focusIndex(index: number, options?: FocusMoveOptions): void;
  /** Make `item` active. See {@link focusIndex}. */
  focus(item: CollectionItem<V>, options?: FocusMoveOptions): void;
  /** Re-apply focus to the currently active item (roving) or the container (activedescendant). */
  focusActive(): void;
  /**
   * Activate the entry item — the first selected row (`entryIndex`), else the first focusable one.
   * Called by the container when focus arrives with nothing active. Shares its rule with the roving
   * tab stop, so the item Tab lands on and the item that highlights are the same.
   */
  focusEntry(): void;

  /** Whether `item` is the active one. */
  isActive(item: CollectionItem<V>): boolean;
  /** Whether `item` can receive focus: not disabled, or `skipDisabled` is off. */
  isFocusable(item: CollectionItem<V>): boolean;

  /** The container's `tabindex`: `0` in activedescendant mode, `-1` in roving (or when disabled). */
  getListTabIndex(): number;
  /**
   * An item's `tabindex`. Roving: `0` for the roving tab stop (the active item, or the first
   * focusable item before any navigation), `-1` for the rest. Activedescendant: always `-1`.
   */
  getItemTabIndex(item: CollectionItem<V>): number;
  /** The container's `aria-activedescendant`: the active item's id in activedescendant mode, else `undefined`. */
  activeDescendant(): string | undefined;
}

/**
 * Owns the active item and the `roving | activedescendant` switch, and nothing else.
 * `createListNavigation`, `createListTypeahead` and `createListSelection` each take one of these and
 * layer their own concern on top, mirroring the same split in Angular Aria (Angular's signal-based
 * accessibility behaviors), whose `list-focus` this adapts — its reasoning and public surface, not
 * its code.
 *
 * The load-bearing detail: **real `.focus()` is deferred until the item's element exists**, because
 * a virtualized list navigates to rows that are not in the DOM yet, and activedescendant mode never
 * moves DOM focus at all. One deferral serves both, which is why focus lives here rather than in
 * each component. Full rationale: `__internal__/primitives/internal/create-list-focus.md`.
 */
export function createListFocus<V = unknown>(
  options: CreateListFocusOptions<V>,
): CreateListFocusReturn<V> {
  const items = () => options.source.items();
  const focusMode = () => options.focusMode?.() ?? "roving";
  const disabled = () => options.disabled?.() ?? false;
  const skipDisabled = () => options.skipDisabled?.() ?? true;

  const [activeIndex, setActiveIndexState] = createControllableState<number>({
    value: () => options.activeIndex?.(),
    defaultValue: () => options.defaultActiveIndex ?? -1,
    onChange: (value) => options.onActiveChange?.(value),
  });

  // The paint gate — see `isFocused`'s doc. Not a controllable state: nothing controls it, the widget
  // sets it from its own focus in/out.
  const [isFocused, setFocused] = createSignal(false);

  const isFocusable = (item: CollectionItem<V>) => !item.disabled() || !skipDisabled();

  const activeItem = () => {
    const index = activeIndex();
    return index >= 0 ? items()[index] : undefined;
  };

  const firstFocusableIndex = createMemo(() => {
    const list = items();
    for (let index = 0; index < list.length; index++) {
      const item = list[index];
      if (item && isFocusable(item)) {
        return index;
      }
    }
    return -1;
  });

  // The item the widget enters on when nothing is active yet: the caller's preferred `entryIndex`
  // (the first selected row, per APG), but only when it resolves to a focusable item — a
  // selected-but-disabled row falls back to the first focusable one.
  const entryIndex = () => {
    const preferred = options.entryIndex?.() ?? -1;
    const item = preferred >= 0 ? items()[preferred] : undefined;
    return item && isFocusable(item) ? preferred : firstFocusableIndex();
  };

  // The roving tab stop: the active item once navigation has happened, else the entry item, so the
  // widget is reachable by Tab before any arrow press (the APG roving requirement — exactly one item
  // must be tabbable) and Tab lands on the same row `focusEntry` highlights (no post-focus jump).
  const rovingTabStopIndex = () => {
    const active = activeIndex();
    return active >= 0 ? active : entryIndex();
  };

  // Deferred focus target. Set to an index by `focusIndex`; an effect focuses the element once it
  // exists (immediately for a mounted item, after mount for a virtualized one), then clears itself.
  const [pendingFocus, setPendingFocus] = createSignal<number | null>(null);
  // The element roving focus last moved DOM focus to. Tracked only to recognize *that same* element
  // later disappearing — a virtualized row scrolled out of the window — so focus can be recovered.
  let rovingFocusedElement: HTMLElement | null | undefined;
  createEffect(
    () => {
      const index = pendingFocus();
      if (index === null) {
        return undefined;
      }
      return items()[index]?.element();
    },
    (element) => {
      if (!element) {
        return; // element not mounted yet — a later run fires once it is
      }
      element.focus();
      rovingFocusedElement = element;
      setPendingFocus(null);
    },
  );

  // Roving focus recovery. A virtualized source unmounts the focused option when it scrolls out of the
  // window (mouse wheel, scrollbar drag — neither changes the active index); the browser then drops
  // focus to `<body>` and keyboard navigation silently dies, because the container's key handler only
  // sees events bubbling up from a focused descendant. Pulling focus back to the container keeps
  // keydowns arriving, and the next arrow/typeahead re-homes onto a mounted option. The guards below
  // are what stop it *stealing* focus: our own element, no navigation mid-flight, and focus really
  // on `<body>` rather than somewhere the user put it.
  createEffect(
    () => activeItem()?.element(),
    (element) =>
      untrack(() => {
        if (element != null || focusMode() !== "roving" || pendingFocus() != null) {
          return;
        }
        const lost = rovingFocusedElement;
        const container = options.element?.();
        if (lost == null || !container) {
          return;
        }
        const doc = container.ownerDocument;
        if (doc.activeElement == null || doc.activeElement === doc.body) {
          rovingFocusedElement = undefined;
          container.focus();
        }
      }),
  );

  const setActive = (index: number, { scroll = true }: FocusMoveOptions = {}) => {
    const length = items().length;
    const clamped = length === 0 ? -1 : index < 0 ? -1 : Math.min(index, length - 1);
    setActiveIndexState(clamped);
    if (clamped < 0) {
      return;
    }

    // Which rows need scrolling is exactly the difference between the two modes. Activedescendant
    // moves no DOM focus, so every row must be scrolled or a mounted-but-clipped option sits offscreen
    // while `aria-activedescendant` names it — a failure no test can see. Roving asks the source only
    // for a row that does not exist yet: once mounted, the native `.focus()` below scrolls it in from
    // the real scrollport, and a second, coarser source scroll on top of that clips the row (measured
    // at 6px). Sources align `"nearest"`, so a fully visible row is never scrolled either way.
    if (scroll && (focusMode() === "activedescendant" || items()[clamped]?.element() == null)) {
      options.source.scrollIndexIntoView?.(clamped);
    }
    if (focusMode() === "roving") {
      setPendingFocus(clamped);
    }
  };

  const focusIndex = (index: number, move?: FocusMoveOptions) => setActive(index, move);
  const focus = (item: CollectionItem<V>, move?: FocusMoveOptions) =>
    setActive(items().indexOf(item), move);

  const focusActive = () => {
    if (focusMode() === "roving") {
      setActive(activeIndex());
    } else {
      options.element?.()?.focus();
    }
  };

  const focusEntry = () => setActive(entryIndex());

  const isActive = (item: CollectionItem<V>) => activeItem() === item;

  const getListTabIndex = () => {
    if (disabled()) {
      return -1;
    }
    return focusMode() === "activedescendant" ? 0 : -1;
  };

  const getItemTabIndex = (item: CollectionItem<V>) => {
    if (focusMode() === "activedescendant" || disabled()) {
      return -1;
    }
    return items().indexOf(item) === rovingTabStopIndex() ? 0 : -1;
  };

  const activeDescendant = () => {
    if (focusMode() !== "activedescendant" || disabled()) {
      return undefined;
    }
    return activeItem()?.id;
  };

  return {
    items,
    activeIndex,
    activeItem,
    disabled,
    skipDisabled,
    focusMode,
    isFocused,
    setFocused,
    focusIndex,
    focus,
    focusActive,
    focusEntry,
    isActive,
    isFocusable,
    getListTabIndex,
    getItemTabIndex,
    activeDescendant,
  };
}
