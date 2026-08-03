import { createDialogTrigger } from "@hope-ui/primitives/dialog";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import { useDialogContext } from "./dialog-context";

export interface DialogTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  render?: RenderProp<JSX.ButtonHTMLAttributes<HTMLButtonElement>>;
}

// Deliberately unstyled: the dialog's own look belongs to the surface parts, and a consumer normally
// swaps in their own `Button` through `render`. This part only wires up the ARIA and the open click.
export const Trigger: Component<DialogTriggerProps> = (props) => {
  const ctx = useDialogContext();
  const trigger = createDialogTrigger(ctx.state, omit(props, "render"));

  return renderElement<JSX.ButtonHTMLAttributes<HTMLButtonElement>>({
    as: "button",
    render: props.render,
    props: trigger.props,
  });
};
