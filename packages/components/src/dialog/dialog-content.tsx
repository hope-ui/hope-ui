import { type CreateDialogContentProps, createDialogContent } from "@hope-ui/primitives/dialog";
import { type RenderProp, renderElement, withDefaults } from "@hope-ui/primitives/utils";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { CloseTrigger } from "./dialog-close-trigger";
import { useDialogContext } from "./dialog-context";

export interface DialogContentProps extends CreateDialogContentProps {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
  /**
   * Auto-render a corner `Dialog.CloseTrigger` before the consumer's children (shadcn's
   * `DialogContent` sugar). Default `true`. Set `false` and place your own `<Dialog.CloseTrigger/>`
   * for full control over its position/label.
   */
  showCloseButton?: boolean;
}

// The dialog surface. `role` is lifted to `Dialog.Root` and threaded here via context — so it wins
// over any consumer `role` on `Content` (which is why the getter is merged last). `class` is set to
// the recipe's `content` slot merged with any consumer `class`.
export const Content: Component<DialogContentProps> = (props) => {
  const ctx = useDialogContext();
  // `withDefaults` (not `merge`): resolves `showCloseButton` with `??`, so a wrapper forwarding an
  // unset `showCloseButton={undefined}` still gets the default. `showCloseButton` is a control prop,
  // omitted from what the hook (and the surface) receives.
  const merged = withDefaults(props, { showCloseButton: true });

  const content = createDialogContent(
    ctx,
    merge(omit(props, "render", "class", "showCloseButton"), {
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
    get children(): JSX.Element {
      // The auto close button precedes the consumer's content. It is a static child gated by a
      // boolean — no `children()` needed (and the whole subtree is client-only, behind the portal +
      // the `mounted()` gate, so no hydration `_hk` is at stake). `Dialog.CloseTrigger` already folds
      // the `closeTrigger` slot into its own `class`, so it needs no explicit class here.
      return (
        <>
          <Show when={merged.showCloseButton}>
            <CloseTrigger />
          </Show>
          {content.props.children}
        </>
      );
    },
  });

  return (
    <Show when={content.mounted()}>
      {renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
        as: "div",
        render: props.render,
        props: elementProps,
        // Publish the element to context (for `Dialog.Positioner`'s exit timing) alongside the
        // primitive's own ref. `renderElement` already merges any consumer `ref`.
        ref: (el) => {
          content.setRef(el);
          ctx.setContentElement(el ?? undefined);
        },
      })}
    </Show>
  );
};
