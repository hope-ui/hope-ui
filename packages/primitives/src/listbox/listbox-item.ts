import type { JSX } from "@solidjs/web";
import { type Accessor, createEffect, merge, omit, untrack } from "solid-js";
import type { FocusMoveOptions } from "../internal";
import { composeEventHandlers } from "../utils";
import type { CreateListboxReturn } from "./listbox-root";

export interface CreateListboxItemProps<V = unknown> extends JSX.HTMLAttributes<HTMLElement> {
  /**
   * The item's element as a **real signal accessor** (not a closure over a plain `let`): the element
   * is created as a reactive consequence of the item rendering, so an untracked read would catch it
   * still `undefined`. The consumer still wires `ref={setRef}` on the element itself.
   */
  ref: Accessor<HTMLElement | null | undefined>;
  /**
   * The item this row renders — one element of the listbox's `items`. **Required in data mode**: the
   * hook resolves the row's position from it (`state.indexOfValue(state.itemToValue(item))`), which
   * is what lets an option sit anywhere in the subtree, including a group's nested `<For>`. Ignored
   * in virtual mode, where `index` is the row's identity.
   */
  item?: V;
  /**
   * **Virtual mode only:** this row's index into `state.indexed.items()`. Its presence selects the
   * virtual path. It is a mechanism rather than information the author has, which is why data mode
   * derives it instead — but a windowed row is *recycled*, so its index changes while the component
   * stays mounted and only the row itself knows it.
   */
  index?: Accessor<number>;
}

export interface CreateListboxItemReturn {
  /**
   * Spread onto the option element (`role="option"` + ARIA + `data-*` state + `tabindex` + handlers).
   * `ref` is omitted so the consumer sets it directly on whatever element it renders (the hook
   * already receives the ref accessor as an option).
   */
  props: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & {
    "data-active"?: string;
    "data-selected"?: string;
    "data-disabled"?: string;
  };
  /** Whether this item is selected. */
  isSelected: Accessor<boolean>;
  /** Whether this item is the active (highlighted) one. */
  isActive: Accessor<boolean>;
  /** Whether this item is disabled. */
  isDisabled: Accessor<boolean>;
}

/** Dev-only. A row outside `items` can never be focused, selected, or scrolled to. */
function warnUnknownItem(value: string): void {
  // `import.meta.env.DEV` is defined by the consumer's Vite (and vitest); cast locally so this
  // package needn't pull `vite/client` into `compilerOptions.types`.
  const isDev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV;
  if (!isDev) {
    return;
  }
  console.warn(
    `[hope-ui] createListboxItem: no row matches the item whose value is "${value}". An option's ` +
      "`item` must be an element of the listbox's `items` — arrow keys and typeahead traverse that " +
      "array, not the DOM, so a row outside it is unreachable. (A virtual row takes `index` instead.)",
  );
}

/**
 * The option part: publishes this row's element into the source and emits the item's ARIA + state
 * attributes. There is **one** code path, because both sources are index-registered — data mode
 * resolves the index from the `item` it was handed, virtual mode is told it. Emits `role="option"`,
 * `aria-selected`, `aria-disabled`, `data-active`/`data-selected`/`data-disabled`, the roving/AD
 * `tabIndex`, an `onClick` that focuses + selects, and an `onPointerMove` that re-targets the active
 * item **only on real pointer movement** (guarded by the root's `pointerMoved`), so a spurious
 * `pointermove` from scrolling cannot fight a keyboard arrow. The consumer's own `onClick` /
 * `onPointerMove` run first, so `event.preventDefault()` cancels the built-in behavior.
 */
export function createListboxItem<V = unknown>(
  state: CreateListboxReturn<V>,
  props: CreateListboxItemProps<V>,
): CreateListboxItemReturn {
  const source = state.indexed;
  // Captured once: a row's mode never changes for its lifetime. Data mode's accessor is a memo read,
  // which is exactly why the registration below tracks it rather than reading it in an effect body.
  const index = props.index ?? (() => state.indexOfValue(state.itemToValue(props.item as V)));

  // Publish this row's element under its index — what resolves `items()[index].element()` for the
  // `aria-activedescendant` IDREF's target and for scroll-into-view. Deliberately **not**
  // `createRegisteredElement`: in data mode the index is reactive, and reading it inside that hook's
  // `register` callback is an untracked read of a reactive value (`[STRICT_READ_UNTRACKED]`, which
  // `mount()` fails a test on). Tracking both in the compute is also what makes a row that changes
  // position re-register under its new index.
  createEffect(
    () => [index(), props.ref()] as const,
    ([at, element]) => {
      if (at < 0) {
        warnUnknownItem(state.itemToValue(props.item as V));
        return;
      }
      if (!element) {
        return;
      }
      source.registerElement(at, element);
      // Variable-height virtual rows only — the data source has nothing to measure.
      source.measureElement?.(element);
      // Retire by **element**, never by the index this run registered under. A reorder re-runs every
      // moved row, and by the time this teardown fires another row may already own `at` — clearing
      // it by index would delete *their* live element, leaving that position with no `element()` at
      // all (no error; just a row `aria-activedescendant` can never point at). See
      // `IndexedItemSource.unregisterElement`.
      return () => source.unregisterElement(element);
    },
  );

  const getItem = () => source.items()[index()];

  // "Highlighted" = the active item **and** the widget holds focus — react-aria's
  // `manager.isFocused && manager.focusedKey === key`. Gating on focus is what stops the highlight from
  // lingering after focus leaves the list, and (paired with the `onFocus` sync below) what paints the
  // row that takes focus when the list is entered. `data-active` is this, not the bare active index.
  const isActive = () => {
    const item = getItem();
    return item ? state.focus.isActive(item) && state.focus.isFocused() : false;
  };
  const isSelected = () => {
    const item = getItem();
    return item ? state.selection.isSelected(item) : false;
  };
  const isDisabled = () => getItem()?.disabled() ?? false;

  const activate = (move?: FocusMoveOptions) => state.focus.focusIndex(index(), move);

  const choose = () => {
    if (state.disabled()) {
      return;
    }
    const item = getItem();
    if (!item) {
      return;
    }
    // Single/none: `selectOne` (single replaces, none no-ops). Multiple: `toggle`.
    if (state.selectionMode() === "multiple") {
      state.selection.toggle(item);
    } else {
      state.selection.selectOne(item);
    }
  };

  // `id` is omitted rather than forwarded: it is the `aria-activedescendant` IDREF, generated by the
  // source per row (`createItemIds`), so a consumer's own id would silently break the reference.
  const rest = omit(props, "ref", "item", "index", "id", "onClick", "onPointerMove", "onFocus");

  const elementProps = merge(rest, {
    get id() {
      return getItem()?.id;
    },
    get role() {
      return "option" as const;
    },
    get "aria-selected"() {
      // `role="option"` in a `selectionMode="none"` listbox is a browsing list — omit the state.
      if (state.selectionMode() === "none") {
        return undefined;
      }
      return isSelected() ? ("true" as const) : ("false" as const);
    },
    get "aria-disabled"() {
      return isDisabled() ? ("true" as const) : undefined;
    },
    get "data-active"() {
      return isActive() ? "" : undefined;
    },
    get "data-selected"() {
      return isSelected() ? "" : undefined;
    },
    get "data-disabled"() {
      return isDisabled() ? "" : undefined;
    },
    get tabindex() {
      const item = getItem();
      return item ? state.focus.getItemTabIndex(item) : -1;
    },
    get onClick() {
      return composeEventHandlers<HTMLElement, MouseEvent>(props.onClick, () => {
        activate();
        choose();
      });
    },
    get onPointerMove() {
      return composeEventHandlers<HTMLElement, PointerEvent>(props.onPointerMove, (event) => {
        if (isDisabled()) {
          return;
        }
        // Re-target the active item only when the pointer genuinely moved — the fight guard.
        if (!state.pointerMoved(event.clientX, event.clientY)) {
          return;
        }
        // `scroll: false`: the row is already under the cursor, and scrolling to it would slide the
        // list and hand the highlight to whatever ends up beneath the pointer.
        activate({ scroll: false });
      });
    },
    get onFocus() {
      // Real DOM focus is the truth in roving mode, so syncing the active index to it paints the row
      // that actually took focus — tabbing in, clicking, or any programmatic `.focus()`. React-aria's
      // item-level `manager.setFocusedKey(key)`. No `getEventTarget(e) === ref.current` guard is needed
      // (unlike react-aria): Solid's `onFocus` is the non-bubbling native `focus`, so a focusable child
      // inside the option cannot reach this handler. `untrack` the whole body (`isDisabled` included)
      // because `createListFocus` moves DOM focus from inside its own effect — this can run in that
      // effect's tracking scope, and every read here is an imperative sync with real focus, never a
      // dependency (same hazard, same fix, as `createCalendarCell.onFocus`).
      return composeEventHandlers<HTMLElement, FocusEvent>(props.onFocus, () => {
        untrack(() => {
          if (isDisabled()) {
            return;
          }
          activate();
        });
      });
    },
  });

  return { props: elementProps, isSelected, isActive, isDisabled };
}
