import { createCollator, useLocale } from "@hope-ui/i18n";
import type { JSX } from "@solidjs/web";
import { type Accessor, createSignal, createUniqueId, untrack } from "solid-js";
import {
  type CreateListFocusReturn,
  type CreateListNavigationReturn,
  type CreateListSelectionReturn,
  type CreateListTypeaheadReturn,
  type CreateVirtualCollectionReturn,
  createDataCollection,
  createListFocus,
  createListNavigation,
  createListSelection,
  createListTypeahead,
  createTextDirectionWarning,
  createVirtualCollection,
  type FocusMode,
  type IndexedItemSource,
  type Orientation,
  type SelectionMode,
  type TextDirection,
  type VirtualItemData,
} from "../internal";
import { composeEventHandlers, createKeyboardHandler, withDefaults } from "../utils";

/**
 * A listbox's shared state: called **once** at the root of the tree, inside a reactive owner scope (a
 * component body, or a `createRoot`). It renders **no JSX and no host element** — it wires the
 * `internal/` list primitives together (item source + focus + selection + navigation + typeahead),
 * owns the listbox id, the label id and the pointer fight-guard, and returns those sub-instances plus
 * a `rootProps` object a standalone `<ul>` can spread. The part hooks (`createListboxItem`,
 * `createListboxGroup`, …) each take this state plus their own props.
 *
 * ## Options are data, never mounted elements
 *
 * `items` is **required**, and it is the whole option set — not the rows that happen to be mounted.
 * That is what lets a Select's options exist while its popup is shut, which in turn makes
 * closed-trigger typeahead and a server-rendered `<select>` for browser autofill possible without
 * mounting a single row the user may never open. A DOM-registered source cannot do any of that,
 * because it *is* the mounted elements.
 *
 * Two sources implement the {@link IndexedItemSource} seam the list primitives read, and this hook
 * picks one **once** at creation:
 * - **data** (default) — every row derives from `items`; a mounted row publishes its element by index.
 *   Supports groups + separators via `groupToItems`.
 * - **virtual** — windowed: only the visible rows exist in the DOM. Selected by passing
 *   `estimateSize`. Flat lists only.
 *
 * Either way a row registers by **index**, so `createListboxItem` has a single code path.
 *
 * ## Two focus modes, and Select-ready
 *
 * `focusMode` picks between `"roving"` (default: the active option holds real DOM focus, and only it
 * is tabbable) and `"activedescendant"` (the container keeps DOM focus and names the active option
 * through `aria-activedescendant`, an ARIA attribute pointing at that option's `id`). `focus`,
 * `navigation` and `typeahead` are returned **separately** so a Select can bind them to a focus owner
 * *outside* the list — pass its input as the listbox element and attach `navigation.onKeyDown` /
 * `typeahead.onKeyDown` / `aria-activedescendant` there. `rootProps` is only the standalone
 * convenience that binds them onto the container.
 *
 * ## One active item — no double highlight
 *
 * A single active index is written by both keyboard and pointer, so the two can never diverge, and
 * the pointer path is guarded by {@link CreateListboxReturn.pointerMoved}. The highlight is styled off
 * `data-active` alone and never `hover:`, so the cursor's physical position cannot paint a second one.
 *
 * Full model: `__internal__/primitives/listbox/listbox-root.md`.
 */
export interface CreateListboxOptions<V = unknown, G = V> {
  /**
   * The option set, in navigation order — **required**, and the source every row derives from. Holds
   * the *items* for a flat list, and the **group entries** when `groupToItems` is set. Pass a getter
   * for reactive data, exactly as a component prop would.
   */
  items: readonly G[];
  /**
   * Maps a group entry to its own items. Its **only** job is flattening `items` into navigation
   * order: the group's *label* never reaches the kernel (a consumer renders it from its own key), so
   * there is no `groupToLabel` and no `{ label, items }` shape to conform to. Omit for a flat list.
   * Not combinable with `estimateSize` — windowing is flat by construction.
   */
  groupToItems?: (group: G) => readonly V[];
  /**
   * Maps an item to its primitive **value** — the selection identity (compared `===`), the string
   * submitted to a form, and the key a row resolves its own index by ({@link
   * CreateListboxReturn.indexOfValue}). **Not** the item's DOM `id`: the source generates those
   * itself. Must be unique per item. Default `(item) => String(item)`.
   */
  itemToValue?: (item: V) => string;
  /**
   * Maps an item to its **label** — the text typeahead matches against. Defaults to `itemToValue`.
   * There is deliberately **no `element.textContent` fallback**: the whole point of a data-driven
   * source is that the text is readable without mounting the row, which is what offscreen and
   * closed-popup typeahead need.
   */
  itemToLabel?: (item: V) => string;
  /** Whether an item is disabled (skipped by focus/navigation, `aria-disabled`). Default `false`. */
  isItemDisabled?: (item: V) => boolean;

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
  /**
   * Reading direction. Defaults to `useLocale()` (the `I18nProvider` / browser locale). Feeds the
   * horizontal arrow flip: under `"rtl"`, ArrowLeft moves toward the *next* item. Inert for a
   * vertical listbox.
   *
   * Behavior only — never written to the DOM, so the layout keeps following the CSS cascade. If you
   * render the element yourself, set `dir` on it too (`Listbox.Root` does). Why the locale-derived
   * value is deliberately not written for you, plus the dev warning that catches a mismatch:
   * `../internal/create-text-direction-warning.ts`.
   */
  dir?: TextDirection;
  /** Whether the whole list is disabled (nothing tabbable, `aria-disabled`). Default `false`. */
  disabled?: boolean;
  /** Whether disabled items are skipped by focus/navigation. Default `true`. */
  skipDisabled?: boolean;
  /** Whether arrow navigation wraps past the ends. Default `false`. */
  wrap?: boolean;
  /**
   * Called with the index typeahead matched, instead of the default "highlight it". The seam a
   * composed widget intercepts to **select** the match rather than highlight it, which is what
   * closed-trigger typeahead needs: a Select whose popup is shut has no row to highlight, and a
   * native `<select>` changes its value outright. `createCombobox` is the caller; a standalone
   * listbox never sets it. Read once at creation — configuration, not reactive input.
   */
  onTypeaheadMatch?: (index: number) => void;

  /** Estimated row size in px by index. Its presence selects **virtual mode** (windowing). */
  estimateSize?: (index: number) => number;
  /** Virtual mode: overscan rows rendered beyond the window. Default `5`. */
  overscan?: number;

  /** Native form field name. When set, the component renders a `HiddenSelect` over `formValues()`. */
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
  /** The registered label id (a `Listbox.Label`), or `undefined` — the container's `aria-labelledby`. */
  labelId: Accessor<string | undefined>;
  /** Register a label id. For a future `Listbox.Label` part. */
  setLabelId: (id: string | undefined) => void;

  /**
   * The item source, data or virtual — always index-registered, which is why `createListboxItem` has
   * a single code path. Read `indexed.items()` for the full option set; a row publishes its element
   * with `indexed.registerElement(index, element)`.
   */
  indexed: IndexedItemSource<V>;
  /** The virtual collection, present only in virtual mode. It carries the windowing metadata a sizer
   *  needs (`virtualItems()`, `totalSize()`), which the shared source seam has no room for. */
  virtual?: CreateVirtualCollectionReturn<V>;
  /**
   * The index of the item whose `itemToValue` is `value`, or `-1`. This is how a row resolves its own
   * position from the `item` it was handed, rather than taking an `index` its author has no way to
   * know — so an option can sit anywhere in the subtree, including a group's nested `<For>`. Backed by
   * a `Map` rebuilt with the data, so it costs O(n) per **data change**, not per render. Always `-1`
   * in **virtual** mode, where a recycled row's position changes under it and `index` is the only
   * honest answer.
   */
  indexOfValue: (value: string) => number;

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
  /** The label mapper, or `undefined` (the source then falls back to `itemToValue`). */
  itemToLabel?: (item: V) => string;
  /** The current selection mode. */
  selectionMode: Accessor<SelectionMode>;
  /** The current focus mode. */
  focusMode: Accessor<FocusMode>;
  /** The current orientation. */
  orientation: Accessor<Orientation>;
  /** The reading direction the horizontal keymap mirrors against: the consumer's `dir`, else
   *  `useLocale().direction()`. Drives behavior only — never written to the DOM, so the layout still
   *  follows the cascade. See `../internal/create-text-direction-warning.ts`. */
  direction: Accessor<TextDirection>;
  /** Whether the whole list is disabled. */
  disabled: Accessor<boolean>;
  /** The current selection (`selection.value`, re-exposed). */
  value: Accessor<V[]>;

  /** Register the listbox element (the container, and in Select the scroll container). */
  setListboxElement: (element: HTMLElement | null | undefined) => void;
  /**
   * The pointer fight-guard: returns `true` (and records the coords) only when `(x, y)` differ from
   * the last recorded pointer position. Without it, a `pointermove` the browser fires because the list
   * scrolled under a *stationary* cursor would yank the highlight back from wherever an arrow key had
   * just put it.
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

/** Dev-only. Windowing measures a flat run of rows, so there is no window a group could live in. */
function warnVirtualGrouping(): void {
  // `import.meta.env.DEV` is defined by the consumer's Vite (and by vitest). Cast it locally so this
  // package needn't pull `vite/client` into `compilerOptions.types`.
  const isDev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV;
  if (!isDev) {
    return;
  }
  console.warn(
    "[hope-ui] createListbox: `groupToItems` and `estimateSize` cannot be combined — windowing " +
      "measures a flat run of rows. `estimateSize` wins and the groups are ignored; drop one.",
  );
}

export function createListbox<V = unknown, G = V>(
  options: CreateListboxOptions<V, G>,
): CreateListboxReturn<V> {
  // `withDefaults`, not Solid's `merge`: `merge` resolves keys by *presence*, so a wrapper forwarding
  // an unset prop (present, value `undefined`) would beat the default. `withDefaults` resolves with
  // `??`, which is what makes it the only correct way to apply defaults under Solid 2.0.
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

  const i18n = useLocale();
  const direction = () => merged.dir ?? i18n.direction();

  // Dev-only, and only for a horizontal list: a vertical one maps Up/Down, which direction cannot
  // change. `direction()` drives the keys and the DOM drives the layout; nothing else joins them.
  createTextDirectionWarning({
    name: "Listbox",
    direction,
    element: listboxElement,
    active: () => orientation() === "horizontal",
  });

  // Decided **once**: a listbox is either data-driven or windowed for its whole lifetime, never
  // switching between them.
  const virtualized = merged.estimateSize != null;

  let virtual: CreateVirtualCollectionReturn<V> | undefined;
  let indexed: IndexedItemSource<V>;
  let indexOfValue: (value: string) => number;

  if (virtualized) {
    if (merged.groupToItems != null) {
      warnVirtualGrouping();
    }
    const estimateSize = merged.estimateSize as (index: number) => number;
    // Grouping is off in this branch (warned above), so the entries *are* the items.
    const items = () => merged.items as unknown as readonly V[];
    virtual = createVirtualCollection<V>({
      count: () => items().length,
      scrollElement: listboxElement,
      estimateSize,
      overscan: merged.overscan,
      horizontal: orientation() === "horizontal",
      getItemData: (index): VirtualItemData<V> => {
        const item = items()[index] as V;
        return {
          value: item,
          textValue: itemToLabel ? itemToLabel(item) : undefined,
          disabled: merged.isItemDisabled ? merged.isItemDisabled(item) : false,
        };
      },
    });
    indexed = virtual;
    // A windowed row is recycled: its index changes while the component stays mounted, so only the row
    // itself knows its position and no value can resolve one. `createListboxItem` warns in dev.
    indexOfValue = () => -1;
  } else {
    const data = createDataCollection<V, G>({
      items: () => merged.items,
      groupToItems: merged.groupToItems,
      itemToValue,
      itemToLabel,
      isItemDisabled: merged.isItemDisabled,
      scrollElement: listboxElement,
    });
    indexed = data;
    indexOfValue = data.indexOfValue;
  }

  // Both types are written out rather than inferred: `entryIndex` forward-references `selection`, and
  // without the annotations TypeScript sees a cyclic initializer (`focus` → `entryIndex` →
  // `selection` → `focus`) and silently widens both to `any`.
  const focus: CreateListFocusReturn<V> = createListFocus<V>({
    source: indexed,
    focusMode,
    disabled,
    skipDisabled: () => merged.skipDisabled,
    element: listboxElement,
    // The row the list enters on — the APG (the ARIA Authoring Practices Guide) says a listbox should
    // enter on its selected option. `selection` is declared just below, but this accessor only *reads*
    // it later, from a focus handler or a tabindex getter, never while constructing — so the forward
    // reference is safe and the dependency direction stays selection → focus everywhere else.
    entryIndex: () => selection.firstSelectedIndex(),
    // The same mapper selection uses, so the highlight survives the option set changing under it —
    // a Combobox narrowing on each keystroke, or an async source arriving.
    itemToValue,
  });

  const selection: CreateListSelectionReturn<V> = createListSelection<V>({
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
    textDirection: direction,
  });

  // `sensitivity: "base"` folds diacritics and case, so typing `cafe` matches `Café`.
  const typeaheadCollator = createCollator({ usage: "search", sensitivity: "base" });
  const typeahead = createListTypeahead<V>({
    focus,
    collator: typeaheadCollator,
    onMatch: merged.onTypeaheadMatch,
  });

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
  // collide, and Space is claimed here before typeahead could treat it as a typed character.
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
      // Peek rather than move-then-read: `navigation.next()` writes the active index, and a Solid 2.0
      // signal write is invisible to a plain read until the next flush, so `focus.activeIndex()` would
      // still report the old row here.
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

  // Focus tracking on the container drives the highlight gate: a row paints `data-active` only while
  // the widget holds focus. `focusin`/`focusout` rather than `focus`/`blur` because those bubble — in
  // roving mode DOM focus lands on an item, and this handler must still see it.
  const onFocusIn: JSX.EventHandler<HTMLElement, FocusEvent> = (event) => {
    // `createListFocus` moves DOM focus from inside its own effect (`element.focus()`), which dispatches
    // this handler synchronously — so a plain read below would register as a dependency of that effect.
    // Every read here is an imperative sync with real focus, so untrack the body (same hazard and fix
    // as `createCalendarCell.onFocus`).
    const enteredContainer = event.target === event.currentTarget;
    untrack(() => {
      focus.setFocused(true);
      // Split on *where* focus landed rather than on the active index, which would race: an item's own
      // `onFocus` has already set the index, but that write is invisible to this synchronous read until
      // the next flush. So only the container receiving focus itself runs the entry rule — a click on a
      // roving list's padding (a `tabindex=-1` container is still click-focusable), and the whole entry
      // path in activedescendant mode. Skipping it when something is already active is what makes
      // returning to the list restore the previous position instead of resetting to the top.
      if (enteredContainer && focus.activeIndex() < 0) {
        focus.focusEntry();
      }
    });
  };

  const onFocusOut: JSX.EventHandler<HTMLElement, FocusEvent> = (event) => {
    const owner = event.currentTarget;
    // Decide on the next task, NOT from `event.relatedTarget`: a virtualized row destroyed under the
    // user blurs with a null `relatedTarget`, at this instant indistinguishable from tabbing away, and
    // the roving focus-recovery effect re-homes focus within the same flush. Same shape, and the same
    // reason, as `calendar-group.ts`.
    setTimeout(() => {
      if (owner.isConnected && !owner.contains(owner.ownerDocument.activeElement)) {
        focus.setFocused(false);
      }
    });
  };

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
    onFocusIn,
    onFocusOut,
  };

  return {
    id,
    labelId,
    setLabelId,
    indexed,
    virtual,
    indexOfValue,
    focus,
    selection,
    navigation,
    typeahead,
    itemToValue,
    itemToLabel,
    selectionMode,
    focusMode,
    orientation,
    direction,
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
