import { JSX, mergeProps, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { chainHandlers } from "../../utils/function";
import { CloseButton, CloseButtonProps } from "../close-button/close-button";
import { usePopoverContext } from "./popover";
import { popoverCloseButtonStyles } from "./popover.styles";

const hopePopoverCloseButtonClass = "hope-popover__close-button";

/**
 * PopoverCloseButton is used closes the popover.
 *
 * You don't need to pass the `onClick` to it, it gets the
 * `close` action from the popover context.
 */
export function PopoverCloseButton(props: CloseButtonProps) {
  const theme = useStyleConfig().Popover;

  const popoverContext = usePopoverContext();

  const defaultProps: CloseButtonProps = {
    "aria-label": theme?.defaultProps?.closeButton?.["aria-label"] ?? "Close popover",
    size: theme?.defaultProps?.closeButton?.size ?? "sm",
    icon: theme?.defaultProps?.closeButton?.icon,
  };

  const propsWithDefaults = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefaults, ["class", "onClick"]);

  const classes = () =>
    classNames(local.class, hopePopoverCloseButtonClass, popoverCloseButtonStyles());

  const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = event => {
    chainHandlers(local.onClick, e => {
      e.stopPropagation();
      popoverContext.closeWithDelay();
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

PopoverCloseButton.toString = () => createClassSelector(hopePopoverCloseButtonClass);
