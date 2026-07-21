import { type CreateDialogContentProps, createDialogContent } from "@hope-ui/primitives/dialog";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { withDefaults } from "@hope-ui/primitives/utils";
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

  // `role` is not threaded here — it lives on `ctx.state` (an a11y concern), and `createDialogContent`
  // reads `state.role()` for the surface's `role` attribute. This layer is pure assembly.
  const content = createDialogContent(
    ctx.state,
    omit(merged, "render", "class", "showCloseButton"),
  );

  // `content.props` already carries `data-presence` (the hook mirrors the shared overlay presence
  // `Dialog.Root`/`createDialog` owns — that's what lets the card animate in). This layer only adds
  // the recipe `class` + the auto CloseTrigger.
  const elementProps = merge(content.props, {
    get class(): string {
      return cx(ctx.slots.content(), merged.class) ?? "";
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
        render: merged.render,
        props: elementProps,
        // `content.setRef` registers the element on the shared state, so the overlay presence can
        // time its exit off the card's transition (and `Dialog.Positioner` rides along) and the
        // focus/dismiss effects can read it. `renderElement` already merges any consumer `ref`.
        ref: content.setRef,
      })}
    </Show>
  );
};
