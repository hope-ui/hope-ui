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
// dismissal, and (under `modal`, which `Combobox.Root` defaults to `false`) `createHideOutside` +
// `createScrollLock` — all created in its scope, so each tears down when the popup unmounts. This
// layer is pure assembly + the recipe `class`.
//
// **It is not the listbox**, and on a Combobox that separation is finally load-bearing rather than
// forward-looking: `role="listbox"` may only contain options and groups, so `Combobox.Empty` and
// `Combobox.Status` live in the card *beside* `Combobox.List`. Putting either inside the list would
// be invalid ARIA and would make a screen reader count the status line as an option.
//
// It is also **the card, not the scroll container**: the cap comes from the kernel's measured
// `--available-height` and `Combobox.List` scrolls inside it, which is what keeps the rounded
// corners, the border and the pinned status line still while the rows move.
export const Content: Component<ComboboxContentProps> = (props) => {
  const ctx = useComboboxContext();
  const content = createComboboxContent(ctx.state, omit(props, "render", "class"));

  // `content.props` already carries `data-presence` (mirroring the shared popup presence
  // `createCombobox` owns — that's what lets the card animate in). The recipe keys its fade/scale on
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
        // `content.setRef` registers the element on the shared state: the presence times its exit
        // transition off it, and the dismissal/modality effects read it. A render target that drops
        // this function ref leaves Escape, outside-dismissal and the scroll lock all dead, silently.
        ref: content.setRef,
      })}
    </Show>
  );
};
