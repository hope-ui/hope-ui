import type { JSX } from "solid-js";

import type { ColorScheme } from "./ColorScheme";
import type { CSSObject } from "./CSSObject";
import type { DeepPartial } from "./DeepPartial";
import type { HopeThemeColors } from "./HopeColor";
import type { HopeNumberSize, HopeSize, HopeSizes } from "./HopeSize";
import type { VariantInput, VariantOutput } from "./Variant";

export type LoaderType = "bars" | "oval" | "dots";
export type HopeThemeOther = Record<string, any>;

export interface HeadingStyle {
  fontSize: JSX.CSSProperties["font-size"];
  fontWeight: JSX.CSSProperties["font-weight"];
  lineHeight: JSX.CSSProperties["line-height"];
}

type Shade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900; // 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface HopePrimaryShade {
  light: Shade;
  dark: Shade;
}

interface HopeThemeFunctions {
  fontStyles(): any;
  focusStyles(): any;
  cover(offset?: number | string): any;
  themeColor(color: string, shade: number, primaryFallback?: boolean): string;
  rgba(color: string, alpha: number): string;
  size(props: { size: string | number; sizes: Record<string, any> }): any;
  smallerThan(breakpoint: HopeNumberSize): string;
  largerThan(breakpoint: HopeNumberSize): string;
  lighten(color: string, alpha: number): string;
  darken(color: string, alpha: number): string;
  radius(size?: HopeNumberSize | (string & {})): string | number;
  variant(payload: VariantInput): VariantOutput;
  primaryShade(colorScheme?: ColorScheme): Shade;
  hover(hoverStyle: CSSObject): any;
}

export interface HopeTheme {
  dir: "ltr" | "rtl";
  primaryShade: Shade | HopePrimaryShade;
  focusRing: "auto" | "always" | "never";
  defaultRadius: HopeNumberSize | (string & {});
  loader: LoaderType;
  dateFormat: string;
  colorScheme: ColorScheme;
  white: string;
  black: string;
  colors: HopeThemeColors;
  fontFamily: JSX.CSSProperties["font-family"];
  lineHeight: JSX.CSSProperties["line-height"];
  transitionTimingFunction: JSX.CSSProperties["transition-timing-function"];
  fontFamilyMonospace: JSX.CSSProperties["font-family"];
  primaryColor: keyof HopeThemeColors;
  respectReducedMotion: boolean;
  cursorType: "default" | "pointer";

  fontSizes: HopeSizes;
  radius: HopeSizes;
  spacing: HopeSizes;
  breakpoints: HopeSizes;
  shadows: Record<HopeSize, string>;

  headings: {
    fontFamily: JSX.CSSProperties["font-family"];
    fontWeight: JSX.CSSProperties["font-weight"];
    sizes: {
      h1: HeadingStyle;
      h2: HeadingStyle;
      h3: HeadingStyle;
      h4: HeadingStyle;
      h5: HeadingStyle;
      h6: HeadingStyle;
    };
  };

  fn: HopeThemeFunctions;
  other: HopeThemeOther;
  activeStyles: CSSObject;
  datesLocale: string;
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
