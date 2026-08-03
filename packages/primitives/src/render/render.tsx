import type { JSX, ValidComponent } from "@solidjs/web";
import { applyRef, Dynamic } from "@solidjs/web";
import { merge } from "solid-js";

/**
 * Consumer override for what a component renders: a **function** that receives the component's
 * fully computed props and returns the element.
 *
 * Never a JSX element. A Solid JSX element is an already-constructed DOM node by the time it
 * reaches us, and Solid has no `cloneElement`, so accepting one could only mean dropping every
 * computed prop — `render={<MyButton/>}` would render a button with no `onClick` and no ARIA.
 */
export type RenderProp<Props> = (props: Props) => JSX.Element;

export interface RenderElementOptions<Props extends object, El extends Element = Element> {
  /** The default element/component to render when no `render` prop is supplied. */
  as: ValidComponent;
  /** The computed DOM props/state to forward to the rendered element. */
  props: Props;
  /** Consumer-supplied override: a function that receives `props`. */
  render?: RenderProp<Props>;
  /**
   * A component-internal ref setter, merged with any consumer `ref` on `props` into a **single
   * function ref** — so no component hand-rolls a `mergeRefs`, and a `render` target that is a
   * component rather than a host element still receives it. See the merge below.
   */
  ref?: JSX.RefCallback<El>;
}

/**
 * Shared render-prop / `as`-polymorphism primitive every public component part routes through.
 * Needs no memoization or ref-forwarding dance: Solid components run once, and the internal +
 * consumer refs collapse into one function ref that any render target honours.
 */
export function renderElement<Props extends object, El extends Element = Element>(
  options: RenderElementOptions<Props, El>,
): JSX.Element {
  const internalRef = options.ref;

  // ONE function ref, never the raw `[internalRef, consumerRef]` array. Only host elements flatten
  // an array (their compiled output runs it through `applyRef`); a `render` target that is a
  // component and reads `props.ref` itself usually honours function refs only — TanStack Router's
  // `Link` does `if (typeof r === "function") r(el)` — and dropped the array silently.
  //
  // `applyRef` (`@solidjs/web`'s ref applier) does the flatten + falsy-skip, but throws on a bare
  // `applyRef(undefined, el)`, so the consumer ref is passed inside the array rather than alone.
  // Its `ref` is read INSIDE the callback so the read lands in the render target's own ref effect;
  // read eagerly in this body it would be an untracked prop read Solid's dev build warns about.
  const props =
    internalRef === undefined
      ? options.props
      : merge(options.props, {
          ref: (element: El) => {
            const consumerRef = (options.props as { ref?: JSX.Ref<El> }).ref;
            // `applyRef` types its refs against `Element`, ours against the narrower `El`, so the
            // array needs a cast at the boundary (as the props access above already does).
            applyRef(
              [internalRef, consumerRef] as unknown as Parameters<typeof applyRef>[0],
              element,
            );
          },
        });

  if (options.render !== undefined) {
    return options.render(props as Props);
  }

  return <Dynamic component={options.as} {...props} />;
}
