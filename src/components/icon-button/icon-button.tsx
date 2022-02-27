import { JSX, mergeProps, Show, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Button, ButtonOptions } from "../button/button";
import { hopeIconButtonClass } from "../button/button.styles";
import { ElementType, HTMLHopeProps, SinglePartComponentStyleConfig } from "../types";

export interface IconButtonOptions
  extends Omit<
    ButtonOptions,
    "loadingText" | "loaderPlacement" | "leftIcon" | "rightIcon" | "iconSpacing" | "fullWidth"
  > {
  "aria-label": string;
  icon: JSX.Element;
}

export type IconButtonStyleConfig = SinglePartComponentStyleConfig<
  Pick<IconButtonOptions, "variant" | "colorScheme" | "size">
>;

export type IconButtonProps<C extends ElementType = "button"> = HTMLHopeProps<C, IconButtonOptions>;

/**
 * IconButton composes the Button component except that it renders only an icon.
 * Since IconButton only renders an icon, you must pass the aria-label prop, so screen readers can give meaning to the button.
 */
export function IconButton<C extends ElementType = "button">(props: IconButtonProps<C>) {
  const theme = useComponentStyleConfigs().IconButton;

  const defaultProps: Partial<IconButtonProps<"button">> = {
    variant: theme?.defaultProps?.variant ?? "solid",
    colorScheme: theme?.defaultProps?.colorScheme ?? "primary",
    size: theme?.defaultProps?.size ?? "md",
  };

  const propsWithDefault: IconButtonProps<C> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "children", "icon"]);

  const classes = () => classNames(local.class, hopeIconButtonClass);

  return (
    <Button class={classes()} __baseStyle={theme?.baseStyle} {...others}>
      <Show when={local.icon} fallback={local.children}>
        {local.icon}
      </Show>
    </Button>
  );
}

IconButton.toString = () => createClassSelector(hopeIconButtonClass);
