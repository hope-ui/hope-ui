import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { useDialogContext } from "./dialog-context";

export interface DialogPositionerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

// The fixed, full-viewport frame that positions the Content card. Required nesting:
// Portal > Backdrop + Positioner > Content.
//
// It mounts and unmounts on the *Content's* enter/exit state, not one of its own. Two reasons: it is
// `fixed inset-0`, so leaving it mounted while closed would swallow every click on the page; and it
// has no CSS transition of its own, so a self-timed exit would report "done" on the first frame and
// cut the card's exit animation short.
export const Positioner: Component<DialogPositionerProps> = (props) => {
  const ctx = useDialogContext();

  const elementProps = merge(omit(props, "render", "class"), {
    get class(): string {
      return ctx.slots.positioner(props.class);
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
