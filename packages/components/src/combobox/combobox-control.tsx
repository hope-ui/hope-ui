import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useComboboxContext } from "./combobox-context";

type ComboboxControlElementProps = JSX.HTMLAttributes<HTMLDivElement>;

export interface ComboboxControlProps extends ComboboxControlElementProps {
  /**
   * Renders as a different element/component while keeping Control's computed props.
   *
   * The internal ref is merged into the single function ref `renderElement` passes down, and it is
   * load-bearing even though this part has no behavior: it registers the widget's outer box as the
   * popup's positioning anchor and as the element dismissal excludes. See this component's doc.
   */
  render?: RenderProp<ComboboxControlElementProps>;
  /** Merged over the recipe's `control` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The bordered shell holding `Combobox.Input`, `Combobox.Clear` and `Combobox.Trigger` — the
 * analogue of `Select.Trigger`'s box, and the reason Combobox has a part Select does not.
 *
 * Select's box *is* its focus owner, so it can carry `focus-visible:` itself. Combobox's focus owner
 * is the `<input>` **inside** this element, so the ring has to move outward: the recipe spells it
 * `focus-within:`, which is why this shell exists as a part at all rather than as a `<div>` the
 * consumer writes.
 *
 * **It registers itself as the kernel's anchor**, which is the one thing here that is not styling.
 * Two things break without it, both silently: the popup is measured against the bare `<input>` and
 * lands narrower than the field it belongs to, and the chevron and clear buttons fall outside
 * `sparedElements` — so a pointerdown on the chevron dismisses in the capture phase and its own
 * `click` reopens, making the popup impossible to close from the control that opened it. That is why
 * the `render` prop's ref is load-bearing here despite the part carrying no behavior of its own.
 *
 * Otherwise purely presentational, and with **no primitive part hook** — it has no ARIA. Deliberately
 * no `role="group"` and no label: the `role="combobox"` inside already names the widget, and a
 * wrapping group would make a screen reader announce a container the user cannot act on.
 * `data-disabled` is the one attribute it computes, so the recipe can dim the whole shell from the
 * state the kernel already holds.
 */
export const Control: Component<ComboboxControlProps> = (props) => {
  const ctx = useComboboxContext();
  const rest = omit(props, "render", "class");

  const elementProps = merge(rest, {
    "data-slot": "combobox-control",
    get class(): string {
      return ctx.slots.control(props.class);
    },
    // Component-owned, deliberately not forwardable: the disabled state lives on the kernel, and a
    // shell that disagreed with the input it frames would dim around a working field.
    get "data-disabled"(): "" | undefined {
      return ctx.state.list.disabled() ? "" : undefined;
    },
  });

  return renderElement<ComboboxControlElementProps, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: elementProps,
    // The positioning anchor and the outer edge of "not outside" — see this component's doc. A
    // render target that drops function refs leaves the popup mis-measured and the chevron unable to
    // close it, with no error.
    ref: ctx.state.setAnchorElement,
  });
};
