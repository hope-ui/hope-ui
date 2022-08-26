import { Dict } from "@hope-ui/utils";

import { CSSObject } from "../stitches.config";
import { AnalyzeBreakpointsReturn } from "../utils/breakpoint";
import { DeepPartial } from "./deep-partial";
import { ThemeScales } from "./scales";
import { UseStyleConfigOptions } from "./style-config";
import { ThemeVars } from "./vars";

export type ThemeMap = Partial<Record<keyof CSSObject, keyof ThemeScales>>;

export type ComponentTheme<
  Props extends UseStyleConfigOptions<any, any> = {},
  Keys extends keyof Props = never
> = {
  /** Default props to be passed to the component. */
  defaultProps?: Pick<Props, Keys>;

  /**
   * Styles that will be merged with the "base styles".
   * Used to override/add additional styles.
   */
  styleConfig?: Props["styleConfig"];
};

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
