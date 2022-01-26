import { JSX, mergeProps, splitProps } from "solid-js";

import { useHopeTheme } from "@/contexts/HopeContext";
import { css } from "@/stitches/stitches.config";

import { Button, ButtonOptions, CommonOmitableButtonOptions } from "../Button/Button";
import { iconButtonStyles } from "../Button/Button.styles";
import { ElementType, PolymorphicComponentProps } from "../types";

export type IconButtonOptions = Omit<
  ButtonOptions,
  "leftIcon" | "rightIcon" | "loaderPosition" | "uppercase" | "fullWidth"
> & {
  "aria-label": string;
  icon?: JSX.Element;
};

export type ThemeableIconButtonOptions = Omit<
  IconButtonOptions,
  CommonOmitableButtonOptions | "aria-label" | "icon"
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

  const propsWithDefault = mergeProps(theme.defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "class",
    "className",
    "classList",
    "children",
    "icon",
  ]);

  // Create theme base styles if provided
  const themeBaseStyles = theme.baseStyle && css(theme.baseStyle);

  const classList = () => {
    const baseClass = iconButtonStyles();
    const themeBaseClass = themeBaseStyles?.() ?? ""; // Should be called after to override buttonStyles(), seem css are appened in the order they are called.

    return {
      [baseClass]: true,
      [themeBaseClass]: true,
      [local.class ?? ""]: true,
      [local.className ?? ""]: true,
      ...local.classList,
    };
  };

  return <Button classList={classList()} leftIcon={local.icon} {...others} />;
}
