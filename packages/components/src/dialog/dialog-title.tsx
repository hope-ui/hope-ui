import { createDialogTitle } from "@hope-ui/primitives/dialog";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useDialogContext } from "./dialog-context";

export interface DialogTitleProps extends JSX.HTMLAttributes<HTMLHeadingElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLHeadingElement>>;
}

export const Title: Component<DialogTitleProps> = (props) => {
  const ctx = useDialogContext();
  const title = createDialogTitle(ctx, omit(props, "render", "class"));

  const elementProps = merge(title.props, {
    get class(): string {
      return cx(ctx.slots.title(), props.class) ?? "";
    },
    "data-slot": "dialog-title",
  });

  return renderElement<JSX.HTMLAttributes<HTMLHeadingElement>>({
    as: "h2",
    render: props.render,
    props: elementProps,
  });
};
