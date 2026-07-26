import { createPopoverAnchor } from "@hope-ui/primitives/popover";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import { usePopoverContext } from "./popover-context";

type PopoverAnchorElementProps = JSX.HTMLAttributes<HTMLDivElement>;

export interface PopoverAnchorProps extends PopoverAnchorElementProps {
  render?: RenderProp<PopoverAnchorElementProps>;
}

// Positions the layer against something other than its trigger — a card, a table row, a whole
// section — while the trigger keeps owning the toggle and the ARIA. Opt-in: with no `Popover.Anchor`
// mounted, the trigger is the anchor.
//
// A bare wrapper: no recipe slot (so `class` is forwarded untouched), no ARIA, no `data-*` — a
// positioning reference is not a control, which is also why it is deliberately not dismiss-excluded.
// Usually worn by an element that already exists, via `render`.
export const Anchor: Component<PopoverAnchorProps> = (props) => {
  const ctx = usePopoverContext();
  const anchor = createPopoverAnchor(ctx.state, omit(props, "render"));

  return renderElement<PopoverAnchorElementProps, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: anchor.props,
    // Registering the element is what outranks the trigger; the hook's `unregister` on unmount is
    // what hands positioning back to it.
    ref: anchor.setRef,
  });
};
