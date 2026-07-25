import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useAlertContext } from "./alert-context";

export interface AlertActionsProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

export const Actions: Component<AlertActionsProps> = (props) => {
  const ctx = useAlertContext();
  const rest = omit(props, "render", "class");

  const elementProps = merge(rest, {
    get class(): string {
      return ctx.slots.actions(props.class);
    },
    "data-slot": "alert-actions",
  });

  return renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
