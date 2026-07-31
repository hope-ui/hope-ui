import { createListboxSeparator } from "@hope-ui/primitives/listbox";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useSelectContext } from "./select-context";

type SelectSeparatorElementProps = JSX.HTMLAttributes<HTMLElement>;

export interface SelectSeparatorProps extends SelectSeparatorElementProps {
  /** Renders as a different element/component while keeping Separator's computed props. */
  render?: RenderProp<SelectSeparatorElementProps>;
  /** Merged over the recipe's `separator` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * A purely visual hairline divider between sections. `createListboxSeparator` — reused unchanged,
 * props only — owns `role="presentation"` + `aria-hidden` (**not** `role="separator"`, which is an
 * invalid `listbox` child, and which some assistive tech would report as an item); this layer adds
 * the recipe `separator` slot + `data-slot`.
 */
export const Separator: Component<SelectSeparatorProps> = (props) => {
  const ctx = useSelectContext();
  const separator = createListboxSeparator(omit(props, "render", "class"));

  const elementProps = merge(separator.props, {
    get class(): string {
      return ctx.slots.separator(props.class);
    },
    "data-slot": "select-separator",
  });

  return renderElement<SelectSeparatorElementProps, HTMLElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
