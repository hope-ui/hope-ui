import { type CreatePopoverContentProps, createPopoverContent } from "@hope-ui/primitives/popover";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { usePopoverContext } from "./popover-context";

type PopoverContentElementProps = JSX.HTMLAttributes<HTMLDivElement>;

export interface PopoverContentProps extends CreatePopoverContentProps {
  render?: RenderProp<PopoverContentElementProps>;
}

// The popup card, and the behavior hub: the primitive's content hook owns the whole effect stack
// (focus restore → autofocus → dismissal → id registration, in that order). `role` is lifted to
// `Popover.Root` and threaded here via context, so this layer is pure assembly + the recipe `class`.
//
// It carries **no auto-rendered close button** — `Popover.CloseTrigger` is opt-in. A popover is
// dismissed by Escape, by clicking outside, by Tab-ing away, or by clicking its trigger again; a
// permanent ✕ on a small anchored surface is chrome most popovers don't want. It also keeps this part
// free of a component-valued prop, so the `children()` audit is trivially satisfied.
export const Content: Component<PopoverContentProps> = (props) => {
  const ctx = usePopoverContext();
  const content = createPopoverContent(ctx.state, omit(props, "render", "class"));

  // `content.props` already carries `data-presence` (the hook mirrors the shared overlay presence
  // `Popover.Root`/`createPopover` owns — that's what lets the card animate in) plus
  // `data-side`/`data-align`, which the recipe keys its directional enter-slide and scale origin on.
  const elementProps = merge(content.props, {
    get class(): string {
      return ctx.slots.content(props.class);
    },
    "data-slot": "popover-content",
  });

  return (
    <Show when={content.mounted()}>
      {renderElement<PopoverContentElementProps, HTMLDivElement>({
        as: "div",
        render: props.render,
        props: elementProps,
        // `content.setRef` registers the element on the shared state: the presence times its exit
        // transition off it, and the focus/dismiss effects read it. A render target that drops this
        // function ref leaves Escape, outside-dismissal and autofocus all dead, silently.
        ref: content.setRef,
      })}
    </Show>
  );
};
