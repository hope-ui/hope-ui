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
 * instead of pushing the selection glyph out of its reserved gutter. No ARIA, no behavior.
 *
 * It does **not** feed the filter: the text the query is matched against comes from `Combobox.Root`'s
 * `itemToLabel`, which is readable whether or not the row is mounted. Which is also why this part is
 * optional — a row may put its label straight in `Combobox.Item`'s children.
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
