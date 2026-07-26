import { createPopoverTitle } from "@hope-ui/primitives/popover";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { usePopoverContext } from "./popover-context";

type PopoverTitleElementProps = JSX.HTMLAttributes<HTMLHeadingElement>;

export interface PopoverTitleProps extends PopoverTitleElementProps {
  render?: RenderProp<PopoverTitleElementProps>;
}

// Labels the popup: the hook registers this element's `id` as the content's `aria-labelledby`. A
// `role="dialog"` surface with no accessible name is an axe `aria-dialog-name` violation, so a
// popover carries either a `Popover.Title` or its own `aria-label` on `Popover.Content`.
export const Title: Component<PopoverTitleProps> = (props) => {
  const ctx = usePopoverContext();
  const title = createPopoverTitle(ctx.state, omit(props, "render", "class"));

  const elementProps = merge(title.props, {
    get class(): string {
      return ctx.slots.title(props.class);
    },
    "data-slot": "popover-title",
  });

  return renderElement<PopoverTitleElementProps, HTMLHeadingElement>({
    as: "h2",
    render: props.render,
    props: elementProps,
  });
};
