// eslint-disable-next-line import/named
import { createPreventScroll } from "@solid-aria/primitives";
import { createFocusTrap, FocusTrap } from "focus-trap";
import { createSignal, JSX, onCleanup, onMount } from "solid-js";

import { chainHandlers } from "../../utils/function";
import { useModalContext } from "./modal";
import { ModalContentProps } from "./modal-content";

export type CreateModalProps = Pick<ModalContentProps, "onClick">;

interface CreateModalReturn {
  assignContainerRef: (el: HTMLDivElement) => void;
  ariaLabelledBy: () => string | undefined;
  ariaDescribedBy: () => string | undefined;
  onDialogClick: JSX.EventHandler<HTMLElement, MouseEvent>;
}

/**
 * Modal hook that manages all the logic for the modal dialog widget.
 */
export function createModal(props: CreateModalProps): CreateModalReturn {
  const [isPreventScrollDisabled, setIsPreventScrollDisabled] = createSignal(false);

  const modalContext = useModalContext();

  let containerRef: HTMLDivElement | undefined;
  let focusTrap: FocusTrap | undefined;

  const assignContainerRef = (el: HTMLDivElement) => {
    containerRef = el;
  };

  const ariaLabelledBy = () => {
    return modalContext.state.headerMounted ? modalContext.state.headerId : undefined;
  };

  const ariaDescribedBy = () => {
    return modalContext.state.bodyMounted ? modalContext.state.bodyId : undefined;
  };

  const onDialogClick: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    chainHandlers(props.onClick, e => e.stopPropagation())(event);
  };

  const dialogSelector = () => `[id='${modalContext.state.dialogId}']`;

  const enableFocusTrapAndScrollLock = () => {
    if (!containerRef) {
      return;
    }

    if (modalContext.state.trapFocus) {
      focusTrap = createFocusTrap(containerRef, {
        initialFocus: modalContext.state.initialFocus,
        fallbackFocus: dialogSelector(),
        allowOutsideClick: true,
      });

      focusTrap.activate();
    }

    setIsPreventScrollDisabled(!modalContext.state.blockScrollOnMount);
  };

  const disableFocusTrapAndScrollLock = () => {
    focusTrap?.deactivate();
    setIsPreventScrollDisabled(true);
  };

  createPreventScroll({
    isDisabled: isPreventScrollDisabled,
  });

  onMount(() => {
    enableFocusTrapAndScrollLock();
  });

  onCleanup(() => {
    disableFocusTrapAndScrollLock();
  });

  return {
    assignContainerRef,
    ariaLabelledBy,
    ariaDescribedBy,
    onDialogClick,
  };
}
