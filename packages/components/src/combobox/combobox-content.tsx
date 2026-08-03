import { createComboboxContent } from "@hope-ui/primitives/combobox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { useComboboxContext } from "./combobox-context";

type ComboboxContentElementProps = JSX.HTMLAttributes<HTMLDivElement>;

export interface ComboboxContentProps extends ComboboxContentElementProps {
  /** Renders as a different element/component while keeping Content's computed props. */
  render?: RenderProp<ComboboxContentElementProps>;
}

// The popup card, and the behavior hub: `createComboboxContent` owns the whole effect stack —
// close-on-outside-click/Escape, and (under `modal`, which `Combobox.Root` defaults to `false`)
// marking the rest of the page `inert` plus locking body scroll. All of it is created in this
// component's scope, so all of it tears down when the popup unmounts.
//
// **It is not the listbox**, and here that separation is load-bearing: `role="listbox"` may only
// contain options and groups, so `Combobox.Empty` and `Combobox.Status` live in the card *beside*
// `Combobox.List`. Putting either inside the list would be invalid ARIA and would make a screen
// reader count the status line as an option.
//
// It is also **the card, not the scroll container**: the height cap comes from the measured
// `--available-height` and `Combobox.List` scrolls inside it, which keeps the rounded corners, the
// border and the pinned status line still while the rows move.
export const Content: Component<ComboboxContentProps> = (props) => {
  const ctx = useComboboxContext();
  const content = createComboboxContent(ctx.state, omit(props, "render", "class"));

  // `content.props` carries `data-presence` — the enter/exit animation phase, which the element keeps
  // through its exit so the card can animate out before unmounting. The recipe keys its fade/scale on
  // it, and the direction of the entry slide on the positioner's `data-side`.
  const elementProps = merge(content.props, {
    get class(): string {
      return ctx.slots.content(props.class);
    },
    "data-slot": "combobox-content",
  });

  return (
    <Show when={content.mounted()}>
      {renderElement<ComboboxContentElementProps, HTMLDivElement>({
        as: "div",
        render: props.render,
        props: elementProps,
        // Publishes the element the exit transition is timed off and the dismissal/modality effects
        // read. A render target that drops function refs leaves Escape, outside-click dismissal and
        // the scroll lock all dead, silently.
        ref: content.setRef,
      })}
    </Show>
  );
};
