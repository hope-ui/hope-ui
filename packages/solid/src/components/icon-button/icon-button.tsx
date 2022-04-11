import { JSX, Show, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Button, ButtonOptions } from "../button/button";
import { hopeIconButtonClass } from "../button/button.styles";
import { useButtonGroupContext } from "../button/button-group";
import { ElementType, HTMLHopeProps, SinglePartComponentStyleConfig } from "../types";

export interface IconButtonOptions
  extends Omit<
    ButtonOptions,
    "loadingText" | "loaderPlacement" | "leftIcon" | "rightIcon" | "iconSpacing" | "fullWidth"
  > {
  /**
   * A11y: A label that describes the button
   */
  "aria-label": string;

  /**
   * The icon to be used in the button.
   */
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
  const theme = useStyleConfig().IconButton;

  const buttonGroupContext = useButtonGroupContext();

  const [local, others] = splitProps(props, [
    "class",
    "children",
    "icon",
    "variant",
    "colorScheme",
    "size",
    "disabled",
  ]);

  const variant = () => local.variant ?? buttonGroupContext?.state.variant ?? theme?.defaultProps?.variant ?? "solid";

  const colorScheme = () => {
    return local.colorScheme ?? buttonGroupContext?.state.colorScheme ?? theme?.defaultProps?.colorScheme ?? "primary";
  };

  const size = () => local.size ?? buttonGroupContext?.state.size ?? theme?.defaultProps?.size ?? "md";

  const disabled = () => local.disabled ?? buttonGroupContext?.state.disabled;

  const classes = () => classNames(local.class, hopeIconButtonClass);

  return (
    <Button
      class={classes()}
      __baseStyle={theme?.baseStyle}
      variant={variant()}
      colorScheme={colorScheme()}
      size={size()}
      disabled={disabled()}
      {...others}
    >
      <Show when={local.icon} fallback={local.children}>
        {local.icon}
      </Show>
    </Button>
  );
}

IconButton.toString = () => createClassSelector(hopeIconButtonClass);
