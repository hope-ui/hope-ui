import { mergeProps, Show, splitProps } from "solid-js";
import { Transition } from "solid-transition-group";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { createModal } from "./create-modal";
import { modalContainerStyles, modalDialogStyles, modalTransitionName } from "./modal.styles";

export type ModalPanelProps<C extends ElementType = "section"> = HTMLHopeProps<C>;

const hopeModalContainerClass = "hope-modal__panel-container";
const hopeModalPanelClass = "hope-modal__panel";

/**
 * Container for the modal dialog's content.
 */
export function ModalPanel<C extends ElementType = "section">(props: ModalPanelProps<C>) {
  const theme = useComponentStyleConfigs().Modal;

  const defaultProps: ModalPanelProps<"section"> = {
    as: "section",
  };

  const propsWithDefault: ModalPanelProps<"section"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "ref",
    "class",
    "role",
    "aria-labelledby",
    "aria-describedby",
    "onClick",
  ]);

  const {
    modalContext,
    assignContainerRef,
    ariaLabelledBy,
    ariaDescribedBy,
    onDialogClick,
    enableFocusTrapAndScrollLock,
    disableFocusTrapAndScrollLock,
  } = createModal(local);

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

    return classNames(local.class, hopeModalPanelClass, dialogClass);
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

  return (
    <Transition
      name={transitionName()}
      appear
      onAfterEnter={enableFocusTrapAndScrollLock}
      onBeforeExit={disableFocusTrapAndScrollLock}
      onAfterExit={modalContext.onModalPanelExitTransitionEnd}
    >
      <Show when={modalContext.state.opened}>
        <Box
          ref={assignContainerRef}
          class={containerClasses()}
          tabIndex={-1}
          onMouseDown={modalContext.onMouseDown}
          onKeyDown={modalContext.onKeyDown}
          onClick={modalContext.onOverlayClick}
        >
          <Box
            class={dialogClasses()}
            __baseStyle={theme?.baseStyle?.panel}
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

ModalPanel.toString = () => createClassSelector(hopeModalPanelClass);
