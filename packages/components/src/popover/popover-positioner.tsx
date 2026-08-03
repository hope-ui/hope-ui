import { createPopoverPositioner } from "@hope-ui/primitives/popover";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { usePopoverContext } from "./popover-context";

type PopoverPositionerElementProps = JSX.HTMLAttributes<HTMLDivElement>;

export interface PopoverPositionerProps extends PopoverPositionerElementProps {
  render?: RenderProp<PopoverPositionerElementProps>;
}

// The measured layer: the element floating-ui positions, wrapping the `Popover.Content` card. The
// nesting `Portal > Positioner > Content` is required, and the split is load-bearing — the card's
// enter/exit `translate`/`scale` would otherwise fight the `translate()` written here.
//
// Its `style` comes from the primitive (positioning first, the consumer's object merged last — the
// documented escape valve for a `z-index`), so the `positioner` slot carries nothing positional. It
// shares the Content's mount/unmount animation state, so it stays mounted exactly as long as the
// card it frames.
//
// **`dir` reaches this element only as an ordinary forwarded attribute**; nothing writes a
// locale-derived one. A portaled layer inherits direction from `document.body`, so there is nothing
// to repair, and stamping `dir="ltr"` from an en-US locale would override the `dir="rtl"` the app
// declared. floating-ui reads direction off this element's computed style, so a consumer's `dir`
// here is also what resolves a logical `side` (`inline-start`/`inline-end`).
export const Positioner: Component<PopoverPositionerProps> = (props) => {
  const ctx = usePopoverContext();
  const positioner = createPopoverPositioner(ctx.state, omit(props, "render", "class"));

  const elementProps = merge(positioner.props, {
    get class(): string {
      return ctx.slots.positioner(props.class);
    },
    "data-slot": "popover-positioner",
  });

  return (
    <Show when={positioner.mounted()}>
      {renderElement<PopoverPositionerElementProps, HTMLDivElement>({
        as: "div",
        render: props.render,
        props: elementProps,
        // The element floating-ui measures and moves. A `render` target that drops this function ref
        // leaves the layer parked at 0,0 with no error.
        ref: positioner.setRef,
      })}
    </Show>
  );
};
