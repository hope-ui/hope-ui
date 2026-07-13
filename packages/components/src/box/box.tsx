import type { RenderProp } from "@hope-ui/primitives/utils";
import type { JsxStyleProps } from "@hope-ui/styled-system/types";
import type { JSX, ValidComponent } from "@solidjs/web";
import type { Component } from "solid-js";
import { renderStyled } from "../system";

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
 * Box — the foundational styled primitive, and the proof that the whole toolchain works end to
 * end. A pure layout primitive: it takes every Chakra-style style prop (`p`, `bg`, `mt`, `_hover`,
 * `colorPalette`, …) and no recipe/theme.
 *
 * All of the split-style-props → `css()` → `cx()` work now lives in `renderStyled`
 * (`../system`), the one mechanism every component and part shares. Box simply hands its props to
 * it and defaults `as` to `div`. The atomic rules `css()` names are emitted by the consumer's own
 * `panda codegen` over their source — hope-ui ships zero CSS — and are byte-stable across server
 * and client, so Box works in SolidStart. See `docs/usage/components/system/style-props.md`.
 */
export const Box: Component<BoxProps> = (props) =>
  renderStyled<BoxElementProps>({
    as: (props.as ?? "div") as ValidComponent,
    render: props.render,
    props: props as unknown as BoxElementProps,
  });
