import { clearAllBodyScrollLocks, disableBodyScroll } from "body-scroll-lock";
import { createFocusTrap, FocusTrap } from "focus-trap";
import { JSX, mergeProps, onCleanup, onMount, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";
import { callAllHandlers } from "@/utils/function";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { useModalContext } from "./modal";
import { modalContainerStyles, modalDialogStyles } from "./modal.styles";

export type ModalContentProps<C extends ElementType> = HopeComponentProps<C>;

const hopeModalContainerClass = "hope-modal__content-container";
const hopeModalContentClass = "hope-modal__content";

/**
 * Container for the modal dialog's content.
 */
export function ModalContent<C extends ElementType = "section">(props: ModalContentProps<C>) {
  const modalContext = useModalContext();

  const defaultProps: ModalContentProps<"section"> = {
    as: "section",
  };

  const propsWithDefault: ModalContentProps<"section"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "class",
    "role",
    "aria-labelledby",
    "aria-describedby",
    "onClick",
  ]);

  let containerRef: HTMLDivElement | undefined;
  let focusTrap: FocusTrap | undefined;

  const containerClasses = () => {
    const containerClass = modalContainerStyles({
      centered: modalContext.state.centered,
      scrollBehavior: modalContext.state.scrollBehavior,
    });

    return classNames(hopeModalContainerClass, containerClass);
  };

  const dialogClasses = () => {
    const dialogClass = modalDialogStyles({
      size: modalContext.state.size,
      scrollBehavior: modalContext.state.scrollBehavior,
    });

    return classNames(local.class, hopeModalContentClass, dialogClass);
  };

  const ariaLabelledBy = () =>
    modalContext.state.headerMounted ? modalContext.state.headerId : local["aria-labelledby"];

  const ariaDescribedBy = () =>
    modalContext.state.bodyMounted ? modalContext.state.bodyId : local["aria-describedby"];

  const onDialogClick: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    const allHandlers = callAllHandlers(local.onClick, event => event.stopPropagation());
    allHandlers(event);
  };

  onMount(() => {
    if (!containerRef) {
      return;
    }

    focusTrap = createFocusTrap(containerRef, {
      initialFocus: modalContext.state.initialFocus,
      fallbackFocus: `[id='${modalContext.state.dialogId}']`,
      allowOutsideClick: false,
    });

    focusTrap.activate();

    disableBodyScroll(containerRef);
  });

  onCleanup(() => {
    focusTrap?.deactivate();

    clearAllBodyScrollLocks();
  });

  return (
    <Box
      class={containerClasses()}
      ref={containerRef}
      tabIndex={-1}
      onClick={modalContext.onOverlayClick}
      onMouseDown={modalContext.onMouseDown}
      onKeyUp={modalContext.onKeyUp}
    >
      <Box
        class={dialogClasses()}
        id={modalContext.state.dialogId}
        role={local.role ?? "dialog"}
        tabIndex={-1}
        aria-modal={true}
        aria-labelledby={ariaLabelledBy()}
        aria-describedby={ariaDescribedBy()}
        onClick={onDialogClick}
        {...others}
      />
    </Box>
  );
}

ModalContent.toString = () => createClassSelector(hopeModalContentClass);
