import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { mergeProps } from "@hope-ui/primitives/zag-solid";
import type { JSX } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import { useZagListboxContext, useZagListboxItemContext } from "./zag-listbox-context";

export interface ZagListboxItemTextProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLElement>>;
  class?: string;
}

/**
 * The row's label. A Zag part with no hope counterpart — hope's `Listbox.Item` children *are* the
 * label — and no recipe slot, so it renders unstyled. It exists because Zag mirrors the row's
 * `data-state`/`data-highlighted`/`data-disabled` onto the text node for styling hooks a
 * `[&_[data-part=itemText]]` selector could reach.
 */
export const ItemText: Component<ZagListboxItemTextProps> = (props) => {
  const ctx = useZagListboxContext();
  const itemCtx = useZagListboxItemContext();
  const rest = omit(props, "render");

  const elementProps = mergeProps(
    () => ctx.api().getItemTextProps({ item: itemCtx.item() }),
    () => rest,
    { "data-slot": "zag-listbox-item-text" },
  );

  return renderElement<JSX.HTMLAttributes<HTMLElement>, HTMLElement>({
    as: "span",
    render: props.render,
    props: elementProps,
  });
};
