import { createPopoverTrigger } from "@hope-ui/primitives/popover";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import { usePopoverContext } from "./popover-context";

type PopoverTriggerElementProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export interface PopoverTriggerProps extends PopoverTriggerElementProps {
  render?: RenderProp<PopoverTriggerElementProps>;
}

// The trigger carries no recipe slot — a consumer usually renders their own `Button` through
// `render`, so the popover's chrome stays on the surface parts. `class` is therefore **forwarded
// untouched**, which is why it is not omitted below.
//
// Unlike `Dialog.Trigger`, this one registers its element, for two reasons: it is the default anchor
// the layer positions against, and it is the one element outside-click dismissal must not count as
// "outside". Without that exclusion an open popover could never be closed by its own trigger — the
// capture-phase pointerdown would dismiss it and the click would immediately reopen it.
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
