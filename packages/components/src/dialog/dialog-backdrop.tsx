import { createDialogBackdrop } from "@hope-ui/primitives/dialog";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { useDialogContext } from "./dialog-context";

export interface DialogBackdropProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

// The visible scrim, and optional — the layer that actually blocks the pointer is rendered by
// `Dialog.Portal` whether or not this part is used.
export const Backdrop: Component<DialogBackdropProps> = (props) => {
  const ctx = useDialogContext();
  const backdrop = createDialogBackdrop(ctx.state, omit(props, "render", "class"));

  const elementProps = merge(backdrop.props, {
    get class(): string {
      return ctx.slots.backdrop(props.class);
    },
    "data-slot": "dialog-backdrop",
  });

  return (
    <Show when={backdrop.mounted()}>
      {renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
        as: "div",
        render: props.render,
        props: elementProps,
        ref: backdrop.setRef,
      })}
    </Show>
  );
};
