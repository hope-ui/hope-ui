import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { useDialogContext } from "./dialog-context";

export interface DialogPositionerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

// The fixed, full-viewport scroll container that centers/positions the Content card. Required wrapper:
// Portal > Backdrop + Positioner > Content. Because it is `fixed inset-0`, it unmounts when closed (an
// empty full-viewport wrapper would block the page). It shares the Content's presence
// (`ctx.state.contentPresence`, owned by `createDialog` and timed off the Content element), NOT its
// own — the Positioner has no transition of its own, so a self-timed presence would report exit-done
// immediately and cut the Content's exit animation short. Sharing it also keeps the frame mounted
// exactly as long as the card, and is what lets that card animate in (see `dialog-context.ts`).
export const Positioner: Component<DialogPositionerProps> = (props) => {
  const ctx = useDialogContext();

  const elementProps = merge(omit(props, "render", "class"), {
    get class(): string {
      return cx(ctx.slots.positioner(), props.class) ?? "";
    },
    "data-slot": "dialog-positioner",
    get "data-presence"(): string {
      return ctx.state.contentPresence.status();
    },
  });

  return (
    <Show when={ctx.state.contentPresence.mounted()}>
      {renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
        as: "div",
        render: props.render,
        props: elementProps,
      })}
    </Show>
  );
};
