import { Dict } from "@hope-ui/utils";

import { CSSObject } from "../stitches.config";
import { AnalyzeBreakpointsReturn } from "../utils/breakpoint";
import { ColorSystem } from "./color-system";
import {
  ThemeBreakpoint,
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

export interface ThemeColors {
  light: ColorSystem;
  dark: ColorSystem;
}

export interface ThemeScales {
  colors: ThemeColors;
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

/** An object with the same shape as `ThemeScales` but with css variables reference as value. */
export type ThemeVars = {
  [Scale in keyof Omit<ThemeScales, "colors">]: {
    [Token in keyof ThemeScales[Scale]]: string;
  };
} & {
  colors: ColorSystem;
};

export type ThemeMap = Partial<Record<keyof CSSObject, keyof ThemeScales>>;

export interface ThemeBase extends ThemeScales {
  cssVarPrefix: string;
  themeMap: ThemeMap;
}

export interface ThemeCSSVariables {
  /** The css variables to be injected in `:root`. */
  root: Dict;

  /** The css variables to be injected in the dark theme selector. */
  dark: Dict;
}

export interface ThemeMetaData {
  /** An object with the same shape as `ThemeScales` but with css variables reference as value. */
  vars: ThemeVars;

  /** The css variables to be injected globally. */
  __cssVarsValues: ThemeCSSVariables;

  /** Metadata about the theme breakpoints. */
  __breakpoints: AnalyzeBreakpointsReturn;
}

export type MaybeThemeWithMetaData = ThemeBase & Partial<ThemeMetaData>;
