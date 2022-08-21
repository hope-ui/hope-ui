/*!
 * Original code by MUI
 * MIT Licensed, Copyright (c) 2014 Call-Em-All.
 *
 * Credits to the MUI team:
 * https://github.com/mui/material-ui/blob/master/packages/mui-joy/src/styles/types/colorSystem.ts
 */

import { Prefixed } from "./prefixed";

/** Default theme colors. */
export type DefaultColorScheme = "primary" | "neutral" | "success" | "info" | "warning" | "danger";

/**
 * Theme colors, can be augmented via TypeScript.
 * @example
 * // typing.d.ts
 * import { ThemeColorScheme, DefaultColorScheme } from '@hope-ui/core';
 *
 * declare module '@hope-ui/core' {
 *   export type ThemeColorScheme = DefaultColorScheme | 'brand';
 * }
 */
export type ThemeColorScheme = DefaultColorScheme;

export interface PaletteScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface PaletteRange extends PaletteScale {
  // rgb color channel used to create alpha colors
  mainChannel: string;
  lightChannel: string;
  darkChannel: string;

  // override palette.text
  overrideTextPrimary: string;
  overrideTextSecondary: string;
  overrideTextTertiary: string;
}

/**
 * Generate a color palette to use in Hope UI Theme.
 *
 * @param color The semantic color it will be used for in the theme (e.g. primary, info, etc...)
 * @param cssVarPrefix The prefix to use when accessing css variables, should be the same as defined in the theme.
 */
export type PaletteRangeGenerator = (
  color: ThemeColorScheme,
  cssVarPrefix?: string
) => PaletteRange;

/** [light, dark]. */
export type PaletteGeneratorTuple = [PaletteRangeGenerator, PaletteRangeGenerator];

export interface PaletteCommon {
  white: string;
  black: string;
  divider: string;
  focusRing: string;
}

export interface PaletteText {
  primary: string;
  secondary: string;
  tertiary: string;
}

export interface PaletteBackground {
  body: string;
  surface: string;
  level1: string;
  level2: string;
  level3: string;
  tooltip: string;
}

export type ThemePaletteRanges = Record<ThemeColorScheme, PaletteRange>;

// Note: ColorSystem keys can't be objects more than one level deep.
export interface ColorSystem extends ThemePaletteRanges {
  whiteAlpha: PaletteScale;
  blackAlpha: PaletteScale;
  common: PaletteCommon;
  text: PaletteText;
  background: PaletteBackground;
}

/**
 * Utility type to get a string union type from ColorSystem values.
 *
 * @example
 * interface ColorSystem {
 *   primary: {
 *     50: string;
 *     100: string;
 *   };
 *   common: {
 *     divider: string;
 *   }
 * }
 * => 'primary.50' | 'primary.100' | 'common.divider'
 */
type ColorSystemStringUnion<K extends keyof ColorSystem> = ColorSystem[K] extends Record<
  string,
  any
>
  ? Prefixed<`${K}.`, keyof ColorSystem[K]>
  : K;

/**
 * Color system token name, used in style props and style object.
 *
 * @example
 * {
 *   bg: "primary.500"
 * }
 */
export type ColorSystemTokenName = {
  [Key in keyof ColorSystem]: ColorSystemStringUnion<Key>;
}[keyof ColorSystem];
