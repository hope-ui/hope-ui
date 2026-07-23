import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { withDefaults } from "@hope-ui/primitives/utils";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, omit, Show } from "solid-js";
import { CloseTrigger } from "./zag-dialog-close-trigger";
import { useZagDialogContext } from "./zag-dialog-context";
import { mergePartProps } from "./zag-dialog-merge-props";

export interface ZagDialogContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
  /**
   * Auto-render a corner `ZagDialog.CloseTrigger` before the consumer's children. Default `true`.
   * Set `false` and place your own for full control over its position/label.
   */
  showCloseButton?: boolean;
}

/**
 * The dialog surface. Everything behavioral — `role`, `aria-modal`, the labelling IDREFs, the focus
 * trap, the dismiss layer, the scroll lock, the `aria-hidden` blanket — comes from the machine's
 * `getContentProps()` and the effects its `open` state runs, so this layer is pure assembly plus
 * the recipe `class` and the auto CloseTrigger.
 *
 * Zag's `hidden` is dropped for the reason spelled out in `zag-dialog-backdrop.tsx`; the shared
 * presence gates the render and supplies `data-presence`. The element is registered on context so
 * that presence can time its exit off the card's own transition.
 */
export const Content: Component<ZagDialogContentProps> = (props) => {
  const ctx = useZagDialogContext();
  // `withDefaults` (not `merge`): resolves `showCloseButton` with `??`, so a wrapper forwarding an
  // unset `showCloseButton={undefined}` still gets the default.
  const merged = withDefaults(props, { showCloseButton: true });
  const rest = omit(merged, "render", "class", "showCloseButton", "id");

  const elementProps = mergePartProps(
    () => omit(ctx.api().getContentProps(), "hidden"),
    () => rest,
    {
      get class(): string {
        return cx(ctx.slots.content(), merged.class) ?? "";
      },
      "data-slot": "zag-dialog-content",
      get "data-presence"(): string {
        return ctx.contentPresence.status();
      },
      get children(): JSX.Element {
        // The auto close button precedes the consumer's content. It is a static child gated by a
        // boolean — no `children()` needed (and the whole subtree is client-only, behind the portal
        // + the `mounted()` gate, so no hydration `_hk` is at stake).
        return (
          <>
            <Show when={merged.showCloseButton}>
              <CloseTrigger />
            </Show>
            {merged.children}
          </>
        );
      },
    },
  );

  return (
    <Show when={ctx.contentPresence.mounted()}>
      {renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
        as: "div",
        render: merged.render,
        props: elementProps,
        ref: ctx.setContentElement,
      })}
    </Show>
  );
};
