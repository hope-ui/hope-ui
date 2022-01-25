import { Component, JSX, mergeProps, splitProps } from "solid-js";

import { useHopeTheme } from "@/contexts/HopeContext";

import { Button, ButtonOptions } from "../Button/Button";
import { iconButtonStyles } from "../Button/Button.styles";
import { ElementType, PolymorphicComponentProps } from "../types";

export type IconButtonOptions = Omit<
  ButtonOptions,
  "leftIcon" | "rightIcon" | "loaderPosition" | "uppercase" | "fullWidth"
> & {
  "aria-label": string;
  icon?: Component | JSX.Element;
};

export type ThemeableIconButtonOptions = Omit<
  IconButtonOptions,
  "loading" | "disabled" | "aria-label" | "icon"
>;

export type IconButtonProps<C extends ElementType> = PolymorphicComponentProps<
  C,
  IconButtonOptions
>;

/**
 * IconButton composes the Button component except that it renders only an icon.
 * Since IconButton only renders an icon, you must pass the aria-label prop, so screen readers can give meaning to the button.
 */
export function IconButton<C extends ElementType = "button">(props: IconButtonProps<C>) {
  const theme = useHopeTheme().components.IconButton;

  const defaultProps: Required<ThemeableIconButtonOptions> = {
    variant: theme.variant,
    color: theme.color,
    size: theme.size,
    radius: theme.radius,
    loader: theme.loader,
    compact: theme.compact,
  };

  const propsWithDefault = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["children", "icon"]);

  return <Button className={iconButtonStyles()} leftIcon={local.icon} {...others} />;
}
