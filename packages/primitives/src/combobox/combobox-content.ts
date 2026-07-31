import type { JSX } from "@solidjs/web";
import { type Accessor, merge } from "solid-js";
import {
  createDismissable,
  createHideOutside,
  createScrollLock,
  type PresenceStatus,
  type SelectionMode,
} from "../internal";
import type { CreateComboboxReturn } from "./combobox-root";

export interface CreateComboboxContentReturn {
  /** Spread onto the popup card. Everything the consumer passes is forwarded; `data-presence` is
   * owned here. There is no `role` and no `aria-modal` — the `role="listbox"` lives on
   * `createComboboxList`'s element, and this layer never claims to be a dialog. */
  props: JSX.HTMLAttributes<HTMLDivElement> & { "data-presence": PresenceStatus };
  /** Gate the content's render on this — the shared presence keeps it mounted through the exit
   * transition. */
  mounted: Accessor<boolean>;
  /** Hand to the content element's `ref`; registers it on `state` (for the shared presence's exit
   * timing) and wires the dismissal/modality effects. */
  setRef: (element: HTMLDivElement) => void;
}

/**
 * The content part: the popup card, and the behavior hub. It owns the effect stack — dismissal,
 * hide-outside and scroll lock — all created in this scope, so each tears down when the popup
 * unmounts.
 *
 * It is **not** the listbox. `Content` and `List` stay distinct parts because `role="listbox"` may
 * only contain options and groups, and a Combobox's `Empty` / `Status` have to live in the card
 * beside the list rather than inside it.
 *
 * ## Modality is two mechanisms, and the trigger is spared from both
 *
 * `modal` (default `true`) gates `createHideOutside` — `aria-hidden` **and** `inert` outside the
 * popup — and `createScrollLock`. There is no focus trap (focus never leaves the trigger, so there
 * is nothing to trap) and no `ModalBackdrop` (it would cover the trigger, making it unclickable and
 * breaking toggle-to-close).
 *
 * `state.sparedElements` is the trigger, and it feeds **both** `createHideOutside`'s `spare` and
 * `createDismissable`'s `exclude`. Drop it from either and the same feature breaks in a different
 * way: without the spare the trigger goes `inert`, losing focus and the pointer; without the exclude
 * the capture-phase pointerdown dismisses and the trigger's own `click` reopens.
 *
 * `createHideOutside` also does nothing at all until its `target` resolves — a run without the popup
 * in the spared set would make the popup itself `inert`, stranding focus for good.
 */
export function createComboboxContent<V = unknown, M extends SelectionMode = "single">(
  state: CreateComboboxReturn<V, M>,
  props: JSX.HTMLAttributes<HTMLDivElement>,
): CreateComboboxContentReturn {
  // The content element lives on `state` (a signal), shared with the presence that times its exit
  // off it. The effects below react to `open`/`modal` and read this ref tracked in their compute fn,
  // so it must be a signal they can react to once it is actually set — the content is conditionally
  // rendered by the very signal they key on.
  const ref = state.contentElement;
  const isModal = () => state.open() && state.modal();

  // The three dismissal toggles and `bubbles` come from the root state, so a consumer sets them once
  // on `createCombobox` and this part forwards them. Getters, not one-time reads: `createDismissable`
  // reads them live inside its handlers, so a getter keeps them reactive (and avoids a
  // `STRICT_READ_UNTRACKED` read here).
  createDismissable({
    active: state.open,
    ref,
    onDismiss: () => state.setOpen(false),
    exclude: state.sparedElements,
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
  createHideOutside({ active: isModal, target: ref, spare: state.sparedElements });
  createScrollLock({ active: isModal });

  const elementProps = merge(props, {
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
