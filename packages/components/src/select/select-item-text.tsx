import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useSelectContext } from "./select-context";

type SelectItemTextElementProps = JSX.HTMLAttributes<HTMLSpanElement>;

export interface SelectItemTextProps extends SelectItemTextElementProps {
  /** Renders as a different element/component while keeping ItemText's computed props. */
  render?: RenderProp<SelectItemTextElementProps>;
  /** Merged over the recipe's `itemText` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The option's label — a shrinkable, truncating box inside the row, so a long label ellipsizes
 * instead of pushing the selection glyph out of its reserved gutter. No ARIA, no behavior.
 *
 * It does **not** feed typeahead: the text keystrokes are matched against comes from `Select.Root`'s
 * `itemToLabel`, which is readable whether or not the row is mounted. Which is also why this part is
 * optional — a row may put its label straight in `Select.Item`'s children.
 */
export const ItemText: Component<SelectItemTextProps> = (props) => {
  const ctx = useSelectContext();
  const rest = omit(props, "render", "class");

  const elementProps = merge(rest, {
    "data-slot": "select-item-text",
    get class(): string {
      return ctx.slots.itemText(props.class);
    },
  });

  return renderElement<SelectItemTextElementProps, HTMLSpanElement>({
    as: "span",
    render: props.render,
    props: elementProps,
  });
};
