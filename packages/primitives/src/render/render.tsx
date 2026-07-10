import type { JSX, ValidComponent } from "@solidjs/web";
import { Dynamic } from "@solidjs/web";
import { merge } from "solid-js";

/**
 * Consumer override for what a component renders. A **function** that receives the
 * component's fully computed props and returns the element to render.
 *
 * Deliberately not `JSX.Element | ((props) => JSX.Element)`. A Solid JSX element is an
 * already-constructed DOM node by the time it reaches us — there is no `cloneElement` and
 * no way to inject props after the fact. Accepting one could only mean *dropping* every
 * computed prop, which is how `<Dialog.Trigger render={<MyButton/>} />` used to type-check,
 * render, and produce a button with no `onClick` and no ARIA wiring. Requiring a function
 * makes the prop flow visible at the call site and unrepresentable to get wrong.
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
   * A component-internal ref setter. Merged with whatever `ref` the consumer already put on
   * `props`, so no component hand-rolls a `mergeRefs` helper. `@solidjs/web`'s `applyRef`
   * flattens ref arrays and skips falsy entries, so an absent consumer ref is a non-issue.
   */
  ref?: JSX.RefCallback<El>;
}

/**
 * Shared "render prop" / `as`-polymorphism primitive used by every public component.
 * Unlike a React `useRender` hook, this needs no memoization or ref-forwarding dance:
 * Solid components run once, and `ref` natively accepts an array of ref-setter functions.
 */
export function renderElement<Props extends object, El extends Element = Element>(
  options: RenderElementOptions<Props, El>,
): JSX.Element {
  const internalRef = options.ref;

  // The consumer's `ref` is read inside a getter rather than here, so `spread`'s own
  // ref-handling effect is what triggers the read. Reading `options.props.ref` eagerly in
  // a component body is an untracked prop read, which Solid's dev build rightly warns about.
  const props =
    internalRef === undefined
      ? options.props
      : merge(options.props, {
          get ref(): JSX.Ref<El> {
            const consumerRef = (options.props as { ref?: JSX.Ref<El> }).ref;
            return consumerRef === undefined ? internalRef : [internalRef, consumerRef];
          },
        });

  if (options.render !== undefined) return options.render(props as Props);

  return <Dynamic component={options.as} {...props} />;
}
