import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { mergeProps } from "@hope-ui/primitives/zag-solid";
import type { JSX } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import { useZagListboxContext } from "./zag-listbox-context";

export interface ZagListboxLabelProps extends JSX.HTMLAttributes<HTMLElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLElement>>;
  class?: string;
}

/**
 * Names the list. Carries **no recipe slot**: hope's `listbox` recipe has no `label` — its `Listbox`
 * is named with `aria-label`/`aria-labelledby` and has no label part at all. Rendering one is what
 * keeps `Content`'s unconditional `aria-labelledby` from dangling, so it is effectively mandatory
 * here where hope's is optional.
 */
export const Label: Component<ZagListboxLabelProps> = (props) => {
  const ctx = useZagListboxContext();
  const rest = omit(props, "render");

  const elementProps = mergeProps(
    () => ctx.api().getLabelProps(),
    () => rest,
    { "data-slot": "zag-listbox-label" },
  );

  return renderElement<JSX.HTMLAttributes<HTMLElement>, HTMLElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
