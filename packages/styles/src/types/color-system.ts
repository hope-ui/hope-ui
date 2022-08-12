/*!
 * Original code by MUI
 * MIT Licensed, Copyright (c) 2014 Call-Em-All.
 *
 * Credits to the MUI team:
 * https://github.com/mui/material-ui/blob/master/packages/mui-joy/src/styles/types/colorSystem.ts
 */

import { Prefixed } from "./prefixed";

/** Default theme color palette. */
export type DefaultColorPalette = "primary" | "neutral" | "success" | "info" | "warning" | "danger";

/**
 * Theme color palette, can be augmented via TypeScript.
 * @example
 * // typing.d.ts
 * import { ThemeColorPalette, DefaultColorPalette } from '@hope-ui/core';
 *
 * declare module '@hope-ui/core' {
 *   export type ThemeColorPalette = DefaultColorPalette | 'brand';
 * }
 */
export type ThemeColorPalette = DefaultColorPalette;

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

export interface PaletteChannel {
  mainChannel: string;
  lightChannel: string;
  darkChannel: string;
}

export interface PaletteRange extends PaletteScale, PaletteChannel {
  solidText: string;
  solidBg: string;
  solidBorder: string;
  // hover state
  solidHoverText: string;
  solidHoverBg: string;
  solidHoverBorder: string;
  // active state
  solidActiveText: string;
  solidActiveBg: string;
  solidActiveBorder: string;
  // disabled state
  solidDisabledText: string;
  solidDisabledBg: string;
  solidDisabledBorder: string;

  softText: string;
  softBg: string;
  softBorder: string;
  // hover state
  softHoverText: string;
  softHoverBg: string;
  softHoverBorder: string;
  // active state
  softActiveText: string;
  softActiveBg: string;
  softActiveBorder: string;
  // disabled state
  softDisabledText: string;
  softDisabledBg: string;
  softDisabledBorder: string;

  outlinedText: string;
  outlinedBg: string;
  outlinedBorder: string;
  // hover state
  outlinedHoverText: string;
  outlinedHoverBg: string;
  outlinedHoverBorder: string;
  // active state
  outlinedActiveText: string;
  outlinedActiveBg: string;
  outlinedActiveBorder: string;
  // disabled state
  outlinedDisabledText: string;
  outlinedDisabledBg: string;
  outlinedDisabledBorder: string;

  plainText: string;
  plainBg: string;
  plainBorder: string;
  // hover state
  plainHoverText: string;
  plainHoverBg: string;
  plainHoverBorder: string;
  // active state
  plainActiveText: string;
  plainActiveBg: string;
  plainActiveBorder: string;
  // disabled state
  plainDisabledText: string;
  plainDisabledBg: string;
  plainDisabledBorder: string;

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
  color: ThemeColorPalette,
  cssVarPrefix?: string
) => PaletteRange;

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
  surface0: string;
  surface1: string;
  surface2: string;
  surface3: string;
  tooltip: string;
}

export type ThemePaletteRanges = Record<ThemeColorPalette, PaletteRange>;

// Note: ColorSystem keys can't be objects more than one level deep.
export interface ColorSystem extends ThemePaletteRanges {
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
 *   divider: string;
 * }
 * => 'primary.50' | 'primary.100' | 'divider'
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
 *   bg: "primary.solidBackground"
 * }
 */
export type ColorSystemTokenName = {
  [Key in keyof ColorSystem]: ColorSystemStringUnion<Key>;
}[keyof ColorSystem];
