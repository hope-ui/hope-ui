import { mergeProps, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { ElementType } from "@/components";
import { useHopeTheme } from "@/contexts";
import { IconSpinner } from "@/icons";

import type { ButtonProps } from "./types";

export function Button<C extends ElementType = "button">(props: ButtonProps<C>) {
  const buttonTheme = useHopeTheme().components?.Button;

  const defaultProps: ButtonProps<"button"> = {
    as: "button",
    class: "",
    className: "",
    classList: {},
    variant: buttonTheme?.variant ?? "filled",
    color: buttonTheme?.color ?? "primary",
    size: buttonTheme?.size ?? "sm",
    radius: buttonTheme?.radius ?? "sm",
    loaderPosition: buttonTheme?.loaderPosition ?? "left",
    compact: buttonTheme?.compact ?? false,
    uppercase: buttonTheme?.uppercase ?? false,
    loading: false,
    disabled: false,
  };

  const propsWithDefault = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "as",
    "class",
    "className",
    "classList",
    "variant",
    "color",
    "size",
    "radius",
    "loaderPosition",
    "compact",
    "uppercase",
    "loading",
    "disabled",
    "leftIcon",
    "rightIcon",
    "children",
  ]);

  const rootClassList = () => ({
    "h-btn": true,
    "h-btn--compact": local.compact,
    "h-btn--loading": local.loading,
    "h-btn--uppercase": local.uppercase,
    [`h-btn--${local.variant}`]: true,
    [`h-btn--${local.size}`]: true,
    [`h-btn--radius-${local.radius}`]: true,
    [`h-btn--${local.color}`]: !local.disabled && local.variant !== "default",
    [local.class || ""]: true,
    [local.className || ""]: true,
    ...local.classList,
  });

  const loadingSpinnerClassName = "h-btn__loading-icon";

  const isLeftIconVisible = () => {
    return local.leftIcon && (!local.loading || local.loaderPosition === "right");
  };

  const isRightIconVisible = () => {
    return local.rightIcon && (!local.loading || local.loaderPosition === "left");
  };

  const isLoadingSpinnerLeftVisible = () => {
    return local.loading && !local.disabled && local.loaderPosition === "left";
  };

  const isLoadingSpinnerRightVisible = () => {
    return local.loading && !local.disabled && local.loaderPosition === "right";
  };

  const shouldWrapChildrenInSpan = () => {
    return local.leftIcon || local.rightIcon || local.loading;
  };

  return (
    <Dynamic
      component={local.as}
      classList={rootClassList()}
      disabled={local.disabled || local.loading}
      {...others}
    >
      <Show when={isLeftIconVisible()}>{local.leftIcon}</Show>
      <Show when={isLoadingSpinnerLeftVisible()}>
        <IconSpinner className={loadingSpinnerClassName} />
      </Show>
      <Show when={shouldWrapChildrenInSpan()} fallback={local.children}>
        <span>{local.children}</span>
      </Show>
      <Show when={isRightIconVisible()}>{local.rightIcon}</Show>
      <Show when={isLoadingSpinnerRightVisible()}>
        <IconSpinner className={loadingSpinnerClassName} />
      </Show>
    </Dynamic>
  );
}
