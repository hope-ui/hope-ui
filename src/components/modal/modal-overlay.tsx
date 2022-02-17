import { createEffect, createSignal, Show, splitProps } from "solid-js";
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

  const [isOverlayVisible, setIsOverlayVisible] = createSignal(false);

  createEffect(() => {
    setIsOverlayVisible(modalContext.state.isOpen);
  });

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeModalOverlayClass, modalOverlayStyles());

  return (
    <Transition name="fade">
      <Show when={isOverlayVisible()}>
        <Box class={classes()} {...others} />
      </Show>
    </Transition>
  );
}

ModalOverlay.toString = () => createClassSelector(hopeModalOverlayClass);
