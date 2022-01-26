import { JSX, mergeProps, splitProps } from "solid-js";

import { useHopeTheme } from "@/contexts/HopeContext";
import { IconSpinner } from "@/icons/IconSpinner";

import { Button, ButtonOptions, CommonOmitableButtonOptions } from "../Button/Button";
import { iconButtonStyles } from "../Button/Button.styles";
import { ElementType, PolymorphicComponentProps } from "../types";
import { classPropNames, generateClassList } from "../utils";

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

  const defaultProps: Required<ThemeableIconButtonOptions> = {
    variant: theme?.defaultProps?.variant ?? "filled",
    color: theme?.defaultProps?.color ?? "primary",
    size: theme?.defaultProps?.size ?? "md",
    radius: theme?.defaultProps?.radius ?? "sm",
    loader: theme?.defaultProps?.loader ?? IconSpinner,
    compact: theme?.defaultProps?.compact ?? false,
  };

  const propsWithDefault = mergeProps(defaultProps, props);
  const [local, classProps, others] = splitProps(
    propsWithDefault,
    ["children", "icon"],
    classPropNames
  );

  const classList = () => {
    return generateClassList({
      baseClass: iconButtonStyles(),
      themeBaseStyle: theme?.baseStyle,
      ...classProps,
    });
  };

  return <Button classList={classList()} leftIcon={local.icon} {...others} />;
}
