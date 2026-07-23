import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useZagDialogContext } from "./zag-dialog-context";

export interface ZagDialogBodyProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

// The main content region. Takes the slack (`flex-1`) and, under `scrollBehavior="inside"`, gets the
// `overflow-y-auto` so the header/footer stay pinned while the body scrolls (both from the recipe).
// Zag has no equivalent part — a verbatim copy of `dialog-body.tsx`.
export const Body: Component<ZagDialogBodyProps> = (props) => {
  const ctx = useZagDialogContext();
  const rest = omit(props, "render");

  const elementProps = merge(rest, {
    get class(): string {
      return cx(ctx.slots.body(), props.class) ?? "";
    },
    "data-slot": "zag-dialog-body",
  });

  return renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
