import { Dict } from "@hope-ui/utils";

import { CSSObject } from "../stitches.config";
import { AnalyzeBreakpointsReturn } from "../utils/breakpoint";
import { DeepPartial } from "./deep-partial";
import { ThemeScales } from "./scales";
import { StyleConfigOverrideInterpolation } from "./style-config";
import { ThemeVars } from "./vars";

export type ThemeMap = Partial<Record<keyof CSSObject, keyof ThemeScales>>;

export interface ComponentTheme<
  Props extends Record<string, any> = {},
  StyleConfigOverride extends StyleConfigOverrideInterpolation<any, any> | undefined = any
> {
  /** Default props to be passed to the component. */
  defaultProps?: Props;

  /**
   * Styles that will be merged with the "base styles" created by `createStyleConfig`.
   * Used to override/add additional styles.
   */
  styleConfigOverride?: StyleConfigOverride;
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

export interface ThemeMetaData {
  /** An object with the same shape as `ThemeScales` but with css variables reference as value. */
  vars: ThemeVars;

  /** The css variables to be injected globally. */
  __cssVarsValues: ThemeCSSVariables;

  /** Metadata about the theme breakpoints. */
  __breakpoints: AnalyzeBreakpointsReturn;
}

export type MaybeThemeWithMetaData = ThemeBase & Partial<ThemeMetaData>;

export interface Theme extends ThemeBase, ThemeMetaData {}

export type ThemeOverride = DeepPartial<Omit<Theme, "components" | keyof ThemeMetaData>> & {
  components?: Record<string, ComponentTheme>;
};
