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
  solidBackground: string;
  solidBorder: string;
  // hover state
  solidHoverText: string;
  solidHoverBackground: string;
  solidHoverBorder: string;
  // active state
  solidActiveText: string;
  solidActiveBackground: string;
  solidActiveBorder: string;
  // disabled state
  solidDisabledText: string;
  solidDisabledBackground: string;
  solidDisabledBorder: string;

  softText: string;
  softBackground: string;
  softBorder: string;
  // hover state
  softHoverText: string;
  softHoverBackground: string;
  softHoverBorder: string;
  // active state
  softActiveText: string;
  softActiveBackground: string;
  softActiveBorder: string;
  // disabled state
  softDisabledText: string;
  softDisabledBackground: string;
  softDisabledBorder: string;

  outlinedText: string;
  outlinedBackground: string;
  outlinedBorder: string;
  // hover state
  outlinedHoverText: string;
  outlinedHoverBackground: string;
  outlinedHoverBorder: string;
  // active state
  outlinedActiveText: string;
  outlinedActiveBackground: string;
  outlinedActiveBorder: string;
  // disabled state
  outlinedDisabledText: string;
  outlinedDisabledBackground: string;
  outlinedDisabledBorder: string;

  plainText: string;
  plainBackground: string;
  plainBorder: string;
  // hover state
  plainHoverText: string;
  plainHoverBackground: string;
  plainHoverBorder: string;
  // active state
  plainActiveText: string;
  plainActiveBackground: string;
  plainActiveBorder: string;
  // disabled state
  plainDisabledText: string;
  plainDisabledBackground: string;
  plainDisabledBorder: string;

  // override palette.text
  overrideTextPrimary: string;
  overrideTextSecondary: string;
  overrideTextTertiary: string;
}

export type PaletteRangeGenerator = (
  palette: ThemeColorPalette,
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
  background: PaletteBackground;
  text: PaletteText;
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
