// import { clearAllBodyScrollLocks, disableBodyScroll } from "body-scroll-lock";
import { createFocusTrap, FocusTrap } from "focus-trap";
import {
  addScrollableSelector,
  clearQueueScrollLocks,
  disablePageScroll,
  enablePageScroll,
  removeScrollableSelector,
} from "scroll-lock";
import { JSX } from "solid-js";

import { callAllHandlers } from "@/utils/function";

import { ModalContextValue, useModalContext } from "./modal";
import { ModalPanelProps } from "./modal-panel";

export type CreateModalProps = Pick<ModalPanelProps, "onClick" | "aria-labelledby" | "aria-describedby">;

interface CreateModalReturn {
  modalContext: ModalContextValue;
  assignContainerRef: (el: HTMLDivElement) => void;
  ariaLabelledBy: () => string | undefined;
  ariaDescribedBy: () => string | undefined;
  onDialogClick: JSX.EventHandler<HTMLElement, MouseEvent>;
  enableFocusTrapAndScrollLock: () => void;
  disableFocusTrapAndScrollLock: () => void;
}

/**
 * Modal hook that manages all the logic for the modal dialog widget
 */
export function createModal(props: CreateModalProps): CreateModalReturn {
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

  const childOfDialogSelector = `[id='${modalContext.state.dialogId}'] *`;

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
      addScrollableSelector(childOfDialogSelector);
      disablePageScroll(containerRef);
      // disableBodyScroll(containerRef, {
      //   allowTouchMove: el => {
      //     if (!containerRef || containerRef === el) {
      //       return false;
      //     }
      //     // allow touchmove only if `el` is a child of `container`
      //     return containerRef.contains(el);
      //   },
      //   reserveScrollBarGap: modalContext.state.preserveScrollBarGap,
      // });
    }
  };

  const disableFocusTrapAndScrollLock = () => {
    focusTrap?.deactivate();
    removeScrollableSelector(childOfDialogSelector);
    clearQueueScrollLocks();
    enablePageScroll();

    //clearAllBodyScrollLocks();
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
