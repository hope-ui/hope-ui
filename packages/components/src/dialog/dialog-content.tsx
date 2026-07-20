import { type CreateDialogContentProps, createDialogContent } from "@hope-ui/primitives/dialog";
import { type RenderProp, renderElement } from "@hope-ui/primitives/utils";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { useDialogContext } from "./dialog-context";

export interface DialogContentProps extends CreateDialogContentProps {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

// The dialog surface. `role` is lifted to `Dialog.Root` and threaded here via context — so it wins
// over any consumer `role` on `Content` (which is why the getter is merged last). `class` is set to
// the recipe's `content` slot merged with any consumer `class`.
export const Content: Component<DialogContentProps> = (props) => {
  const ctx = useDialogContext();

  const content = createDialogContent(
    ctx,
    merge(omit(props, "render", "class"), {
      get role() {
        return ctx.role();
      },
    }),
  );

  const elementProps = merge(content.props, {
    get class(): string {
      return cx(ctx.slots.content(), props.class) ?? "";
    },
    "data-slot": "dialog-content",
  });

  return (
    <Show when={content.mounted()}>
      {renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
        as: "div",
        render: props.render,
        props: elementProps,
        ref: content.setRef,
      })}
    </Show>
  );
};
