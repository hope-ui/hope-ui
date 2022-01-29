import { JSX, mergeProps, splitProps } from "solid-js";

import { useTheme } from "@/contexts/HopeContext";

import { Button, ButtonOptions, CommonOmitableButtonOptions } from "../Button/Button";
import { iconButtonStyles } from "../Button/Button.styles";
import { ElementType, PolymorphicComponentProps } from "../types";
import { commonProps, createCssSelector, generateClassList } from "../utils";

export interface IconButtonOptions
  extends Omit<
    ButtonOptions,
    "leftIcon" | "rightIcon" | "loaderPosition" | "textTransform" | "fullWidth"
  > {
  icon: JSX.Element;
  "aria-label": string;
}

export type ThemeableIconButtonOptions = Omit<
  IconButtonOptions,
  CommonOmitableButtonOptions | "aria-label" | "icon"
>;

export type IconButtonProps<C extends ElementType> = PolymorphicComponentProps<
  C,
  IconButtonOptions
>;

const hopeIconButtonClass = "hope-icon-button";

/**
 * IconButton composes the Button component except that it renders only an icon.
 * Since IconButton only renders an icon, you must pass the aria-label prop, so screen readers can give meaning to the button.
 */
export function IconButton<C extends ElementType = "button">(props: IconButtonProps<C>) {
  const theme = useTheme().components.IconButton;

  const defaultProps: Required<ThemeableIconButtonOptions> = {
    variant: theme?.defaultProps?.variant ?? "filled",
    colorScheme: theme?.defaultProps?.colorScheme ?? "primary",
    size: theme?.defaultProps?.size ?? "md",
    borderRadius: theme?.defaultProps?.borderRadius ?? "sm",
    compact: theme?.defaultProps?.compact ?? false,
  };

  props = mergeProps(defaultProps, props);
  const [local, others] = splitProps(props, [...commonProps, "children", "icon"]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeIconButtonClass,
      baseClass: iconButtonStyles(),
      class: local.class,
      className: local.className,
      classList: local.classList,
    });
  };

  return (
    <Button
      as={local.as as ElementType}
      classList={classList()}
      leftIcon={local.icon}
      {...others}
    />
  );
}

IconButton.toString = () => createCssSelector(hopeIconButtonClass);
