import { type CreateComboboxToggleProps, createComboboxToggle } from "@hope-ui/primitives/combobox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useComboboxContext } from "./combobox-context";
import { Icon } from "./combobox-icon";

type ComboboxTriggerElementProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export interface ComboboxTriggerProps extends CreateComboboxToggleProps {
  /**
   * Renders as a different element/component while keeping the trigger's computed props — the popup
   * ARIA, the localized `aria-label`, the `tabindex="-1"` and the focus-preserving pointerdown all
   * ride on them. Pass `nativeButton={false}` alongside when the target is not a real `<button>`.
   */
  render?: RenderProp<ComboboxTriggerElementProps>;
  /** Merged over the recipe's `trigger` slot (applied last), so the consumer's utilities win. */
  class?: string;
  /** The chevron. With none, renders `<Combobox.Icon />`. */
  children?: JSX.Element;
}

/**
 * The chevron button: a pointer affordance for opening the popup, and nothing else.
 *
 * **It is not the focus owner** — `Combobox.Input` is. That is the whole difference from
 * `Select.Trigger`: this button carries no `role="combobox"`, no `aria-activedescendant` and no
 * keymap, because a second combobox in the same tree would give a screen reader two fields and the
 * keyboard two maps.
 *
 * It sits **outside the tab order** (`tabindex="-1"`) and never takes focus (`preventDefault()` on
 * `pointerdown`): the input is the widget's single tab stop, and every key this button could offer is
 * already bound there.
 */
export const Trigger: Component<ComboboxTriggerProps> = (props) => {
  const ctx = useComboboxContext();
  const toggle = createComboboxToggle(ctx.state, omit(props, "render", "class", "children"));

  const elementProps = merge(toggle.props, {
    get class(): string {
      return ctx.slots.trigger(props.class);
    },
    "data-slot": "combobox-trigger",
    get children(): JSX.Element {
      return props.children ?? <Icon />;
    },
  });

  return renderElement<ComboboxTriggerElementProps, HTMLButtonElement>({
    as: "button",
    render: props.render,
    props: elementProps,
    ref: toggle.setRef,
  });
};
