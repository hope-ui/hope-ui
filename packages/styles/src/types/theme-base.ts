import { CSSObject } from "../stitches.config";
import { AnalyzeBreakpointsReturn } from "../utils/breakpoint";
import { ColorMode } from "./color-mode";
import {
  ThemeBreakpoint,
  ThemeColor,
  ThemeColorPalette,
  ThemeFontFamily,
  ThemeFontSize,
  ThemeFontWeight,
  ThemeLetterSpacing,
  ThemeLineHeight,
  ThemeRadii,
  ThemeShadow,
  ThemeSize,
  ThemeSpace,
  ThemeZIndice,
} from "./token";

export type ThemeOther = Record<string, any>;

export type ThemeMap = Partial<Record<keyof CSSObject, keyof ThemeScale>>;

export interface ThemeScale {
  colors: Record<ThemeColor, ThemeColorPalette>;
  fonts: Record<ThemeFontFamily, string>;
  fontSizes: Record<ThemeFontSize, string>;
  fontWeights: Record<ThemeFontWeight, number>;
  lineHeights: Record<ThemeLineHeight, string | number>;
  letterSpacings: Record<ThemeLetterSpacing, string>;
  space: Record<ThemeSpace, string>;
  sizes: Record<ThemeSize, string>;
  radii: Record<ThemeRadii, string>;
  shadows: Record<ThemeShadow, string>;
  zIndices: Record<ThemeZIndice, string | number>;
  breakpoints: Record<ThemeBreakpoint, string>;
}

export interface ThemeFunctions {
  mode: <T>(lightValue: T, darkValue: T) => T;
  focusStyles: () => CSSObject;
  rgba: (hexOrRgbColor: string, alpha: number) => string;
}

export interface ThemeBase extends ThemeScale {
  colorMode: ColorMode;
  themeMap: ThemeMap;
  fn: ThemeFunctions;
  other: ThemeOther;
  __breakpoints?: AnalyzeBreakpointsReturn;
}
