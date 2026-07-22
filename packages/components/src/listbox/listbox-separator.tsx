import { createListboxSeparator } from "@hope-ui/primitives/listbox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { useListboxContext } from "./listbox-context";

export interface ListboxSeparatorProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLElement>>;
  /** Merged over the recipe's `separator` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * A purely visual hairline divider between sections. `createListboxSeparator` owns
 * `role="presentation"` + `aria-hidden` (**not** `role="separator"` — invalid as a `listbox` child,
 * and some assistive tech would report a real separator as an item); this layer adds the recipe
 * `separator` slot + `data-slot`.
 */
export function Separator(props: ListboxSeparatorProps): JSX.Element {
  const ctx = useListboxContext();
  const separator = createListboxSeparator(omit(props, "render", "class"));

  const elementProps = merge(separator.props, {
    get class(): string {
      return cx(ctx.slots.separator(), props.class) ?? "";
    },
    "data-slot": "listbox-separator",
  });

  return renderElement<JSX.HTMLAttributes<HTMLElement>, HTMLElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
}
