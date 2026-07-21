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
   * A per-read accessor consumed by this part's focus trap — read lazily at focus time (after the
   * content mounts), so the target may live inside the content. It belongs here, not on `createDialog`:
   * the focus trap is owned by this part, and nothing else in the family reads it.
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
 * focus restore, focus trap, hide-outside, dismiss, and scroll lock — all created in this scope (the
 * content's), so each tears down when the content unmounts.
 *
 * It does **not** create presence — `createDialog` owns the single shared overlay presence
 * (`state.contentPresence`) eagerly, and this part *reflects* it: `mounted` and `data-presence` come
 * straight from `state.contentPresence`, and the Positioner consumes the same one. Creating a
 * presence here instead would recreate the enter-animation bug — this part is mounted lazily on
 * open, so its own presence would see `present` already `true` on the first run and latch straight to
 * `entered`. Mirrors Ark, where `Content`/`Positioner` share one presence and only `Backdrop` (which
 * is mounted eagerly) keeps its own. The content element is likewise registered on `state`
 * (`setRef` → `state.setContentElement`) so the shared presence can time its exit off it.
 *
 * The effect creation order is load-bearing, not stylistic. `createFocusRestore` **must** be
 * created before `createFocusTrap`/`createHideOutside`: sibling effects run (and clean up on
 * re-run) in creation order, so this is what makes the restore's `document.activeElement`
 * snapshot happen before the trap moves focus and before `inert` blurs the trigger (see
 * `create-focus-restore.md`). Restore is gated on `open()`; the trap/hide-outside/scroll-lock on
 * `isModal` — a non-modal dialog isn't trapped but must still hand focus back.
 */
export function createDialogContent(
  state: CreateDialogReturn,
  props: CreateDialogContentProps,
): CreateDialogContentReturn {
  // The content element lives on `state` (a signal), shared with the presence that times its exit
  // off it. The effects below react to `open`/`isModal` and read this ref tracked in their compute
  // fn, so it must be a signal they can react to once it's actually set. See `create-focus-trap.ts`.
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
  // The two dismissal toggles come from the root state, so a consumer sets them once on
  // `createDialog` / `Dialog.Root` and this part forwards them (both default `true` on the root).
  // Getters, not a one-time read: `createDismissable` reads these live inside its keydown/pointerdown
  // handlers, so a getter keeps them reactive (and avoids a `STRICT_READ_UNTRACKED` read here).
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
  });
  createScrollLock({ active: state.isModal });

  // Publish a consumer-supplied `id` up so the trigger's `aria-controls` names the element that
  // actually exists. `createRegisteredId` defers the write past Solid 2.0's
  // `[REACTIVE_WRITE_IN_OWNED_SCOPE]` ban; running it here scopes cleanup to the content's unmount.
  createRegisteredId({ id: () => props.id, register: state.setPopupId });

  // Internal values fall back to the consumer's rather than overwriting them: `merge` gives the
  // *last* source precedence and treats a getter returning `undefined` as a real value, so a bare
  // `get "aria-labelledby"()` would erase a consumer's own value whenever no `Title` is mounted —
  // stripping the accessible name. `aria-modal` (state-derived, and *absent* on a non-modal dialog)
  // and `data-presence` (mirroring the shared presence `state` owns) are owned here. `initialFocus`
  // is a control prop, not an attribute, so it's dropped from the spread.
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
