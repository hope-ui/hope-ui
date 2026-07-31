import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  merge,
  omit,
  untrack,
} from "solid-js";
import {
  type Boundary,
  type CreateFloatingReturn,
  createControllableState,
  createFloating,
  createPresence,
  type DismissBubbles,
  type FloatingAlign,
  type Padding,
  type PresenceState,
  type SelectionMode,
  type SideOrLogical,
  type Strategy,
} from "../internal";
import { type CreateListboxOptions, type CreateListboxReturn, createListbox } from "../listbox";
import { withDefaults } from "../utils";

/**
 * The shared state kernel of the **APG 1.2 combobox pattern** — `role="combobox"` on a focus owner
 * that keeps DOM focus, `aria-expanded`/`aria-controls` pointing at a `role="listbox"` popup, and
 * `aria-activedescendant` naming the active option. It is the one call at the root of the tree, it
 * renders **no JSX and no host element**, and it is what stops Select and Combobox growing two
 * keyboard/ARIA implementations that drift apart.
 *
 * The per-part hooks (`createComboboxTrigger`, `createComboboxValue`, `createComboboxPositioner`,
 * `createComboboxContent`, `createComboboxList`) each take this state plus their own props and own
 * the rest — their effects, their id/element registration, and their consumer-prop precedence.
 * Options are `createListboxItem(state.list, …)` unchanged; there is no `combobox-item.ts`.
 *
 * ## It owns no text value — the absence of filtering is the design
 *
 * There is no `inputValue`, no filtered-vs-original collection, no `commit`/`revert`, and **no
 * filtering of any kind**. Someone opening this folder expecting them will not find them, and that
 * is deliberate: the filter seam belongs to Combobox, must be pulled by a real input value, and
 * cannot be guessed at from Select's side. Base UI built the same kernel one layer *up*, around an
 * input value, and its `SelectRoot` (757 lines) consequently cannot import it — the exact outcome
 * this scoping avoids. See `__internal__/roadmap.md` § "The combobox kernel".
 *
 * ## Why the listbox is created eagerly here
 *
 * The popup mounts lazily — nothing renders until open, so tabbing a form with ten Selects mounts
 * zero option lists. A `createListbox` created inside the popup would therefore leave the trigger
 * with no `navigation`, no `typeahead` and no `focus.activeDescendant()` to read *while closed*,
 * which is exactly the state closed-trigger typeahead lives in. Created here, the option set exists
 * from the first render because it is **data** (`items`), not mounted elements. Same argument as
 * Popover's root-owned `createPresence`, and it is why `allowsEmptyCollection` can mean anything at
 * all.
 *
 * ## Modality is two mechanisms, not four
 *
 * `modal` (default `true`) gates `createHideOutside` + `createScrollLock`, both created by
 * `createComboboxContent`. There is deliberately **no focus trap and no `ModalBackdrop`**: focus
 * never leaves the trigger in activedescendant mode, so there is nothing to trap, and a backdrop
 * would cover the trigger — making it unclickable and breaking toggle-to-close. React Aria's Select
 * composes exactly this pair (`usePreventScroll` + `ariaHideOutside`).
 *
 * Call it **once**, inside a reactive owner scope (a component body, or a `createRoot`).
 */

/** Where the highlight lands when the popup opens. See {@link CreateComboboxReturn.focusStrategy}. */
export type ComboboxFocusStrategy = "first" | "last" | "selected";

/**
 * The selection value as a **consumer** sees it, discriminated by `selectionMode`: an array in
 * `"multiple"`, a scalar (or `null`) otherwise. A single Select must not hand back `[apple]`.
 *
 * `createListbox` keeps its low-level `V[]` contract untouched — the adaptation happens in this
 * kernel, so Select and Combobox stay pure pass-throughs and both inherit it. React Aria spells the
 * same idea the same way (`useSelect<T, M extends SelectionMode = 'single'>`).
 */
export type SelectionValue<V, M extends SelectionMode> = M extends "multiple" ? V[] : V | null;

export interface CreateComboboxOptions<V = unknown, M extends SelectionMode = "single", G = V>
  extends Omit<
    CreateListboxOptions<V, G>,
    "focusMode" | "value" | "defaultValue" | "onChange" | "selectionMode" | "onTypeaheadMatch"
  > {
  /**
   * `"single"` (default), `"multiple"`, or `"none"` — the vocabulary `createListbox` already
   * exposes, never a `multiple` boolean. `M` is inferred from it and types `value`/`defaultValue`/
   * `onChange`.
   */
  selectionMode?: M;
  /** Controlled selection: `V | null` in single mode, `V[]` in multiple. Omit for uncontrolled use. */
  value?: SelectionValue<V, M>;
  /** Initial selection, uncontrolled. Defaults to "nothing selected". */
  defaultValue?: SelectionValue<V, M>;
  /** Called on every selection change, in the same shape as `value`. */
  onChange?: (value: SelectionValue<V, M>) => void;

  /** Controlled open state. Omit for uncontrolled use via `defaultOpen`. */
  open?: boolean;
  /** Initial open state, uncontrolled. Default `false`. */
  defaultOpen?: boolean;
  /** Called whenever the popup would open or close. */
  onOpenChange?: (open: boolean) => void;

  /**
   * Whether the popup may open with no options in it. Default `false` — a listbox with nothing to
   * choose from is a dead end, and this guard is only *meaningful* because the option set is data
   * and therefore countable while closed. Combobox sets it once it has a filter that can empty the
   * list and an `Empty` part to say so.
   */
  allowsEmptyCollection?: boolean;
  /**
   * Whether choosing an option closes the popup. Defaults to `selectionMode !== "multiple"` —
   * picking one value is finished business, ticking several is not. Applied by wrapping the
   * selection's `onChange`, so it covers *every* path that selects (Enter, Space, a click on an
   * option) without each of them repeating it.
   */
  shouldCloseOnSelect?: boolean;
  /**
   * Whether the open popup hides the rest of the page from assistive technology (`aria-hidden` +
   * `inert`) and locks body scroll. Default `true`; Combobox passes `false`. See this hook's doc for
   * why modality here is two mechanisms rather than four.
   */
  modal?: boolean;

  /** Whether Escape closes the popup. Default `true`. */
  closeOnEscape?: boolean;
  /** Whether a pointerdown outside the content closes the popup. Default `true`. */
  closeOnInteractOutside?: boolean;
  /**
   * Whether focus landing outside the content (and outside the trigger) closes the popup. Default
   * `true` — nothing traps focus here, so tabbing away must not leave an orphaned popup behind.
   */
  closeOnFocusOutside?: boolean;
  /**
   * Whether a dismissal handled by a layer opened **above** this popup also closes it. Default:
   * neither channel — the topmost layer alone dismisses.
   */
  bubbles?: DismissBubbles;

  /** Preferred side of the trigger. Default `"bottom"`. */
  side?: SideOrLogical;
  /** Alignment along the side's cross axis. Default `"center"`. */
  align?: FloatingAlign;
  /** Distance from the trigger, in px. Default `0`; the visual default lives in the component. */
  sideOffset?: number;
  /** Skid along the alignment axis, in px. Default `0`. */
  alignOffset?: number;
  /** Flip to the opposite side when the preferred one overflows. Default `true`. */
  flip?: boolean;
  /** Slide along the alignment axis to stay in view. Default `true`. */
  shift?: boolean;
  /** Padding kept between the popup and the collision boundary. Default `0`. */
  collisionPadding?: Padding;
  /** What the popup must stay inside. Default floating-ui's `"clippingAncestors"`. */
  collisionBoundary?: Boundary;
  /** CSS `position` for the positioner. Default `"absolute"`. */
  strategy?: Strategy;
  /** Keep the position current via scroll/resize observers. Default `true`. */
  autoUpdate?: boolean;
  /** Re-measure every animation frame — for a trigger that moves under a transform. Default `false`. */
  trackAnchorMotion?: boolean;
}

export interface CreateComboboxReturn<V = unknown, M extends SelectionMode = "single"> {
  /** Whether the popup is open. */
  open: Accessor<boolean>;
  /**
   * Request an open/close. Honors controlled mode, fires `onOpenChange`, and refuses to open an
   * empty collection unless `allowsEmptyCollection`. A request that matches the current state is
   * dropped, so a close-on-select that fires while already closed (closed-trigger typeahead) does
   * not emit a phantom `onOpenChange(false)`.
   */
  setOpen: (open: boolean) => void;
  /**
   * Where the highlight lands on the next open — set by whatever opened the popup, applied by this
   * hook's entry effect once the layer is positioned. `"selected"` (click, Enter/Space),
   * `"first"` (ArrowDown), `"last"` (ArrowUp).
   */
  focusStrategy: Accessor<ComboboxFocusStrategy>;
  /** Set the entry strategy. Call it **before** `setOpen(true)`. */
  setFocusStrategy: (strategy: ComboboxFocusStrategy) => void;

  /**
   * The listbox state, created eagerly over the data source in `"activedescendant"` focus mode.
   * Parts read `list.focus` / `list.selection` / `list.navigation` / `list.typeahead` from here, and
   * an option is `createListboxItem(state.list, …)` unchanged.
   */
  list: CreateListboxReturn<V>;
  /** The selection in the consumer's shape — scalar in single mode, an array in multiple. */
  value: Accessor<SelectionValue<V, M>>;
  /** The current selection mode. */
  selectionMode: Accessor<SelectionMode>;

  /** Whether an empty collection may open. */
  allowsEmptyCollection: Accessor<boolean>;
  /** Whether choosing an option closes the popup. */
  shouldCloseOnSelect: Accessor<boolean>;
  /** Whether the open popup hides outside content and locks scroll. */
  modal: Accessor<boolean>;
  /** Whether Escape closes the popup. Read by `createComboboxContent`'s `createDismissable`. */
  closeOnEscape: Accessor<boolean>;
  /** Whether an outside pointerdown closes the popup. */
  closeOnInteractOutside: Accessor<boolean>;
  /** Whether focus landing outside closes the popup. */
  closeOnFocusOutside: Accessor<boolean>;
  /** Whether a dismissal handled by a layer above also closes this one. */
  bubbles: Accessor<DismissBubbles | undefined>;

  /** The trigger's id: a registered consumer id if any, else a generated (SSR-stable) fallback. */
  triggerId: Accessor<string>;
  /** Register a consumer-supplied trigger id. Called by `createComboboxTrigger`. */
  setTriggerId: (id: string | undefined) => void;
  /**
   * The popup's id — the listbox element's, which is what the trigger's `aria-controls` names.
   * Falls back to `list.id()`, so there is exactly one generated id for one element.
   */
  popupId: Accessor<string>;
  /** Register a consumer-supplied popup id. Called by `createComboboxList`. */
  setPopupId: (id: string | undefined) => void;
  /**
   * The registered `Value` part's id, or `undefined` when none is mounted — prepended to the
   * trigger's `aria-labelledby` so the current selection is announced before the field's label.
   */
  valueId: Accessor<string | undefined>;
  /** Register the value id. Called by `createComboboxValue` from the value's own scope. */
  setValueId: (id: string | undefined) => void;

  /** The trigger element: the focus owner, the positioning anchor, and the one spared element. */
  triggerElement: Accessor<HTMLElement | undefined>;
  /** Register the trigger element. Wired to `createComboboxTrigger`'s `setRef`. */
  setTriggerElement: (element: HTMLElement | undefined) => void;
  /** The positioner element — what `floating.floatingStyles()` is spread onto. */
  positionerElement: Accessor<HTMLElement | undefined>;
  /** Register the positioner element. Wired to `createComboboxPositioner`'s `setRef`. */
  setPositionerElement: (element: HTMLElement | undefined) => void;
  /** The content element: the card inside the positioner, and what presence times its exit off. */
  contentElement: Accessor<HTMLElement | undefined>;
  /** Register the content element. Wired to `createComboboxContent`'s `setRef`. */
  setContentElement: (element: HTMLElement | undefined) => void;
  /**
   * Register the `role="listbox"` element. Wired to `createComboboxList`'s `setRef`; it is the data
   * source's **scroll container**, so an offscreen highlighted option can be scrolled into view.
   */
  setListElement: (element: HTMLElement | null | undefined) => void;

  /**
   * The trigger, once registered — one array serving two mechanisms that are really one
   * requirement. It is `createDismissable`'s `exclude` (or a pointerdown on the trigger dismisses in
   * the capture phase and the trigger's own `click` reopens, so the popup can never be closed by the
   * control that opened it) **and** `createHideOutside`'s `spare` (or the trigger goes `inert`,
   * losing focus, the pointer, and the same toggle).
   */
  sparedElements: Accessor<HTMLElement[]>;
  /** The **shared** popup presence for `Content` + `Positioner`. Gate their render on `mounted()`. */
  contentPresence: PresenceState;
  /** The positioning layer, anchored to the trigger, with `trackSize` on. */
  floating: CreateFloatingReturn;
}

export function createCombobox<V = unknown, M extends SelectionMode = "single", G = V>(
  options: CreateComboboxOptions<V, M, G>,
): CreateComboboxReturn<V, M> {
  // `withDefaults`, not `merge({ modal: true }, options)`: `merge` resolves by key *presence*, so a
  // wrapper forwarding an unset `modal`/`defaultOpen` (the key present with value `undefined`) would
  // silently beat the default. See `withDefaults`' doc.
  //
  // `selectionMode` and `shouldCloseOnSelect` are absent on purpose. The first cannot be defaulted
  // here without casting a literal to the generic `M`; the second's default is *derived* from it.
  // The positioning options are absent for Popover's reason — `createFloating` applies its own `??`
  // defaults, and the visual ones belong to the component layer where a preset can theme them.
  const merged = withDefaults(options, {
    defaultOpen: false,
    allowsEmptyCollection: false,
    modal: true,
    closeOnEscape: true,
    closeOnInteractOutside: true,
    closeOnFocusOutside: true,
  });

  const selectionMode: Accessor<SelectionMode> = () => merged.selectionMode ?? "single";
  const allowsEmptyCollection = () => merged.allowsEmptyCollection;
  const modal = () => merged.modal;
  const shouldCloseOnSelect = () => merged.shouldCloseOnSelect ?? selectionMode() !== "multiple";

  const [open, setOpenState] = createControllableState<boolean>({
    value: () => merged.open,
    defaultValue: () => merged.defaultOpen,
    onChange: (value) => merged.onOpenChange?.(value),
  });

  const [focusStrategy, setFocusStrategy] = createSignal<ComboboxFocusStrategy>("selected");

  // The trigger is rendered eagerly and its id feeds two IDREFs (the list's `aria-labelledby`, and
  // the trigger's own when a consumer names it with `aria-label`), so it needs a server-visible
  // generated fallback. `createRegisteredId` never runs during SSR.
  const generatedTriggerId = createUniqueId();
  const [customTriggerId, setTriggerId] = createSignal<string | undefined>();
  const triggerId = () => customTriggerId() ?? generatedTriggerId;
  const [customPopupId, setPopupId] = createSignal<string | undefined>();
  const [valueId, setValueId] = createSignal<string | undefined>();

  const [triggerElement, setTriggerElement] = createSignal<HTMLElement>();
  const [positionerElement, setPositionerElement] = createSignal<HTMLElement>();
  const [contentElement, setContentElement] = createSignal<HTMLElement>();

  // ─── The scalar ⇄ array adapter ────────────────────────────────────────────────────────────────
  // Both directions live here, beside the `onChange` wrap, so `createListbox` keeps its low-level
  // `V[]` contract and neither component layer has to know the difference.
  const toValueArray = (value: SelectionValue<V, M> | undefined): V[] | undefined => {
    // `=== undefined`, not `??`: `null` is the single-mode "nothing selected" *controlled* value,
    // and `createControllableState` reads `undefined` as "uncontrolled".
    if (value === undefined) {
      return undefined;
    }
    if (selectionMode() === "multiple") {
      return (value as V[] | null) ?? [];
    }
    return value === null ? [] : [value as V];
  };
  const fromValueArray = (values: V[]): SelectionValue<V, M> =>
    (selectionMode() === "multiple" ? values : (values[0] ?? null)) as SelectionValue<V, M>;

  // Every selection path funnels through here — Enter, Space, and an option's own click — so
  // close-on-select is spelled once instead of at each key. `createControllableState` notifies on
  // every request, including re-selecting the value that is already selected, which is what makes
  // re-picking the current option close the popup.
  const handleSelectionChange = (values: V[]) => {
    merged.onChange?.(fromValueArray(values));
    if (shouldCloseOnSelect()) {
      setOpen(false);
    }
  };

  // The `onMatch` seam is the whole reason closed-trigger typeahead works: with the popup shut there
  // is no row to highlight, so a match **selects** outright — native `<select>` behavior, and what
  // the data-driven source exists for. Multiple mode keeps highlighting instead: toggling a value
  // per keystroke would make a repeated letter select and immediately deselect.
  const handleTypeaheadMatch = (index: number) => {
    if (open() || selectionMode() !== "single") {
      list.focus.focusIndex(index);
      return;
    }
    const item = list.focus.items()[index];
    if (item) {
      list.selection.selectOne(item);
    }
  };

  // `merge(options, …)` rather than a hand-written getter per forwarded key: `CreateComboboxOptions`
  // *is* `CreateListboxOptions` minus the keys overridden below, so re-listing the rest would be a
  // second copy that silently stops forwarding whatever `createListbox` gains next. The extra
  // open/modal/positioning keys ride along unread, as they would through any props object.
  //
  // The four re-shaped keys are `omit`-ed rather than merely shadowed: `merge` types an overlapping
  // key as the *union* of both sources, so a consumer's scalar `value` would leak into a `V[]` slot.
  // That list mirrors this hook's `Omit<…>` exactly and — unlike a forwarding list — cannot rot,
  // because it names what this kernel re-shapes, not what the listbox happens to accept.
  const listOptions: CreateListboxOptions<V, G> = merge(
    omit(options, "value", "defaultValue", "onChange", "selectionMode"),
    {
      // Forced, and therefore omitted from the options: the focus owner is the trigger, which keeps
      // DOM focus and points `aria-activedescendant` at the active option.
      focusMode: "activedescendant" as const,
      get selectionMode() {
        return selectionMode();
      },
      get value() {
        return toValueArray(merged.value);
      },
      get defaultValue() {
        return toValueArray(merged.defaultValue) ?? [];
      },
      onChange: handleSelectionChange,
      onTypeaheadMatch: handleTypeaheadMatch,
    },
  );
  const list: CreateListboxReturn<V> = createListbox<V, G>(listOptions);

  const popupId = () => customPopupId() ?? list.id();
  const value = () => fromValueArray(list.value());

  const setOpen = (next: boolean) => {
    if (next === open()) {
      return;
    }
    // Only meaningful because the options are data: a DOM-registered source is *always* empty before
    // opening, so this guard could never have been written against one.
    if (next && !allowsEmptyCollection() && list.focus.items().length === 0) {
      return;
    }
    setOpenState(next);
  };

  // A memo, so the array's identity only changes when the trigger does.
  const sparedElements = createMemo<HTMLElement[]>(() => {
    const trigger = triggerElement();
    return trigger === undefined ? [] : [trigger];
  });

  // Eager (created while `open` is `false`) so opening drives `entering → entered` rather than
  // latching straight to `entered` — the lazily-mounted-content trap `popover-root.md` documents.
  const contentPresence = createPresence({ present: open, ref: contentElement });

  const floating = createFloating({
    // `mounted()`, NOT `open`: keyed on `open`, `createFloating` would revert `floatingStyles()` to
    // its hidden, unpositioned branch the instant the popup closes — while the presence is still
    // holding it mounted for its exit transition.
    active: () => contentPresence.mounted(),
    anchor: triggerElement,
    floating: positionerElement,
    // Unconditional, as on Popover: `createComboboxPositioner` publishes `--anchor-width` /
    // `--available-height` on every combobox, so a recipe's `w-(--anchor-width)` always resolves.
    // Behind a flag those properties would be absent by default and the declaration reading them
    // would be silently dropped by the browser.
    trackSize: true,
    get side() {
      return merged.side;
    },
    get align() {
      return merged.align;
    },
    get sideOffset() {
      return merged.sideOffset;
    },
    get alignOffset() {
      return merged.alignOffset;
    },
    get flip() {
      return merged.flip;
    },
    get shift() {
      return merged.shift;
    },
    get collisionPadding() {
      return merged.collisionPadding;
    },
    get collisionBoundary() {
      return merged.collisionBoundary;
    },
    get strategy() {
      return merged.strategy;
    },
    get autoUpdate() {
      return merged.autoUpdate;
    },
    get trackAnchorMotion() {
      return merged.trackAnchorMotion;
    },
  });

  // ─── The entry effect ──────────────────────────────────────────────────────────────────────────
  // `isPositioned` is the load-bearing gate, the same one `createAutoFocus` needs in
  // `popover-content.ts`: until the first measurement lands, `floatingStyles()` is the pre-positioned
  // `visibility: hidden` branch, and scrolling a row into view inside a hidden subtree measures
  // nothing. `focusStrategy` is tracked in the deps rather than read in the callback — deps is the
  // tracking scope, and it also means "set the strategy, then open" settles into a single run.
  //
  // No collection-length gate is needed: the options are data, so they exist before the popup does.
  createEffect(
    () => [open(), floating.isPositioned(), focusStrategy()] as const,
    ([isOpen, isPositioned, strategy]) =>
      // Imperative placement driven by the open transition — every read below is a current-value
      // lookup, never a dependency, and `[STRICT_READ_UNTRACKED]` is what an unwrapped one costs.
      untrack(() => {
        if (!isOpen) {
          // Drop the highlight on close, so reopening applies its own strategy instead of flashing
          // the previous session's row for the frame before this effect runs again.
          list.focus.focusIndex(-1);
          return;
        }
        if (!isPositioned) {
          return;
        }
        // Each of these scrolls the row it lands on into view on its own: in activedescendant mode
        // nothing moves DOM focus, so `createListFocus` asks the source for **every** move.
        if (strategy === "selected") {
          list.focus.focusEntry();
        } else if (strategy === "first") {
          list.navigation.first();
        } else {
          list.navigation.last();
        }
      }),
  );

  return {
    open,
    setOpen,
    focusStrategy,
    setFocusStrategy: (strategy) => setFocusStrategy(strategy),
    list,
    value,
    selectionMode,
    allowsEmptyCollection,
    shouldCloseOnSelect,
    modal,
    closeOnEscape: () => merged.closeOnEscape,
    closeOnInteractOutside: () => merged.closeOnInteractOutside,
    closeOnFocusOutside: () => merged.closeOnFocusOutside,
    // No `withDefaults` entry: "neither channel bubbles" is what an absent `bubbles` already means
    // to `createDismissable`, so a default here would only restate it.
    bubbles: () => merged.bubbles,
    triggerId,
    setTriggerId,
    popupId,
    setPopupId,
    valueId,
    setValueId,
    triggerElement,
    setTriggerElement: (element) => setTriggerElement(element),
    positionerElement,
    setPositionerElement: (element) => setPositionerElement(element),
    contentElement,
    setContentElement: (element) => setContentElement(element),
    setListElement: (element) => list.setListboxElement(element),
    sparedElements,
    contentPresence,
    floating,
  };
}
