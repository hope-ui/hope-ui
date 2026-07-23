import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useZagDialogContext } from "./zag-dialog-context";

export interface ZagDialogFooterProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

// The action row: a sunken bar pulled into the card's padding with a top hairline (the recipe's
// `footer` slot). Zag has no equivalent part — a verbatim copy of `dialog-footer.tsx`.
export const Footer: Component<ZagDialogFooterProps> = (props) => {
  const ctx = useZagDialogContext();
  const rest = omit(props, "render");

  const elementProps = merge(rest, {
    get class(): string {
      return cx(ctx.slots.footer(), props.class) ?? "";
    },
    "data-slot": "zag-dialog-footer",
  });

  return renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
