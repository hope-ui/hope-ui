import { JSX, mergeProps, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { UIColor, UISize } from "@/lib/utils/types";

import type { ElementType, PolymorphicComponentProps } from "../types";
import type { UIButtonVariant } from "./types";

type ButtonOptions = {
  variant?: UIButtonVariant;
  color?: UIColor;
  size?: UISize;
  compact?: boolean;
  loading?: boolean;
  disabled?: boolean;
  children?: JSX.Element;
};

export type ButtonProps<C extends ElementType> = PolymorphicComponentProps<C, ButtonOptions>;

const defaultProps: ButtonProps<"button"> = {
  as: "button",
  class: "",
  className: "",
  classList: {},
  variant: "filled",
  color: "primary",
  size: "sm",
  compact: false,
  loading: false,
  disabled: false,
};

export default function Button<C extends ElementType = "button">(props: ButtonProps<C>) {
  const propsWithDefault = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "as",
    "class",
    "classList",
    "className",
    "variant",
    "color",
    "size",
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
    [`btn--${local.color}`]: !local.disabled && local.variant !== "default",
    [local.class || ""]: true,
    [local.className || ""]: true,
    ...local.classList,
  });

  return (
    <Dynamic {...others} component={local.as} classList={rootClassList()}>
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
