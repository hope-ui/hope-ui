/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/tree/main/packages/styled-system/src/config
 */

import { ColorSystem } from "./color-system";
import { DeepPartial } from "./deep-partial";

export interface ThemeColors {
  light: ColorSystem;
  dark: DeepPartial<ColorSystem>;
}

export type ThemeFontFamily = "sans" | "serif" | "mono" | (string & {});

export type ThemeFontSize =
  | "xs"
  | "sm"
  | "base"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "8xl"
  | "9xl"
  | (string & {});

export type ThemeFontWeight =
  | "hairline"
  | "thin"
  | "light"
  | "normal"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold"
  | "black"
  | (string & {});

export type ThemeLineHeight =
  | "none"
  | "shorter"
  | "short"
  | "base"
  | "tall"
  | "taller"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | (string & {});

export type ThemeLetterSpacing =
  | "tighter"
  | "tight"
  | "normal"
  | "wide"
  | "wider"
  | "widest"
  | (string & {});

export type ThemeSpace =
  | "0.5"
  | "1"
  | "1.5"
  | "2"
  | "2.5"
  | "3"
  | "3.5"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "12"
  | "14"
  | "16"
  | "20"
  | "24"
  | "28"
  | "32"
  | "36"
  | "40"
  | "44"
  | "48"
  | "52"
  | "56"
  | "60"
  | "64"
  | "72"
  | "80"
  | "96"
  | (string & {});

export type ThemeSize =
  | ThemeSpace
  | "max"
  | "min"
  | "full"
  | "screenW"
  | "screenH"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "8xl"
  | (string & {});

export type ThemeRadii =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "full"
  | (string & {});

export type ThemeShadow =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "inner"
  | (string & {});

export type ThemeZIndice =
  | "hide"
  | "base"
  | "docked"
  | "sticky"
  | "banner"
  | "overlay"
  | "modal"
  | "dropdown"
  | "popover"
  | "tooltip"
  | "skipLink"
  | "toast"
  | (string & {});

export type ThemeBreakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl" | (string & {});

export interface ThemeScales {
  colors: ThemeColors;
  fonts: Record<ThemeFontFamily, string>;
  fontSizes: Record<ThemeFontSize, string>;
  fontWeights: Record<ThemeFontWeight, string>;
  lineHeights: Record<ThemeLineHeight, string>;
  letterSpacings: Record<ThemeLetterSpacing, string>;
  space: Record<ThemeSpace, string>;
  sizes: Record<ThemeSize, string>;
  radii: Record<ThemeRadii, string>;
  shadows: Record<ThemeShadow, string>;
  zIndices: Record<ThemeZIndice, string>;
  breakpoints: Record<ThemeBreakpoint, string>;
}
