import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, omit, Show } from "solid-js";
import { useZagDialogContext } from "./zag-dialog-context";
import { mergePartProps } from "./zag-dialog-merge-props";

export interface ZagDialogPositionerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

/**
 * The fixed, full-viewport frame that centers/positions the Content card, and — while modal — the
 * layer Zag re-enables pointer events on, so an outside click lands here and dismisses.
 *
 * It shares the Content's presence rather than owning one: the Positioner has no transition of its
 * own, so a self-timed presence would report exit-done immediately and cut the card's exit
 * animation short. Zag's inline `pointer-events` style rides along beside the recipe class — the
 * adapter's `mergeProps` composes `style` across sources instead of letting the last one win.
 */
export const Positioner: Component<ZagDialogPositionerProps> = (props) => {
  const ctx = useZagDialogContext();
  const rest = omit(props, "render", "class", "id");

  const elementProps = mergePartProps(
    () => ctx.api().getPositionerProps(),
    () => rest,
    {
      get class(): string {
        return cx(ctx.slots.positioner(), props.class) ?? "";
      },
      "data-slot": "zag-dialog-positioner",
      get "data-presence"(): string {
        return ctx.contentPresence.status();
      },
    },
  );

  return (
    <Show when={ctx.contentPresence.mounted()}>
      {renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
        as: "div",
        render: props.render,
        props: elementProps,
      })}
    </Show>
  );
};
