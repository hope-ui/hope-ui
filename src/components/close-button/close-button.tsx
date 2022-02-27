import { mergeProps, splitProps } from "solid-js";

import { SinglePartComponentStyleConfig, useComponentStyleConfigs } from "@/theme";
import { classNames, createClassSelector } from "@/utils/css";

import { IconButton, IconButtonProps } from "../icon-button/icon-button";
import { IconClose } from "../icons/IconClose";

export type CloseButtonProps = Partial<IconButtonProps<"button">>;

export type CloseButtonStyleConfig = SinglePartComponentStyleConfig<
  Pick<CloseButtonProps, "aria-label" | "icon" | "variant" | "colorScheme" | "size">
>;

const hopeCloseButtonClass = "hope-close-button";

/**
 * A button with a close icon.
 *
 * It is used to handle the close functionality in feedback and overlay components
 * like Alerts, Toasts, Drawers and Modals.
 */
export function CloseButton(props: CloseButtonProps) {
  const theme = useComponentStyleConfigs().CloseButton;

  const defaultProps: IconButtonProps<"button"> = {
    "aria-label": theme?.defaultProps?.["aria-label"] ?? "Close",
    icon: theme?.defaultProps?.icon ?? <IconClose />,
    variant: theme?.defaultProps?.variant ?? "ghost",
    colorScheme: theme?.defaultProps?.colorScheme ?? "neutral",
    size: theme?.defaultProps?.size ?? "md",
  };

  const propsWithDefaults = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefaults, ["class"]);

  const classes = () => classNames(local.class, hopeCloseButtonClass);

  return <IconButton class={classes()} __baseStyle={theme?.baseStyle} {...others} />;
}

CloseButton.toString = () => createClassSelector(hopeCloseButtonClass);
