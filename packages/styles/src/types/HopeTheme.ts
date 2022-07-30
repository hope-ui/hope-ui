import type { ColorMode } from "./ColorMode";
import type { CSSObject } from "./CSSObject";
import type { DeepPartial } from "./DeepPartial";
import {
  HopeBreakpoint,
  HopeFontFamily,
  HopeFontSize,
  HopeFontWeight,
  HopeLetterSpacing,
  HopeLineHeight,
  HopeRadii,
  HopeShadow,
  HopeSize,
  HopeSpace,
  HopeThemeColors,
  Shade,
} from "./HopeToken";

export type HopeThemeOther = Record<string, any>;

export interface HopePrimaryShade {
  light: Shade;
  dark: Shade;
}

interface HopeThemeFunctions {
  focusStyles(): CSSObject;
  colorModeValue<T>(light: T, dark: T): T;
  smallerThan(breakpoint: HopeBreakpoint | number): string;
  largerThan(breakpoint: HopeBreakpoint | number): string;
  rgba(color: string, alpha: number): string;
}

export interface HopeTheme {
  dir: "ltr" | "rtl";
  colorMode: ColorMode;
  primaryColor: keyof HopeThemeColors;
  primaryShade: Shade | HopePrimaryShade;

  colors: HopeThemeColors;
  fonts: Record<HopeFontFamily, string>;
  fontSizes: Record<HopeFontSize, string>;
  fontWeights: Record<HopeFontWeight, number>;
  lineHeights: Record<HopeLineHeight, string | number>;
  letterSpacings: Record<HopeLetterSpacing, string>;
  space: Record<HopeSpace, string>;
  size: Record<HopeSize, string>;
  radii: Record<HopeRadii, string>;
  shadows: Record<HopeShadow, string>;
  breakpoints: Record<HopeBreakpoint, number>;

  fn: HopeThemeFunctions;
  other: HopeThemeOther;
  components: Record<string, ThemeComponent>;
}

interface ThemeComponent {
  defaultProps?: Record<string, any>;
  classNames?: Record<string, string>;
  styles?:
    | Record<string, CSSObject>
    | ((theme: HopeTheme, params: any) => Record<string, CSSObject>);
}

export type HopeThemeBase = Omit<HopeTheme, "fn">;
export type HopeThemeOverride = DeepPartial<Omit<HopeThemeBase, "fn" | "other" | "components">> & {
  other?: HopeThemeOther;
  components?: Record<string, ThemeComponent>;
};
