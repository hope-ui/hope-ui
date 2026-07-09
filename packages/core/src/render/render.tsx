import type { JSX, ValidComponent } from "@solidjs/web";
import { Dynamic } from "@solidjs/web";

export type RenderProp<Props> = JSX.Element | ((props: Props) => JSX.Element);

export interface RenderElementOptions<Props extends object> {
  /** The default element/component to render when no `render` prop is supplied. */
  as: ValidComponent;
  /** The computed DOM props/state to forward to the rendered element. */
  props: Props;
  /** Consumer-supplied override: a JSX element, or a function that receives `props`. */
  render?: RenderProp<Props>;
}

/**
 * Shared "render prop" / `as`-polymorphism primitive used by every public component.
 * Unlike a React `useRender` hook, this needs no memoization or ref-forwarding dance:
 * Solid components run once, and `ref` already accepts an array of ref functions
 * natively, so merging internal + consumer refs is just `ref={[a, b]}` at the call site.
 */
export function renderElement<Props extends object>(
  options: RenderElementOptions<Props>,
): JSX.Element {
  const { as, props, render } = options;

  if (typeof render === "function") {
    return render(props);
  }

  if (render !== undefined) {
    return render;
  }

  return <Dynamic component={as} {...props} />;
}
