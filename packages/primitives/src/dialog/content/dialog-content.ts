import type { JSX } from "@solidjs/web";
import { type Accessor, createSignal, merge, omit } from "solid-js";
import {
  createDismissable,
  createFocusRestore,
  createFocusTrap,
  createHideOutside,
  createPresence,
  createRegisteredId,
  createScrollLock,
} from "../../internal";
import type { CreateDialogReturn } from "../root/dialog-root";

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
   * the consumer's; `aria-modal` and `data-presence` are owned here. */
  props: JSX.HTMLAttributes<HTMLDivElement> & { "data-presence": string };
  /** Gate the content's render on this — it stays mounted through an exit transition. */
  mounted: Accessor<boolean>;
  /** Hand to the content element's `ref`; wires presence + the focus/dismiss/hide-outside effects. */
  setRef: (element: HTMLDivElement) => void;
}

/**
 * The content part: the dialog surface itself, and the behavior hub. Owns presence and the full
 * effect stack — focus restore, focus trap, hide-outside, dismiss, and scroll lock — all created
 * in this scope (the content's), so each tears down when the content unmounts.
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
  // A signal-backed ref, not a `let`: the content only exists as a reactive consequence of
  // `mounted()`, so the effects below (which react to `open`/`isModal` and read this ref tracked
  // in their compute fn) must be able to react once it's actually set. See `create-focus-trap.ts`.
  const [ref, setRef] = createSignal<HTMLDivElement>();

  const presence = createPresence({ present: state.open, ref });

  createFocusRestore({ active: state.open });
  createFocusTrap({ active: state.isModal, ref, initialFocus: () => props.initialFocus?.() });
  createHideOutside({ active: state.isModal, target: ref, spare: state.sparedElements });
  createDismissable({ active: state.open, ref, onDismiss: () => state.setOpen(false) });
  createScrollLock({ active: state.isModal });

  // Publish a consumer-supplied `id` up so the trigger's `aria-controls` names the element that
  // actually exists. `createRegisteredId` defers the write past Solid 2.0's
  // `[REACTIVE_WRITE_IN_OWNED_SCOPE]` ban; running it here scopes cleanup to the content's unmount.
  createRegisteredId({ id: () => props.id, register: state.setPopupId });

  // Internal values fall back to the consumer's rather than overwriting them: `merge` gives the
  // *last* source precedence and treats a getter returning `undefined` as a real value, so a bare
  // `get "aria-labelledby"()` would erase a consumer's own value whenever no `Title` is mounted —
  // stripping the accessible name. `aria-modal`/`data-presence` stay owned here (state-derived,
  // and `aria-modal` must be *absent* on a non-modal dialog). `initialFocus` is a control prop, not
  // an attribute, so it's dropped from what spreads onto the element.
  const elementProps = merge(omit(props, "initialFocus"), {
    get id() {
      return props.id ?? state.popupId();
    },
    get role() {
      return props.role ?? ("dialog" as const);
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
      return presence.status();
    },
  });

  return { props: elementProps, mounted: presence.mounted, setRef };
}
