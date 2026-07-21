import type { JSX } from "@solidjs/web";
import { type Accessor, merge, omit } from "solid-js";
import { type CollectionItem, createRegisteredElement } from "../internal";
import { composeEventHandlers, withDefaults } from "../utils";
import type { CreateListboxReturn } from "./listbox-root";

export interface CreateListboxItemProps<V = unknown> extends JSX.HTMLAttributes<HTMLElement> {
  /**
   * The item's element as a **real signal accessor** (not a closure over a plain `let`): the element
   * is created as a reactive consequence of the item rendering, so an untracked read would catch it
   * still `undefined`. The consumer still wires `ref={setRef}` on the element itself.
   */
  ref: Accessor<HTMLElement | null | undefined>;
  /** The item's value. **Required in collection mode** (the registered selection value). Ignored in
   *  virtual mode, where the value comes from the source's `getItemData`. */
  value?: V;
  /** Virtual mode only: this row's index into `state.source.items()`. Its presence selects the
   *  virtual path (look the item up by index + publish this row's element into the window). */
  index?: Accessor<number>;
  /** Collection mode: whether this item is disabled. Default `false`. */
  disabled?: boolean;
  /** Explicit typeahead text, overriding `itemToLabel` / `textContent`. */
  textValue?: string;
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

/**
 * The option part: registers the item and emits its ARIA + state attributes. Works over both source
 * modes — collection (self-register via `state.collection.register`) and virtual (look up
 * `state.source.items()[index]` and publish this row's element into the window). Emits `role="option"`,
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
  const merged = withDefaults(props, { disabled: false });
  const virtualIndex = props.index;

  let getItem: () => CollectionItem<V> | undefined;

  if (virtualIndex) {
    // Virtual mode: the CollectionItem is derived from the data source by index. Publish this row's
    // element into the window (and hand it to the virtualizer for measurement) via
    // `createRegisteredElement`, so `items()[index].element()` resolves for the rendered slice.
    createRegisteredElement({
      ref: merged.ref,
      register: (element) => {
        state.virtual?.registerElement(virtualIndex(), element);
        state.virtual?.measureElement(element);
      },
      unregister: () => state.virtual?.registerElement(virtualIndex(), null),
    });
    getItem = () => state.source.items()[virtualIndex()];
  } else {
    // Collection mode: self-register. `textValue` prefers an explicit prop, then the listbox's
    // `itemToLabel`. When neither exists it is omitted entirely, so `createCollection` falls back to
    // the element's trimmed `textContent`.
    const hasTextValue = merged.textValue != null || state.itemToLabel != null;
    const registered = state.collection?.register({
      ref: merged.ref,
      id: typeof merged.id === "string" ? merged.id : undefined,
      disabled: () => merged.disabled,
      value: () => merged.value as V,
      ...(hasTextValue
        ? { textValue: () => merged.textValue ?? state.itemToLabel?.(merged.value as V) ?? "" }
        : {}),
    });
    getItem = () => registered;
  }

  const isActive = () => {
    const item = getItem();
    return item ? state.focus.isActive(item) : false;
  };
  const isSelected = () => {
    const item = getItem();
    return item ? state.selection.isSelected(item) : false;
  };
  const isDisabled = () => getItem()?.disabled() ?? false;

  const activate = () => {
    if (virtualIndex) {
      state.focus.focusIndex(virtualIndex());
      return;
    }
    const item = getItem();
    if (item) {
      state.focus.focus(item);
    }
  };

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

  const rest = omit(
    merged,
    "ref",
    "value",
    "index",
    "id",
    "disabled",
    "textValue",
    "onClick",
    "onPointerMove",
  );

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
      return composeEventHandlers<HTMLElement, MouseEvent>(merged.onClick, () => {
        activate();
        choose();
      });
    },
    get onPointerMove() {
      return composeEventHandlers<HTMLElement, PointerEvent>(merged.onPointerMove, (event) => {
        if (isDisabled()) {
          return;
        }
        // Re-target the active item only when the pointer genuinely moved — the fight guard.
        if (!state.pointerMoved(event.clientX, event.clientY)) {
          return;
        }
        activate();
      });
    },
  });

  return { props: elementProps, isSelected, isActive, isDisabled };
}
