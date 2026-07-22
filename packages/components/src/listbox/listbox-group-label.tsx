import { createListboxGroupLabel } from "@hope-ui/primitives/listbox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { useListboxContext, useListboxGroupContext } from "./listbox-context";

export interface ListboxGroupLabelProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLElement>>;
  /** Merged over the recipe's `groupLabel` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The label naming its `Listbox.Group`. `createListboxGroupLabel` takes the group's return (read off
 * `ListboxGroupContext`) and registers its `id` onto the group's `aria-labelledby` via
 * `createRegisteredId` (deferring the ancestor-signal write past Solid 2.0's ban). This layer adds
 * the recipe `groupLabel` slot + `data-slot`.
 */
export function GroupLabel(props: ListboxGroupLabelProps): JSX.Element {
  const ctx = useListboxContext();
  const groupCtx = useListboxGroupContext();
  const label = createListboxGroupLabel(groupCtx.group, omit(props, "render", "class"));

  const elementProps = merge(label.props, {
    get class(): string {
      return cx(ctx.slots.groupLabel(), props.class) ?? "";
    },
    "data-slot": "listbox-group-label",
  });

  return renderElement<JSX.HTMLAttributes<HTMLElement>, HTMLElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
}
