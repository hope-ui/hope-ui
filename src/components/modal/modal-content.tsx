import { clearAllBodyScrollLocks, disableBodyScroll } from "body-scroll-lock";
import { createFocusTrap, FocusTrap } from "focus-trap";
import { JSX, mergeProps, Show, splitProps } from "solid-js";
import { Transition } from "solid-transition-group";

import { classNames, createClassSelector } from "@/utils/css";
import { callAllHandlers } from "@/utils/function";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useModalContext } from "./modal";
import { modalContainerStyles, modalDialogStyles, modalTransitionName } from "./modal.styles";

export type ModalContentProps<C extends ElementType = "section"> = HTMLHopeProps<C>;

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
    "ref",
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

  const ariaLabelledBy = () => {
    return modalContext.state.headerMounted ? modalContext.state.headerId : local["aria-labelledby"];
  };

  const ariaDescribedBy = () => {
    return modalContext.state.bodyMounted ? modalContext.state.bodyId : local["aria-describedby"];
  };

  const onDialogClick: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    const allHandlers = callAllHandlers(local.onClick, e => e.stopPropagation());
    allHandlers(event);
  };

  const transitionName = () => {
    switch (modalContext.state.transition) {
      case "fade-in-bottom":
        return modalTransitionName.fadeInBottom;
      case "scale":
        return modalTransitionName.scale;
      case "none":
        return "hope-none";
    }
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

  return (
    <Transition
      name={transitionName()}
      appear
      onAfterEnter={enableFocusTrapAndScrollLock}
      onBeforeExit={disableFocusTrapAndScrollLock}
      onAfterExit={modalContext.onModalContentExitTransitionEnd}
    >
      <Show when={modalContext.state.opened}>
        <Box
          ref={containerRef}
          class={containerClasses()}
          tabIndex={-1}
          onMouseDown={modalContext.onMouseDown}
          onKeyDown={modalContext.onKeyDown}
          onClick={modalContext.onOverlayClick}
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
      </Show>
    </Transition>
  );
}

ModalContent.toString = () => createClassSelector(hopeModalContentClass);
