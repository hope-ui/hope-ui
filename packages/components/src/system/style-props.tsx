import { type RenderProp, renderElement } from "@hope-ui/primitives/utils";
import { css, cx } from "@hope-ui/styled-system/css";
import { isCssProperty } from "@hope-ui/styled-system/is-valid-prop";
import type { SystemStyleObject } from "@hope-ui/styled-system/types";
import type { JSX, ValidComponent } from "@solidjs/web";
import { type Accessor, merge, omit } from "solid-js";

/**
 * Options for {@link renderStyled} — a superset of what `renderElement` needs, plus the optional
 * `recipeClass` seam. `Props` is the element's fixed prop shape (e.g.
 * `JSX.HTMLAttributes<HTMLElement>`), not a type that morphs by `as` — see the note in
 * {@link renderStyled}.
 */
export interface RenderStyledOptions<
  Props extends { class?: unknown },
  El extends Element = Element,
> {
  /** The element/component to render. Polymorphism is delegated to `renderElement`. */
  as: ValidComponent;
  /**
   * The full incoming props bag: DOM props + style props (`p`, `bg`, `_hover`, …) + `class` /
   * `style` / the `css` escape hatch. Style props and `class` are consumed here (folded into a
   * single computed `class`); everything else is forwarded verbatim.
   */
  props: Props;
  /** Consumer render-prop override; receives the computed props. */
  render?: RenderProp<Props>;
  /** A component-internal ref setter; `renderElement` merges it with the consumer's own `ref`. */
  ref?: JSX.RefCallback<El>;
  /**
   * Optional class(es) placed *below* style props in the cascade — the seam recipe/variant classes
   * plug into once theming is wired. A plain string accessor: `renderStyled` imports no theming and
   * Box does not use it. See `docs/usage/components/system/style-props.md`.
   */
  recipeClass?: Accessor<string | undefined>;
}

/**
 * The one reusable style-props mechanism every component and part opts into — `renderElement`
 * (`as` / render-prop polymorphism + ref merging) plus style-prop extraction and class
 * composition. A part adopts the full style-props API by swapping its `renderElement(...)` call
 * for `renderStyled(...)`; because behavior hooks forward unknown consumer props through their
 * returned `.props`, the style props a consumer wrote arrive here untouched.
 *
 * Class precedence, low → high (see the usage doc for the cascade-layer detail): `recipeClass`
 * → style props + `css` prop → consumer `class` (appended last, so it wins ties). Consumer inline
 * `style` is forwarded untouched and always beats a class.
 *
 * SSR-safe by construction: the `class` getter is pure render-time computation (no DOM access, no
 * effects, no ids), and `css()` emits stable unhashed class names, so server and client agree.
 *
 * `as` is a loose `ValidComponent`, never a generic that re-types `Props` from the element, so this
 * carries none of the deep-conditional polymorphic-type cost that wrecks IntelliSense in that other
 * SolidJS overlay library — `renderStyled<Props>` is as cheap to type-check as `renderElement<Props>`.
 */
export function renderStyled<Props extends { class?: unknown }, El extends Element = Element>(
  options: RenderStyledOptions<Props, El>,
): JSX.Element {
  const { props } = options;

  // Which passed keys are style props is stable for a given render — the KEY (`p`, `bg`) is static;
  // only its VALUE is reactive — so compute the list once and read the values lazily in the `class`
  // getter below. That is what preserves style-prop reactivity. `isCssProperty("css")` is true, but
  // the `css` escape hatch is a *nested* style object, not a per-prop value: Panda's `css()` does
  // not flatten a `css` KEY, so folding it in with the others emits garbage (`color:css_red`).
  // Exclude it here and pass its value as a sibling `css()` argument in the getter below, which is
  // how Panda merges it (and lets it win ties — the documented escape-hatch precedence).
  const styleKeys = Object.keys(props).filter((key) => isCssProperty(key) && key !== "css");

  // `as`/`render`/`class`/`css` and the style props never reach the element as attributes:
  // `as`/`render` are handled by `renderElement`, `class`/`css` and the style props become the
  // computed class. `omit` keeps the rest reactive. Stripping `as`/`render` defensively lets callers
  // hand us a raw component props bag (Box) or a hook's output (`trigger.props`) with no ceremony.
  const rest = omit(
    props as Record<string, unknown>,
    "as",
    "render",
    "class",
    "css",
    ...styleKeys,
  ) as Props;

  const elementProps = merge(rest, {
    get class() {
      const styles: Record<string, unknown> = {};
      for (const key of styleKeys) styles[key] = (props as Record<string, unknown>)[key];
      return cx(
        options.recipeClass?.(),
        css(
          styles as SystemStyleObject,
          (props as { css?: unknown }).css as SystemStyleObject | undefined,
        ),
        props.class as string | undefined,
      );
    },
  }) as Props;

  return renderElement<Props, El>({
    as: options.as,
    render: options.render,
    ref: options.ref,
    props: elementProps,
  });
}
