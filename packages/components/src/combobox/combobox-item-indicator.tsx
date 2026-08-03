import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { useComboboxContext, useComboboxItemContext } from "./combobox-context";

type ComboboxItemIndicatorElementProps = JSX.HTMLAttributes<HTMLSpanElement>;

export interface ComboboxItemIndicatorProps extends ComboboxItemIndicatorElementProps {
  /** Renders as a different element/component while keeping ItemIndicator's computed props. */
  render?: RenderProp<ComboboxItemIndicatorElementProps>;
  /** Merged over the recipe's `itemIndicator` slot (applied last), so the consumer's utilities win. */
  class?: string;
  /**
   * A custom selection glyph, overriding the default for this one indicator. When omitted, renders the
   * resolved default (instance `checkIcon` ?? preset `defaultProps.combobox.checkIcon` ?? hope's
   * built-in check) from context.
   */
  children?: JSX.Element;
}

/**
 * The chosen-row check glyph, shown in the row's reserved trailing gutter only while selected.
 * `aria-hidden`, because the option's own `aria-selected` already conveys it.
 *
 * On a **multiple** Combobox this is the only thing reporting what is picked — the input holds the
 * query rather than a joined list of labels — so a multi-select tree that omits it shows the user
 * nothing.
 *
 * The `<Show>` gates on `isSelected()`, never on the glyph prop itself — reading a JSX-valued prop
 * twice builds the component twice and gives the two copies different hydration positions, so it must
 * stay a single read.
 */
export const ItemIndicator: Component<ComboboxItemIndicatorProps> = (props) => {
  const ctx = useComboboxContext();
  const itemCtx = useComboboxItemContext();

  const rest = omit(props, "render", "class", "children");

  const elementProps = merge(rest, {
    "data-slot": "combobox-item-indicator",
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
      {renderElement<ComboboxItemIndicatorElementProps, HTMLSpanElement>({
        as: "span",
        render: props.render,
        props: elementProps,
      })}
    </Show>
  );
};
