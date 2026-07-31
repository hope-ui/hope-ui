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
// dismissal, and (under `modal`, the default) `createHideOutside` + `createScrollLock` — all created
// in its scope, so each tears down when the popup unmounts. This layer is pure assembly + the recipe
// `class`.
//
// **It is not the listbox.** `Content` and `List` stay distinct parts because `role="listbox"` may
// only contain options and groups, so a future `Combobox.Empty`/`Combobox.Status` has to live in the
// card beside the list rather than inside it. `Content` carries no `role` at all — the card is
// chrome.
//
// It is also **the card, not the scroll container**: the cap comes from the kernel's measured
// `--available-height` and `Select.List` scrolls inside it, which is what keeps the rounded corners
// and the border still while the rows move.
export const Content: Component<SelectContentProps> = (props) => {
  const ctx = useSelectContext();
  const content = createComboboxContent(ctx.state, omit(props, "render", "class"));

  // `content.props` already carries `data-presence` (mirroring the shared popup presence
  // `createCombobox` owns — that's what lets the card animate in). The recipe keys its fade/scale on
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
        // `content.setRef` registers the element on the shared state: the presence times its exit
        // transition off it, and the dismissal/modality effects read it. A render target that drops
        // this function ref leaves Escape, outside-dismissal, hide-outside and the scroll lock all
        // dead, silently.
        ref: content.setRef,
      })}
    </Show>
  );
};
