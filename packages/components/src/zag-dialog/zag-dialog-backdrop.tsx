import { createPresence } from "@hope-ui/primitives/internal";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, createSignal, omit, Show } from "solid-js";
import { useZagDialogContext } from "./zag-dialog-context";
import { mergePartProps } from "./zag-dialog-merge-props";

export interface ZagDialogBackdropProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

/**
 * The decorative scrim. Mounted eagerly (the Portal renders it as soon as it exists), so it owns
 * its own `createPresence` rather than sharing the Content's — the same split the handmade Dialog
 * and Ark both make.
 *
 * Zag's `hidden` is dropped. `[hidden] { display: none }` is a UA rule an explicit `display` beats,
 * and every hope dialog slot sets one (`positioner` is `fixed inset-0 flex`, `content` is
 * `flex flex-col`), so a `hidden` part would stay painted and a closed dialog would leave a
 * full-viewport layer over the page. Presence gates the render instead.
 */
export const Backdrop: Component<ZagDialogBackdropProps> = (props) => {
  const ctx = useZagDialogContext();
  const rest = omit(props, "render", "class", "id");

  const [ref, setRef] = createSignal<HTMLDivElement>();
  const presence = createPresence({ present: () => ctx.api().open, ref });

  const elementProps = mergePartProps(
    () => omit(ctx.api().getBackdropProps(), "hidden"),
    () => rest,
    {
      get class(): string {
        return cx(ctx.slots.backdrop(), props.class) ?? "";
      },
      "data-slot": "zag-dialog-backdrop",
      get "data-presence"(): string {
        return presence.status();
      },
    },
  );

  return (
    <Show when={presence.mounted()}>
      {renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
        as: "div",
        render: props.render,
        props: elementProps,
        ref: setRef,
      })}
    </Show>
  );
};
