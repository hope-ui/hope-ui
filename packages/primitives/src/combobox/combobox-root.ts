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
 * Shared state for the WAI-ARIA combobox pattern, used by both Select and Combobox: `role="combobox"`
 * on the one element that keeps DOM focus, `aria-expanded`/`aria-controls` naming the `role="listbox"`
 * popup, and `aria-activedescendant` naming the highlighted option (the ARIA way to move a highlight
 * without moving real focus). Renders no JSX and no host element; the sibling `createCombobox*` hooks
 * take this state plus their own props and own the rest. An option is `createListboxItem(state.list,
 * …)` — there is no `combobox-item.ts`.
 *
 * **It owns no text value, and therefore no filtering.** No `inputValue`, no filtered collection, no
 * commit/revert. That seam belongs to Combobox, which has a real input value to pull it.
 *
 * **The listbox is created here, eagerly.** The popup mounts only while open, so a `createListbox`
 * created inside it would leave the trigger with no navigation, no typeahead (type-to-jump matching)
 * and no active option to read *while closed* — which is exactly when closed-trigger typeahead runs.
 * This works only because the option set is data (`items`), not mounted elements, which is also what
 * makes `allowsEmptyCollection` a question that can be answered before opening.
 *
 * **Modality here is two mechanisms, not the usual four.** `modal` gates `createHideOutside` +
 * `createScrollLock` (both created by `createComboboxContent`). There is deliberately no focus trap —
 * focus never leaves the trigger — and no backdrop, which would cover the trigger and break
 * toggle-to-close.
 *
 * Call it **once**, inside a reactive owner scope (a component body, or a `createRoot`).
 * Full rationale: `__internal__/primitives/combobox/combobox-root.md`.
 */

/** Where the highlight lands when the popup opens. See {@link CreateComboboxReturn.focusStrategy}. */
export type ComboboxFocusStrategy = "first" | "last" | "selected";

/**
 * The selection as a **consumer** sees it, discriminated by `selectionMode`: an array in
 * `"multiple"`, a scalar (or `null`) otherwise — a single Select must not hand back `[apple]`.
 * `createListbox` underneath keeps its plain `V[]`; the adaptation happens here once, so Select and
 * Combobox both inherit it without either converting.
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
   * choose from is a dead end. Only answerable before opening because the option set is data;
   * Combobox turns it on once it has a filter that can empty the list and an `Empty` part to say so.
   */
  allowsEmptyCollection?: boolean;
  /**
   * Whether choosing an option closes the popup. Defaults to `selectionMode !== "multiple"`.
   * Applied by wrapping the selection's `onChange`, so every path that selects (Enter, Space, a
   * click on an option) obeys it without repeating the check.
   */
  shouldCloseOnSelect?: boolean;
  /**
   * Whether the open popup hides the rest of the page from assistive technology (`aria-hidden` +
   * `inert`) and locks body scroll. Default `true`; Combobox passes `false`.
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
   * Parts read `list.focus` / `list.selection` / `list.navigation` / `list.typeahead` from here.
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

  /** The trigger element: the focus owner, and — unless an outer anchor is registered — the
   *  positioning anchor and the one spared element. */
  triggerElement: Accessor<HTMLElement | undefined>;
  /** Register the trigger element. Wired to `createComboboxTrigger`'s / `createComboboxInput`'s
   *  `setRef`. */
  setTriggerElement: (element: HTMLElement | undefined) => void;
  /**
   * The widget's **outer box**, when it is larger than the focus owner. Optional: with none the
   * focus owner plays both parts, which is right for Select — its trigger *is* the whole control.
   *
   * Combobox's focus owner is an `<input>` inside a bordered shell alongside a chevron and a clear
   * button, and leaving that shell unregistered breaks two things: the popup gets measured against
   * the bare input and lands narrower than the field, and the two gutter buttons fall outside
   * `sparedElements` — so a pointerdown on the chevron dismisses and its own `click` reopens, making
   * the popup impossible to close from the control that opened it. `Combobox.Control` registers here.
   */
  anchorElement: Accessor<HTMLElement | undefined>;
  /** Register the outer box. Wired to `Combobox.Control`'s `ref`. */
  setAnchorElement: (element: HTMLElement | undefined) => void;
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
   * Everything that counts as "the control" rather than "outside" — the registered anchor and the
   * focus owner. One array, two mechanisms, one requirement: it is `createDismissable`'s `exclude`
   * (else a pointerdown on the control dismisses and its own `click` reopens, so the popup can never
   * be closed by the control that opened it) **and** `createHideOutside`'s `spare` (else the control
   * itself goes `inert` — unfocusable, unclickable — and the same toggle breaks).
   */
  sparedElements: Accessor<HTMLElement[]>;
  /** The **shared** presence (mount/enter/exit lifecycle) for `Content` + `Positioner`. Gate their
   *  render on `mounted()`. */
  contentPresence: PresenceState;
  /** The positioning layer, anchored to the trigger, with `trackSize` on. */
  floating: CreateFloatingReturn;
}

export function createCombobox<V = unknown, M extends SelectionMode = "single", G = V>(
  options: CreateComboboxOptions<V, M, G>,
): CreateComboboxReturn<V, M> {
  // `withDefaults`, never `merge({ modal: true }, options)`: Solid 2.0's `merge` resolves a key by
  // *presence*, so a wrapper forwarding an unset `modal` (key present, value `undefined`) would beat
  // the default. `withDefaults` resolves with `??`.
  //
  // `selectionMode` and `shouldCloseOnSelect` are absent on purpose — the first cannot be defaulted
  // without casting a literal to the generic `M`, and the second's default derives from it. The
  // positioning options are absent because `createFloating` applies its own, and the *visual* ones
  // belong to the component layer where a preset can theme them.
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

  // The trigger renders eagerly and its id feeds two IDREFs (the list's `aria-labelledby`, and the
  // trigger's own when a consumer names it with `aria-label`), so it needs a fallback that exists on
  // the server too — `createRegisteredId` runs in an effect and never fires during SSR.
  const generatedTriggerId = createUniqueId();
  const [customTriggerId, setTriggerId] = createSignal<string | undefined>();
  const triggerId = () => customTriggerId() ?? generatedTriggerId;
  const [customPopupId, setPopupId] = createSignal<string | undefined>();
  const [valueId, setValueId] = createSignal<string | undefined>();

  const [triggerElement, setTriggerElement] = createSignal<HTMLElement>();
  const [anchorElement, setAnchorElement] = createSignal<HTMLElement>();
  const [positionerElement, setPositionerElement] = createSignal<HTMLElement>();
  const [contentElement, setContentElement] = createSignal<HTMLElement>();

  const toValueArray = (value: SelectionValue<V, M> | undefined): V[] | undefined => {
    // `=== undefined`, not `??`: `null` is the single-mode "nothing selected" *controlled* value,
    // and `createControllableState` reads only `undefined` as "uncontrolled".
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

  // Every selection path funnels through here — Enter, Space, an option's own click — so
  // close-on-select is spelled once instead of at each key. `createControllableState` notifies on
  // every request, including re-selecting the value already selected, which is what makes re-picking
  // the current option still close the popup.
  const handleSelectionChange = (values: V[]) => {
    merged.onChange?.(fromValueArray(values));
    if (shouldCloseOnSelect()) {
      setOpen(false);
    }
  };

  // Typeahead (type-to-jump) with the popup shut has no row to highlight, so a match **selects**
  // outright — what a native `<select>` does. Multiple mode keeps highlighting instead: toggling a
  // value per keystroke would make a repeated letter select and immediately deselect it.
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

  // `merge(options, …)` rather than a getter per forwarded key: `CreateComboboxOptions` *is*
  // `CreateListboxOptions` minus the keys re-shaped below, so re-listing the rest would be a second
  // copy that silently stops forwarding whatever `createListbox` gains next. The extra
  // open/modal/positioning keys ride along unread, as they would through any props object.
  //
  // The four re-shaped keys are `omit`-ed rather than just shadowed: `merge` types an overlapping key
  // as the *union* of both sources, so a consumer's scalar `value` would leak into a `V[]` slot.
  const listOptions: CreateListboxOptions<V, G> = merge(
    omit(options, "value", "defaultValue", "onChange", "selectionMode"),
    {
      // Forced, hence not an option: the trigger keeps DOM focus and points `aria-activedescendant`
      // at the active option, rather than focus moving onto the options themselves.
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
    // Answerable only because the options are data: a source registered from mounted DOM elements is
    // *always* empty before opening, so this guard could never have been written against one.
    if (next && !allowsEmptyCollection() && list.focus.items().length === 0) {
      return;
    }
    setOpenState(next);
  };

  // A memo, so the array's identity only changes when one of the two elements does. Both are listed
  // even when the focus owner is a descendant of the anchor: the overlap is harmless, and a tree that
  // registers no anchor (Select, or a Combobox whose `Control` was re-targeted to something that
  // drops the ref) must not silently lose the focus owner from the set.
  const sparedElements = createMemo<HTMLElement[]>(() => {
    const spared: HTMLElement[] = [];
    const anchor = anchorElement();
    const trigger = triggerElement();
    if (anchor !== undefined) {
      spared.push(anchor);
    }
    if (trigger !== undefined && trigger !== anchor) {
      spared.push(trigger);
    }
    return spared;
  });

  // Created here while `open` is still `false`, so its first run observes the closed state and the
  // open drives `entering → entered`. Created inside the lazily-mounted content instead, it would
  // see `present` already `true` on its first run and latch straight to `entered`, skipping the
  // enter animation. See `__internal__/primitives/popover/popover-root.md`.
  const contentPresence = createPresence({ present: open, ref: contentElement });

  const floating = createFloating({
    // `mounted()`, NOT `open`: keyed on `open`, `createFloating` reverts `floatingStyles()` to its
    // hidden, unpositioned branch the instant the popup closes — while the presence is still holding
    // it mounted for its exit transition, so the popup would vanish instead of animating out.
    active: () => contentPresence.mounted(),
    // The outer box when one is registered, else the focus owner. See `anchorElement`: measuring a
    // Combobox against its bare `<input>` lands the popup narrower than the shell around it.
    anchor: () => anchorElement() ?? triggerElement(),
    floating: positionerElement,
    // Unconditional rather than an option: `createComboboxPositioner` publishes `--anchor-width` /
    // `--available-height` on every combobox, so a recipe's `w-(--anchor-width)` always resolves.
    // Behind a flag they would be absent by default, and the browser silently drops a declaration
    // whose `var()` does not resolve.
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

  // Places the highlight when the popup opens. `isPositioned` is the load-bearing gate (the same one
  // `createAutoFocus` needs in `popover-content.ts`): until the first measurement lands,
  // `floatingStyles()` is a `visibility: hidden` branch, and scrolling a row into view inside a
  // hidden subtree measures nothing. `focusStrategy` sits in the dependency list rather than being
  // read in the callback, so "set the strategy, then open" settles into one run.
  //
  // No collection-length gate is needed: the options are data, so they exist before the popup does.
  createEffect(
    () => [open(), floating.isPositioned(), focusStrategy()] as const,
    ([isOpen, isPositioned, strategy]) =>
      // Every read below is a current-value lookup, not a dependency. Solid 2.0 throws
      // `[STRICT_READ_UNTRACKED]` for an unwrapped tracked read here, so the block is `untrack`ed.
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
        // Each of these also scrolls the row it lands on into view: nothing moves DOM focus in
        // activedescendant mode, so the source is asked explicitly on **every** move.
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
    anchorElement,
    setAnchorElement: (element) => setAnchorElement(element),
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
