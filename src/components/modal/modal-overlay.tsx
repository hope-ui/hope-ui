import { Show, splitProps } from "solid-js";
import { Transition } from "solid-transition-group";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { useModalContext } from "./modal";
import { modalOverlayStyles } from "./modal.styles";

const hopeModalOverlayClass = "hope-modal__overlay";

/**
 * ModalOverlay renders a backdrop behind the modal.
 */
export function ModalOverlay<C extends ElementType = "div">(props: HopeComponentProps<C>) {
  const modalContext = useModalContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeModalOverlayClass, modalOverlayStyles());

  const overlayTransitionName = () => {
    return modalContext.state.transition === "none" ? "hope-none" : "hope-fade";
  };

  return (
    <Transition name={overlayTransitionName()} appear>
      <Show when={modalContext.state.isOpen}>
        <Box class={classes()} {...others} />
      </Show>
    </Transition>
  );
}

ModalOverlay.toString = () => createClassSelector(hopeModalOverlayClass);
