import { JSX, mergeProps, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";
import { callAllHandlers } from "@/utils/function";

import { CloseButton, CloseButtonProps } from "../close-button/close-button";
import { useModalContext } from "./modal";
import { modalCloseButtonStyles } from "./modal.styles";

const hopeModalCloseButtonClass = "hope-modal__close-button";

/**
 * ModalCloseButton is used closes the modal.
 *
 * You don't need to pass the `onClick` to it, it reads the
 * `onClose` action from the modal context.
 */
export function ModalCloseButton(props: CloseButtonProps) {
  const modalContext = useModalContext();

  const defaultProps: CloseButtonProps = {
    "aria-label": "Close modal",
    size: "sm",
  };

  const propsWithDefaults = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefaults, ["class", "onClick"]);

  const classes = () =>
    classNames(local.class, hopeModalCloseButtonClass, modalCloseButtonStyles());

  const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = event => {
    const allHandlers = callAllHandlers(local.onClick, e => {
      e.stopPropagation();
      modalContext.onClose();
    });

    allHandlers(event);
  };

  return <CloseButton class={classes()} onClick={onClick} {...others} />;
}

ModalCloseButton.toString = () => createClassSelector(hopeModalCloseButtonClass);
