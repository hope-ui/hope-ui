import { type Accessor, createEffect, createMemo, createSignal, untrack } from "solid-js";
import type { CollectionItem, ItemSource } from "./create-collection";
import { createControllableState } from "./create-controllable-state";

/** How the list surfaces the active item to assistive technology and the tab order. */
export type FocusMode = "roving" | "activedescendant";

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
   * Whether disabled items are skipped by focus/navigation. Default `true`. Set `false` for menus,
   * where APG keeps disabled items focusable (so they can be read) but not actionable.
   */
  skipDisabled?: Accessor<boolean>;
  /** The container element, as a signal accessor. Used to restore DOM focus in activedescendant mode. */
  element?: Accessor<HTMLElement | null | undefined>;
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
   * Make the item at `index` active. In roving mode this moves real DOM focus to the item —
   * **deferred until the item's element exists**, which is exactly what a virtualized row (mounted
   * only after `scrollIndexIntoView`) and the activedescendant path both need. In activedescendant
   * mode it updates `aria-activedescendant` and, if the target row is unmounted, scrolls it into
   * view so the IDREF resolves, but never moves DOM focus.
   */
  focusIndex(index: number): void;
  /** Make `item` active. See {@link focusIndex}. */
  focus(item: CollectionItem<V>): void;
  /** Re-apply focus to the currently active item (roving) or the container (activedescendant). */
  focusActive(): void;

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
 * The **foundation** of the list-navigation kernel: it owns the active item and the
 * `roving | activedescendant` switch, and nothing else. `createListNavigation`,
 * `createListTypeahead` and `createListSelection` each take one of these and layer their own
 * concern on top — the same way Angular Aria's `ListNavigation`/`ListSelection`/`ListTypeahead`
 * each inject one `ListFocus`. Modeled on Angular's `list-focus` (its reasoning and public surface,
 * adapted — not its code).
 *
 * The one hard-won detail is that **real `.focus()` is deferred until the item's element exists**.
 * A roving list normally focuses a mounted element synchronously, but a virtualized list navigates
 * to rows that are not in the DOM yet: `focusIndex` scrolls the row into view and an effect focuses
 * it once it mounts. Activedescendant mode never moves DOM focus at all, so it shares the same
 * "the element may be absent" plumbing. That shared deferral is why this primitive, not each
 * component, owns focus.
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

  const isFocusable = (item: CollectionItem<V>) => !item.disabled() || !skipDisabled();

  const activeItem = () => {
    const index = activeIndex();
    return index >= 0 ? items()[index] : undefined;
  };

  // The roving tab stop: the active item once navigation has happened, else the first focusable
  // item, so the widget is reachable by Tab before any arrow press (the APG roving requirement —
  // exactly one item must be tabbable). A memo because it scans the list.
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
  const rovingTabStopIndex = () => {
    const active = activeIndex();
    return active >= 0 ? active : firstFocusableIndex();
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

  // Roving + virtualization focus recovery. In roving mode DOM focus sits on the active option, but a
  // virtualized source unmounts that option when it scrolls out of the window — by PageDown, the mouse
  // wheel, or dragging the scrollbar (all of which change scroll without changing the active index).
  // The browser then drops focus to `<body>`, and because the container's key handler only sees events
  // that *bubble up from a focused descendant*, keyboard navigation would silently die. When the very
  // element roving last focused disappears **and** focus fell back to `<body>` as a result, pull focus
  // to the container so keydowns keep arriving; the next arrow/typeahead re-homes onto a mounted option.
  //
  // Tightly gated so it never *steals* focus: only the element we actually focused, only when a
  // navigation isn't already mid-flight (that path re-focuses the target itself via `pendingFocus`),
  // and only when focus truly landed on `<body>` (not when the user moved it elsewhere). It is a no-op
  // in collection mode (nothing unmounts) and in activedescendant mode (focus lives on the container).
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

  const setActive = (index: number) => {
    const length = items().length;
    const clamped = length === 0 ? -1 : index < 0 ? -1 : Math.min(index, length - 1);
    setActiveIndexState(clamped);
    if (clamped < 0) {
      return;
    }

    const item = items()[clamped];
    // Bring an unmounted row into view (virtualization): required both so a roving `.focus()` has
    // an element to land on, and so an activedescendant IDREF names an element that exists.
    if (item && item.element() == null) {
      options.source.scrollIndexIntoView?.(clamped);
    }
    if (focusMode() === "roving") {
      setPendingFocus(clamped);
    }
  };

  const focusIndex = (index: number) => setActive(index);
  const focus = (item: CollectionItem<V>) => setActive(items().indexOf(item));

  const focusActive = () => {
    if (focusMode() === "roving") {
      setActive(activeIndex());
    } else {
      options.element?.()?.focus();
    }
  };

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
    focusIndex,
    focus,
    focusActive,
    isActive,
    isFocusable,
    getListTabIndex,
    getItemTabIndex,
    activeDescendant,
  };
}
