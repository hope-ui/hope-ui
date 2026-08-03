import { createComboboxPositioner } from "@hope-ui/primitives/combobox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { useComboboxContext } from "./combobox-context";

type ComboboxPositionerElementProps = JSX.HTMLAttributes<HTMLDivElement>;

export interface ComboboxPositionerProps extends ComboboxPositionerElementProps {
  /** Renders as a different element/component while keeping the positioner's computed props (the
   *  computed `style` and `data-side`/`data-align`/`data-presence`). */
  render?: RenderProp<ComboboxPositionerElementProps>;
}

// The measured layer: the element floating-ui positions, wrapping the `Combobox.Content` card. The
// nesting is required (`Portal > Positioner > Content`) and the split is load-bearing — the card's
// enter/exit `translate`/`scale` would otherwise fight the `translate()` written here.
//
// Its `style` is computed (the consumer's object is merged last, the escape valve for a `z-index`),
// so the `positioner` slot carries nothing positional. What it does carry is the width: this element
// publishes `--anchor-width` and `--available-height` from the measurement, and hope's recipe spends
// the first as `w-(--anchor-width)` so the popup matches the control. Nothing is published before the
// first measurement, so `width: var(--anchor-width)` is simply invalid then and the element keeps its
// natural size.
//
// The popup is measured against **`Combobox.Control`**, not the input inside it. The default anchor is
// the focus owner — right for Select, whose trigger is the whole control — but Combobox's focus owner
// is a bare `<input>` between two gutter buttons, so measuring against it would land the popup short
// of the shell it belongs to. `Combobox.Control` registers itself as the anchor to override that.
//
// It shares the Content's mount/unmount animation state, so it stays mounted exactly as long as the
// card it frames.
export const Positioner: Component<ComboboxPositionerProps> = (props) => {
  const ctx = useComboboxContext();
  const positioner = createComboboxPositioner(ctx.state, omit(props, "render", "class"));

  const elementProps = merge(positioner.props, {
    get class(): string {
      return ctx.slots.positioner(props.class);
    },
    "data-slot": "combobox-positioner",
  });

  return (
    <Show when={positioner.mounted()}>
      {renderElement<ComboboxPositionerElementProps, HTMLDivElement>({
        as: "div",
        render: props.render,
        props: elementProps,
        // The element floating-ui measures and moves. A render target that drops function refs leaves
        // the layer parked at 0,0 — invisible in practice — with no error.
        ref: positioner.setRef,
      })}
    </Show>
  );
};
