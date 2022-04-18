import { JSX, mergeProps, Show, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { IconClose } from "../icons/IconClose";
import { ElementType, HTMLHopeProps, SinglePartComponentStyleConfig } from "../types";
import { closeButtonStyles, CloseButtonVariants } from "./close-button.styles";

export interface ThemeableCloseButtonOptions extends CloseButtonVariants {
  /**
   * A11y: A label that describes the button
   */
  "aria-label"?: string;

  /**
   * The icon to be used in the button.
   */
  icon?: JSX.Element;
}

export type CloseButtonProps<C extends ElementType = "button"> = HTMLHopeProps<
  C,
  ThemeableCloseButtonOptions
>;

export type CloseButtonStyleConfig = SinglePartComponentStyleConfig<ThemeableCloseButtonOptions>;

const hopeCloseButtonClass = "hope-close-button";

/**
 * A button with a close icon.
 *
 * It is used to handle the close functionality in feedback and overlay components
 * like Alerts, Toasts, Drawers and Modals.
 */
export function CloseButton<C extends ElementType = "button">(props: CloseButtonProps<C>) {
  const theme = useStyleConfig().CloseButton;

  const defaultProps: CloseButtonProps<"button"> = {
    "aria-label": theme?.defaultProps?.["aria-label"] ?? "Close",
    icon: theme?.defaultProps?.icon ?? <IconClose />,
    size: theme?.defaultProps?.size ?? "md",
  };

  const propsWithDefaults = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefaults, ["class", "children", "size", "icon"]);

  const classes = () => {
    return classNames(local.class, hopeCloseButtonClass, closeButtonStyles({ size: local.size }));
  };

  return (
    <hope.button type="button" class={classes()} __baseStyle={theme?.baseStyle} {...others}>
      <Show when={local.children} fallback={local.icon}>
        {local.children}
      </Show>
    </hope.button>
  );
}

CloseButton.toString = () => createClassSelector(hopeCloseButtonClass);
