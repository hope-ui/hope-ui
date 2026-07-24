import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { mergeProps } from "@hope-ui/primitives/zag-solid";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, omit, Show } from "solid-js";
import { useZagListboxContext, useZagListboxItemContext } from "./zag-listbox-context";

export interface ZagListboxItemIndicatorProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLElement>>;
  class?: string;
  /** A custom glyph. With none, renders the resolved default check from context. */
  children?: JSX.Element;
}

/**
 * The chosen-row check glyph.
 *
 * **`hidden` has to be stripped and the render gated instead** — `B2` from the ZagDialog ledger,
 * recurring verbatim one component later. `getItemIndicatorProps()` returns `hidden: !selected`,
 * which relies on the UA's `[hidden] { display: none }`; the recipe's `itemIndicator` slot is
 * `absolute right-2 flex …`, and any explicit `display` beats that UA rule. Left in place the glyph
 * would be permanently visible on every row. A `<Show>` on the item's own `selected` is the same fix
 * hope's `Listbox.ItemIndicator` already uses, so the visual result is identical.
 */
export const ItemIndicator: Component<ZagListboxItemIndicatorProps> = (props) => {
  const ctx = useZagListboxContext();
  const itemCtx = useZagListboxItemContext();
  const rest = omit(props, "render", "class", "children");

  const elementProps = mergeProps(
    // `hidden` dropped here, not downstream: leaving it on the element and letting `<Show>` do the
    // work would still ship `hidden` on the one frame the glyph *is* rendered.
    () => omit(ctx.api().getItemIndicatorProps({ item: itemCtx.item() }), "hidden"),
    () => rest,
    {
      get class(): string {
        return cx(ctx.slots.itemIndicator(), props.class) ?? "";
      },
      "data-slot": "zag-listbox-item-indicator",
      get children(): JSX.Element {
        return props.children ?? ctx.checkIcon();
      },
    },
  );

  return (
    <Show when={itemCtx.itemState().selected}>
      {renderElement<JSX.HTMLAttributes<HTMLElement>, HTMLElement>({
        as: "span",
        render: props.render,
        props: elementProps,
      })}
    </Show>
  );
};
