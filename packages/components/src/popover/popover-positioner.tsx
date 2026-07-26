import { createPopoverPositioner } from "@hope-ui/primitives/popover";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { usePopoverContext } from "./popover-context";

type PopoverPositionerElementProps = JSX.HTMLAttributes<HTMLDivElement>;

export interface PopoverPositionerProps extends PopoverPositionerElementProps {
  render?: RenderProp<PopoverPositionerElementProps>;
}

// The measured layer: the element `createFloating` positions, wrapping the `Popover.Content` card.
// Required (`Portal > Positioner > Content`), and the split is load-bearing — the card's enter/exit
// `translate`/`scale` would otherwise fight the `translate()` the kernel writes here.
//
// Its `style` comes from the primitive (kernel first, consumer's object merged last — the documented
// escape valve for a `z-index` or a custom pre-positioned `visibility`), so the `positioner` slot
// carries nothing positional. It shares the Content's presence (`ctx.state.contentPresence`, created
// eagerly by `createPopover` and timed off the Content element), so it stays mounted exactly as long
// as the card it frames.
//
// **`dir` reaches this element as an ordinary forwarded attribute** and nothing writes a
// locale-derived one: a portaled layer inherits direction from `document.body`, so there is nothing
// to repair, and stamping `dir="ltr"` from an en-US locale would override the `dir="rtl"` the app
// declared. `createFloating` reads direction off this element's computed style — the same call
// `platform.isRTL` makes — so a consumer's `dir` here is also what resolves a logical `side`.
export const Positioner: Component<PopoverPositionerProps> = (props) => {
  const ctx = usePopoverContext();
  const positioner = createPopoverPositioner(ctx.state, omit(props, "render", "class"));

  // `positioner.props` already carries the kernel `style` and `data-side`/`data-align`/
  // `data-presence`. This layer only adds the recipe `class` + the slot marker.
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
        // The element `createFloating` measures and moves. A render target that drops this function
        // ref leaves the layer unpositioned at 0,0 with no error — see `render.md`.
        ref: positioner.setRef,
      })}
    </Show>
  );
};
