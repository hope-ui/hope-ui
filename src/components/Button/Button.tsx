import { Component, JSX, mergeProps, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { useHopeTheme } from "@/contexts/HopeContext";
import { css } from "@/stitches/stitches.config";
import { HopeXPosition } from "@/theme/types";

import { ElementType, ExtendableProps, PolymorphicComponentProps } from "../types";
import { commonProps } from "../utils";
import { buttonLoadingIconStyles, buttonStyles, ButtonVariants } from "./Button.styles";

export type ButtonOptions = ButtonVariants & {
  disabled?: boolean;
  loaderPosition?: HopeXPosition;
  loader?: Component | JSX.Element;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
};

export type CommonOmitableButtonOptions = "disabled" | "loading";

export type ThemeableButtonOptions = Omit<
  ButtonOptions,
  CommonOmitableButtonOptions | "leftIcon" | "rightIcon"
>;

export type ButtonProps<C extends ElementType> = PolymorphicComponentProps<C, ButtonOptions>;

/**
 * The Button component is used to trigger an action or event,
 * such as submitting a form, opening a dialog, canceling an action, or performing a delete operation.
 */
export function Button<C extends ElementType = "button">(props: ButtonProps<C>) {
  const theme = useHopeTheme().components.Button;

  const defaultProps: ExtendableProps<ButtonProps<"button">, Required<ThemeableButtonOptions>> = {
    ...theme.defaultProps,
    as: "button",
    loading: false,
    disabled: false,
    type: "button",
    role: "button",
  };

  const propsWithDefault = mergeProps(defaultProps, props);
  const [local, styleProps, others] = splitProps(
    propsWithDefault,
    [...commonProps, "loader", "loaderPosition", "disabled", "leftIcon", "rightIcon", "children"],
    ["css", "variant", "color", "size", "radius", "loading", "compact", "uppercase", "fullWidth"]
  );

  // Create theme base styles if provided
  const themeBaseStyles = theme.baseStyle && css(theme.baseStyle);

  const classList = () => {
    const baseClass = buttonStyles(styleProps);
    const themeBaseClass = themeBaseStyles?.() ?? ""; // Should be called after to override buttonStyles(), seem css are appened in the order they are called.

    return {
      [baseClass]: true,
      [themeBaseClass]: true,
      [local.class ?? ""]: true,
      [local.className ?? ""]: true,
      ...local.classList,
    };
  };

  const loaderClass = buttonLoadingIconStyles();

  const isLeftIconVisible = () => {
    return local.leftIcon && (!styleProps.loading || local.loaderPosition === "right");
  };

  const isRightIconVisible = () => {
    return local.rightIcon && (!styleProps.loading || local.loaderPosition === "left");
  };

  const isLeftLoaderVisible = () => {
    return styleProps.loading && !local.disabled && local.loaderPosition === "left";
  };

  const isRightLoaderVisible = () => {
    return styleProps.loading && !local.disabled && local.loaderPosition === "right";
  };

  const shouldWrapChildrenInSpan = () => {
    return styleProps.loading || local.leftIcon || local.rightIcon;
  };

  return (
    <Dynamic component={local.as} classList={classList()} disabled={local.disabled} {...others}>
      <Show when={isLeftIconVisible()}>{local.leftIcon}</Show>
      <Show when={isLeftLoaderVisible()}>
        <span className={loaderClass}>{local.loader}</span>
      </Show>
      <Show when={local.children}>
        <Show when={shouldWrapChildrenInSpan()} fallback={local.children}>
          <span>{local.children}</span>
        </Show>
      </Show>
      <Show when={isRightIconVisible()}>{local.rightIcon}</Show>
      <Show when={isRightLoaderVisible()}>
        <span className={loaderClass}>{local.loader}</span>
      </Show>
    </Dynamic>
  );
}
