import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { mergeProps } from "@hope-ui/primitives/zag-solid";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import { useZagListboxContext } from "./zag-listbox-context";

export interface ZagListboxContentProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLElement>>;
  /** Merged over the recipe's `root` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The `role="listbox"` element — the focusable scroll container that owns arrow navigation,
 * typeahead, and `aria-activedescendant`. It takes the recipe's **`root`** slot, because hope's
 * recipe was written for a `Listbox` whose root *is* this element; Zag's `root` part is a wrapper
 * above it.
 *
 * `aria-labelledby` is emitted **unconditionally**, pointing at `listbox:<id>:label`, whether or not
 * a `ZagListbox.Label` was rendered — the same class of dangling IDREF as ZagDialog's `C1`. A
 * consumer `aria-labelledby` or `aria-label` does not remove it (`mergeProps` resolves plain keys
 * last-defined-wins, so `aria-labelledby` can be *replaced* but not dropped).
 */
export const Content: Component<ZagListboxContentProps> = (props) => {
  const ctx = useZagListboxContext();
  const rest = omit(props, "render", "class");

  const elementProps = mergeProps(
    () => ctx.api().getContentProps(),
    () => rest,
    {
      get class(): string {
        return cx(ctx.slots.root(), props.class) ?? "";
      },
      "data-slot": "zag-listbox",
    },
  );

  return renderElement<JSX.HTMLAttributes<HTMLElement>, HTMLElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
