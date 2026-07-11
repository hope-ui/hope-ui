import { type RenderProp, renderElement, withDefaults } from "@solid-zero/primitives/utils";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";

type ButtonElementProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export interface ButtonProps extends ButtonElementProps {
  /** Renders as a different element/component while keeping Button's computed props. */
  render?: RenderProp<ButtonElementProps>;
  disabled?: boolean;
}

export const Button: Component<ButtonProps> = (props) => {
  // `withDefaults`, not `merge({ type: "button" }, props)`: `merge` resolves by key
  // presence, so `<Button type={props.type}>` with `type` unset would drop `type="button"`
  // entirely and submit the surrounding form. See `withDefaults`' doc.
  const merged = withDefaults(props, { type: "button" as const });
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
