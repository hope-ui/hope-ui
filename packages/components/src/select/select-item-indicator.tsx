import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { useSelectContext, useSelectItemContext } from "./select-context";

type SelectItemIndicatorElementProps = JSX.HTMLAttributes<HTMLSpanElement>;

export interface SelectItemIndicatorProps extends SelectItemIndicatorElementProps {
  /** Renders as a different element/component while keeping ItemIndicator's computed props. */
  render?: RenderProp<SelectItemIndicatorElementProps>;
  /** Merged over the recipe's `itemIndicator` slot (applied last), so the consumer's utilities win. */
  class?: string;
  /**
   * A custom selection glyph, overriding the default for this one indicator. When omitted, renders the
   * resolved default (instance `checkIcon` ?? preset `defaultProps.select.checkIcon` ?? hope's
   * built-in check) from context.
   */
  children?: JSX.Element;
}

/**
 * The chosen-row check glyph, shown in the row's reserved trailing gutter only while selected.
 * `aria-hidden`, because the option's own `aria-selected` already conveys it.
 *
 * The glyph is **built in**: with no `children` it renders the one resolved on `Select.Root`, so a
 * preset can swap the default app-wide instead of every consumer hard-coding an SVG.
 *
 * The `<Show>` gates on `isSelected()`, never on the glyph prop itself — reading a JSX-valued prop
 * twice builds the component twice and gives the two copies different hydration positions, so it must
 * stay a single read.
 */
export const ItemIndicator: Component<SelectItemIndicatorProps> = (props) => {
  const ctx = useSelectContext();
  const itemCtx = useSelectItemContext();

  const rest = omit(props, "render", "class", "children");

  const elementProps = merge(rest, {
    "data-slot": "select-item-indicator",
    // Deliberately not forwardable: un-hiding the glyph would double-announce a selection the
    // option's own `aria-selected` already conveys.
    "aria-hidden": "true" as const,
    get class(): string {
      return ctx.slots.itemIndicator(props.class);
    },
    get children(): JSX.Element {
      return props.children ?? ctx.checkIcon();
    },
  });

  return (
    <Show when={itemCtx.isSelected()}>
      {renderElement<SelectItemIndicatorElementProps, HTMLSpanElement>({
        as: "span",
        render: props.render,
        props: elementProps,
      })}
    </Show>
  );
};
