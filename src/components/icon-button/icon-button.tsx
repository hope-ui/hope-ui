import { JSX, mergeProps, splitProps } from "solid-js";

import { useThemeComponentStyles } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Button, ButtonOptions, ThemeableButtonOptions } from "../button/button";
import { hopeIconButtonClass } from "../button/button.styles";
import { ElementType, HTMLHopeProps } from "../types";

export interface IconButtonOptions
  extends Omit<ButtonOptions, "leftIcon" | "rightIcon" | "loaderPosition" | "fullWidth"> {
  "aria-label": string;
  icon: JSX.Element;
}

export type ThemeableIconButtonOptions = Pick<ThemeableButtonOptions, "variant" | "colorScheme" | "size">;

export type IconButtonProps<C extends ElementType = "button"> = HTMLHopeProps<C, IconButtonOptions>;

/**
 * IconButton composes the Button component except that it renders only an icon.
 * Since IconButton only renders an icon, you must pass the aria-label prop, so screen readers can give meaning to the button.
 */
export function IconButton<C extends ElementType = "button">(props: IconButtonProps<C>) {
  const theme = useThemeComponentStyles().IconButton;

  const defaultProps: Required<ThemeableIconButtonOptions> = {
    variant: theme?.defaultProps?.variant ?? "solid",
    colorScheme: theme?.defaultProps?.colorScheme ?? "primary",
    size: theme?.defaultProps?.size ?? "md",
  };

  const propsWithDefault: IconButtonProps<C> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "children", "icon"]);

  const classes = () => classNames(local.class, hopeIconButtonClass);

  return <Button class={classes()} __baseStyle={theme?.baseStyle} leftIcon={local.icon} {...others} />;
}

IconButton.toString = () => createClassSelector(hopeIconButtonClass);
