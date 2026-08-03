import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useDialogContext } from "./dialog-context";

export interface DialogFooterProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

// The action row. The recipe stacks it as a column on narrow viewports and aligns it to the end on
// wider ones, so buttons dropped in here need no responsive classes of their own.
export const Footer: Component<DialogFooterProps> = (props) => {
  const ctx = useDialogContext();
  const rest = omit(props, "render");

  const elementProps = merge(rest, {
    get class(): string {
      return ctx.slots.footer(props.class);
    },
    "data-slot": "dialog-footer",
  });

  return renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
