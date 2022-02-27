import { JSX, mergeProps, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";
import { callAllHandlers } from "@/utils/function";

import { CloseButton, CloseButtonProps } from "../close-button/close-button";
import { useModalContext } from "./modal";
import { modalCloseButtonStyles } from "./modal.styles";
import { useComponentStyleConfigs } from "@/theme/provider";

const hopeModalCloseButtonClass = "hope-modal__close-button";

/**
 * ModalCloseButton is used closes the modal.
 *
 * You don't need to pass the `onClick` to it, it reads the
 * `onClose` action from the modal context.
 */
export function ModalCloseButton(props: CloseButtonProps) {
  const theme = useComponentStyleConfigs().Modal;

  const modalContext = useModalContext();

  const defaultProps: CloseButtonProps = {
    "aria-label": theme?.defaultProps?.closeButton?.["aria-label"] ?? "Close modal",
    size: theme?.defaultProps?.closeButton?.size ?? "sm",
    icon: theme?.defaultProps?.closeButton?.icon,
    variant: theme?.defaultProps?.closeButton?.variant,
    colorScheme: theme?.defaultProps?.closeButton?.colorScheme,
  };

  const propsWithDefaults = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefaults, ["class", "onClick"]);

  const classes = () => classNames(local.class, hopeModalCloseButtonClass, modalCloseButtonStyles());

  const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = event => {
    const allHandlers = callAllHandlers(local.onClick, e => {
      e.stopPropagation();
      modalContext.onClose();
    });

    allHandlers(event);
  };

  return <CloseButton class={classes()} __baseStyle={theme?.baseStyle?.closeButton} onClick={onClick} {...others} />;
}

ModalCloseButton.toString = () => createClassSelector(hopeModalCloseButtonClass);
