import { createPopoverArrow } from "@hope-ui/primitives/popover";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { usePopoverContext } from "./popover-context";

type PopoverArrowElementProps = JSX.HTMLAttributes<HTMLDivElement>;

export interface PopoverArrowProps extends PopoverArrowElementProps {
  render?: RenderProp<PopoverArrowElementProps>;
}

// The little square that points back at the anchor. Goes **inside `Popover.Content`**, whose
// `relative` is what its absolute pin resolves against.
//
// **Rendered unconditionally, never gated on a measurement.** No element means floating-ui gets no
// arrow element, so its `arrow` middleware never runs and the measurement never arrives — a deadlock,
// not a slow start. A late ref is fine; the config re-reads it.
//
// The primitive contributes measurements only (`left`/`top` and the pin offset, as inline style).
// The box size, the 45° rotation and the fill belong to the recipe's `arrow` slot — including
// `--popover-arrow-size`, which that slot both declares and sizes itself from, so the value the pin's
// `calc()` reads cannot drift from the painted box.
export const Arrow: Component<PopoverArrowProps> = (props) => {
  const ctx = usePopoverContext();
  const arrow = createPopoverArrow(ctx.state, omit(props, "render", "class"));

  const elementProps = merge(arrow.props, {
    get class(): string {
      return ctx.slots.arrow(props.class);
    },
    "data-slot": "popover-arrow",
  });

  return renderElement<PopoverArrowElementProps, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: elementProps,
    // Registering the element is what enables floating-ui's `arrow` middleware — so a `render` target
    // that drops this function ref leaves the arrow permanently unmeasured (and, under the recipe's
    // `data-uncentered:invisible`, permanently invisible).
    ref: arrow.setRef,
  });
};
