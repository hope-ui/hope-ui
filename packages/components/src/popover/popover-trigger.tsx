import { createPopoverTrigger } from "@hope-ui/primitives/popover";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import { usePopoverContext } from "./popover-context";

type PopoverTriggerElementProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export interface PopoverTriggerProps extends PopoverTriggerElementProps {
  render?: RenderProp<PopoverTriggerElementProps>;
}

// The trigger carries no recipe slot — a consumer usually renders their own `Button` via `render`, so
// the popover chrome stays on the surface parts. `class` is therefore **forwarded untouched** (it
// rides the primitive's prop passthrough, never a slot fn), which is why it is not omitted below.
//
// It wires the primitive's ARIA + the **toggle** handler, and — unlike `Dialog.Trigger` — registers
// its element: the trigger is the default anchor the layer positions against, and the one element
// dismissal must not treat as outside (without which clicking an open popover's trigger could never
// close it — the capture-phase pointerdown would dismiss and the click would reopen).
export const Trigger: Component<PopoverTriggerProps> = (props) => {
  const ctx = usePopoverContext();
  const trigger = createPopoverTrigger(ctx.state, omit(props, "render"));

  return renderElement<PopoverTriggerElementProps, HTMLButtonElement>({
    as: "button",
    render: props.render,
    props: trigger.props,
    ref: trigger.setRef,
  });
};
