import { type CreateDialogContentProps, createDialogContent } from "@hope-ui/primitives/dialog";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { withDefaults } from "@hope-ui/primitives/utils";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { CloseTrigger } from "./dialog-close-trigger";
import { useDialogContext } from "./dialog-context";

export interface DialogContentProps extends CreateDialogContentProps {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
  /**
   * Auto-render a corner `Dialog.CloseTrigger` before the children. Default `true`. Set it `false`
   * and place your own `<Dialog.CloseTrigger/>` to control its position and label.
   */
  showCloseButton?: boolean;
}

// The dialog surface. `role` is an accessibility concern, so it is owned by the shared state created
// on `Dialog.Root` rather than by this part; `createDialogContent` reads it from there and its props
// are merged last, which is what makes it beat a `role` written on `Content`.
export const Content: Component<DialogContentProps> = (props) => {
  const ctx = useDialogContext();
  // `withDefaults` resolves each key with `??`; Solid's `merge` resolves by key *presence*, so a
  // wrapper forwarding `showCloseButton={undefined}` would lose the default under `merge`.
  const merged = withDefaults(props, { showCloseButton: true });

  const content = createDialogContent(
    ctx.state,
    omit(merged, "render", "class", "showCloseButton"),
  );

  // `content.props` already carries `data-presence` — the entering/entered/exiting status the shared
  // mount-and-animate state publishes, which the recipe's transition classes select on. This layer
  // adds only the recipe class and the auto close button.
  const elementProps = merge(content.props, {
    get class(): string {
      return ctx.slots.content(merged.class);
    },
    "data-slot": "dialog-content",
    get children(): JSX.Element {
      // A static child behind a boolean gate, so it needs no `children()` resolution (that is only
      // for a component arriving through a prop and read more than once), and the subtree is
      // client-only — behind the portal and the `mounted()` gate — so no server/client node matching
      // is at stake. `Dialog.CloseTrigger` folds the `closeTrigger` slot into its own `class`.
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
        // Publishing the element on the shared state is what lets the exit be timed off the card's
        // own CSS transition, and what the focus/dismiss effects read. `renderElement` collapses
        // this and any consumer `ref` into one, so passing it here does not shadow theirs.
        ref: content.setRef,
      })}
    </Show>
  );
};
