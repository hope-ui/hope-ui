import { Dict } from "@hope-ui/utils";

import { CSSObject } from "../stitches.config";
import { AnalyzeBreakpointsReturn } from "../utils/breakpoint";
import { ColorSystem } from "./color-system";
import { DeepPartial } from "./deep-partial";
import { PartialRecipeConfigInterpolation } from "./recipe";
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

export interface ComponentTheme<
  Props extends Record<string, any> = {},
  RecipeConfig extends PartialRecipeConfigInterpolation<any, any, any> | undefined = any
> {
  /** Default props to be passed to the component. */
  defaultProps?: Props;

  /**
   * Styles that will be merged with the "base styles" of the component.
   * Mostly used to override/add additional styles.
   */
  styles?: RecipeConfig;
}

export interface ThemeBase extends ThemeScales {
  cssVarPrefix: string;
  themeMap: ThemeMap;
  components: Record<string, ComponentTheme>;
}

export interface ThemeCSSVariables {
  /** The css variables to be injected in `:root`. */
  root: Dict;

  /** The css variables to be injected in the dark theme selector. */
  dark: Dict;
}

interface ThemeMetaData {
  /** An object with the same shape as `ThemeScales` but with css variables reference as value. */
  vars: ThemeVars;

  /** The css variables to be injected globally. */
  __cssVarsValues: ThemeCSSVariables;

  /** Metadata about the theme breakpoints. */
  __breakpoints: AnalyzeBreakpointsReturn;
}

export type Theme = ThemeBase & ThemeMetaData;

export type MaybeThemeWithMetaData = ThemeBase & Partial<ThemeMetaData>;

export type ThemeOverride = DeepPartial<Omit<Theme, "components" | keyof ThemeMetaData>> & {
  components?: Record<string, ComponentTheme>;
};
