import { Show, splitProps } from "solid-js";
import { Transition } from "solid-transition-group";

import { useComponentStyleConfigs } from "../../theme/provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { createModal } from "./create-modal";
import { useModalContext } from "./modal";
import { modalContainerStyles, modalDialogStyles, modalTransitionName } from "./modal.styles";

export type ModalContentProps<C extends ElementType = "section"> = HTMLHopeProps<C>;

const hopeModalContainerClass = "hope-modal__content-container";
const hopeModalContentClass = "hope-modal__content";

/**
 * Container for the modal dialog's content.
 */
export function ModalContent<C extends ElementType = "section">(props: ModalContentProps<C>) {
  const theme = useComponentStyleConfigs().Modal;

  const modalContext = useModalContext();

  const [local, others] = splitProps(props as ModalContentProps<"section">, [
    "ref",
    "class",
    "role",
    "aria-labelledby",
    "aria-describedby",
    "onClick",
  ]);

  const { assignContainerRef, ariaLabelledBy, ariaDescribedBy, onDialogClick } = createModal(local);

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

  const transitionName = () => {
    switch (modalContext.state.motionPreset) {
      case "fade-in-bottom":
        return modalTransitionName.fadeInBottom;
      case "scale":
        return modalTransitionName.scale;
      case "none":
        return "hope-none";
    }
  };

  return (
    <Transition name={transitionName()} appear onAfterExit={modalContext.unmountPortal}>
      <Show when={modalContext.state.opened}>
        <Box
          ref={assignContainerRef}
          class={containerClasses()}
          tabIndex={-1}
          onMouseDown={modalContext.onMouseDown}
          onKeyDown={modalContext.onKeyDown}
          onClick={modalContext.onOverlayClick}
        >
          <hope.section
            class={dialogClasses()}
            __baseStyle={theme?.baseStyle?.content}
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
