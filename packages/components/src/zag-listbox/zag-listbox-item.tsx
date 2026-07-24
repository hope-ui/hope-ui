import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { withDefaults } from "@hope-ui/primitives/utils";
import { mergeProps } from "@hope-ui/primitives/zag-solid";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import type { CollectionItem } from "@zag-js/listbox";
import { omit } from "solid-js";
import {
  useZagListboxContext,
  ZagListboxItemContext,
  type ZagListboxItemContextValue,
} from "./zag-listbox-context";

export interface ZagListboxItemProps extends JSX.HTMLAttributes<HTMLElement> {
  /**
   * The collection item this row renders. **Data down** — there is no `value` prop and no
   * registration: the machine already knows every item from `Root`'s `collection`, and this row is
   * merely a view of one of them. Every descendant part is handed the same object again.
   */
  item: CollectionItem;
  /**
   * Whether moving the mouse over the row highlights it. Zag defaults this **off**; hope's `Listbox`
   * highlights on real pointer movement, so it is defaulted **on** here to keep the two comparable.
   */
  highlightOnHover?: boolean;
  render?: RenderProp<JSX.HTMLAttributes<HTMLElement>>;
  /** Merged over the recipe's `item` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The `role="option"` row. Pure assembly: `getItemProps({ item })` owns the role, the ARIA state, the
 * `data-*` markers and the click/pointer handlers.
 *
 * **One override the shared recipe forces: `data-active`.** hope's `listbox` recipe highlights the
 * active row with the preset's registered `data-active:` variant, and Zag emits `data-highlighted`
 * instead — and not even on the same condition. Zag's `highlighted` is
 * `isHighlighted && (inputFocused ? contentFocused : focusVisible)`, so a mouse-driven highlight
 * carries no marker at all, where hope's `data-active` is "this is the active item" regardless of
 * focus visibility. Re-deriving it from `api().highlightedValue` is the only way to keep the same
 * recipe painting the same row, and it is per-item work the component layer now owns.
 */
export function Item(props: ZagListboxItemProps): JSX.Element {
  const ctx = useZagListboxContext();
  const merged = withDefaults(props, { highlightOnHover: true });
  const rest = omit(merged, "item", "highlightOnHover", "render", "class");

  const itemState = () => ctx.api().getItemState({ item: merged.item });

  const elementProps = mergeProps(
    () => ctx.api().getItemProps({ item: merged.item, highlightOnHover: merged.highlightOnHover }),
    () => rest,
    {
      get class(): string {
        return cx(ctx.slots.item(), props.class) ?? "";
      },
      "data-slot": "zag-listbox-item",
      get "data-active"(): string | undefined {
        return ctx.api().highlightedValue === itemState().value ? "" : undefined;
      },
    },
  );

  const itemContext: ZagListboxItemContextValue = {
    item: () => merged.item,
    itemState,
  };

  return (
    <ZagListboxItemContext value={itemContext}>
      {renderElement<JSX.HTMLAttributes<HTMLElement>, HTMLElement>({
        as: "div",
        render: props.render,
        props: elementProps,
      })}
    </ZagListboxItemContext>
  );
}
