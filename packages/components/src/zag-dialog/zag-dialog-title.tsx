import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import { useZagDialogContext } from "./zag-dialog-context";
import { mergePartProps } from "./zag-dialog-merge-props";

export interface ZagDialogTitleProps extends JSX.HTMLAttributes<HTMLHeadingElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLHeadingElement>>;
}

/**
 * Labels the dialog. It registers nothing: Zag hands out a fixed `dialog:<id>:title` id and the
 * machine decides whether to *use* it by querying the DOM for that element one frame after open
 * (`checkRenderedElements`), so the link is DOM-sniffed rather than registered.
 */
export const Title: Component<ZagDialogTitleProps> = (props) => {
  const ctx = useZagDialogContext();
  const rest = omit(props, "render", "class", "id");

  const elementProps = mergePartProps(
    () => ctx.api().getTitleProps(),
    () => rest,
    {
      get class(): string {
        return cx(ctx.slots.title(), props.class) ?? "";
      },
      "data-slot": "zag-dialog-title",
    },
  );

  return renderElement<JSX.HTMLAttributes<HTMLHeadingElement>>({
    as: "h2",
    render: props.render,
    props: elementProps,
  });
};
