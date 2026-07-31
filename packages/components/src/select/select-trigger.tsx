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
   * `role="combobox"`, the popup ARIA, the whole keymap and the button behavior all ride on them, so
   * a target that spreads them keeps every one. Set `nativeButton={false}` alongside when the target
   * is not a real `<button>`, so `createButton` switches to `tabIndex`/`aria-disabled` and
   * synthesizes keyboard activation.
   *
   * The internal ref is merged into the single function ref `renderElement` passes down. It is
   * load-bearing here: the trigger element is the positioning anchor, the one element dismissal
   * excludes, and the one element modality spares — a target that drops function refs leaves the
   * popup unpositioned and makes the trigger un-clickable while open, with no error.
   */
  render?: RenderProp<SelectTriggerElementProps>;
  /** Merged over the recipe's `trigger` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The trigger part, and the **focus owner**: it keeps real DOM focus for the widget's whole lifetime,
 * open or closed, and points `aria-activedescendant` at the highlighted option. `createComboboxTrigger`
 * owns all of it — `role="combobox"`, `aria-haspopup`/`aria-expanded`/`aria-controls` (open-gated, so
 * a closed Select never carries a dangling IDREF), the `aria-labelledby` that announces the value
 * before the label, the entire keymap, and the composed `createButton` behavior. This layer adds the
 * recipe `trigger` slot + `data-slot`. Pure assembly + theme: no behavior lives here.
 *
 * **It needs an accessible name**, on every tree: an `aria-label`, or an `aria-labelledby` pointing at
 * the consumer's own `<label>`. Select ships no `Label` part (see `Select.Root`), and a nameless
 * `role="combobox"` is an axe `aria-input-field-name` violation — as is the `role="listbox"` popup,
 * which inherits its name from here.
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
