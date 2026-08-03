import type { JSX } from "@solidjs/web";
import { type Accessor, merge, omit } from "solid-js";
import {
  createDismissable,
  createFocusRestore,
  createFocusTrap,
  createHideOutside,
  createRegisteredId,
  createScrollLock,
} from "../internal";
import type { CreateDialogReturn } from "./dialog-root";

export interface CreateDialogContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /**
   * Explicit element to focus when the dialog opens, instead of the first focusable descendant.
   * An accessor, read lazily at focus time rather than up front, so the target is allowed to be an
   * element inside the content that does not exist until the content mounts.
   */
  initialFocus?: Accessor<HTMLElement | null | undefined>;
}

export interface CreateDialogContentReturn {
  /** Spread onto the content surface. `id`/`role`/`aria-labelledby`/`aria-describedby` fall back to
   * the consumer's; `aria-modal` and `data-presence` are owned here (`data-presence` mirrors the
   * shared overlay presence `state` owns). */
  props: JSX.HTMLAttributes<HTMLDivElement> & { "data-presence": string };
  /** Gate the content's render on this — the shared presence keeps it mounted through the exit
   * transition. */
  mounted: Accessor<boolean>;
  /** Hand to the content element's `ref`; registers it on `state` (for the shared presence's exit
   * timing) and wires the focus/dismiss/hide-outside/scroll effects. */
  setRef: (element: HTMLDivElement) => void;
}

/**
 * The content part: the dialog surface itself, and the behavior hub. Owns the full effect stack —
 * focus restore, focus trap, hide-outside, dismiss, scroll lock — all created in this scope, so
 * each tears down when the content unmounts.
 *
 * It does **not** create presence. `createDialog` owns the one shared overlay presence eagerly and
 * this part reflects it (`mounted` and `data-presence` read straight off `state.contentPresence`);
 * creating one here would skip the enter animation, for the reason `createDialog`'s doc gives.
 *
 * The effect creation order is load-bearing, not stylistic: `createFocusRestore` **must** come
 * before `createFocusTrap`/`createHideOutside`, because sibling effects run — and clean up on
 * re-run — in creation order, and the restore has to snapshot `document.activeElement` before the
 * trap moves focus and before `inert` blurs the trigger. Details:
 * `__internal__/primitives/internal/create-focus-restore.md`. Restore is gated on `open()`, the
 * rest on `isModal` — a non-modal dialog isn't trapped, but must still hand focus back.
 */
export function createDialogContent(
  state: CreateDialogReturn,
  props: CreateDialogContentProps,
): CreateDialogContentReturn {
  // A signal, not a plain ref: the effects below track it in their compute function, so they have
  // to be able to react to the moment it is finally set. See `create-focus-trap.ts`.
  const ref = state.contentElement;

  createFocusRestore({ active: state.open });
  createFocusTrap({
    active: state.isModal,
    ref,
    initialFocus: () => props.initialFocus?.(),
  });
  createHideOutside({
    active: state.isModal,
    target: ref,
    spare: state.sparedElements,
  });
  // Getters, not a one-time read: `createDismissable` reads these live inside its keydown and
  // pointerdown handlers, so a getter keeps them reactive — and keeps this from being an untracked
  // read Solid's dev build flags as `STRICT_READ_UNTRACKED`.
  createDismissable({
    active: state.open,
    ref,
    onDismiss: () => state.setOpen(false),
    get dismissOnEscape() {
      return state.closeOnEscape();
    },
    get dismissOnOutsidePointerDown() {
      return state.closeOnInteractOutside();
    },
    get bubbles() {
      return state.bubbles();
    },
  });
  createScrollLock({ active: state.isModal });

  // Publish a consumer-supplied `id` up so the trigger's `aria-controls` names the element that
  // actually exists. Solid 2.0 throws `[REACTIVE_WRITE_IN_OWNED_SCOPE]` when a descendant writes an
  // ancestor's signal during render, so `createRegisteredId` defers the write; running it here
  // scopes its cleanup to the content's unmount.
  createRegisteredId({ id: () => props.id, register: state.setPopupId });

  // Every internal value spelled `props.x ?? …`, falling back to the consumer's rather than
  // overwriting it: `merge` gives the *last* source precedence and treats a getter returning
  // `undefined` as a real value, so a bare `get "aria-labelledby"()` would erase the consumer's own
  // whenever no `Title` is mounted — silently stripping the dialog's accessible name. The two
  // exceptions are state-owned and have no consumer counterpart: `aria-modal` (absent entirely on a
  // non-modal dialog) and `data-presence`.
  const elementProps = merge(omit(props, "initialFocus"), {
    get id() {
      return props.id ?? state.popupId();
    },
    get role() {
      return props.role ?? state.role();
    },
    get "aria-modal"() {
      return state.modal() ? ("true" as const) : undefined;
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
  });

  return {
    props: elementProps,
    mounted: state.contentPresence.mounted,
    setRef: (element) => state.setContentElement(element),
  };
}
