import { JSX, mergeProps, splitProps } from "solid-js";

import { useTheme } from "@/theme/HopeProvider";
import { createCssSelector, generateClassList } from "@/utils/function";
import { classPropsKeys } from "@/utils/object";

import { Button, ButtonOptions, ThemeableButtonOptions } from "../Button/Button";
import { iconButtonStyles } from "../Button/Button.styles";
import { ElementType, HopeComponentProps } from "../types";

export interface IconButtonOptions
  extends Omit<
    ButtonOptions,
    "leftIcon" | "rightIcon" | "loaderPosition" | "textTransform" | "fullWidth"
  > {
  icon: JSX.Element;
  "aria-label": string;
}

export type ThemeableIconButtonOptions = Pick<
  ThemeableButtonOptions,
  "variant" | "colorScheme" | "size" | "borderRadius" | "compact"
>;

export type IconButtonProps<C extends ElementType> = HopeComponentProps<C, IconButtonOptions>;

const hopeIconButtonClass = "hope-icon-button";

/**
 * IconButton composes the Button component except that it renders only an icon.
 * Since IconButton only renders an icon, you must pass the aria-label prop, so screen readers can give meaning to the button.
 */
export function IconButton<C extends ElementType = "button">(props: IconButtonProps<C>) {
  const theme = useTheme().components.IconButton;

  const defaultProps: Required<ThemeableIconButtonOptions> = {
    variant: theme?.defaultProps?.variant ?? "solid",
    colorScheme: theme?.defaultProps?.colorScheme ?? "primary",
    size: theme?.defaultProps?.size ?? "md",
    borderRadius: theme?.defaultProps?.borderRadius ?? "sm",
    compact: theme?.defaultProps?.compact ?? false,
  };

  const propsWithDefault: IconButtonProps<C> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [...classPropsKeys, "children", "icon"]);

  const classList = () => {
    return generateClassList({
      hopeClass: hopeIconButtonClass,
      baseClass: iconButtonStyles(),
      classProps: local,
    });
  };

  return <Button classList={classList()} leftIcon={local.icon} {...others} />;
}

IconButton.toString = () => createCssSelector(hopeIconButtonClass);
