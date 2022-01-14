import { mergeProps, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ElementType } from "@/components";
import { useHopeTheme } from "@/contexts";
import { IconSpinner } from "@/icons";

import { IconButtonProps } from "./types";

export function IconButton<C extends ElementType = "button">(props: IconButtonProps<C>) {
  const iconButtonTheme = useHopeTheme().components.IconButton;

  const defaultProps: IconButtonProps<"button"> = {
    as: "button",
    variant: iconButtonTheme.variant,
    color: iconButtonTheme.color,
    size: iconButtonTheme.size,
    radius: iconButtonTheme.radius,
    compact: iconButtonTheme.compact,
    loading: false,
    disabled: false,
    type: "button",
    role: "button",
    "aria-label": "",
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
    "compact",
    "loading",
    "disabled",
    "icon",
    "children",
  ]);

  const rootClassList = () => ({
    "h-btn": true,
    "h-btn--icon-button": true,
    "h-btn--compact": local.compact,
    "h-btn--loading": local.loading,
    [`h-btn--variant-${local.variant}`]: true,
    [`h-btn--size-${local.size}`]: true,
    [`h-btn--radius-${local.radius}`]: true,
    [`h-btn--color-${local.color}`]: !local.disabled && local.variant !== "default",
    [local.class || ""]: true,
    [local.className || ""]: true,
    ...local.classList,
  });

  const isLoadingSpinnerVisible = () => {
    return local.loading && !local.disabled;
  };

  return (
    <Dynamic
      component={local.as}
      classList={rootClassList()}
      disabled={local.disabled || local.loading}
      {...others}
    >
      <Show when={isLoadingSpinnerVisible()} fallback={local.icon}>
        <IconSpinner className="h-btn__loading-icon" />
      </Show>
    </Dynamic>
  );
}
