import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { merge, omit, Show } from "solid-js";
import { useListboxContext, useListboxItemContext } from "./listbox-context";

export interface ListboxItemIndicatorProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLSpanElement>>;
  /** Merged over the recipe's `itemIndicator` slot (applied last), so the consumer's utilities win. */
  class?: string;
  /**
   * A custom selection glyph for this one indicator. Omit it and the resolved default is rendered:
   * the instance's `checkIcon`, else the preset's, else hope's built-in check.
   */
  children?: JSX.Element;
}

/**
 * The check glyph on the chosen row. Purely presentational: it reads the item's selected state off
 * context and shows the glyph in the row's reserved trailing gutter only while selected. It is
 * `aria-hidden` because the option's own `aria-selected` already conveys the selection, so exposing
 * the glyph would double-announce it.
 *
 * The default glyph comes from `Root` through context rather than being a hard-coded SVG here, which
 * is what lets a theme preset swap it app-wide.
 *
 * No primitive hook, unlike every sibling part: there is no behavior and no ARIA beyond one constant
 * for one to own, so the consumer's native attributes are merged here directly.
 *
 * `props.children` is read **exactly once**, and the `<Show>` gates on the item's selected state
 * rather than on the glyph prop. That matters for hydration: a component-valued prop read *twice* —
 * once by a `<Show>`'s `when` and again in its body — builds and discards a component, which shifts
 * the hydration keys Solid derives from tree position. A single read, inside a `<Show>` or not, is
 * safe and needs no `children()` wrapper.
 */
export function ItemIndicator(props: ListboxItemIndicatorProps): JSX.Element {
  const ctx = useListboxContext();
  const itemCtx = useListboxItemContext();

  const rest = omit(props, "render", "class", "children");

  const elementProps = merge(rest, {
    "data-slot": "listbox-item-indicator",
    // Merged after `rest` so a consumer cannot override it — see the double-announcement note above.
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
      {renderElement<JSX.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>({
        as: "span",
        render: props.render,
        props: elementProps,
      })}
    </Show>
  );
}
