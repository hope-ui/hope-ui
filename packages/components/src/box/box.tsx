import { type RenderProp, renderElement } from "@hope-ui/primitives/utils";
import { css, cx } from "@hope-ui/styled-system/css";
import { isCssProperty } from "@hope-ui/styled-system/is-valid-prop";
import type { JsxStyleProps, SystemStyleObject } from "@hope-ui/styled-system/types";
import type { JSX, ValidComponent } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";

/** The DOM props Box forwards to the rendered element. */
type BoxElementProps = JSX.HTMLAttributes<HTMLElement>;

export interface BoxProps
  extends Omit<JSX.HTMLAttributes<HTMLElement>, keyof JsxStyleProps>,
    JsxStyleProps {
  /** Render as a different element/component. Defaults to `div`. */
  as?: ValidComponent;
  /** Render-prop override that receives Box's computed DOM props. */
  render?: RenderProp<BoxElementProps>;
}

/**
 * Box — the foundational styled primitive, and the proof that the whole toolchain
 * works end to end.
 *
 * Every Chakra-style style prop (`p`, `bg`, `mt`, `_hover`, `colorPalette`, …) is
 * accepted directly on the JSX, split out via Panda's own `isCssProperty`, compiled
 * to an atomic class name by the pure `css()` mapper, and merged with any consumer
 * `class` (consumer wins on ties). It renders through `renderElement` for `as`/render-prop
 * polymorphism (a `<div>` by default). The `css()` mapper is pure and deterministic, so
 * server and client produce identical class names and it works in SolidStart. hope-ui ships
 * zero CSS: the atomic rules `css()` names are emitted by the consumer's own `panda codegen`
 * over their source.
 */
export const Box: Component<BoxProps> = (props) => {
  // Which passed keys are style props? Stable for a given render; the values are read
  // lazily in the `class` getter below, so style-prop reactivity is preserved.
  const styleKeys = Object.keys(props).filter((key) => isCssProperty(key));

  // Everything Box does not forward verbatim: its own props, and the style props
  // (which become a class, not DOM attributes). `omit` keeps the rest reactive.
  const rest = omit(
    props as Record<string, unknown>,
    "as",
    "render",
    "class",
    ...styleKeys,
  ) as BoxElementProps;

  const elementProps: BoxElementProps = merge(rest, {
    get class() {
      const styles: Record<string, unknown> = {};
      for (const key of styleKeys) styles[key] = (props as Record<string, unknown>)[key];
      // css(styleProps) first, consumer `class` last so the consumer wins on ties.
      // `class` is native Solid (a string at runtime), even though the augmented JSX
      // type widens it to a clsx-style ClassValue.
      return cx(css(styles as SystemStyleObject), props.class as string | undefined);
    },
  });

  return renderElement<BoxElementProps>({
    as: (props.as ?? "div") as ValidComponent,
    render: props.render,
    props: elementProps,
  });
};
