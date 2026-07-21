import { createDialogTrigger } from "@hope-ui/primitives/dialog";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import { useDialogContext } from "./dialog-context";

export interface DialogTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  render?: RenderProp<JSX.ButtonHTMLAttributes<HTMLButtonElement>>;
}

// The trigger carries no recipe slot — a consumer usually renders their own `Button` via `render`, so
// the dialog chrome stays on the surface parts. It only wires the primitive's ARIA + open handler.
export const Trigger: Component<DialogTriggerProps> = (props) => {
  const state = useDialogContext();
  const trigger = createDialogTrigger(state, omit(props, "render"));

  return renderElement<JSX.ButtonHTMLAttributes<HTMLButtonElement>>({
    as: "button",
    render: props.render,
    props: trigger.props,
  });
};
