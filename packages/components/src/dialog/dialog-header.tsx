import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useDialogContext } from "./dialog-context";

export interface DialogHeaderProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

export const Header: Component<DialogHeaderProps> = (props) => {
  const ctx = useDialogContext();
  const rest = omit(props, "render");

  const elementProps = merge(rest, {
    get class(): string {
      return ctx.slots.header(props.class);
    },
    "data-slot": "dialog-header",
  });

  return renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
