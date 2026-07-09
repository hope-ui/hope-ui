import { type RenderProp, renderElement } from "@solid-zero/core";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";

type ButtonElementProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export interface ButtonProps extends ButtonElementProps {
  /** Renders as a different element/component while keeping Button's computed props. */
  render?: RenderProp<ButtonElementProps>;
  disabled?: boolean;
}

export const Button: Component<ButtonProps> = (props) => {
  const merged = merge({ type: "button" as const }, props);
  const rest = omit(merged, "render", "disabled");

  const elementProps: ButtonElementProps = merge(rest, {
    get disabled() {
      return merged.disabled;
    },
    get "aria-disabled"() {
      return merged.disabled ? ("true" as const) : undefined;
    },
  });

  return renderElement<ButtonElementProps>({
    as: "button",
    render: merged.render,
    props: elementProps,
  });
};
