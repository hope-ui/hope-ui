import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useAlertContext } from "./alert-context";

export interface AlertIconProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLSpanElement>>;
}

export const Icon: Component<AlertIconProps> = (props) => {
  const ctx = useAlertContext();
  const rest = omit(props, "render", "class");

  const elementProps = merge(rest, {
    get class(): string {
      return ctx.slots.icon(props.class);
    },
    "data-slot": "alert-icon",
    get "aria-hidden"() {
      // Decorative by default — the alert's text carries the meaning. A consumer who renders a
      // meaningful glyph opts out with `aria-hidden={undefined}`.
      return props["aria-hidden"] ?? "true";
    },
  });

  return renderElement<JSX.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>({
    as: "span",
    render: props.render,
    props: elementProps,
  });
};
