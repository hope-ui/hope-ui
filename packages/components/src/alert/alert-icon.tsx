import { type RenderProp, renderElement } from "@hope-ui/primitives/utils";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useAlertContext } from "./alert-context";

export interface AlertIconProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLSpanElement>>;
}

export const Icon: Component<AlertIconProps> = (props) => {
  const ctx = useAlertContext();
  const rest = omit(props, "render");

  const elementProps = merge(rest, {
    get class(): string {
      return ctx.slots.icon();
    },
    "data-slot": "alert-icon",
    get "aria-hidden"() {
      // The glyph is decorative by default; a consumer may opt out via `aria-hidden={undefined}`.
      return props["aria-hidden"] ?? "true";
    },
  });

  return renderElement<JSX.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>({
    as: "span",
    render: props.render,
    props: elementProps,
  });
};
