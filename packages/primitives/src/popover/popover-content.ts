import type { JSX } from "@solidjs/web";
import { type Accessor, merge, omit } from "solid-js";
import {
  createAutoFocus,
  createDismissable,
  createFocusRestore,
  createFocusScope,
  createRegisteredId,
  type FloatingAlign,
  type PresenceStatus,
  type Side,
} from "../internal";
import type { CreatePopoverReturn } from "./popover-root";

export interface CreatePopoverContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /**
   * Explicit element to focus when the popover opens, instead of the first focusable descendant.
   * A per-read accessor consumed by this part's autofocus — read lazily at focus time (after the
   * content mounts), so the target may live inside the content. It belongs here, not on
   * `createPopover`: the autofocus effect is owned by this part, and nothing else in the family
   * reads it.
   */
  initialFocus?: Accessor<HTMLElement | null | undefined>;
}

export interface CreatePopoverContentReturn {
  /** Spread onto the content surface. `id`/`role`/`aria-labelledby`/`aria-describedby` fall back to
   * the consumer's; `data-presence`/`data-side`/`data-align` are owned here. There is **no
   * `aria-modal`** — this layer is non-modal, and the attribute is absent rather than `"false"`. */
  props: JSX.HTMLAttributes<HTMLDivElement> & {
    "data-presence": PresenceStatus;
    "data-side": Side;
    "data-align": FloatingAlign;
  };
  /** Gate the content's render on this — the shared presence keeps it mounted through the exit
   * transition. */
  mounted: Accessor<boolean>;
  /** Hand to the content element's `ref`; registers it on `state` (for the shared presence's exit
   * timing) and wires the focus/dismiss effects. */
  setRef: (element: HTMLDivElement) => void;
}

/**
 * The content part: the popup surface, and the behavior hub. Owns the whole effect stack — focus
 * restore, autofocus, dismissal and id registration — all created in this scope (the content's), so
 * each tears down when the content unmounts.
 *
 * **Non-modal.** No focus trap, no scroll lock, no hide-outside, no backdrop, and no `aria-modal`.
 * Tab is free to leave; leaving is what closes the layer (`closeOnFocusOutside`, default `true` on
 * `createPopover`).
 *
 * It does **not** create presence — `createPopover` owns the single shared overlay presence
 * (`state.contentPresence`) eagerly, and this part *reflects* it. Creating one here would recreate
 * the enter-animation bug: this part is mounted lazily on open, so its own presence would see
 * `present` already `true` on the first run and latch straight to `entered`. The Positioner consumes
 * the same one. See `popover-root.md`.
 */
export function createPopoverContent(
  state: CreatePopoverReturn,
  props: CreatePopoverContentProps,
): CreatePopoverContentReturn {
  // The content element lives on `state` (a signal), shared with the presence that times its exit
  // off it. The effects below react to `open` and read this ref tracked in their compute fn, so it
  // must be a signal they can react to once it's actually set — the content is conditionally
  // rendered by the very signal they key on. See `create-auto-focus.ts`.
  const ref = state.contentElement;

  // THE CREATION ORDER OF THESE FOUR IS LOAD-BEARING, NOT STYLISTIC.
  //
  // 1. `createFocusRestore` first, so its `document.activeElement` snapshot is taken before anything
  //    below moves focus (`create-focus-restore.md`; the same constraint `dialog-content.ts` states).
  // 2. `createFocusScope` before `createAutoFocus`, so this layer is on the focus-scope stack —
  //    above whatever it was opened inside — *before* anything moves focus into it. Registered
  //    after, the `focusin` that autofocus dispatches reaches an enclosing modal's focus trap while
  //    the trap still knows nothing about this layer, and it yanks focus straight back out; the
  //    dismissal below then reads that as focus leaving and closes the popover in ~3ms. This is a
  //    registration, not a trap: Tab still leaves freely. See `create-focus-scope.md`.
  // 3. `createAutoFocus` before `createDismissable`, because focus-out now dismisses: `.focus()`
  //    dispatches `focusin` **synchronously**, and sibling effects run in creation order, so on a
  //    reopen that finds the layer already positioned the focus lands before the dismissable effect
  //    attaches its document listener. On a *cold* open the autofocus gate below delays it past that
  //    attach instead, and the listener's own `container.contains(target)` early return is what
  //    keeps the layer from dismissing itself. Two independent guards, one per path.
  createFocusRestore({ active: state.open });
  // Keyed on `open`, not on `isPositioned`: the scope costs nothing while the layer is still
  // measuring, and being registered early is the entire point. The predicate it returns is for a
  // trap to consult — this layer has none, so it is deliberately unused here.
  createFocusScope({ active: state.open, ref });
  // Gated on `isPositioned`, not on `open` alone. Until the first measurement lands,
  // `floating.floatingStyles()` is the pre-positioned `visibility: hidden` branch — and an element
  // inside a `visibility: hidden` subtree is not focusable, so `.focus()` is a **silent no-op** and
  // focus stays on the trigger for good (the effect's deps never change again). Verified against the
  // installed Chromium. Base UI avoids the same trap the other way round, by pre-positioning with
  // `opacity: 0` at `position: fixed` rather than hiding — see `useAnchorPositioning.ts`.
  createAutoFocus({
    active: () => state.open() && state.floating.isPositioned(),
    ref,
    initialFocus: () => props.initialFocus?.(),
  });
  // The three dismissal toggles and `bubbles` come from the root state, so a consumer sets them
  // once on `createPopover` / `Popover.Root` and this part forwards them. Getters, not one-time reads:
  // `createDismissable` reads them live inside its keydown/pointerdown/focusin handlers, so a getter
  // keeps them reactive (and avoids a `STRICT_READ_UNTRACKED` read here).
  //
  // `exclude` is what makes a *toggling* trigger possible at all: without it a pointerdown on the
  // trigger dismisses in the capture phase and the trigger's own `click` reopens, so the popover
  // could never be closed by the control that opened it. It governs the focus half too — Shift+Tab
  // back onto the trigger keeps the layer open, and `aria-expanded` truthful.
  createDismissable({
    active: state.open,
    ref,
    onDismiss: () => state.setOpen(false),
    exclude: state.dismissExclusions,
    get dismissOnEscape() {
      return state.closeOnEscape();
    },
    get dismissOnOutsidePointerDown() {
      return state.closeOnInteractOutside();
    },
    get dismissOnFocusOutside() {
      return state.closeOnFocusOutside();
    },
    get bubbles() {
      return state.bubbles();
    },
  });

  // Publish a consumer-supplied `id` up so the trigger's `aria-controls` names the element that
  // actually exists. `createRegisteredId` defers the write past Solid 2.0's
  // `[REACTIVE_WRITE_IN_OWNED_SCOPE]` ban; running it here scopes cleanup to the content's unmount.
  createRegisteredId({ id: () => props.id, register: state.setPopupId });

  // Internal values fall back to the consumer's rather than overwriting them: `merge` gives the
  // *last* source precedence and treats a getter returning `undefined` as a real value, so a bare
  // `get "aria-labelledby"()` would erase a consumer's own value whenever no `Title` is mounted —
  // stripping the accessible name. The three `data-*` are state-derived and component-owned.
  // `initialFocus` is a control prop, not an attribute, so it's dropped from the spread.
  const elementProps = merge(omit(props, "initialFocus"), {
    get id() {
      return props.id ?? state.popupId();
    },
    get role() {
      return props.role ?? state.role();
    },
    get "aria-labelledby"() {
      return props["aria-labelledby"] ?? state.titleId();
    },
    get "aria-describedby"() {
      return props["aria-describedby"] ?? state.descriptionId();
    },
    get "data-presence"() {
      return state.contentPresence.status();
    },
    get "data-side"() {
      return state.floating.side();
    },
    get "data-align"() {
      return state.floating.align();
    },
  });

  return {
    props: elementProps,
    mounted: state.contentPresence.mounted,
    setRef: (element) => state.setContentElement(element),
  };
}
