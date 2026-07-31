import { createListboxGroup } from "@hope-ui/primitives/listbox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import {
  ComboboxGroupContext,
  type ComboboxGroupContextValue,
  useComboboxContext,
} from "./combobox-context";

type ComboboxGroupElementProps = JSX.HTMLAttributes<HTMLElement>;

export interface ComboboxGroupProps extends ComboboxGroupElementProps {
  /** Renders as a different element/component while keeping Group's computed props. */
  render?: RenderProp<ComboboxGroupElementProps>;
  /** Merged over the recipe's `group` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * A `role="group"` section that names itself from its `Combobox.GroupLabel`. Rendered from
 * `Combobox.List`'s per-entry callback once `groupToItems` is set on `Combobox.Root`.
 *
 * `createListboxGroup` is reused **unchanged** — it takes props only, no state, so there is nothing
 * for the combobox kernel to adapt. It owns the `role` + `aria-labelledby` + the label-id
 * registration seam (published on `ComboboxGroupContext` for the label child); this layer adds the
 * recipe `group` slot + `data-slot`.
 *
 * **Under a filter, a group is rendered only if something in it survived** — `Combobox.Root` drops
 * the empty ones — so a heading never outlives its last row. Iterate the callback's **third
 * argument**, not your own `category.products`; see `Combobox.List`.
 */
export const Group: Component<ComboboxGroupProps> = (props) => {
  const ctx = useComboboxContext();
  const group = createListboxGroup(omit(props, "render", "class"));

  const elementProps = merge(group.props, {
    get class(): string {
      return ctx.slots.group(props.class);
    },
    "data-slot": "combobox-group",
  });

  const groupContext: ComboboxGroupContextValue = { group };

  return (
    <ComboboxGroupContext value={groupContext}>
      {renderElement<ComboboxGroupElementProps, HTMLElement>({
        as: "div",
        render: props.render,
        props: elementProps,
      })}
    </ComboboxGroupContext>
  );
};
