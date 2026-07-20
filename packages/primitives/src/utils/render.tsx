import type { JSX, ValidComponent } from "@solidjs/web";
import { applyRef, Dynamic } from "@solidjs/web";
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
   * `props` into a **single function ref**, so no component hand-rolls a `mergeRefs` helper.
   * The merge delegates flattening to `@solidjs/web`'s `applyRef` (which flattens ref arrays and
   * skips falsy entries), so an absent consumer ref — or a consumer ref that is itself an array —
   * is a non-issue. Handing over a single function (rather than the raw array) is what makes the
   * merge work when `render` targets a *component* that reads `props.ref` itself and only honours
   * function refs (e.g. TanStack Router's `Link`), not just host elements.
   */
  ref?: JSX.RefCallback<El>;
}

/**
 * Shared "render prop" / `as`-polymorphism primitive used by every public component.
 * Unlike a React `useRender` hook, this needs no memoization or ref-forwarding dance:
 * Solid components run once, and the internal + consumer refs are merged into one function ref
 * (see the merge below) that any render target — host element or component — honours.
 */
export function renderElement<Props extends object, El extends Element = Element>(
  options: RenderElementOptions<Props, El>,
): JSX.Element {
  const internalRef = options.ref;

  // Merge the internal ref with any consumer `ref` into a SINGLE function ref. A single callback
  // is honoured by every kind of render target: a host element (Solid's `spread` accepts a
  // `typeof r === "function"` ref), a component using a plain function ref, and — crucially — a
  // component that composes refs but ignores non-function values (e.g. TanStack Router's `Link`
  // does `if (typeof r === "function") r(el)`). Handing over the raw array `[internalRef,
  // consumerRef]` only worked for host elements, whose compiler flattens it via `applyRef`; a
  // user component that reads `props.ref` itself dropped it silently.
  //
  // `applyRef` does the flatten + falsy-skip, so an absent consumer ref (or a consumer ref that is
  // itself an array) is a non-issue — but a bare `applyRef(undefined, el)` throws, so the consumer
  // ref is passed *inside* the array, never on its own. The consumer's `ref` is read INSIDE the
  // callback (not eagerly in the body), so the read lands in the render target's ref effect rather
  // than being an untracked prop read Solid's dev build warns about.
  const props =
    internalRef === undefined
      ? options.props
      : merge(options.props, {
          ref: (element: El) => {
            const consumerRef = (options.props as { ref?: JSX.Ref<El> }).ref;
            // `applyRef` types its refs against `Element`; ours are typed against the narrower `El`,
            // so the array needs a cast at the boundary (as the props access above already does).
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
