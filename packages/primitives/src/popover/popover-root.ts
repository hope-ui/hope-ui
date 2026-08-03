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
 * Shared state for a popover — the one call at the root of the tree. It owns open state, the
 * popup/title/description ids, every element ref the family shares, the positioning layer and the
 * presence (the mount/enter/exit lifecycle), and renders no JSX and no host element. The sibling
 * `createPopover*` hooks take this state plus their own props and own the rest. `Popover.Root` calls
 * this once and shares the return on context; a headless consumer holds it directly.
 *
 * **Non-modal.** Nothing here traps focus, locks scroll, hides the page or blocks the pointer.
 * A `modal` mode is later work.
 *
 * **Presence is created here for correctness, not tidiness.** `Popover.Content` mounts only once
 * open, so a presence created inside `createPopoverContent` would see `present` already `true` on
 * its first run and latch straight to `"entered"`, skipping the enter animation. Created here, its
 * first run observes `open === false`. Content and Positioner share this one object.
 *
 * **The positioning layer is created here for sharing.** A late positioner ref would be fine
 * wherever it lived, but `side()` is read by both the Positioner and the Arrow, and the arrow
 * element has to reach the positioning config — a positioner-owned call would need a second context
 * or a descendant writing an ancestor-owned signal, which Solid 2.0 rejects with
 * `[REACTIVE_WRITE_IN_OWNED_SCOPE]`. That is also why `side`/`align`/`sideOffset`/… are options of
 * the **root** rather than of the Positioner part. They are forwarded as **getters**, so changing
 * one re-measures instead of needing a remount.
 *
 * **No locale.** There is no `dir` option and no `useLocale()` call: the positioning layer resolves
 * a logical side from `getComputedStyle` on the floating element itself, so there is one direction
 * channel and nothing to disagree. A locale-derived `dir` would stamp `dir="ltr"` on an en-US
 * browser and override the `dir="rtl"` the layer was actually rendered into.
 *
 * Call it **once**, inside a reactive owner scope (a component body, or a `createRoot`).
 * Full rationale: `__internal__/primitives/popover/popover-root.md`.
 */

/**
 * The popup's ARIA role. `alertdialog` is the pattern for a destructive confirmation, and stays
 * legal on a non-modal layer — which never sets `aria-modal`.
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
   * default, not `createDismissable`'s, which is `false` because a modal layer traps focus and the
   * listener would be dead weight there. A non-modal layer is the case it exists for, so Tab-ing
   * away closes it.
   */
  closeOnFocusOutside?: boolean;
  /**
   * Whether an Escape / outside pointerdown that closes a layer opened **above** this popover also
   * closes the popover. Default: neither — the topmost layer alone dismisses. Forwarded by
   * `createPopoverContent` to `createDismissable`'s `bubbles`.
   */
  bubbles?: DismissBubbles;
  /**
   * ARIA role for the popup — `"dialog"` (default) or `"alertdialog"`. It lives here rather than in
   * the styling layer because it is an accessibility concern. The trigger's `aria-haspopup` stays
   * `"dialog"` either way: ARIA defines no `alertdialog` token for it.
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
  /** The arrow element. Its arrival is what makes the arrow get measured at all. */
  arrowElement: Accessor<HTMLElement | undefined>;
  /** Register the arrow element. Wired to `createPopoverArrow`'s `setRef`. */
  setArrowElement: (element: HTMLElement | undefined) => void;

  /** What must not count as "outside" for dismissal — the trigger, once registered. Fed straight to
   * `createDismissable`'s `exclude` by `createPopoverContent`. */
  dismissExclusions: Accessor<Element[]>;
  /** The **shared** presence (mount/enter/exit lifecycle) for `Content` + `Positioner`. Gate their
   * render on `mounted()` and drive `data-presence` off `status()`. Created here, while closed, so
   * the enter animation actually fires. */
  contentPresence: PresenceState;
  /** The positioning layer. `floatingStyles()` goes on the positioner; `side()`/`align()` drive
   * `data-side`/`data-align` on the positioner, the content and the arrow. */
  floating: CreateFloatingReturn;
}

export function createPopover(options: CreatePopoverOptions = {}): CreatePopoverReturn {
  // `withDefaults`, never `merge({ closeOnEscape: true }, options)`: Solid 2.0's `merge` resolves a
  // key by *presence*, so a wrapper forwarding an unset `closeOnEscape` (key present, value
  // `undefined`) would beat the default. `withDefaults` resolves with `??`.
  //
  // The positioning options are deliberately absent: `createFloating` applies its own, and the
  // *visual* ones (a non-zero `sideOffset`, `collisionPadding`, `arrowPadding`) belong to the
  // component layer where a preset can theme them.
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

  // The server-visible fallback: `createRegisteredId` runs in an effect, so a consumer-pinned id is
  // never registered during SSR. This is the only `createUniqueId` the root consumes, and Solid's
  // hydration keys are positional — inserting another one here would shift the trigger's key and
  // break hydration.
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
  // while the layer is open — re-runs the positioning attach effect and re-points its observers.
  const anchorElement = () => customAnchorElement() ?? triggerElement();

  // A memo, so the array's identity only changes when the trigger does — `createDismissable` reads
  // it live inside its handlers, but a part is free to track it instead.
  const dismissExclusions = createMemo<Element[]>(() => {
    const trigger = triggerElement();
    return trigger === undefined ? [] : [trigger];
  });

  // Created after the `createUniqueId` above, deliberately: `createPresence` reserves an id of its
  // own, and Solid's hydration keys are positional, so reordering these two shifts the trigger's key
  // and breaks hydration. Created while `open` is still `false` so opening drives
  // `entering → entered` rather than latching to `entered`.
  const contentPresence = createPresence({ present: open, ref: contentElement });

  const floating = createFloating({
    // `mounted()`, NOT `open`. When inactive, `createFloating` reverts `floatingStyles()` to
    // `{ left: 0, top: 0, visibility: "hidden" }` — which keyed on `open` fires the instant the
    // popover closes, while the presence is still holding the content mounted for its exit
    // transition, so the layer would vanish instead of animating out. Keyed on `mounted()` it stays
    // positioned and its scroll/resize observers stay attached, so a closing layer can't drift.
    active: () => contentPresence.mounted(),
    anchor: anchorElement,
    floating: positionerElement,
    // Always supplied. What enables arrow measurement is the *element* arriving, and that is tracked
    // reactively — so a popover with no arrow and one whose arrow ref arrives late both work without
    // a branch here.
    arrowElement,
    // Unconditional rather than an option: `createPopoverPositioner` publishes the measurements as
    // `--anchor-width`/`--available-height`/… on every popover, so a consumer's `w-(--anchor-width)`
    // always resolves. Behind a flag they would be absent by default, and the browser silently drops
    // a declaration whose `var()` does not resolve. Measurement only — nothing is written back.
    trackSize: true,
    // Getters throughout: the only shape in which changing an option re-measures rather than
    // needing a remount.
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
