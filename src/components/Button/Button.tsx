import { Component, JSX, mergeProps, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { useHopeTheme } from "@/contexts/HopeContext";
import { HopeXPosition } from "@/theme/types";

import { ElementType, ExtendableProps, PolymorphicComponentProps } from "../types";
import { commonProps } from "../utils";
import { buttonLoadingIconStyles, buttonStyles, ButtonVariants } from "./Button.styles";

export type ButtonOptions = ButtonVariants & {
  disabled?: boolean;
  loader?: Component | JSX.Element;
  loaderPosition?: HopeXPosition;
  leftIcon?: Component | JSX.Element;
  rightIcon?: Component | JSX.Element;
};

export type ThemeableButtonOptions = Omit<
  ButtonOptions,
  "loading" | "disabled" | "leftIcon" | "rightIcon"
>;

export type ButtonProps<C extends ElementType> = PolymorphicComponentProps<C, ButtonOptions>;

/**
 * The Button component is used to trigger an action or event,
 * such as submitting a form, opening a dialog, canceling an action, or performing a delete operation.
 */
export function Button<C extends ElementType = "button">(props: ButtonProps<C>) {
  const theme = useHopeTheme().components.Button;

  const defaultProps: ExtendableProps<ButtonProps<"button">, Required<ThemeableButtonOptions>> = {
    as: "button",
    variant: theme.variant,
    color: theme.color,
    size: theme.size,
    radius: theme.radius,
    loader: theme.loader,
    loaderPosition: theme.loaderPosition,
    compact: theme.compact,
    uppercase: theme.uppercase,
    fullWidth: theme.fullWidth,
    loading: false,
    disabled: false,
    type: "button",
    role: "button",
  };

  const propsWithDefault = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    ...commonProps,
    "variant",
    "color",
    "size",
    "radius",
    "compact",
    "uppercase",
    "fullWidth",
    "loading",
    "loader",
    "loaderPosition",
    "disabled",
    "leftIcon",
    "rightIcon",
    "children",
  ]);

  const classList = () => {
    const buttonClass = buttonStyles({
      variant: local.variant,
      color: local.color,
      size: local.size,
      radius: local.radius,
      loading: local.loading,
      compact: local.compact,
      uppercase: local.uppercase,
      fullWidth: local.fullWidth,
      css: local.css,
    });

    return {
      [buttonClass]: true,
      [local.class ?? ""]: true,
      [local.className ?? ""]: true,
      ...local.classList,
    };
  };

  const isLeftIconVisible = () => {
    return local.leftIcon && (!local.loading || local.loaderPosition === "right");
  };

  const isRightIconVisible = () => {
    return local.rightIcon && (!local.loading || local.loaderPosition === "left");
  };

  const isLeftLoaderVisible = () => {
    return local.loading && !local.disabled && local.loaderPosition === "left";
  };

  const isRightLoaderVisible = () => {
    return local.loading && !local.disabled && local.loaderPosition === "right";
  };

  const shouldWrapChildrenInSpan = () => {
    return local.leftIcon || local.rightIcon || local.loading;
  };

  return (
    <Dynamic component={local.as} classList={classList()} disabled={local.disabled} {...others}>
      <Show when={isLeftIconVisible()}>{local.leftIcon}</Show>
      <Show when={isLeftLoaderVisible()}>
        <span className={buttonLoadingIconStyles()}>{local.loader}</span>
      </Show>
      <Show when={local.children}>
        <Show when={shouldWrapChildrenInSpan()} fallback={local.children}>
          <span>{local.children}</span>
        </Show>
      </Show>
      <Show when={isRightIconVisible()}>{local.rightIcon}</Show>
      <Show when={isRightLoaderVisible()}>
        <span className={buttonLoadingIconStyles()}>{local.loader}</span>
      </Show>
    </Dynamic>
  );
}
