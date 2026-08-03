import {
  type CreateComboboxTriggerProps,
  createComboboxTrigger,
} from "@hope-ui/primitives/combobox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useSelectContext } from "./select-context";

type SelectTriggerElementProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export interface SelectTriggerProps extends CreateComboboxTriggerProps {
  /**
   * Renders as a different element/component while keeping the trigger's computed props — the
   * `role="combobox"`, the popup ARIA, the whole keymap and the button behavior all ride on them.
   * Pass `nativeButton={false}` alongside when the target is not a real `<button>`, so the button
   * behavior switches to `tabIndex`/`aria-disabled` and synthesizes keyboard activation.
   *
   * The internal ref rides along, and it is load-bearing: this element is what the popup is positioned
   * against, and the one element spared from the "click outside closes" and "everything else goes
   * inert" rules while open. A target that drops function refs leaves the popup unpositioned and the
   * trigger un-clickable, with no error.
   */
  render?: RenderProp<SelectTriggerElementProps>;
  /** Merged over the recipe's `trigger` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The trigger part, and the **focus owner**: it keeps real DOM focus for the widget's whole lifetime,
 * open or closed, and names the highlighted option through `aria-activedescendant` — no option is
 * ever focused. `createComboboxTrigger` owns all of it: `role="combobox"`, the popup ARIA (gated on
 * open, so a closed Select never carries an `aria-controls` pointing at an unmounted element), the
 * `aria-labelledby` that announces the value before the label, the keymap and the button behavior.
 * Pure assembly plus theme — no behavior lives here.
 *
 * **It needs an accessible name**, on every tree: an `aria-label`, or an `aria-labelledby` pointing at
 * your own `<label>`. Select ships no `Label` part, and a nameless `role="combobox"` is an axe
 * `aria-input-field-name` violation — as is the `role="listbox"` popup, which inherits its name here.
 */
export const Trigger: Component<SelectTriggerProps> = (props) => {
  const ctx = useSelectContext();
  const trigger = createComboboxTrigger(ctx.state, omit(props, "render", "class"));

  const elementProps = merge(trigger.props, {
    get class(): string {
      return ctx.slots.trigger(props.class);
    },
    "data-slot": "select-trigger",
  });

  return renderElement<SelectTriggerElementProps, HTMLButtonElement>({
    as: "button",
    render: props.render,
    props: elementProps,
    ref: trigger.setRef,
  });
};
