import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { mergeProps } from "@hope-ui/primitives/zag-solid";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import { useZagListboxContext } from "./zag-listbox-context";

export interface ZagListboxItemGroupProps extends Omit<JSX.HTMLAttributes<HTMLElement>, "id"> {
  /**
   * The group's key. **Required**, and it is what links group to label: both parts derive their ids
   * from it (`listbox:<scope>:item-group:<id>` / `…:item-group-label:<id>`), so the `aria-labelledby`
   * link is computed from a string the consumer repeats on both parts. hope's `Listbox.Group` instead
   * has its `GroupLabel` child *register* its id through `createRegisteredId`, so the link cannot be
   * mistyped and cannot dangle.
   */
  id: string;
  render?: RenderProp<JSX.HTMLAttributes<HTMLElement>>;
  /** Merged over the recipe's `group` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/** A `role="group"` section, named by the `ZagListbox.ItemGroupLabel` that repeats its `id`. */
export const ItemGroup: Component<ZagListboxItemGroupProps> = (props) => {
  const ctx = useZagListboxContext();
  const rest = omit(props, "render", "class", "id");

  const elementProps = mergeProps(
    () => ctx.api().getItemGroupProps({ id: props.id }),
    () => rest,
    {
      get class(): string {
        return cx(ctx.slots.group(), props.class) ?? "";
      },
      "data-slot": "zag-listbox-group",
    },
  );

  return renderElement<JSX.HTMLAttributes<HTMLElement>, HTMLElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
