import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useZagDialogContext } from "./zag-dialog-context";

export interface ZagDialogHeaderProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

// A plain layout container for the title/description. Zag has no equivalent part, so this is a
// verbatim copy of `dialog-header.tsx` — no machine involvement, just the recipe's `header` slot
// merged with any consumer `class`, and a `data-slot` marker.
export const Header: Component<ZagDialogHeaderProps> = (props) => {
  const ctx = useZagDialogContext();
  const rest = omit(props, "render");

  const elementProps = merge(rest, {
    get class(): string {
      return cx(ctx.slots.header(), props.class) ?? "";
    },
    "data-slot": "zag-dialog-header",
  });

  return renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
