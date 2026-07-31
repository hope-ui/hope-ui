import { createListboxGroupLabel } from "@hope-ui/primitives/listbox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useSelectContext, useSelectGroupContext } from "./select-context";

type SelectGroupLabelElementProps = JSX.HTMLAttributes<HTMLElement>;

export interface SelectGroupLabelProps extends SelectGroupLabelElementProps {
  /** Renders as a different element/component while keeping GroupLabel's computed props. */
  render?: RenderProp<SelectGroupLabelElementProps>;
  /** Merged over the recipe's `groupLabel` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The label naming its `Select.Group`. `createListboxGroupLabel` — reused unchanged, props only —
 * takes the group's return (read off `SelectGroupContext`) and registers its `id` onto the group's
 * `aria-labelledby` via `createRegisteredId`, which defers the ancestor-signal write past Solid 2.0's
 * ban. This layer adds the recipe `groupLabel` slot + `data-slot`.
 */
export const GroupLabel: Component<SelectGroupLabelProps> = (props) => {
  const ctx = useSelectContext();
  const groupCtx = useSelectGroupContext();
  const label = createListboxGroupLabel(groupCtx.group, omit(props, "render", "class"));

  const elementProps = merge(label.props, {
    get class(): string {
      return ctx.slots.groupLabel(props.class);
    },
    "data-slot": "select-group-label",
  });

  return renderElement<SelectGroupLabelElementProps, HTMLElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
