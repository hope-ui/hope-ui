import type { JSX } from "@solidjs/web";
import { type Accessor, createSignal, createUniqueId } from "solid-js";
import {
  type CreateCollectionReturn,
  type CreateListFocusReturn,
  type CreateListNavigationReturn,
  type CreateListSelectionReturn,
  type CreateListTypeaheadReturn,
  type CreateVirtualCollectionReturn,
  createCollection,
  createListFocus,
  createListNavigation,
  createListSelection,
  createListTypeahead,
  createVirtualCollection,
  type FocusMode,
  type ItemSource,
  type Orientation,
  type SelectionMode,
  type VirtualItemData,
} from "../internal";
import { composeEventHandlers, createKeyboardHandler, withDefaults } from "../utils";

/**
 * The shared state kernel of a listbox — the one call at the root of the tree. It renders **no JSX
 * and no host element**: it wires the `internal/` list kernel together (item source + focus +
 * selection + navigation + typeahead), owns the listbox id / label id / pointer fight-guard, and
 * returns the sub-instances plus a `rootProps` getter the standalone `<ul>` spreads. The per-part
 * hooks (`createListboxItem`, `createListboxGroup`, `createListboxGroupLabel`,
 * `createListboxSeparator`) each take this state (or a group's return) plus their own props.
 * `Listbox.Root` calls this once and shares the return on context; a headless consumer holds it and
 * threads it into whichever part hooks it needs. Mirrors the `createDialog` split.
 *
 * ## Two item-source modes, one seam
 *
 * The list kernel reads an abstract {@link ItemSource}, so `createListbox` picks the concrete source
 * once at creation and everything downstream is identical:
 * - **collection** (default) — `createCollection`, every item mounted and self-registering. Supports
 *   groups + separators. Idiomatic Solid `<For>`.
 * - **virtual** — `createVirtualCollection`, windowed. Selected when both `items` and `estimateSize`
 *   are supplied; `getItemData(index)` is derived from `items` + `itemToValue`/`itemToLabel`/
 *   `getItemDisabled`. Flat lists only.
 *
 * ## Two focus modes, and Select-ready
 *
 * `focusMode` toggles `createListFocus` between `"roving"` (default; the active `<li>` holds real DOM
 * focus) and `"activedescendant"` (the focus owner keeps DOM focus and points `aria-activedescendant`
 * at the active option). The focus/keyboard/typeahead primitives are exposed **independently**
 * (`focus`, `navigation`, `typeahead`) so a future Select can bind them to a focus owner *outside*
 * the `<ul>` (its trigger/input): pass that element as the listbox element and attach
 * `navigation.onKeyDown` / `typeahead.onKeyDown` / `aria-activedescendant` to it. `rootProps` is only
 * the standalone convenience binding them onto the `<ul>`.
 *
 * ## One active item — no double highlight
 *
 * `createListFocus` holds a single active index, written by both keyboard nav and pointer, so the two
 * never diverge. The pointer path is guarded by {@link CreateListboxReturn.pointerMoved} — an item's
 * `onPointerMove` re-targets the active item only when the pointer actually moved, so a spurious
 * `pointermove` fired by scrolling under a still cursor (after a keyboard arrow) cannot yank the
 * active item back. The highlight is styled by `data-active` only (never `hover:`), so the cursor's
 * physical position can never paint a second highlight.
 *
 * Call it **once**, inside a reactive owner scope (a component body, or a `createRoot`).
 */
export interface CreateListboxOptions<V = unknown> {
  /**
   * Maps an item to its primitive **value** — the selection identity (compared `===`), the string
   * submitted to a form, and the item's `id` in virtual mode. Must be unique per item. Default
   * `(item) => String(item)`. Base UI's `itemToStringValue`.
   */
  itemToValue?: (item: V) => string;
  /**
   * Maps an item to its **label** — the typeahead/display text feeding the kernel's `textValue`.
   * When omitted, collection mode falls back to the item element's trimmed `textContent`; virtual
   * mode has no element to fall back to, so offscreen typeahead needs this. Base UI's
   * `itemToStringLabel`.
   */
  itemToLabel?: (item: V) => string;

  /** Controlled selection. Omit for uncontrolled use via `defaultValue`. For reactive control pass a
   *  getter (`get value() { return signal(); }`), exactly as a component prop would. */
  value?: V[];
  /** Initial selection, uncontrolled. Default `[]`. */
  defaultValue?: V[];
  /** Called on every selection change with the new value array. */
  onChange?: (value: V[]) => void;
  /** Full override of value equality. Default `(a, b) => itemToValue(a) === itemToValue(b)`. */
  isItemEqualToValue?: (a: V, b: V) => boolean;
  /** `"single"` (default), `"multiple"`, or `"none"`. */
  selectionMode?: SelectionMode;

  /** `"roving"` (default) or `"activedescendant"`. See this hook's doc. */
  focusMode?: FocusMode;
  /** Arrow-key axis + `aria-orientation`. Default `"vertical"`. */
  orientation?: Orientation;
  /** Whether the whole list is disabled (nothing tabbable, `aria-disabled`). Default `false`. */
  disabled?: boolean;
  /** Whether disabled items are skipped by focus/navigation. Default `true`. */
  skipDisabled?: boolean;
  /** Whether arrow navigation wraps past the ends. Default `false`. */
  wrap?: boolean;

  /** Virtual mode: the **full** data array. Supply with `estimateSize` to enable windowing. Pass a
   *  getter for reactive data. */
  items?: readonly V[];
  /** Virtual mode: estimated row size in px by index. Its presence (with `items`) selects virtual mode. */
  estimateSize?: (index: number) => number;
  /** Virtual mode: overscan rows rendered beyond the window. Default `5`. */
  overscan?: number;
  /** Virtual mode: whether the item at a given index is disabled (collection mode uses the item prop). */
  getItemDisabled?: (item: V) => boolean;

  /** Native form field name. When set, the component renders hidden inputs from `formValues()`. */
  name?: string;
  /** Associates the hidden field(s) with a form by id. */
  form?: string;
  /** Marks the field required for native validation. Default `false`. */
  required?: boolean;

  /** Explicit listbox id. Defaults to a generated, SSR-stable `createUniqueId()`. */
  id?: string;
}

export interface CreateListboxReturn<V = unknown> {
  /** The resolved listbox id (consumer's, else generated). */
  id: Accessor<string>;
  /** The registered label id (a `Listbox.Label`), or `undefined` — the `<ul>`'s `aria-labelledby`. */
  labelId: Accessor<string | undefined>;
  /** Register a label id. For a future `Listbox.Label` part. */
  setLabelId: (id: string | undefined) => void;

  /** The abstract item source — either the collection or the virtual collection. */
  source: ItemSource<V>;
  /** The self-registering collection, present only in collection mode (for `createListboxItem`). */
  collection?: CreateCollectionReturn<V>;
  /** The virtual collection, present only in virtual mode (windowing + element registration). */
  virtual?: CreateVirtualCollectionReturn<V>;

  /** The shared focus instance (active item + roving/activedescendant). Bind its pieces to any owner. */
  focus: CreateListFocusReturn<V>;
  /** The selection instance. */
  selection: CreateListSelectionReturn<V>;
  /** The arrow-key navigation instance. Attach `navigation.onKeyDown` to the focus owner. */
  navigation: CreateListNavigationReturn;
  /** The typeahead instance. Attach `typeahead.onKeyDown` to the focus owner. */
  typeahead: CreateListTypeaheadReturn;

  /** The resolved value mapper (never undefined). */
  itemToValue: (item: V) => string;
  /** The label mapper, or `undefined` (defer to `textContent`). Read by `createListboxItem`. */
  itemToLabel?: (item: V) => string;
  /** The current selection mode. */
  selectionMode: Accessor<SelectionMode>;
  /** The current focus mode. */
  focusMode: Accessor<FocusMode>;
  /** The current orientation. */
  orientation: Accessor<Orientation>;
  /** Whether the whole list is disabled. */
  disabled: Accessor<boolean>;
  /** The current selection (`selection.value`, re-exposed). */
  value: Accessor<V[]>;

  /** Register the listbox element (the `<ul>`, or in Select the scroll container). */
  setListboxElement: (element: HTMLElement | null | undefined) => void;
  /**
   * The pointer fight-guard: returns `true` (and records the coords) only when `(x, y)` differ from
   * the last recorded pointer position, so an item's `onPointerMove` acts on real movement only.
   */
  pointerMoved: (x: number, y: number) => boolean;

  /** The selected items' `itemToValue` strings — what a form submits. */
  formValues: Accessor<string[]>;
  /** The native form field name, if set. */
  name: Accessor<string | undefined>;
  /** The associated form id, if set. */
  form: Accessor<string | undefined>;
  /** Whether the field is required. */
  required: Accessor<boolean>;

  /** Spread onto the standalone listbox container (`role`/`aria-*`/`tabindex`/`onKeyDown`). `ref` is
   *  omitted — the consumer wires the element to `setListboxElement` directly. */
  rootProps: Omit<JSX.HTMLAttributes<HTMLElement>, "ref">;
}

export function createListbox<V = unknown>(
  options: CreateListboxOptions<V> = {},
): CreateListboxReturn<V> {
  // `withDefaults`, not `merge`: `merge` resolves by key *presence*, so a wrapper forwarding an unset
  // prop (present with value `undefined`) would beat the default. See `withDefaults`' doc.
  const merged = withDefaults(options, {
    itemToValue: ((item: V) => String(item)) as (item: V) => string,
    selectionMode: "single" as SelectionMode,
    focusMode: "roving" as FocusMode,
    orientation: "vertical" as Orientation,
    disabled: false,
    skipDisabled: true,
    wrap: false,
    required: false,
  });

  const generatedId = createUniqueId();
  const id = () => merged.id ?? generatedId;

  const itemToValue = (item: V) => merged.itemToValue(item);
  const itemToLabel = merged.itemToLabel;

  const [labelId, setLabelId] = createSignal<string | undefined>();
  const [listboxElement, setListboxElement] = createSignal<HTMLElement | null>();

  const selectionMode = () => merged.selectionMode;
  const focusMode = () => merged.focusMode;
  const orientation = () => merged.orientation;
  const disabled = () => merged.disabled;

  // The source is decided **once**: a listbox is either fully mounted (collection) or windowed
  // (virtual) for its lifetime, never switching. Virtual when both `items` and `estimateSize` exist.
  const virtualized = merged.estimateSize != null && merged.items != null;

  let collection: CreateCollectionReturn<V> | undefined;
  let virtual: CreateVirtualCollectionReturn<V> | undefined;
  let source: ItemSource<V>;

  if (virtualized) {
    const estimateSize = merged.estimateSize as (index: number) => number;
    const items = () => merged.items ?? [];
    virtual = createVirtualCollection<V>({
      count: () => items().length,
      scrollElement: listboxElement,
      estimateSize,
      overscan: merged.overscan,
      horizontal: orientation() === "horizontal",
      getItemData: (index): VirtualItemData<V> => {
        const item = items()[index] as V;
        return {
          id: itemToValue(item),
          value: item,
          textValue: itemToLabel ? itemToLabel(item) : undefined,
          disabled: merged.getItemDisabled ? merged.getItemDisabled(item) : false,
        };
      },
    });
    source = virtual;
  } else {
    collection = createCollection<V>();
    source = collection;
  }

  const focus = createListFocus<V>({
    source,
    focusMode,
    disabled,
    skipDisabled: () => merged.skipDisabled,
    element: listboxElement,
  });

  const selection = createListSelection<V>({
    focus,
    selectionMode,
    value: () => merged.value,
    defaultValue: merged.defaultValue,
    onChange: (value) => merged.onChange?.(value),
    itemToValue,
    isItemEqualToValue: merged.isItemEqualToValue,
  });

  const navigation = createListNavigation<V>({
    focus,
    orientation,
    wrap: () => merged.wrap,
  });

  const typeahead = createListTypeahead<V>({ focus });

  // The pointer/keyboard fight-guard. See `pointerMoved`'s doc + this hook's "one active item" note.
  const [pointerCoords, setPointerCoords] = createSignal<{ x: number; y: number } | null>(null);
  const pointerMoved = (x: number, y: number) => {
    const previous = pointerCoords();
    if (previous && previous.x === x && previous.y === y) {
      return false;
    }
    setPointerCoords({ x, y });
    return true;
  };

  const formValues = () => selection.value().map((value) => itemToValue(value));

  // Selection keys, composed in front of navigation + typeahead. `createKeyboardHandler` matches
  // modifiers exactly, so `shift+ArrowDown` here and the plain `ArrowDown` in `navigation` never
  // collide, and Space is caught here before typeahead's `onText` fallback can type it.
  const selectionKeys = createKeyboardHandler<HTMLElement>()
    .on(" ", (event) => {
      event.preventDefault();
      selection.toggleActive();
    })
    .on("Enter", (event) => {
      event.preventDefault();
      selection.selectActive();
    })
    .on("mod+a", (event) => {
      if (selectionMode() !== "multiple") {
        return;
      }
      event.preventDefault();
      selection.selectAll();
    })
    .on(["shift+ArrowDown", "shift+ArrowUp"], (event) => {
      if (selectionMode() !== "multiple") {
        return;
      }
      // Peek the target explicitly: `navigation.next()` writes the active index, but that write is
      // not visible to a synchronous `focus.activeIndex()` read until the next flush.
      const target = event.key === "ArrowDown" ? navigation.peekNext() : navigation.peekPrev();
      if (target < 0) {
        return;
      }
      event.preventDefault();
      selection.selectRange(target);
      focus.focusIndex(target);
    });

  const onKeyDown = composeEventHandlers<HTMLElement, KeyboardEvent>(
    selectionKeys.onKeyDown,
    navigation.onKeyDown,
    typeahead.onKeyDown,
  );

  const rootProps: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> = {
    get id() {
      return id();
    },
    get role() {
      return "listbox" as const;
    },
    get "aria-multiselectable"() {
      return selectionMode() === "multiple" ? ("true" as const) : undefined;
    },
    get "aria-orientation"() {
      return orientation();
    },
    get "aria-activedescendant"() {
      return focus.activeDescendant();
    },
    get "aria-disabled"() {
      return disabled() ? ("true" as const) : undefined;
    },
    get "aria-labelledby"() {
      return labelId();
    },
    get tabindex() {
      return focus.getListTabIndex();
    },
    onKeyDown,
  };

  return {
    id,
    labelId,
    setLabelId,
    source,
    collection,
    virtual,
    focus,
    selection,
    navigation,
    typeahead,
    itemToValue,
    itemToLabel,
    selectionMode,
    focusMode,
    orientation,
    disabled,
    value: selection.value,
    setListboxElement: (element) => setListboxElement(element),
    pointerMoved,
    formValues,
    name: () => merged.name,
    form: () => merged.form,
    required: () => merged.required,
    rootProps,
  };
}
