import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useComboboxContext } from "./combobox-context";

type ComboboxControlElementProps = JSX.HTMLAttributes<HTMLDivElement>;

export interface ComboboxControlProps extends ComboboxControlElementProps {
  /**
   * Renders as a different element/component while keeping Control's computed props.
   *
   * The internal ref rides along, and it is load-bearing even though this part carries no behavior:
   * it registers the widget's outer box as what the popup is positioned against, and as the region
   * an outside click is measured from. See this component's doc.
   */
  render?: RenderProp<ComboboxControlElementProps>;
  /** Merged over the recipe's `control` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The bordered shell holding `Combobox.Input`, `Combobox.Clear` and `Combobox.Trigger` — the analogue
 * of `Select.Trigger`'s box, and the reason Combobox has a part Select does not.
 *
 * Select's box *is* its focus owner, so it can carry `focus-visible:` itself. Combobox's focus owner
 * is the `<input>` **inside** this element, so the ring has to move outward — the recipe spells it
 * `focus-within:`, which is why this shell is a part rather than a `<div>` you write yourself.
 *
 * **It registers itself as the popup's anchor**, the one thing here that is not styling. Two things
 * break silently without it: the popup is measured against the bare `<input>` and lands narrower than
 * the field it belongs to, and the two gutter buttons fall outside the set of elements spared from
 * outside-click dismissal — so a pointerdown on the chevron closes the popup and its own `click`
 * immediately reopens it, forever.
 *
 * Otherwise purely presentational, and carrying no ARIA. Deliberately no `role="group"` and no label:
 * the `role="combobox"` inside already names the widget, and a wrapping group would make a screen
 * reader announce a container the user cannot act on.
 */
export const Control: Component<ComboboxControlProps> = (props) => {
  const ctx = useComboboxContext();
  const rest = omit(props, "render", "class");

  const elementProps = merge(rest, {
    "data-slot": "combobox-control",
    get class(): string {
      return ctx.slots.control(props.class);
    },
    // Deliberately not forwardable: the disabled state is the widget's, and a shell that disagreed
    // with the input it frames would dim around a working field.
    get "data-disabled"(): "" | undefined {
      return ctx.state.list.disabled() ? "" : undefined;
    },
  });

  return renderElement<ComboboxControlElementProps, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: elementProps,
    // The positioning anchor and the outer edge of "not outside" — see this component's doc.
    ref: ctx.state.setAnchorElement,
  });
};
