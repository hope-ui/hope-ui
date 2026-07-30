import { createListboxGroup } from "@hope-ui/primitives/listbox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import {
  ListboxGroupContext,
  type ListboxGroupContextValue,
  useListboxContext,
} from "./listbox-context";

export interface ListboxGroupProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLElement>>;
  /** Merged over the recipe's `group` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * A `role="group"` section that names itself from its `Listbox.GroupLabel`. `createListboxGroup` owns
 * the `role` + `aria-labelledby` + the label-id registration seam (published on `ListboxGroupContext`
 * for the label child); this layer adds the recipe `group` slot + `data-slot`. Rendered from
 * `Listbox.Root`'s per-entry callback once `groupToItems` is set — a virtual listbox is flat and has
 * no groups.
 */
export function Group(props: ListboxGroupProps): JSX.Element {
  const ctx = useListboxContext();
  const group = createListboxGroup(omit(props, "render", "class"));

  const elementProps = merge(group.props, {
    get class(): string {
      return ctx.slots.group(props.class);
    },
    "data-slot": "listbox-group",
  });

  const groupContext: ListboxGroupContextValue = { group };

  return (
    <ListboxGroupContext value={groupContext}>
      {renderElement<JSX.HTMLAttributes<HTMLElement>, HTMLElement>({
        as: "div",
        render: props.render,
        props: elementProps,
      })}
    </ListboxGroupContext>
  );
}
