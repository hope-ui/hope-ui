import { clearAllBodyScrollLocks, disableBodyScroll } from "body-scroll-lock";
import { createFocusTrap, FocusTrap } from "focus-trap";
import { JSX } from "solid-js";

import { callAllHandlers } from "@/utils/function";

import { useModalContext } from "./modal";
import { ModalContentProps } from "./modal-content";

export type CreateModalProps = Pick<ModalContentProps, "onClick" | "aria-labelledby" | "aria-describedby">;

/**
 * Modal hook that manages all the logic for the modal dialog widget
 */
export function createModal(props: CreateModalProps) {
  const modalContext = useModalContext();

  let containerRef: HTMLDivElement | undefined;
  let focusTrap: FocusTrap | undefined;

  const assignContainerRef = (el: HTMLDivElement) => {
    containerRef = el;
  };

  const ariaLabelledBy = () => {
    return modalContext.state.headerMounted ? modalContext.state.headerId : props["aria-labelledby"];
  };

  const ariaDescribedBy = () => {
    return modalContext.state.bodyMounted ? modalContext.state.bodyId : props["aria-describedby"];
  };

  const onDialogClick: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    const allHandlers = callAllHandlers(props.onClick, e => e.stopPropagation());
    allHandlers(event);
  };

  const enableFocusTrapAndScrollLock = () => {
    if (!containerRef) {
      return;
    }

    if (modalContext.state.trapFocus) {
      focusTrap = createFocusTrap(containerRef, {
        initialFocus: modalContext.state.initialFocus,
        fallbackFocus: `[id='${modalContext.state.dialogId}']`,
        allowOutsideClick: false,
      });

      focusTrap.activate();
    }

    if (modalContext.state.blockScrollOnMount) {
      disableBodyScroll(containerRef, {
        allowTouchMove: el => el.id === modalContext.state.bodyId,
        reserveScrollBarGap: modalContext.state.preserveScrollBarGap,
      });
    }
  };

  const disableFocusTrapAndScrollLock = () => {
    focusTrap?.deactivate();
    clearAllBodyScrollLocks();
  };

  return {
    modalContext,
    assignContainerRef,
    ariaLabelledBy,
    ariaDescribedBy,
    onDialogClick,
    enableFocusTrapAndScrollLock,
    disableFocusTrapAndScrollLock,
  };
}
