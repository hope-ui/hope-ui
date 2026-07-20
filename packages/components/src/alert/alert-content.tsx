import { type RenderProp, renderElement } from "@hope-ui/primitives/utils";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useAlertContext } from "./alert-context";

export interface AlertContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

export const Content: Component<AlertContentProps> = (props) => {
  const ctx = useAlertContext();
  const rest = omit(props, "render");

  const elementProps = merge(rest, {
    get class(): string {
      return ctx.slots.content();
    },
    "data-slot": "alert-content",
  });

  return renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
