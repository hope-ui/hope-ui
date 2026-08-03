import { createListboxGroupLabel } from "@hope-ui/primitives/listbox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useComboboxContext, useComboboxGroupContext } from "./combobox-context";

type ComboboxGroupLabelElementProps = JSX.HTMLAttributes<HTMLElement>;

export interface ComboboxGroupLabelProps extends ComboboxGroupLabelElementProps {
  /** Renders as a different element/component while keeping GroupLabel's computed props. */
  render?: RenderProp<ComboboxGroupLabelElementProps>;
  /** Merged over the recipe's `groupLabel` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The label naming its `Combobox.Group`: it registers its own `id` onto the group's `aria-labelledby`.
 * That registration is deferred rather than written during render, because Solid 2.0 throws when a
 * descendant writes a signal owned by an ancestor from its synchronous render body — and it is
 * *unregistered* on teardown the same way, which is what lets a filter swap one group for another.
 */
export const GroupLabel: Component<ComboboxGroupLabelProps> = (props) => {
  const ctx = useComboboxContext();
  const groupCtx = useComboboxGroupContext();
  const label = createListboxGroupLabel(groupCtx.group, omit(props, "render", "class"));

  const elementProps = merge(label.props, {
    get class(): string {
      return ctx.slots.groupLabel(props.class);
    },
    "data-slot": "combobox-group-label",
  });

  return renderElement<ComboboxGroupLabelElementProps, HTMLElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
