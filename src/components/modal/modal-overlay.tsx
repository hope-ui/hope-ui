import { Show, splitProps } from "solid-js";
import { Transition } from "solid-transition-group";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { useModalContext } from "./modal";
import { modalOverlayStyles, modalTransitionName } from "./modal.styles";

export type ModalOverlayProps<C extends ElementType = "div"> = HopeComponentProps<C>;

const hopeModalOverlayClass = "hope-modal__overlay";

/**
 * ModalOverlay renders a backdrop behind the modal.
 */
export function ModalOverlay<C extends ElementType = "div">(props: ModalOverlayProps<C>) {
  const modalContext = useModalContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeModalOverlayClass, modalOverlayStyles());

  const transitionName = () => {
    return modalContext.state.transition === "none" ? "hope-none" : modalTransitionName.fade;
  };

  return (
    <Transition name={transitionName()} appear>
      <Show when={modalContext.state.opened}>
        <Box class={classes()} {...others} />
      </Show>
    </Transition>
  );
}

ModalOverlay.toString = () => createClassSelector(hopeModalOverlayClass);
