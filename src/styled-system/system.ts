import { css } from "@/styled-system/stitches.config";
import { toCssObject } from "@/styled-system/utils";

import { borderPropNames, BorderProps } from "./props/border";
import { colorPropNames, ColorProps } from "./props/color";
import { CSSProp, cssPropName } from "./props/css";
import { flexboxPropNames, FlexboxProps } from "./props/flexbox";
import { gridPropNames, GridProps } from "./props/grid";
import { layoutPropNames, LayoutProps } from "./props/layout";
import { marginPropNames, MarginProps } from "./props/margin";
import { paddingPropNames, PaddingProps } from "./props/padding";
import { positionPropNames, PositionProps } from "./props/position";
import { pseudoSelectorPropNames, PseudoSelectorProps } from "./props/pseudo-selector";
import { radiiPropNames, RadiiProps } from "./props/radii";
import { shadowPropNames, ShadowProps } from "./props/shadow";
import { sizePropNames, SizeProps } from "./props/size";
import { typographyPropNames, TypographyProps } from "./props/typography";
import { KeysOf, ResponsiveProps } from "./types";

export type StyleProps = ResponsiveProps<
  BorderProps &
    ColorProps &
    FlexboxProps &
    GridProps &
    LayoutProps &
    MarginProps &
    PaddingProps &
    PositionProps &
    RadiiProps &
    ShadowProps &
    SizeProps &
    TypographyProps &
    PseudoSelectorProps
> &
  CSSProp;

export const stylePropNames: KeysOf<StyleProps> = {
  ...borderPropNames,
  ...colorPropNames,
  ...flexboxPropNames,
  ...gridPropNames,
  ...layoutPropNames,
  ...marginPropNames,
  ...paddingPropNames,
  ...positionPropNames,
  ...radiiPropNames,
  ...shadowPropNames,
  ...sizePropNames,
  ...typographyPropNames,
  ...pseudoSelectorPropNames,
  ...cssPropName,
};

/**
 * Base stitches css object of all Hope UI components.
 */
const styledSystemStyles = css({});

/**
 * Generate a css class based on style props.
 */
export function createStyledSystemClass(props: StyleProps) {
  return styledSystemStyles({ css: toCssObject(props) });
}

/**
 * Take a props object and return only the keys that match a style prop.
 */
export function getUsedStylePropNames(props: Record<string | number, unknown>) {
  return Object.keys(props).filter(key => key in stylePropNames) as Array<keyof StyleProps>;
}
