import { JSX, mergeProps, Show, splitProps } from "solid-js";

import { IconSpinner } from "@/components/icons/IconSpinner";
import { useThemeComponentStyles } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { buttonLoadingIconContainerStyles, buttonStyles, ButtonVariants } from "./button.styles";

export interface ButtonOptions extends ButtonVariants {
  disabled?: boolean;
  loaderPosition?: "left" | "right";
  loader?: JSX.Element;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
}

export type ThemeableButtonOptions = Pick<ButtonOptions, "variant" | "colorScheme" | "size" | "loaderPosition">;

export type ButtonProps<C extends ElementType = "button"> = HTMLHopeProps<C, ButtonOptions>;

const hopeButtonClass = "hope-button";

/**
 * The Button component is used to trigger an action or event,
 * such as submitting a form, opening a dialog, canceling an action, or performing a delete operation.
 */
export function Button<C extends ElementType = "button">(props: ButtonProps<C>) {
  const theme = useThemeComponentStyles().Button;

  const defaultProps: ButtonProps<"button"> = {
    as: "button",
    __baseStyle: theme?.baseStyle,
    variant: theme?.defaultProps?.variant ?? "solid",
    colorScheme: theme?.defaultProps?.colorScheme ?? "primary",
    size: theme?.defaultProps?.size ?? "md",
    loaderPosition: theme?.defaultProps?.loaderPosition ?? "left",
    loader: <IconSpinner />,
    loading: false,
    disabled: false,
    type: "button",
    role: "button",
  };

  const propsWithDefault: ButtonProps<"button"> = mergeProps(defaultProps, props);
  const [local, variantProps, others] = splitProps(
    propsWithDefault,
    ["class", "__baseStyle", "loader", "loaderPosition", "disabled", "leftIcon", "rightIcon", "children"],
    ["variant", "colorScheme", "size", "loading", "compact", "fullWidth"]
  );

  const classes = () => classNames(local.class, hopeButtonClass, buttonStyles(variantProps));

  const loaderClass = buttonLoadingIconContainerStyles();

  const isLeftIconVisible = () => {
    return local.leftIcon && (!variantProps.loading || local.loaderPosition === "right");
  };

  const isRightIconVisible = () => {
    return local.rightIcon && (!variantProps.loading || local.loaderPosition === "left");
  };

  const isLeftLoaderVisible = () => {
    return variantProps.loading && !local.disabled && local.loaderPosition === "left";
  };

  const isRightLoaderVisible = () => {
    return variantProps.loading && !local.disabled && local.loaderPosition === "right";
  };

  const shouldWrapChildrenInSpan = () => {
    return variantProps.loading || local.leftIcon || local.rightIcon;
  };

  return (
    <Box class={classes()} disabled={local.disabled} __baseStyle={local.__baseStyle} {...others}>
      <Show when={isLeftIconVisible()}>{local.leftIcon}</Show>
      <Show when={isLeftLoaderVisible()}>
        <span class={loaderClass}>{local.loader}</span>
      </Show>
      <Show when={local.children}>
        <Show when={shouldWrapChildrenInSpan()} fallback={local.children}>
          <span>{local.children}</span>
        </Show>
      </Show>
      <Show when={isRightIconVisible()}>{local.rightIcon}</Show>
      <Show when={isRightLoaderVisible()}>
        <span class={loaderClass}>{local.loader}</span>
      </Show>
    </Box>
  );
}

Button.toString = () => createClassSelector(hopeButtonClass);
