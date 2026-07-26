import { type Accessor, createMemo, createSignal, createUniqueId } from "solid-js";
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
  type SideOrLogical,
  type Strategy,
} from "../internal";
import { withDefaults } from "../utils";

/**
 * The shared state kernel of a popover — the one call at the root of the tree. It owns open state,
 * the popup/title/description ids, every element ref the family shares, the positioning layer and
 * the overlay presence, and it renders **no JSX and no host element**. The per-part hooks
 * (`createPopoverTrigger`, `createPopoverAnchor`, `createPopoverPositioner`, `createPopoverContent`,
 * `createPopoverArrow`, `createPopoverTitle`, `createPopoverDescription`,
 * `createPopoverCloseTrigger`) each take this state plus their own props and own the rest — their
 * effects, their id-and-element registration, and their consumer-prop precedence. `Popover.Root`
 * calls this once and shares the return on context; a headless consumer holds it and threads it into
 * whichever part hooks it needs. Mirrors the `createDialog` split.
 *
 * **Non-modal.** Nothing here traps focus, locks scroll, hides the page or blocks the pointer — a
 * popover composes `createFloating` + `createDismissable` + `createPresence` + `createFocusRestore`
 * directly, never Dialog's modal machinery. A `modal` mode is later work.
 *
 * ## Why positioning and presence live on the root
 *
 * **Presence must be eager for correctness.** `Popover.Content` is mounted lazily — only once open —
 * so a presence created inside `createPopoverContent` would see `present` already `true` on its
 * first run and latch straight to `"entered"`, skipping the enter animation. Created here, its first
 * run observes `open === false`. Both the Content and the Positioner consume this one presence.
 *
 * **`createFloating` is root-owned for sharing**, not for that reason: it tracks its elements in the
 * compute of its own effect, so a late positioner ref is fine wherever it is created. But `side()` is
 * read by the Positioner *and* the Arrow, and `arrowElement` must reach its config memo — a
 * positioner-owned call would need a second context or a descendant→ancestor write
 * (`[REACTIVE_WRITE_IN_OWNED_SCOPE]`).
 *
 * ## Positioning options live here
 *
 * `side`/`align`/`sideOffset`/`alignOffset`/`flip`/… are options of the **root**, not of the
 * Positioner part, which follows from the call site above and matches Dialog's precedent
 * (`closeOnEscape`/`role` on the root). A deliberate divergence from Base UI, which spells them on
 * its Positioner — recorded in `popover-root.md`.
 *
 * They are forwarded to `createFloating` as **getters**, never read once: that is the documented
 * idiom, and the only shape in which changing `side` re-measures instead of needing a remount.
 * No offset defaults are applied here — the *visual* defaults belong to the component layer, so a
 * preset can theme them.
 *
 * ## No locale
 *
 * Popover takes no `dir` option and calls no `useLocale()`. `createFloating` resolves a logical side
 * against `getComputedStyle(floating).direction` — the same call `platform.isRTL` makes, on the same
 * element — so there is one direction channel and nothing to disagree. Writing a locale-derived
 * `dir` would stamp `dir="ltr"` on an en-US browser and override the `dir="rtl"` the layer was
 * rendered into. See `popover-root.md`.
 *
 * Call it **once**, inside a reactive owner scope (a component body, or a `createRoot`).
 */

/**
 * The popup's ARIA role. `alertdialog` is the APG destructive-confirmation pattern; it stays legal
 * on a non-modal layer, which never sets `aria-modal`.
 */
export type PopoverRole = "dialog" | "alertdialog";

export interface CreatePopoverOptions {
  /** Controlled open state. Omit for uncontrolled use via `defaultOpen`. For reactive control,
   * pass a getter (`get open() { return signal(); }`), exactly as a component prop would. */
  open?: boolean;
  /** Initial open state, uncontrolled. Default `false`. */
  defaultOpen?: boolean;
  /** Called whenever the popover would open or close. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether pressing Escape closes the popover. Forwarded by `createPopoverContent` to
   * `createDismissable`'s `dismissOnEscape`. Default `true`.
   */
  closeOnEscape?: boolean;
  /**
   * Whether a pointerdown outside the content closes the popover. Forwarded by
   * `createPopoverContent` to `createDismissable`'s `dismissOnOutsidePointerDown`. Default `true`.
   */
  closeOnInteractOutside?: boolean;
  /**
   * Whether focus landing outside the content closes the popover. Default `true` — **Popover's**
   * default, not the kernel's: `createDismissable`'s `dismissOnFocusOutside` defaults `false`,
   * because a modal layer traps focus and the listener would be dead weight there. A non-modal
   * layer is the case it exists for, so Tab-ing away closes it, as Radix and Base UI both do.
   */
  closeOnFocusOutside?: boolean;
  /**
   * Whether an Escape / outside pointerdown that closes a layer opened **above** this popover also
   * closes the popover. Default: neither — the topmost layer alone dismisses. Forwarded by
   * `createPopoverContent` to `createDismissable`'s `bubbles`.
   */
  bubbles?: DismissBubbles;
  /**
   * ARIA role for the popup — `"dialog"` (default) or `"alertdialog"`. An accessibility concern, so
   * it lives on the state hook (not the styling layer): `createPopoverContent` reads it for the
   * surface's `role` attribute. The trigger's `aria-haspopup` stays `"dialog"` either way — ARIA
   * defines no `alertdialog` token for it.
   */
  role?: PopoverRole;

  /**
   * Preferred side of the anchor. Default `"bottom"`. Accepts the two inline-relative sides;
   * `floating.side()` always reports the **physical** side actually used after `flip`. See
   * `createFloating`.
   */
  side?: SideOrLogical;
  /** Alignment along the side's cross axis. Default `"center"`. */
  align?: FloatingAlign;
  /** Distance from the anchor, in px. Default `0` here; the visual default lives in the component. */
  sideOffset?: number;
  /** Skid along the alignment axis, in px. Default `0`. */
  alignOffset?: number;
  /** Flip to the opposite side when the preferred one overflows. Default `true`. */
  flip?: boolean;
  /** Slide along the alignment axis to stay in view. Default `true`. */
  shift?: boolean;
  /** Padding kept between the layer and the collision boundary. Default `0`. */
  collisionPadding?: Padding;
  /** What the layer must stay inside. Default floating-ui's `"clippingAncestors"`. */
  collisionBoundary?: Boundary;
  /** Padding kept between the arrow and the layer's corners. Default `0`. */
  arrowPadding?: number;
  /** CSS `position` for the positioner. Default `"absolute"`. */
  strategy?: Strategy;
  /** Keep the position current via scroll/resize observers. Default `true`. */
  autoUpdate?: boolean;
  /** Re-measure every animation frame — for an anchor that moves under a transform. Default `false`. */
  trackAnchorMotion?: boolean;
}

export interface CreatePopoverReturn {
  /** Current open state. */
  open: Accessor<boolean>;
  /** Request an open/close. Honors controlled mode and fires `onOpenChange`. */
  setOpen: (open: boolean) => void;
  /** The ARIA role (`"dialog"` | `"alertdialog"`). Read by `createPopoverContent` for the surface. */
  role: Accessor<PopoverRole>;
  /** Whether Escape closes the popover. Read by `createPopoverContent`'s `createDismissable`. */
  closeOnEscape: Accessor<boolean>;
  /** Whether an outside pointerdown closes the popover. Read by `createPopoverContent`'s `createDismissable`. */
  closeOnInteractOutside: Accessor<boolean>;
  /** Whether focus landing outside closes the popover. Read by `createPopoverContent`'s `createDismissable`. */
  closeOnFocusOutside: Accessor<boolean>;
  /** Whether a dismissal handled by a layer above also closes this one. Read by
   * `createPopoverContent`'s `createDismissable`. */
  bubbles: Accessor<DismissBubbles | undefined>;

  /** The popup's id: a registered consumer id if any, else a generated (SSR-stable) fallback. */
  popupId: Accessor<string>;
  /** Register a consumer-supplied popup id (feeds the trigger's `aria-controls`). Called by
   * `createPopoverContent` from the content's own scope, via `createRegisteredId`. */
  setPopupId: (id: string | undefined) => void;
  /** The registered title id, or `undefined` — the popup's `aria-labelledby` fallback. */
  titleId: Accessor<string | undefined>;
  /** Register a title id. Called by `createPopoverTitle` from the title's own scope. */
  setTitleId: (id: string | undefined) => void;
  /** The registered description id, or `undefined` — the popup's `aria-describedby` fallback. */
  descriptionId: Accessor<string | undefined>;
  /** Register a description id. Called by `createPopoverDescription` from its own scope. */
  setDescriptionId: (id: string | undefined) => void;

  /** The trigger element: the default anchor, and the sole dismiss exclusion. */
  triggerElement: Accessor<HTMLElement | undefined>;
  /** Register the trigger element. Wired to `createPopoverTrigger`'s `setRef`. */
  setTriggerElement: (element: HTMLElement | undefined) => void;
  /** A `Popover.Anchor`'s element, when one is mounted. */
  customAnchorElement: Accessor<HTMLElement | undefined>;
  /** Register/clear the custom anchor. Wired to `createPopoverAnchor`'s `setRef`; clearing it on
   * unmount is what hands positioning back to the trigger. */
  setCustomAnchorElement: (element: HTMLElement | undefined) => void;
  /** What the layer is positioned against: the custom anchor if one is mounted, else the trigger. */
  anchorElement: Accessor<HTMLElement | undefined>;

  /** The positioner element — what `floating.floatingStyles()` is spread onto. */
  positionerElement: Accessor<HTMLElement | undefined>;
  /** Register the positioner element. Wired to `createPopoverPositioner`'s `setRef`. */
  setPositionerElement: (element: HTMLElement | undefined) => void;
  /** The content element: the recipe card inside the positioner, and what the presence times its
   * exit transition off. */
  contentElement: Accessor<HTMLElement | undefined>;
  /** Register the content element. Wired to `createPopoverContent`'s `setRef`. */
  setContentElement: (element: HTMLElement | undefined) => void;
  /** The arrow element. Its arrival is what enables floating-ui's `arrow` middleware. */
  arrowElement: Accessor<HTMLElement | undefined>;
  /** Register the arrow element. Wired to `createPopoverArrow`'s `setRef`. */
  setArrowElement: (element: HTMLElement | undefined) => void;

  /** What must not count as "outside" for dismissal — the trigger, once registered. Fed straight to
   * `createDismissable`'s `exclude` by `createPopoverContent`. */
  dismissExclusions: Accessor<Element[]>;
  /** The **shared** overlay presence for `Content` + `Positioner`. Gate their render on `mounted()`
   * and drive `data-presence` off `status()`. Created eagerly here so the enter animation fires. */
  contentPresence: PresenceState;
  /** The positioning layer. `floatingStyles()` goes on the positioner; `side()`/`align()` drive
   * `data-side`/`data-align` on the positioner, the content and the arrow. */
  floating: CreateFloatingReturn;
}

export function createPopover(options: CreatePopoverOptions = {}): CreatePopoverReturn {
  // `withDefaults`, not `merge({ closeOnEscape: true }, options)`: `merge` resolves by key
  // *presence*, so a wrapper forwarding an unset `closeOnEscape`/`defaultOpen` (the key present with
  // value `undefined`) would silently beat the default. See `withDefaults`' doc.
  //
  // The positioning options are deliberately absent: `createFloating` applies its own `??` defaults,
  // and the *visual* ones (a non-zero `sideOffset`, `collisionPadding`, `arrowPadding`) belong to the
  // component layer, where a preset can theme them.
  const merged = withDefaults(options, {
    defaultOpen: false,
    closeOnEscape: true,
    closeOnInteractOutside: true,
    closeOnFocusOutside: true,
    role: "dialog" as PopoverRole,
  });

  const [open, setOpen] = createControllableState<boolean>({
    value: () => merged.open,
    defaultValue: () => merged.defaultOpen,
    onChange: (value) => merged.onOpenChange?.(value),
  });
  const closeOnEscape = () => merged.closeOnEscape;
  const closeOnInteractOutside = () => merged.closeOnInteractOutside;
  const closeOnFocusOutside = () => merged.closeOnFocusOutside;
  // No `withDefaults` entry: "neither channel bubbles" is what an absent `bubbles` already means to
  // `createDismissable`, so a default here would only restate it.
  const bubbles = () => merged.bubbles;
  const role = () => merged.role;

  // The generated id is the server-visible fallback: `createRegisteredId` never runs during SSR,
  // so a consumer-pinned id can't be registered server-side. This is the only `createUniqueId`
  // the root consumes, and it fixes the trigger's SSR hydration key — see the fixtures README.
  const generatedPopupId = createUniqueId();
  const [customPopupId, setCustomPopupId] = createSignal<string | undefined>();
  const popupId = () => customPopupId() ?? generatedPopupId;
  const [titleId, setTitleId] = createSignal<string | undefined>();
  const [descriptionId, setDescriptionId] = createSignal<string | undefined>();

  const [triggerElement, setTriggerElement] = createSignal<HTMLElement>();
  const [customAnchorElement, setCustomAnchorElement] = createSignal<HTMLElement>();
  const [positionerElement, setPositionerElement] = createSignal<HTMLElement>();
  const [contentElement, setContentElement] = createSignal<HTMLElement>();
  const [arrowElement, setArrowElement] = createSignal<HTMLElement>();

  // A derived accessor over both signals, so an anchor mounting after the trigger — or unmounting
  // while the layer is open — re-runs `createFloating`'s attach effect and re-points `autoUpdate`.
  const anchorElement = () => customAnchorElement() ?? triggerElement();

  // A memo, so the array's identity only changes when the trigger does. `createDismissable` reads it
  // live inside its handlers, but a part is free to track it.
  const dismissExclusions = createMemo<Element[]>(() => {
    const trigger = triggerElement();
    return trigger === undefined ? [] : [trigger];
  });

  // The ONE shared overlay presence, and the positioning layer. Both created after
  // `createUniqueId` above so the trigger's SSR hydration key is unaffected by the id
  // `createPresence` reserves. Eager (created while `open` is `false`) so opening drives
  // `entering → entered` — see this hook's doc.
  const contentPresence = createPresence({ present: open, ref: contentElement });

  const floating = createFloating({
    // `mounted()`, NOT `open`. `createFloating`'s config effect does `!active →
    // setIsPositioned(false)`, and `floatingStyles()` then reverts to `{ left: 0, top: 0, visibility:
    // "hidden" }`. Keyed on `open` that fires the instant the popover closes — while the presence is
    // still holding the content mounted for its exit transition — so the layer would vanish instead
    // of animating out. Keyed on `mounted()` it stays positioned, and `autoUpdate` stays attached, so
    // a closing layer can't drift either.
    active: () => contentPresence.mounted(),
    anchor: anchorElement,
    floating: positionerElement,
    // Always supplied: what enables the `arrow` middleware is the *element* arriving, which is
    // tracked in `createFloating`'s config memo. So a popover with no arrow, and one whose arrow ref
    // arrives late, both work with no branch here.
    arrowElement,
    // Getters throughout — the documented `createFloating` idiom, and the only shape in which
    // changing an option re-measures instead of needing a remount.
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
    get arrowPadding() {
      return merged.arrowPadding;
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

  return {
    open,
    setOpen,
    role,
    closeOnEscape,
    closeOnInteractOutside,
    closeOnFocusOutside,
    bubbles,
    popupId,
    setPopupId: setCustomPopupId,
    titleId,
    setTitleId,
    descriptionId,
    setDescriptionId,
    triggerElement,
    setTriggerElement: (element) => setTriggerElement(element),
    customAnchorElement,
    setCustomAnchorElement: (element) => setCustomAnchorElement(element),
    anchorElement,
    positionerElement,
    setPositionerElement: (element) => setPositionerElement(element),
    contentElement,
    setContentElement: (element) => setContentElement(element),
    arrowElement,
    setArrowElement: (element) => setArrowElement(element),
    dismissExclusions,
    contentPresence,
    floating,
  };
}
