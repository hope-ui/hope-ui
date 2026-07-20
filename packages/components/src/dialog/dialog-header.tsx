import { type RenderProp, renderElement } from "@hope-ui/primitives/utils";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useDialogContext } from "./dialog-context";

export interface DialogHeaderProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

// A plain layout container for the title/description (mirrors `alert-content.tsx`). No behavior — just
// the recipe's `header` slot merged with any consumer `class`, and a `data-slot` marker.
export const Header: Component<DialogHeaderProps> = (props) => {
  const ctx = useDialogContext();
  const rest = omit(props, "render");

  const elementProps = merge(rest, {
    get class(): string {
      return cx(ctx.slots.header(), props.class) ?? "";
    },
    "data-slot": "dialog-header",
  });

  return renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
