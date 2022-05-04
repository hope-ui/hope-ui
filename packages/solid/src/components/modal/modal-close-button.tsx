import { JSX, mergeProps, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { chainHandlers } from "../../utils/function";
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
  const theme = useStyleConfig().Modal;

  const modalContext = useModalContext();

  const defaultProps: CloseButtonProps = {
    "aria-label": theme?.defaultProps?.closeButton?.["aria-label"] ?? "Close modal",
    size: theme?.defaultProps?.closeButton?.size ?? "md",
    icon: theme?.defaultProps?.closeButton?.icon,
  };

  const propsWithDefaults = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefaults, ["class", "onClick"]);

  const classes = () =>
    classNames(local.class, hopeModalCloseButtonClass, modalCloseButtonStyles());

  const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = event => {
    chainHandlers(local.onClick, e => {
      e.stopPropagation();
      modalContext.onClose();
    })(event);
  };

  return (
    <CloseButton
      class={classes()}
      __baseStyle={theme?.baseStyle?.closeButton}
      onClick={onClick}
      {...others}
    />
  );
}

ModalCloseButton.toString = () => createClassSelector(hopeModalCloseButtonClass);
