import { type CreatePopoverContentProps, createPopoverContent } from "@hope-ui/primitives/popover";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { usePopoverContext } from "./popover-context";

type PopoverContentElementProps = JSX.HTMLAttributes<HTMLDivElement>;

export interface PopoverContentProps extends CreatePopoverContentProps {
  render?: RenderProp<PopoverContentElementProps>;
}

// The popup card. `createPopoverContent` owns the whole effect stack (focus restore → autofocus →
// dismissal → id registration, in that order), so this file is assembly plus the recipe `class`.
//
// **No auto-rendered close button** — `Popover.CloseTrigger` is opt-in, unlike `Dialog.Content`'s. A
// popover already closes on Escape, an outside click, Tab-ing away, or a second trigger click, and a
// permanent ✕ is chrome most anchored surfaces don't want.
export const Content: Component<PopoverContentProps> = (props) => {
  const ctx = usePopoverContext();
  const content = createPopoverContent(ctx.state, omit(props, "render", "class"));

  // `content.props` already carries `data-presence` ("entering"/"entered"/"exiting" — what the CSS
  // animates on, and what keeps a closing card mounted until its transition ends) plus
  // `data-side`/`data-align`, which the recipe keys its enter-slide direction and scale origin on.
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
        // Registers the element on the shared state: the exit transition is timed off it and the
        // focus/dismiss effects read it. A `render` target that drops this function ref leaves
        // Escape, outside-dismissal and autofocus dead, with no error.
        ref: content.setRef,
      })}
    </Show>
  );
};
