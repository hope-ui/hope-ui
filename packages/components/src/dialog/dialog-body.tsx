import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useDialogContext } from "./dialog-context";

export interface DialogBodyProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

// The main content region. Takes the slack (`flex-1`) and, under `scrollBehavior="inside"`, gets the
// `overflow-y-auto` so the header/footer stay pinned while the body scrolls (both from the recipe).
export const Body: Component<DialogBodyProps> = (props) => {
  const ctx = useDialogContext();
  const rest = omit(props, "render");

  const elementProps = merge(rest, {
    get class(): string {
      return cx(ctx.slots.body(), props.class) ?? "";
    },
    "data-slot": "dialog-body",
  });

  return renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
