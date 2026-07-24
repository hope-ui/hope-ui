import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { mergeProps } from "@hope-ui/primitives/zag-solid";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import { useZagListboxContext } from "./zag-listbox-context";

export interface ZagListboxItemGroupLabelProps extends JSX.HTMLAttributes<HTMLElement> {
  /** The `id` of the `ZagListbox.ItemGroup` this labels — repeated by hand from the group. */
  htmlFor: string;
  render?: RenderProp<JSX.HTMLAttributes<HTMLElement>>;
  /** Merged over the recipe's `groupLabel` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/** The label naming its `ZagListbox.ItemGroup`, linked by repeating the group's key in `htmlFor`. */
export const ItemGroupLabel: Component<ZagListboxItemGroupLabelProps> = (props) => {
  const ctx = useZagListboxContext();
  const rest = omit(props, "render", "class", "htmlFor");

  const elementProps = mergeProps(
    () => ctx.api().getItemGroupLabelProps({ htmlFor: props.htmlFor }),
    () => rest,
    {
      get class(): string {
        return cx(ctx.slots.groupLabel(), props.class) ?? "";
      },
      "data-slot": "zag-listbox-group-label",
    },
  );

  return renderElement<JSX.HTMLAttributes<HTMLElement>, HTMLElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
