import { createDialogDescription } from "@hope-ui/primitives/dialog";
import { type RenderProp, renderElement } from "@hope-ui/primitives/utils";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useDialogContext } from "./dialog-context";

export interface DialogDescriptionProps extends JSX.HTMLAttributes<HTMLParagraphElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLParagraphElement>>;
}

export const Description: Component<DialogDescriptionProps> = (props) => {
  const ctx = useDialogContext();
  const description = createDialogDescription(ctx, omit(props, "render", "class"));

  const elementProps = merge(description.props, {
    get class(): string {
      return cx(ctx.slots.description(), props.class) ?? "";
    },
    "data-slot": "dialog-description",
  });

  return renderElement<JSX.HTMLAttributes<HTMLParagraphElement>>({
    as: "p",
    render: props.render,
    props: elementProps,
  });
};
