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
  /** Spread onto the popup card. Everything the consumer passes is forwarded; `data-presence` (the
   * enter/exit lifecycle state) is owned here. No `role` and no `aria-modal` — `role="listbox"`
   * lives on `createComboboxList`'s element, and this layer never claims to be a dialog. */
  props: JSX.HTMLAttributes<HTMLDivElement> & { "data-presence": PresenceStatus };
  /** Gate the content's render on this — the shared presence keeps it mounted through the exit
   * transition. */
  mounted: Accessor<boolean>;
  /** Hand to the content element's `ref`; registers it on `state` (for the shared presence's exit
   * timing) and wires the dismissal/modality effects. */
  setRef: (element: HTMLDivElement) => void;
}

/**
 * The content part: the popup card, and the behavior hub. It creates the effect stack — dismissal,
 * hide-outside and scroll lock — in this scope, so each tears down when the popup unmounts.
 *
 * It is **not** the listbox: `role="listbox"` may only contain options and groups, so a Combobox's
 * `Empty` / `Status` have to live in the card beside the list rather than inside it.
 *
 * **Modality here is two mechanisms, not four.** `modal` (default `true`) gates `createHideOutside`
 * — which applies `aria-hidden` (removes from the accessibility tree) **and** `inert` (removes from
 * focus order and hit testing) to everything outside the popup — plus `createScrollLock`. There is
 * no focus trap, because focus never leaves the trigger, and no backdrop, which would cover the
 * trigger and break toggle-to-close.
 *
 * Two ordering hazards that fail silently:
 *
 * - **The trigger must be in `state.sparedElements`, which feeds both mechanisms.** Missing from
 *   `createHideOutside`'s `spare`, the trigger itself goes `inert` and loses focus and the pointer;
 *   missing from `createDismissable`'s `exclude`, the capture-phase pointerdown dismisses and the
 *   trigger's own `click` reopens.
 * - **`createHideOutside` does nothing until its `target` resolves.** A run without the popup in the
 *   spared set would mark the popup itself `inert`, stranding focus for good.
 */
export function createComboboxContent<V = unknown, M extends SelectionMode = "single">(
  state: CreateComboboxReturn<V, M>,
  props: JSX.HTMLAttributes<HTMLDivElement>,
): CreateComboboxContentReturn {
  // A signal, not a plain ref. The content is conditionally rendered by the very signal the effects
  // below key on, so they have to be able to *react* to the element arriving — which means tracking
  // it in their dependency function, which only works for a signal.
  const ref = state.contentElement;
  const isModal = () => state.open() && state.modal();

  // Getters, not one-time reads: `createDismissable` consults these live inside its handlers, so a
  // getter keeps them reactive — and reading them eagerly here would trip Solid 2.0's
  // `[STRICT_READ_UNTRACKED]`.
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
