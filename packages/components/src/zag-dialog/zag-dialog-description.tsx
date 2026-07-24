import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { mergeProps } from "@hope-ui/primitives/zag-solid";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import { useZagDialogContext } from "./zag-dialog-context";

export interface ZagDialogDescriptionProps extends JSX.HTMLAttributes<HTMLParagraphElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLParagraphElement>>;
}

export const Description: Component<ZagDialogDescriptionProps> = (props) => {
  const ctx = useZagDialogContext();
  const rest = omit(props, "render", "class", "id");

  const elementProps = mergeProps(
    () => ctx.api().getDescriptionProps(),
    () => rest,
    {
      get class(): string {
        return cx(ctx.slots.description(), props.class) ?? "";
      },
      "data-slot": "zag-dialog-description",
    },
  );

  return renderElement<JSX.HTMLAttributes<HTMLParagraphElement>>({
    as: "p",
    render: props.render,
    props: elementProps,
  });
};
