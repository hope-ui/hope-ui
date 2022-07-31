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
} from "./token";

export type ThemeOther = Record<string, any>;

export type ThemePrimaryShade = Shade | { light: Shade; dark: Shade };

interface ThemeFunctions {
  focusStyles: () => CSSObject;
  rgba: (hexOrRgbColor: string, alpha: number) => string;
}

export interface Theme {
  colorMode: ColorMode;
  primaryColor: ThemeColor;
  primaryShade: ThemePrimaryShade;

  colors: Record<ThemeColor, ThemeColorPalette>;
  fonts: Record<ThemeFontFamily, string>;
  fontSizes: Record<ThemeFontSize, string>;
  fontWeights: Record<ThemeFontWeight, number>;
  lineHeights: Record<ThemeLineHeight, string | number>;
  letterSpacings: Record<ThemeLetterSpacing, string>;
  space: Record<ThemeSpace, string>;
  size: Record<ThemeSize, string>;
  radii: Record<ThemeRadii, string>;
  shadows: Record<ThemeShadow, string>;
  breakpoints: Record<ThemeBreakpoint, string>;

  fn: ThemeFunctions;
  other: ThemeOther;
  components: Record<string, ThemeComponent>;
}

interface ThemeComponent {
  defaultProps?: Record<string, any>;
  classNames?: Record<string, string>;
  styles?: Record<string, CSSObject> | ((theme: Theme, variants: any) => Record<string, CSSObject>);
}

export type ThemeBase = Omit<Theme, "fn">;
export type ThemeOverride = DeepPartial<Omit<ThemeBase, "fn" | "other" | "components">> & {
  other?: ThemeOther;
  components?: Record<string, ThemeComponent>;
};
