import { clearAllBodyScrollLocks, disableBodyScroll } from "body-scroll-lock";
import { createFocusTrap, FocusTrap } from "focus-trap";
import { JSX, mergeProps, Show, splitProps } from "solid-js";
import { Transition } from "solid-transition-group";

import { classNames, createClassSelector } from "@/utils/css";
import { callAllHandlers } from "@/utils/function";

import { Box } from "../box/box";
import { useModalContext } from "../modal/modal";
import { ElementType, HopeComponentProps } from "../types";
import { useDrawerContext } from "./drawer";
import { drawerContainerStyles, drawerDialogStyles, drawerTransitionName } from "./drawer.styles";

export type DrawerContentProps<C extends ElementType = "section"> = HopeComponentProps<C>;

const hopeDrawerContainerClass = "hope-drawer__content-container";
const hopeDrawerContentClass = "hope-drawer__content";

/**
 * Container for the drawer dialog's content.
 */
export function DrawerContent<C extends ElementType = "section">(props: DrawerContentProps<C>) {
  const drawerContext = useDrawerContext();
  const modalContext = useModalContext();

  const defaultProps: DrawerContentProps<"section"> = {
    as: "section",
  };

  const propsWithDefault: DrawerContentProps<"section"> = mergeProps(defaultProps, props);
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
    return classNames(
      hopeDrawerContainerClass,
      drawerContainerStyles({
        placement: drawerContext.placement,
      })
    );
  };

  const dialogClasses = () => {
    const dialogClass = drawerDialogStyles({
      size: drawerContext.size,
      placement: drawerContext.placement,
      fullHeight: drawerContext.fullHeight,
    });

    return classNames(local.class, hopeDrawerContentClass, dialogClass);
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
    if (drawerContext.disableTransition) {
      return "hope-none";
    }

    switch (drawerContext.placement) {
      case "top":
        return drawerTransitionName.slideInTop;
      case "right":
        return drawerTransitionName.slideInRight;
      case "bottom":
        return drawerTransitionName.slideInBottom;
      case "left":
        return drawerTransitionName.slideInLeft;
    }
  };

  const enableFocusTrapAndScrollLock = () => {
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

DrawerContent.toString = () => createClassSelector(hopeDrawerContentClass);
