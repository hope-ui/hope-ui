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
   * An accessor, read lazily at focus time — after the content mounts — so the target may live
   * inside the content. It belongs here rather than on `createPopover` because this part owns the
   * autofocus effect and nothing else reads it.
   */
  initialFocus?: Accessor<HTMLElement | null | undefined>;
}

export interface CreatePopoverContentReturn {
  /** Spread onto the content surface. `id`/`role`/`aria-labelledby`/`aria-describedby` fall back to
   * the consumer's; `data-presence` (enter/exit lifecycle) and `data-side`/`data-align` (the
   * placement actually chosen) are owned here. There is **no `aria-modal`** — this layer is
   * non-modal, and the attribute is absent rather than `"false"`. */
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
 * The content part: the popup surface, and the behavior hub. It creates the whole effect stack —
 * focus restore, autofocus, dismissal and id registration — in this scope, so each tears down when
 * the content unmounts.
 *
 * **Non-modal.** No focus trap, no scroll lock, no hide-outside, no backdrop, and no `aria-modal`.
 * Tab is free to leave, and leaving is what closes the layer.
 *
 * It does **not** create the presence (the mount/enter/exit lifecycle) — it *reflects* the one
 * `createPopover` made, as the Positioner does. Creating one here would reintroduce the
 * enter-animation bug: this part mounts lazily on open, so its own presence would see `present`
 * already `true` on the first run and latch straight to `entered`.
 */
export function createPopoverContent(
  state: CreatePopoverReturn,
  props: CreatePopoverContentProps,
): CreatePopoverContentReturn {
  // A signal, not a plain ref. The content is conditionally rendered by the very signal the effects
  // below key on, so they have to be able to *react* to the element arriving — which means tracking
  // it in their dependency function, which only works for a signal.
  const ref = state.contentElement;

  // THE CREATION ORDER OF THESE FOUR IS LOAD-BEARING, NOT STYLISTIC. Sibling effects run in creation
  // order, so each of these three constraints is a real ordering dependency:
  //
  // 1. `createFocusRestore` first, so it snapshots `document.activeElement` before anything below
  //    moves focus. Otherwise closing restores focus to the wrong element.
  // 2. `createFocusScope` before `createAutoFocus`, so this layer is registered on the focus-scope
  //    stack — above whatever it was opened inside — *before* anything moves focus into it. Register
  //    it after, and the `focusin` autofocus dispatches reaches an enclosing modal's focus trap that
  //    still knows nothing about this layer; the trap yanks focus straight back out, the dismissal
  //    below reads that as focus leaving, and the popover closes itself in ~3ms. This is only a
  //    registration — Tab still leaves freely.
  // 3. `createAutoFocus` before `createDismissable`, because focus leaving now dismisses. `.focus()`
  //    dispatches `focusin` **synchronously**, so on a reopen that finds the layer already
  //    positioned, focus lands before the dismissal effect attaches its document listener. On a cold
  //    open the `isPositioned` gate below delays autofocus past that attach instead, and the
  //    listener's own containment check is what stops the layer dismissing itself. Two independent
  //    guards, one per path.
  createFocusRestore({ active: state.open });
  // Keyed on `open`, not on `isPositioned`: registering early is the entire point, and it costs
  // nothing while the layer is still measuring. The predicate it returns is for a focus trap to
  // consult — this layer has none, so it is deliberately unused.
  createFocusScope({ active: state.open, ref });
  // Gated on `isPositioned`, not on `open` alone. Until the first measurement lands the layer is
  // `visibility: hidden`, and an element inside a `visibility: hidden` subtree is not focusable — so
  // `.focus()` is a **silent no-op** and focus stays on the trigger for good, because this effect's
  // dependencies never change again. Verified against the installed Chromium.
  createAutoFocus({
    active: () => state.open() && state.floating.isPositioned(),
    ref,
    initialFocus: () => props.initialFocus?.(),
  });
  // Getters, not one-time reads: `createDismissable` consults these live inside its
  // keydown/pointerdown/focusin handlers, so a getter keeps them reactive — and reading them eagerly
  // here would trip Solid 2.0's `[STRICT_READ_UNTRACKED]`.
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
  // actually exists. `createRegisteredId` defers the write, because Solid 2.0 throws
  // `[REACTIVE_WRITE_IN_OWNED_SCOPE]` when a descendant writes an ancestor-owned signal during
  // render. Calling it here scopes the cleanup to the content's unmount.
  createRegisteredId({ id: () => props.id, register: state.setPopupId });

  // Each internal value falls back to the consumer's rather than overwriting it. `merge` gives the
  // *last* source precedence and treats a getter returning `undefined` as a real value, so a bare
  // `get "aria-labelledby"()` would erase a consumer's own whenever no `Title` is mounted — silently
  // stripping the popup's accessible name.
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
