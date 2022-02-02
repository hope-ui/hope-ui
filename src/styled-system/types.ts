import { CSS, ScaleValue } from "@stitches/core";

import { BorderProps } from "./props/border";
import { ColorProps } from "./props/color";
import { CSSProp } from "./props/css";
import { FlexboxProps } from "./props/flexbox";
import { GridProps } from "./props/grid";
import { LayoutProps } from "./props/layout";
import { MarginProps } from "./props/margin";
import { PaddingProps } from "./props/padding";
import { PositionProps } from "./props/position";
import { PseudoSelectorProps } from "./props/pseudo-selector";
import { RadiiProps } from "./props/radii";
import { ShadowProps } from "./props/shadow";
import { SizeProps } from "./props/size";
import { TypographyProps } from "./props/typography";
import { config, theme } from "./stitches.config";

/**
 * Stitches config type.
 */
export type SystemConfig = typeof config;

/**
 * Hope UI - Stitches theme interface.
 */
export type SystemThemeTokens = typeof theme;

/**
 * Media interface based on the stitches media.
 */
export type SystemMedia = typeof config.media;

/**
 * Style interface based on the stitches configuration.
 */
export type SystemStyleObject = CSS<SystemConfig>;

/**
 * Hope UI theme `colors` scale vaue.
 */
export type ColorScaleValue = ScaleValue<"colors", SystemConfig>;

/**
 * Hope UI theme `space`scale vaue.
 */
export type SpaceScaleValue = ScaleValue<"space", SystemConfig>;

/**
 * Hope UI theme `sizes`scale vaue.
 */
export type SizeScaleValue = ScaleValue<"sizes", SystemConfig>;

/**
 * Hope UI theme `fonts`scale vaue.
 */
export type FontScaleValue = ScaleValue<"fonts", SystemConfig>;

/**
 * Hope UI theme `fontSizes`scale vaue.
 */
export type FontSizeScaleValue = ScaleValue<"fontSizes", SystemConfig>;

/**
 * Hope UI theme `fontWeights`scale vaue.
 */
export type FontWeightScaleValue = ScaleValue<"fontWeights", SystemConfig>;

/**
 * Hope UI theme `letterSpacings`scale vaue.
 */
export type LetterSpacingScaleValue = ScaleValue<"letterSpacings", SystemConfig>;

/**
 * Hope UI theme `lineHeights`scale vaue.
 */
export type LineHeightScaleValue = ScaleValue<"lineHeights", SystemConfig>;

/**
 * Hope UI theme `radii`scale vaue.
 */
export type RadiiScaleValue = ScaleValue<"radii", SystemConfig>;

/**
 * Hope UI theme `shadows`scale vaue.
 */
export type ShadowScaleValue = ScaleValue<"shadows", SystemConfig>;

/**
 * Hope UI theme `zIndices`scale vaue.
 */
export type ZIndiceScaleValue = ScaleValue<"zIndices", SystemConfig>;

/**
 * Utility type to get an object containing all keys of another type
 */
export type KeysOf<T> = Record<keyof T, true>;

/**
 * Utility type to convert a given props to a stitches responsive variant-like type.
 */
export type ResponsiveProps<Props> = {
  [K in keyof Props]:
    | Props[K]
    | {
        [KMedia in SystemMediaCssSelector]?: Props[K];
      };
};

/**
 * All style props types.
 */
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

/**
 * Utility to prefix keys of a type.
 */
export type Prefixed<K extends string, T> = `${K}${Extract<T, boolean | number | string>}`;

/**
 * All system media css selectors
 */
export type SystemMediaCssSelector = Prefixed<"@", "initial" | keyof SystemMedia>;

export type SystemMediaCssSelectorWithoutInitalSelector = Exclude<
  SystemMediaCssSelector,
  "@initial"
>;

export type ResponsiveObject = Record<SystemMediaCssSelector, string | number | boolean>;
