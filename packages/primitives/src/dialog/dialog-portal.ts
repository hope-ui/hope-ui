import { type Accessor, createSignal } from "solid-js";
import { createRegisteredElement } from "../internal";
import type { CreateDialogReturn } from "./dialog-root";

export interface CreateDialogPortalReturn {
  /** `open() && modal()` — gate the pointer-blocking modal backdrop's render on this. */
  showModalBackdrop: Accessor<boolean>;
  /** Hand to the modal backdrop element's `ref`; spares it from the popup's hide-outside, so the
   * `inert` layer never makes the backdrop itself transparent to hit testing. */
  setModalBackdropRef: (element: HTMLDivElement) => void;
}

/**
 * The portal part: owns the pointer-blocking modal backdrop's registration. That backdrop is what
 * makes an element inserted before `createHideOutside`'s `MutationObserver` reaches it still
 * unreachable by pointer — but only while the backdrop is itself spared from `inert`, which is
 * exactly what registering its ref here does. Rendering the portal + `ModalBackdrop` JSX (and its
 * server-side `isServer` guard) stays in the component.
 */
export function createDialogPortal(state: CreateDialogReturn): CreateDialogPortalReturn {
  const [modalBackdropRef, setModalBackdropRef] = createSignal<HTMLDivElement>();

  createRegisteredElement({
    ref: modalBackdropRef,
    register: state.addSparedElement,
    unregister: state.removeSparedElement,
  });

  return { showModalBackdrop: state.isModal, setModalBackdropRef };
}
