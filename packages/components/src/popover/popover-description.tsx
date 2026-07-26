import { createPopoverDescription } from "@hope-ui/primitives/popover";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { usePopoverContext } from "./popover-context";

type PopoverDescriptionElementProps = JSX.HTMLAttributes<HTMLParagraphElement>;

export interface PopoverDescriptionProps extends PopoverDescriptionElementProps {
  render?: RenderProp<PopoverDescriptionElementProps>;
}

// Describes the popup: the hook registers this element's `id` as the content's `aria-describedby`.
export const Description: Component<PopoverDescriptionProps> = (props) => {
  const ctx = usePopoverContext();
  const description = createPopoverDescription(ctx.state, omit(props, "render", "class"));

  const elementProps = merge(description.props, {
    get class(): string {
      return ctx.slots.description(props.class);
    },
    "data-slot": "popover-description",
  });

  return renderElement<PopoverDescriptionElementProps, HTMLParagraphElement>({
    as: "p",
    render: props.render,
    props: elementProps,
  });
};
