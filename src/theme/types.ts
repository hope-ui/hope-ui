import { CSS, ScaleValue } from "@stitches/core";

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
