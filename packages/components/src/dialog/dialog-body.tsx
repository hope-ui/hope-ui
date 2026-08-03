import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useDialogContext } from "./dialog-context";

export interface DialogBodyProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

// Under `scrollBehavior="inside"` this is the element the recipe makes scrollable, which is what
// keeps the header and footer pinned while long content moves between them.
export const Body: Component<DialogBodyProps> = (props) => {
  const ctx = useDialogContext();
  const rest = omit(props, "render");

  const elementProps = merge(rest, {
    get class(): string {
      return ctx.slots.body(props.class);
    },
    "data-slot": "dialog-body",
  });

  return renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
