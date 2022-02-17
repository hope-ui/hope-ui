import { mergeProps, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { IconButton, IconButtonProps } from "../icon-button/icon-button";
import { IconClose } from "../icons/IconClose";

export type CloseButtonProps = Partial<IconButtonProps<"button">>;

const hopeCloseButtonClass = "hope-close-button";

/**
 * A button with a close icon.
 *
 * It is used to handle the close functionality in feedback and overlay components
 * like Alerts, Toasts, Drawers and Modals.
 */
export function CloseButton(props: CloseButtonProps) {
  const defaultProps: IconButtonProps<"button"> = {
    "aria-label": "Close",
    icon: <IconClose />,
    variant: "ghost",
    colorScheme: "neutral",
    size: "md",
  };

  const propsWithDefaults = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefaults, ["class"]);

  const classes = () => classNames(local.class, hopeCloseButtonClass);

  return <IconButton class={classes()} {...others} />;
}

CloseButton.toString = () => createClassSelector(hopeCloseButtonClass);
