import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useComboboxContext } from "./combobox-context";

type ComboboxItemTextElementProps = JSX.HTMLAttributes<HTMLSpanElement>;

export interface ComboboxItemTextProps extends ComboboxItemTextElementProps {
  /** Renders as a different element/component while keeping ItemText's computed props. */
  render?: RenderProp<ComboboxItemTextElementProps>;
  /** Merged over the recipe's `itemText` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The option's label — a shrinkable, truncating box inside the row, so a long label ellipsizes
 * instead of pushing the selection glyph out of its reserved gutter.
 *
 * Purely presentational, with no primitive part hook: it carries no ARIA and no behavior. In
 * particular it does **not** feed the filter — an option's matchable text comes from
 * `Combobox.Root`'s `itemToLabel`, which is readable before (and without) the row being mounted at
 * all. That is the whole point of a data-driven option set, and it is why this part is optional: a
 * row may put its label straight in `Combobox.Item`'s children.
 */
export const ItemText: Component<ComboboxItemTextProps> = (props) => {
  const ctx = useComboboxContext();
  const rest = omit(props, "render", "class");

  const elementProps = merge(rest, {
    "data-slot": "combobox-item-text",
    get class(): string {
      return ctx.slots.itemText(props.class);
    },
  });

  return renderElement<ComboboxItemTextElementProps, HTMLSpanElement>({
    as: "span",
    render: props.render,
    props: elementProps,
  });
};
