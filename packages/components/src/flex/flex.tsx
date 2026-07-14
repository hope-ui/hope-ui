import { flex } from "@hope-ui/styled-system/patterns";
import type { SystemStyleObject } from "@hope-ui/styled-system/types";
import type { JSX, ValidComponent } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import type { BoxProps } from "../box";
import { renderStyled } from "../system";

/** The DOM props Flex forwards to the rendered element. */
type FlexElementProps = JSX.HTMLAttributes<HTMLElement>;

export interface FlexProps extends Omit<BoxProps, "direction"> {
  /** Shorthand for `flexDirection`. */
  direction?: SystemStyleObject["flexDirection"];
  /** Shorthand for `alignItems`. */
  align?: SystemStyleObject["alignItems"];
  /** Shorthand for `justifyContent`. */
  justify?: SystemStyleObject["justifyContent"];
  /** Shorthand for `flexWrap`. */
  wrap?: SystemStyleObject["flexWrap"];
  /** Shorthand for `flexBasis`. */
  basis?: SystemStyleObject["flexBasis"];
  /** Shorthand for `flexGrow`. */
  grow?: SystemStyleObject["flexGrow"];
  /** Shorthand for `flexShrink`. */
  shrink?: SystemStyleObject["flexShrink"];
  /**
   * Render as `inline-flex` instead of `flex`. The atomic rule is pre-generated in every
   * `@hope-ui/themes/*` preset's `staticCss` (a runtime toggle Panda's usage scan can't see).
   */
  inline?: boolean;
}

/**
 * Flex — a Box that lays its children out with flexbox. It exposes Chakra's flexbox shorthands
 * (`direction`/`align`/`justify`/`wrap`/`basis`/`grow`/`shrink` + `inline`) on top of the full Box
 * style-prop surface, and renders through the shared `renderStyled` — a `<div>` by default, or any
 * element via `as`/`render`.
 *
 * The shorthand → canonical mapping is Panda's own `flex` **pattern** (`flex.raw`), reused verbatim
 * rather than re-implemented. `flex.raw` is a pure function (no Solid runtime — unlike Panda's
 * Solid-1.x `/jsx` factory, which stays out); its output is fed to `renderStyled` as the `css`
 * escape hatch, so a consumer's own `<Flex align="center">` (extracted statically via the same
 * `flex` pattern in their preset) and this runtime emit identical atomic classes. `display` is
 * forced (`flex`, or `inline-flex` when `inline`); a consumer's `css` still wins, spread last.
 */
export const Flex: Component<FlexProps> = (props) => {
  // Strip the shorthands + `inline` + `css`; the rest (p/gap/bg/native attrs) flows through
  // renderStyled untouched. Reactivity is preserved via omit/merge + a lazy getter (no
  // destructuring). `direction`/`css` are real css properties we must not forward verbatim.
  const rest = omit(
    props as Record<string, unknown>,
    "direction",
    "align",
    "justify",
    "wrap",
    "basis",
    "grow",
    "shrink",
    "inline",
    "css",
  );

  const elementProps = merge(rest, {
    get css(): SystemStyleObject {
      const flexStyle = flex.raw({
        direction: props.direction,
        align: props.align,
        justify: props.justify,
        wrap: props.wrap,
        basis: props.basis,
        grow: props.grow,
        shrink: props.shrink,
      });
      if (props.inline) flexStyle.display = "inline-flex";
      // Chakra parity: the consumer's `css` is spread last, so it wins.
      return props.css ? { ...flexStyle, ...(props.css as SystemStyleObject) } : flexStyle;
    },
  });

  return renderStyled<FlexElementProps>({
    as: (props.as ?? "div") as ValidComponent,
    render: props.render,
    props: elementProps as unknown as FlexElementProps,
  });
};
