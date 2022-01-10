import { JSX, mergeProps, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { useTheme } from "@/lib/contexts/HopeContext";
import type { SemanticColor, SemanticSize } from "@/lib/theme/theme";
import type { ElementType, PolymorphicComponentProps } from "@/lib/utils/types";

export type ButtonVariant = "filled" | "light" | "outline" | "dashed" | "text" | "default";

export type ThemableButtonOptions = {
  variant?: ButtonVariant;
  color?: SemanticColor;
  size?: SemanticSize;
  radius?: SemanticSize | "none" | "full";
  compact?: boolean;
};

export type ButtonOptions = ThemableButtonOptions & {
  loading?: boolean;
  disabled?: boolean;
  children?: JSX.Element;
};

export type ButtonProps<C extends ElementType> = PolymorphicComponentProps<C, ButtonOptions>;

export default function Button<C extends ElementType = "button">(props: ButtonProps<C>) {
  const buttonTheme = useTheme().components?.Button;

  const defaultProps: ButtonProps<"button"> = {
    as: "button",
    class: "",
    className: "",
    classList: {},
    variant: buttonTheme?.variant ?? "filled",
    color: buttonTheme?.color ?? "primary",
    size: buttonTheme?.size ?? "sm",
    radius: buttonTheme?.radius ?? "sm",
    compact: buttonTheme?.compact ?? false,
    loading: false,
    disabled: false,
  };

  const propsWithDefault = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "as",
    "class",
    "classList",
    "className",
    "variant",
    "color",
    "size",
    "radius",
    "compact",
    "loading",
    "children",
    "disabled",
  ]);

  const rootClassList = () => ({
    btn: true,
    "btn--compact": local.compact,
    "btn--loading": local.loading,
    [`btn--${local.variant}`]: true,
    [`btn--${local.size}`]: true,
    [`btn--radius-${local.radius}`]: true,
    [`btn--${local.color}`]: !local.disabled && local.variant !== "default",
    [local.class || ""]: true,
    [local.className || ""]: true,
    ...local.classList,
  });

  return (
    <Dynamic {...others} component={local.as} classList={rootClassList()} disabled={local.disabled}>
      <div
        classList={{
          btn__content: true,
          "btn__content--hidden": local.loading && !local.disabled,
        }}
      >
        {local.children}
      </div>
      <Show when={local.loading && !local.disabled}>
        <div className="btn__loading-content">Loading</div>
      </Show>
    </Dynamic>
  );
}
