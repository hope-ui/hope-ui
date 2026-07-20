import { createDialogBackdrop } from "@hope-ui/primitives/dialog";
import { type RenderProp, renderElement } from "@hope-ui/primitives/utils";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { useDialogContext } from "./dialog-context";

export interface DialogBackdropProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

// The decorative scrim. `class` is omitted from what the primitive hook receives, then re-set here to
// the recipe's `backdrop` slot merged with any consumer `class` (which wins via tailwind-merge).
export const Backdrop: Component<DialogBackdropProps> = (props) => {
  const ctx = useDialogContext();
  const backdrop = createDialogBackdrop(ctx, omit(props, "render", "class"));

  const elementProps = merge(backdrop.props, {
    get class(): string {
      return cx(ctx.slots.backdrop(), props.class) ?? "";
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
