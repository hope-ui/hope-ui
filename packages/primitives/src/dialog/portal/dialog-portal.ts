import { type Accessor, createSignal } from "solid-js";
import { createRegisteredElement } from "../../internal";
import type { CreateDialogReturn } from "../root/dialog-root";

export interface CreateDialogPortalReturn {
  /** `open() && modal()` — gate the pointer-blocking modal backdrop's render on this. */
  showModalBackdrop: Accessor<boolean>;
  /** Hand to the modal backdrop element's `ref`; spares it from the popup's hide-outside so the
   * inert layer never makes the backdrop itself transparent to hit testing. */
  setModalBackdropRef: (element: HTMLDivElement) => void;
}

/**
 * The portal part: owns the pointer-blocking modal backdrop's registration. The backdrop covers
 * the viewport unconditionally while modal, so an element inserted before hide-outside's
 * MutationObserver marks it `inert` is still unreachable by pointer — but only if the backdrop is
 * itself spared from `inert`, which is what registering its ref here does. Rendering the
 * `SolidPortal` + `ModalBackdrop` JSX (and the SSR `isServer` guard) stays in the component.
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
