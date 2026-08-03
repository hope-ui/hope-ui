import { createListboxGroup } from "@hope-ui/primitives/listbox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import {
  SelectGroupContext,
  type SelectGroupContextValue,
  useSelectContext,
} from "./select-context";

type SelectGroupElementProps = JSX.HTMLAttributes<HTMLElement>;

export interface SelectGroupProps extends SelectGroupElementProps {
  /** Renders as a different element/component while keeping Group's computed props. */
  render?: RenderProp<SelectGroupElementProps>;
  /** Merged over the recipe's `group` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * A `role="group"` section that names itself from its `Select.GroupLabel`. Rendered from
 * `Select.List`'s per-entry callback once `groupToItems` is set on `Select.Root`.
 *
 * `createListboxGroup` owns the `role`, the `aria-labelledby` and the id-registration seam its label
 * child uses; this layer adds the recipe `group` slot.
 *
 * The group's *label text* never reaches the behavior layer — you render it from your own data — so
 * there is no `groupToLabel` and no `{ label, items }` shape to conform to. What gets registered is
 * the ARIA wiring, not the text.
 */
export const Group: Component<SelectGroupProps> = (props) => {
  const ctx = useSelectContext();
  const group = createListboxGroup(omit(props, "render", "class"));

  const elementProps = merge(group.props, {
    get class(): string {
      return ctx.slots.group(props.class);
    },
    "data-slot": "select-group",
  });

  const groupContext: SelectGroupContextValue = { group };

  return (
    <SelectGroupContext value={groupContext}>
      {renderElement<SelectGroupElementProps, HTMLElement>({
        as: "div",
        render: props.render,
        props: elementProps,
      })}
    </SelectGroupContext>
  );
};
