import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { usePopoverContext } from "./popover-context";

type PopoverHeaderElementProps = JSX.HTMLAttributes<HTMLDivElement>;

export interface PopoverHeaderProps extends PopoverHeaderElementProps {
  render?: RenderProp<PopoverHeaderElementProps>;
}

// An optional layout container for the title/description. No behavior and no ARIA — and so no
// primitive hook: `Popover.Title`/`Popover.Description` register their own ids with the content
// wherever they sit, so wrapping them here changes nothing but the spacing.
export const Header: Component<PopoverHeaderProps> = (props) => {
  const ctx = usePopoverContext();
  const rest = omit(props, "render");

  const elementProps = merge(rest, {
    get class(): string {
      return ctx.slots.header(props.class);
    },
    "data-slot": "popover-header",
  });

  return renderElement<PopoverHeaderElementProps, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
