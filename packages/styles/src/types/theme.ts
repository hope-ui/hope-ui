import { AnalyzeBreakpointsReturn } from "../utils/breakpoint";
import type { ColorMode } from "./color-mode";
import type { CSSObject } from "./css-object";
import type { DeepPartial } from "./deep-partial";
import {
  Shade,
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

export type ThemePrimaryShade = Shade | { light: Shade; dark: Shade };

export type ThemeMap = Partial<Record<keyof CSSObject, keyof ThemeScale>>;

interface ThemeFunctions {
  focusStyles: () => CSSObject;
  rgba: (hexOrRgbColor: string, alpha: number) => string;
}

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
}

export interface Theme extends ThemeScale {
  colorMode: ColorMode;
  primaryColor: ThemeColor;
  primaryShade: ThemePrimaryShade;
  breakpoints: Record<ThemeBreakpoint, string>;
  __breakpoints: AnalyzeBreakpointsReturn;
  themeMap: ThemeMap;
  fn: ThemeFunctions;
  other: ThemeOther;
  components: Record<string, ThemeComponent>;
}

interface ThemeComponent {
  defaultProps?: Record<string, any>;
  classNames?: Record<string, string>;
  styles?: Record<string, CSSObject> | ((theme: Theme, variants: any) => Record<string, CSSObject>);
}

export type ThemeBase = Omit<Theme, "__breakpoints" | "fn">;
export type ThemeOverride = DeepPartial<
  Omit<ThemeBase, "__breakpoints" | "fn" | "other" | "components">
> & {
  other?: ThemeOther;
  components?: Record<string, ThemeComponent>;
};
