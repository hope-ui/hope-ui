import { createComboboxContent } from "@hope-ui/primitives/combobox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { useSelectContext } from "./select-context";

type SelectContentElementProps = JSX.HTMLAttributes<HTMLDivElement>;

export interface SelectContentProps extends SelectContentElementProps {
  /** Renders as a different element/component while keeping Content's computed props. */
  render?: RenderProp<SelectContentElementProps>;
}

// The popup card, and the behavior hub: `createComboboxContent` owns the whole effect stack —
// close-on-outside-click/Escape, and (under `modal`, the default) marking the rest of the page
// `inert` plus locking body scroll. All of it is created in this component's scope, so all of it
// tears down when the popup unmounts. This layer is pure assembly plus the recipe `class`.
//
// **It is not the listbox.** `Content` and `List` are separate parts because `role="listbox"` may
// only contain options and groups, so anything else (Combobox's empty message and result count) has
// to live in the card beside the list. `Content` carries no `role` at all — the card is chrome.
//
// It is also **the card, not the scroll container**: the height cap comes from the measured
// `--available-height` and `Select.List` scrolls inside it, which keeps the rounded corners and the
// border still while the rows move.
export const Content: Component<SelectContentProps> = (props) => {
  const ctx = useSelectContext();
  const content = createComboboxContent(ctx.state, omit(props, "render", "class"));

  // `content.props` carries `data-presence` — the enter/exit animation phase, which the element keeps
  // through its exit so the card can animate out before unmounting. The recipe keys its fade/scale on
  // it, and the direction of the entry slide on the positioner's `data-side`.
  const elementProps = merge(content.props, {
    get class(): string {
      return ctx.slots.content(props.class);
    },
    "data-slot": "select-content",
  });

  return (
    <Show when={content.mounted()}>
      {renderElement<SelectContentElementProps, HTMLDivElement>({
        as: "div",
        render: props.render,
        props: elementProps,
        // Publishes the element the exit transition is timed off and the dismissal/modality effects
        // read. A render target that drops function refs leaves Escape, outside-click dismissal,
        // `inert` and the scroll lock all dead, silently.
        ref: content.setRef,
      })}
    </Show>
  );
};
