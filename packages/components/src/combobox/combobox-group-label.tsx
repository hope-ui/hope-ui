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
 * The label naming its `Combobox.Group`. `createListboxGroupLabel` — reused unchanged, props only —
 * takes the group's return (read off `ComboboxGroupContext`) and registers its `id` onto the group's
 * `aria-labelledby` via `createRegisteredId`, which defers the ancestor-signal write past Solid 2.0's
 * ban. This layer adds the recipe `groupLabel` slot + `data-slot`.
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
