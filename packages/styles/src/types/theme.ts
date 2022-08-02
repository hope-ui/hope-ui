import { SystemStyleObject } from "../styled-system/system.types";
import { AnalyzeBreakpointsReturn } from "../utils/breakpoint";
import type { ColorMode } from "./color-mode";
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
import { CSSObject } from "../stitches.config";

export type ThemeOther = Record<string, any>;

export type ThemePrimaryShade = Shade | { light: Shade; dark: Shade };

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
}

export interface Theme extends ThemeScale {
  colorMode: ColorMode;
  primaryColor: ThemeColor;
  primaryShade: ThemePrimaryShade;
  breakpoints: Record<ThemeBreakpoint, string>;
  themeMap: ThemeMap;
  other: ThemeOther;
  components: Record<string, ThemeComponent>;
  __breakpoints: AnalyzeBreakpointsReturn;
}

interface ThemeComponent {
  defaultProps?: Record<string, any>;
  classNames?: Record<string, string>;
  styles?:
    | Record<string, SystemStyleObject>
    | ((theme: Theme, params: any) => Record<string, SystemStyleObject>);
}

export type ThemeBase = Omit<Theme, "__breakpoints">;
export type ThemeOverride = DeepPartial<
  Omit<ThemeBase, "other" | "components" | "__breakpoints">
> & {
  other?: ThemeOther;
  components?: Record<string, ThemeComponent>;
};
